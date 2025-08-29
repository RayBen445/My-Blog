# My-Blog

A full-featured blog application built with React, TypeScript, and Firebase.

## Features

- **Blog Posts**: Create, edit, and publish blog posts with rich media support
- **Media Uploads**: Upload images and videos with Firebase Storage
- **Contact Management**: Admin-managed contact methods (WhatsApp, Telegram, Email, Phone)
- **Support System**: Contact form with Telegram bot integration for notifications
- **User Authentication**: Firebase Authentication with admin roles
- **Admin Panel**: Comprehensive admin interface for content and contact management
- **Responsive Design**: Mobile-friendly interface with Material-UI

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Configuration
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create Firestore Database
4. Enable Firebase Storage
5. Copy your Firebase configuration to `.env` file:

```bash
cp .env.example .env
# Edit .env with your Firebase configuration
```

### 3. Telegram Bot Setup (Optional)
For support message notifications:
1. Create a Telegram bot via @BotFather
2. Get your bot token and chat ID
3. Add to `.env` file:
   - `REACT_APP_TELEGRAM_BOT_TOKEN`
   - `REACT_APP_TELEGRAM_CHAT_ID`

### 4. Admin User Setup
1. Register a user through the application
2. Manually add `isAdmin: true` to the user document in Firestore
3. Or add the user to a `users` collection with admin privileges

### 5. Start Development Server
```bash
npm start
```

### 6. Build for Production
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable components
│   └── Header/         # Navigation header
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── PostContext.tsx # Blog posts state
├── pages/              # Page components
│   ├── Home/           # Homepage with post list
│   ├── PostPage/       # Individual post view
│   ├── Dashboard/      # User dashboard
│   ├── Admin/          # Admin panel
│   ├── Support/        # Support form
│   └── Contacts/       # Contact information
├── services/           # External services
│   └── firebase.ts     # Firebase configuration
└── types/              # TypeScript type definitions
```

## Usage

### For Users
- View and read blog posts
- Contact through provided methods
- Submit support requests
- Authenticated users can create and manage their own posts

### For Admins
- Manage all blog posts
- Add/edit/remove contact methods
- View and manage support messages
- Control user permissions

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI)
- **Backend**: Firebase (Firestore, Storage, Auth)
- **Routing**: React Router
- **Notifications**: Telegram Bot API
- **Build Tool**: Create React App

## License

MIT License