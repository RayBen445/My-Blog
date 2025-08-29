import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import axios from 'axios';

const Support: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const sendToTelegram = async (supportMessage: string) => {
    // These would typically be stored in environment variables or admin settings
    const TELEGRAM_BOT_TOKEN = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.REACT_APP_TELEGRAM_CHAT_ID;

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          chat_id: TELEGRAM_CHAT_ID,
          text: supportMessage,
          parse_mode: 'HTML',
        });
      } catch (error) {
        console.error('Error sending to Telegram:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('All fields are required');
      return;
    }

    setSending(true);
    setError('');

    try {
      // Save to Firestore
      const supportMessageData = {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        createdAt: Timestamp.now(),
        status: 'new',
      };

      await addDoc(collection(db, 'supportMessages'), supportMessageData);

      // Send to Telegram
      const telegramMessage = `
<b>New Support Message</b>
<b>Name:</b> ${name.trim()}
<b>Email:</b> ${email.trim()}
<b>Message:</b>
${message.trim()}
<b>Time:</b> ${new Date().toLocaleString()}`;

      await sendToTelegram(telegramMessage);

      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      
      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error sending support message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Support & Contact
      </Typography>
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Need help? Have a question? We're here to help!
      </Typography>

      <Paper elevation={2} sx={{ p: 4 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Your message has been sent successfully! We'll get back to you soon.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Your Name"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 3 }}
            required
          />

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 3 }}
            required
          />

          <TextField
            fullWidth
            label="Message"
            variant="outlined"
            multiline
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mb: 3 }}
            required
            placeholder="Please describe your issue or question in detail..."
          />

          <Box display="flex" justifyContent="center">
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SendIcon />}
              disabled={sending}
              sx={{ px: 4 }}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </Box>
        </form>

        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="h6" gutterBottom>
            Other Ways to Reach Us
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We typically respond within 24 hours. For urgent matters, please use the contact methods below.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Support;