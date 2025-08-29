const express = require('express');
const admin = require('firebase-admin');

const router = express.Router();
let db, messagesCollection;

try {
  db = admin.firestore();
  messagesCollection = db.collection('supportMessages');
} catch (error) {
  console.log('Firestore not available in development mode');
}

// Send a support message via Telegram Bot API
const sendToTelegram = async (message) => {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    console.log('Telegram configuration not found - message not sent to Telegram');
    return false;
  }

  try {
    const telegramMessage = `
🔔 *New Support Message*

*From:* ${message.name}
*Email:* ${message.email}
*Subject:* ${message.subject || 'No subject'}

*Message:*
${message.message}

*Submitted:* ${new Date().toLocaleString()}
    `;

    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: telegramMessage,
        parse_mode: 'Markdown',
      }),
    });

    if (response.ok) {
      console.log('Message sent to Telegram successfully');
      return true;
    } else {
      console.error('Failed to send message to Telegram:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
    return false;
  }
};

// POST /api/support - Submit a support message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const supportMessage = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || '',
      message: message.trim(),
      createdAt: admin.firestore?.Timestamp?.now() || new Date().toISOString(),
      status: 'new',
      telegramSent: false
    };

    // Send to Telegram
    const telegramSent = await sendToTelegram(supportMessage);
    supportMessage.telegramSent = telegramSent;

    // Save to Firestore if available
    let messageId = 'dev-msg-' + Date.now();
    if (messagesCollection) {
      const docRef = await messagesCollection.add(supportMessage);
      messageId = docRef.id;
    }

    res.status(201).json({
      id: messageId,
      message: 'Support message sent successfully',
      telegramSent
    });
  } catch (error) {
    console.error('Error processing support message:', error);
    res.status(500).json({ error: 'Failed to send support message' });
  }
});

// GET /api/support - Get all support messages (admin only)
router.get('/', async (req, res) => {
  try {
    // In development without Firebase, return empty array
    if (!messagesCollection) {
      return res.json([]);
    }
    
    const snapshot = await messagesCollection
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const messages = [];
    snapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to ISO strings
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
      });
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching support messages:', error);
    res.status(500).json({ error: 'Failed to fetch support messages' });
  }
});

module.exports = router;