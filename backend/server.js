const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { setFirebaseInitialized } = require('./middleware/auth');
require('dotenv').config();

// Initialize Firebase Admin SDK
// In production, use a service account key file
// For now, we'll use environment variables or default credentials
let firebaseInitialized = false;
try {
  if (process.env.FIREBASE_PROJECT_ID) {
    // Use environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    firebaseInitialized = true;
    setFirebaseInitialized(true);
    console.log('Firebase Admin initialized successfully with environment variables');
  } else if (process.env.NODE_ENV === 'production') {
    // Try default credentials (works in Firebase/GCP environment)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    firebaseInitialized = true;
    setFirebaseInitialized(true);
    console.log('Firebase Admin initialized successfully with default credentials');
  } else {
    // Development mode - don't initialize Firebase
    console.log('Firebase Admin not initialized - running in development mode');
    firebaseInitialized = false;
    setFirebaseInitialized(false);
  }
} catch (error) {
  console.log('Firebase Admin initialization error:', error.message);
  console.log('Note: Running in development mode without Firebase. Some features will be limited.');
  firebaseInitialized = false;
  setFirebaseInitialized(false);
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
app.use('/api/contacts', require('./routes/contacts'));

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