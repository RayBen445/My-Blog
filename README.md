# My Blog - Dynamic Contacts & Media System

A full-stack blog application with dynamic contact management, support messaging system, and media upload capabilities.

## 🚀 Features

### Core Features
- **Dynamic Contact Management**: Admin can add/edit/remove contact methods (WhatsApp, Telegram, email, phone)
- **Support Message System**: Users can send messages via form, delivered to Telegram bot
- **Media Upload System**: Upload images and videos in blog posts with preview and removal
- **Authentication**: Google Sign-In and email/password authentication
- **Responsive Design**: Works on desktop and mobile devices

### Contact System
- Support multiple contact types (WhatsApp, Telegram, Email, Phone, Website, Custom)
- Floating support button with contact panel
- Admin interface for contact management
- Automatic contact linking (mailto, tel, wa.me, t.me)

### Support Messages
- Professional contact form with validation
- Email format validation and character limits
- Telegram bot integration for message delivery
- Message storage in Firestore database
- Success confirmation with auto-close

### Media System
- Drag & drop file upload (images and videos)
- File type and size validation (50MB limit)
- Image and video preview with playback controls
- Media removal functionality
- Secure file serving with access control

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite
- **Firebase Authentication** with Google Sign-In
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Responsive Design** for all devices

### Backend
- **Node.js** with Express
- **Firebase Admin SDK** for authentication
- **Firestore** for data storage
- **Multer** for file uploads
- **Firebase Storage** for media files (production)
- **Local storage** for media files (development)

## Project Structure

```
/
├── backend/                 # Node.js Express API
│   ├── routes/             
│   │   └── posts.js        # CRUD operations for posts
│   ├── middleware/         
│   │   └── auth.js         # Firebase authentication middleware
│   ├── server.js           # Express server setup
│   ├── package.json        # Backend dependencies
│   └── .env                # Environment variables
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── App.jsx         # Main app component
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── package.json            # Root workspace configuration
└── README.md               # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- A Firebase project with Authentication and Firestore enabled

### 1. Clone the repository

```bash
git clone <repository-url>
cd My-Blog
```

### 2. Install dependencies

```bash
# Install all dependencies for both frontend and backend
npm run install-all

# Or install manually:
npm install
npm install --workspace=backend
npm install --workspace=frontend
```

### 3. Firebase Setup

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com/)

2. **Enable Authentication:**
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider

3. **Enable Firestore:**
   - Go to Firestore Database
   - Create database in test mode (or production mode with proper security rules)

4. **Get Firebase configuration:**
   - Go to Project Settings > General
   - Add a web app to get your Firebase config
   - Copy the configuration object

5. **Set up Firebase Admin SDK:**
   - Go to Project Settings > Service accounts
   - Generate a new private key
   - Save the JSON file as `backend/firebaseServiceAccountKey.json`
   - **Note:** This file is gitignored for security

### 4. Configure Environment Variables

#### Backend (`backend/.env`)
```bash
PORT=5000
```

#### Frontend
Update `frontend/src/firebase.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 5. Run the application

#### Development mode (both apps)
```bash
npm run dev
```

This starts:
- Backend API on http://localhost:5000
- Frontend app on http://localhost:3000

#### Run individually
```bash
# Backend only
npm run dev --workspace=backend

# Frontend only  
npm run dev --workspace=frontend
```

#### Production
```bash
# Build frontend
npm run build

# Start backend
npm start
```

## API Endpoints

All API endpoints are prefixed with `/api/posts`:

### Public Endpoints
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get a specific post

### Protected Endpoints (require Authentication)
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post (owner only)
- `DELETE /api/posts/:id` - Delete a post (owner only)
- `GET /api/posts/user/:userId` - Get user's posts (owner only)

### Authentication

Protected endpoints require a Firebase ID Token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Usage

1. **Visit the homepage** to see all published posts
2. **Create an account** or login using the login page
3. **Create posts** from the dashboard or create post page
4. **Manage your posts** from the dashboard (edit/delete)
5. **View individual posts** by clicking on post titles

## Development

### Available Scripts

From the root directory:

```bash
npm run dev          # Start both frontend and backend in development
npm run build        # Build frontend for production
npm start           # Start backend in production mode
npm run install-all # Install dependencies for all workspaces
```

### Code Structure

- **Backend:** RESTful API with Express and Firebase Admin
- **Frontend:** React SPA with React Router and Context API
- **Authentication:** Firebase Auth with ID token verification
- **Database:** Firestore for storing posts and user data
- **Styling:** Tailwind CSS for responsive design

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License