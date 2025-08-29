import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../utils/api';

const PostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await apiService.getPost(id);
        setPost(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading post...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">Post not found</div>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <nav className="mb-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          ← Back to All Posts
        </Link>
      </nav>

      <article className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="flex justify-between items-center text-sm text-gray-600 border-b pb-4">
            <div>
              <span className="font-medium">Author:</span> {post.authorId}
            </div>
            <div className="flex gap-4">
              <div>
                <span className="font-medium">Created:</span> {' '}
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              {post.updatedAt !== post.createdAt && (
                <div>
                  <span className="font-medium">Updated:</span> {' '}
                  {new Date(post.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="prose max-w-none">
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </article>
    </div>
  );
};

export default PostPage;