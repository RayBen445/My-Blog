import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { firebaseService } from '../utils/firebaseService';

const EditPostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await firebaseService.getPost(id);
        
        // Check if current user owns this post
        if (data.authorId !== currentUser?.uid) {
          setError('You can only edit your own posts');
          return;
        }
        
        setPost(data);
        setTitle(data.title);
        setContent(data.content);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id && currentUser) {
      fetchPost();
    }
  }, [id, currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const postData = {
        title: title.trim(),
        content: content.trim()
      };

      const updatedPost = await firebaseService.updatePost(id, postData, currentUser);
      setPost(updatedPost);
      
      // Redirect to the updated post
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await firebaseService.deletePost(id, currentUser);
      
      // Redirect to dashboard after successful deletion
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading post...</div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <Link to="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <nav className="mb-4">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
        {post && (
          <p className="text-gray-600 mt-2">
            Created: {new Date(post.createdAt).toLocaleDateString()}
            {post.updatedAt !== post.createdAt && (
              <span className="ml-4">
                Last updated: {new Date(post.updatedAt).toLocaleDateString()}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-700">Error: {error}</div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <form onSubmit={handleSave} className="space-y-6">
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
              disabled={saving || deleting}
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
              disabled={saving || deleting}
              rows={15}
              maxLength={10000}
            />
            <div className="text-sm text-gray-500 mt-1">
              {content.length}/10,000 characters
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              <Link 
                to="/dashboard" 
                className="btn-secondary"
                disabled={saving || deleting}
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving || deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
            <button
              type="submit"
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving || deleting || !title.trim() || !content.trim()}
            >
              {saving ? 'Saving...' : 'Save Changes'}
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

export default EditPostPage;