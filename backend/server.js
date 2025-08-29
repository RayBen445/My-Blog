const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
// In production, use a service account key file
// For now, we'll use environment variables or default credentials
try {
  admin.initializeApp({
    // If you have a service account key file, uncomment the line below:
    // credential: admin.credential.cert(require('./firebaseServiceAccountKey.json')),
    // For now, using default credentials (works in Firebase environment)
    credential: admin.credential.applicationDefault(),
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.log('Firebase Admin initialization error:', error.message);
  console.log('Note: In production, add your firebaseServiceAccountKey.json file');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // React dev servers
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/posts', require('./routes/posts'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'My-Blog Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      posts: '/api/posts'
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;