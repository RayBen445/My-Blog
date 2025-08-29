const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins in production, configure as needed
  credentials: true
}));
app.use(express.json());

// Import routes
app.use('/api/posts', require('./routes/posts'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/support', require('./routes/support'));
app.use('/api/media', require('./routes/media'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running on Firebase Functions', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'My-Blog Backend API on Firebase Functions',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      posts: '/api/posts',
      contacts: '/api/contacts',
      support: '/api/support',
      media: '/api/media'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Export the Express app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);