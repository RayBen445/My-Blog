const express = require('express');
const admin = require('firebase-admin');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
let db, contactsCollection;

try {
  db = admin.firestore();
  contactsCollection = db.collection('contacts');
} catch (error) {
  console.log('Firestore not available in development mode');
}

// GET /api/contacts - Get all contacts (public)
router.get('/', async (req, res) => {
  try {
    // In development without Firebase, return empty array
    if (!contactsCollection) {
      return res.json([]);
    }
    
    const snapshot = await contactsCollection
      .where('isActive', '==', true)
      .orderBy('order', 'asc')
      .get();

    const contacts = [];
    snapshot.forEach(doc => {
      contacts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    // In development, return empty array on error
    if (process.env.NODE_ENV === 'development') {
      return res.json([]);
    }
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// GET /api/contacts/admin - Get all contacts for admin (requires authentication)
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    // In development without Firebase, return mock data
    if (!contactsCollection) {
      return res.json([
        {
          id: 'dev-1',
          type: 'email',
          label: 'Customer Support',
          value: 'support@example.com',
          icon: '✉️',
          isActive: true,
          order: 0
        },
        {
          id: 'dev-2',
          type: 'whatsapp',
          label: 'WhatsApp Support',
          value: '+1234567890',
          icon: '📱',
          isActive: true,
          order: 1
        }
      ]);
    }
    
    const snapshot = await contactsCollection
      .orderBy('order', 'asc')
      .get();

    const contacts = [];
    snapshot.forEach(doc => {
      contacts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts for admin:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// POST /api/contacts - Create new contact (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, label, value, icon, isActive = true, order = 0 } = req.body;

    if (!type || !label || !value) {
      return res.status(400).json({ error: 'Type, label, and value are required' });
    }

    // Validate contact type
    const validTypes = ['whatsapp', 'telegram', 'email', 'phone', 'website', 'other'];
    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid contact type' });
    }

    const contactData = {
      type: type.toLowerCase(),
      label: label.trim(),
      value: value.trim(),
      icon: icon?.trim() || '',
      isActive: Boolean(isActive),
      order: parseInt(order) || 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    const docRef = await contactsCollection.add(contactData);
    
    const newContact = {
      id: docRef.id,
      ...contactData
    };

    res.status(201).json(newContact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// PUT /api/contacts/:id - Update contact (requires authentication)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { type, label, value, icon, isActive, order } = req.body;
    const contactId = req.params.id;

    if (!type || !label || !value) {
      return res.status(400).json({ error: 'Type, label, and value are required' });
    }

    // Check if contact exists
    const contactDoc = await contactsCollection.doc(contactId).get();
    if (!contactDoc.exists) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Validate contact type
    const validTypes = ['whatsapp', 'telegram', 'email', 'phone', 'website', 'other'];
    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid contact type' });
    }

    const updatedData = {
      type: type.toLowerCase(),
      label: label.trim(),
      value: value.trim(),
      icon: icon?.trim() || '',
      isActive: Boolean(isActive),
      order: parseInt(order) || 0,
      updatedAt: admin.firestore.Timestamp.now()
    };

    await contactsCollection.doc(contactId).update(updatedData);

    const updatedContact = {
      id: contactId,
      ...contactDoc.data(),
      ...updatedData
    };

    res.json(updatedContact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// DELETE /api/contacts/:id - Delete contact (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const contactId = req.params.id;

    // Check if contact exists
    const contactDoc = await contactsCollection.doc(contactId).get();
    if (!contactDoc.exists) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await contactsCollection.doc(contactId).delete();
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

module.exports = router;