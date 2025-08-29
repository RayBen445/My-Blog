const admin = require('firebase-admin');
require('dotenv').config();

let firebaseInitialized = false;

const authenticateToken = async (req, res, next) => {
  try {
    // In development without Firebase, bypass authentication
    if (process.env.NODE_ENV === 'development' && !firebaseInitialized) {
      req.user = {
        uid: 'dev-user-123',
        email: 'dev@example.com',
        emailVerified: true
      };
      return next();
    }
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization header provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({ error: 'No ID token provided' });
    }

    // Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Attach user information to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'ID token expired' });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({ error: 'Invalid ID token format' });
    }
    
    return res.status(401).json({ error: 'Authentication failed', details: error.message });
  }
};

// Export the firebaseInitialized flag to be set by server.js
const setFirebaseInitialized = (status) => {
  firebaseInitialized = status;
};

module.exports = { authenticateToken, setFirebaseInitialized };