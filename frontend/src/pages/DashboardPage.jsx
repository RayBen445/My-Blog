import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../utils/api';

const DashboardPage = () => {
  const { currentUser, getIdToken, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const data = await apiService.getUserPosts(currentUser.uid, getIdToken);
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [currentUser, getIdToken]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading your posts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {currentUser?.email}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/create-post" className="btn-primary">
              Create New Post
            </Link>
            <Link to="/admin/contacts" className="btn-secondary">
              Manage Contacts
            </Link>
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mb-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          ← Back to All Posts
        </Link>
      </nav>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-700">Error: {error}</div>
        </div>
      )}

      {/* Posts */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Your Posts</h2>
          <span className="text-gray-600">{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">No posts yet</h3>
            <p className="text-gray-600 mb-6">
              Start sharing your thoughts with the world!
            </p>
            <Link to="/create-post" className="btn-primary">
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link to={`/posts/${post.id}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-gray-700 mb-4">
                      {post.content.length > 150 
                        ? `${post.content.substring(0, 150)}...` 
                        : post.content
                      }
                    </p>
                    <div className="text-sm text-gray-500">
                      Created: {new Date(post.createdAt).toLocaleDateString()}
                      {post.updatedAt !== post.createdAt && (
                        <span className="ml-4">
                          Updated: {new Date(post.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link 
                      to={`/edit-post/${post.id}`}
                      className="btn-secondary text-sm"
                    >
                      Edit
                    </Link>
                    <Link 
                      to={`/posts/${post.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;