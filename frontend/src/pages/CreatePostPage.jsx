import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../utils/api';

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getIdToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const postData = {
        title: title.trim(),
        content: content.trim()
      };

      const newPost = await apiService.createPost(postData, getIdToken);
      
      // Redirect to the new post
      navigate(`/posts/${newPost.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <nav className="mb-4">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
        <p className="text-gray-600 mt-2">Share your thoughts with the world</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-700">Error: {error}</div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Post Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field w-full"
              placeholder="Enter a compelling title for your post"
              required
              disabled={loading}
              maxLength={200}
            />
            <div className="text-sm text-gray-500 mt-1">
              {title.length}/200 characters
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Post Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="textarea-field w-full"
              placeholder="Write your post content here..."
              required
              disabled={loading}
              rows={15}
              maxLength={10000}
            />
            <div className="text-sm text-gray-500 mt-1">
              {content.length}/10,000 characters
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Link 
              to="/dashboard" 
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !title.trim() || !content.trim()}
            >
              {loading ? 'Creating Post...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Preview */}
      {(title.trim() || content.trim()) && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            {title.trim() && (
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {title}
              </h3>
            )}
            {content.trim() && (
              <div className="text-gray-700 whitespace-pre-wrap">
                {content}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePostPage;