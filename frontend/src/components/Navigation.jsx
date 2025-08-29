import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const Navigation = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link 
            to="/" 
            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            My Blog
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className={`hover:text-blue-600 transition-colors ${
                isActive('/') ? 'text-blue-600 font-medium' : 'text-gray-700'
              }`}
            >
              Home
            </Link>

            {currentUser ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`hover:text-blue-600 transition-colors ${
                    isActive('/dashboard') ? 'text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/create-post" 
                  className={`hover:text-blue-600 transition-colors ${
                    isActive('/create-post') ? 'text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Create Post
                </Link>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {currentUser.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/login" 
                className={`hover:text-blue-600 transition-colors ${
                  isActive('/login') ? 'text-blue-600 font-medium' : 'text-gray-700'
                }`}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;