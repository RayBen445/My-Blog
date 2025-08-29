import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import ContactManagementPage from './pages/ContactManagementPage';

// Navigation Component
import Navigation from './components/Navigation';
import SupportButton from './components/SupportButton';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/posts/:id" element={<PostPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-post" 
                element={
                  <ProtectedRoute>
                    <CreatePostPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-post/:id" 
                element={
                  <ProtectedRoute>
                    <EditPostPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/contacts" 
                element={
                  <ProtectedRoute>
                    <ContactManagementPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 Route */}
              <Route 
                path="*" 
                element={
                  <div className="text-center py-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                    <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                } 
              />
            </Routes>
          </main>
          <SupportButton />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
