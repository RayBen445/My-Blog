# My Blog

A modern blog application built with React and Firebase. This application uses Firebase services for authentication, database, and hosting - no backend server required!

## Features

- 📝 Create, read, update, and delete blog posts
- 🔐 User authentication with Firebase Auth
- 🎨 Responsive design with Tailwind CSS
- 🔒 Protected routes and secure data access
- 📱 Mobile-friendly interface
- ⚡ Fast development with Vite
- ☁️ Serverless architecture with Firebase

## Tech Stack

### Frontend
- **React 19** with functional components and hooks
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Tailwind CSS** for styling

### Backend Services (Firebase)
- **Firebase Authentication** for user management
- **Firestore Database** for blog post storage
- **Firebase Storage** for media uploads (ready for future use)
- **Firebase Hosting** for deployment (optional)

## Project Structure

```
/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React context providers
│   │   ├── pages/            # Page components
│   │   ├── utils/            # Utility functions & Firebase service
│   │   ├── firebase.js       # Firebase configuration
│   │   └── App.jsx           # Main app component
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
├── backend/                  # 🚨 DEPRECATED - No longer used
│   └── DEPRECATED.md         # Migration information
├── package.json              # Root workspace configuration
└── README.md                 # This file
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
# Install frontend dependencies
npm run install-all

# Or install manually:
npm install --workspace=frontend
```

### 3. Firebase Setup

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com/)

2. **Enable Authentication:**
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider

3. **Enable Firestore:**
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see Security Rules section below)

4. **Get Firebase configuration:**
   - Go to Project Settings > General
   - Add a web app to get your Firebase config
   - Copy the configuration object

5. **Configure the app:**
   - Update `frontend/src/firebase.js` with your Firebase configuration:

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

### 4. Firestore Security Rules

Add these security rules in the Firebase Console (Firestore Database > Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Posts collection - public read, authenticated write (own posts only)
    match /posts/{postId} {
      // Anyone can read posts
      allow read: if true;
      
      // Only authenticated users can create posts
      allow create: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
      
      // Only post authors can update/delete their posts
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
    }
  }
}
```

### 5. Run the application

```bash
# Development mode
npm run dev
# This starts the frontend on http://localhost:3000

# Build for production
npm run build

# Preview production build
npm start
```

## Firebase Services

This application uses the following Firebase services:

### Authentication
- **Email/Password authentication** for user accounts
- **Protected routes** that require login
- **User context** throughout the application

### Firestore Database
- **Posts collection** for blog post storage
- **Real-time updates** (can be added in future)
- **Security rules** to protect user data
- **Automatic timestamps** for created/updated dates

### Storage (Ready for Future Use)
- **Media uploads** for blog images
- **File management** with automatic URLs
- **Security rules** for file access

## Database Structure

### Posts Collection
```javascript
{
  id: "auto-generated-id",
  title: "Post Title",
  content: "Post content...",
  authorId: "firebase-user-id",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Deployment

### Frontend Deployment Options

1. **Vercel** (Recommended)
   ```bash
   npm run build
   # Deploy to Vercel
   ```

2. **Firebase Hosting**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   npm run build
   firebase deploy
   ```

3. **Netlify**
   - Connect your repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

### No Backend Deployment Needed!
- All backend logic is handled by Firebase services
- No server maintenance required
- Automatic scaling with Firebase

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
npm run dev          # Start frontend in development mode
npm run build        # Build frontend for production
npm start           # Preview production build
npm run install-all # Install frontend dependencies
```

From the frontend directory:

```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Structure

- **Frontend:** React SPA with React Router and Context API
- **Authentication:** Firebase Auth with user context
- **Database:** Direct Firestore integration with security rules
- **Storage:** Firebase Storage ready for media uploads
- **Styling:** Tailwind CSS for responsive design

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (ensure Firebase rules work correctly)
5. Submit a pull request

## Migration Notes

This project was migrated from a Node.js/Express backend to a Firebase-only architecture. The `backend/` folder is deprecated and no longer used. See `backend/DEPRECATED.md` for migration details.

## License

MIT License