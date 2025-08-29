const express = require('express');
const admin = require('firebase-admin');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
let db, postsCollection;

try {
  db = admin.firestore();
  postsCollection = db.collection('posts');
} catch (error) {
  console.log('Firestore not available in development mode');
}

// GET /api/posts - Get all posts (public)
router.get('/', async (req, res) => {
  try {
    // In development without Firebase, return empty array
    if (!postsCollection) {
      return res.json([]);
    }
    
    const snapshot = await postsCollection
      .orderBy('createdAt', 'desc')
      .get();

    const posts = [];
    snapshot.forEach(doc => {
      posts.push({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to ISO strings for JSON serialization
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      });
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET /api/posts/:id - Get single post by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const postDoc = await postsCollection.doc(req.params.id).get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postData = postDoc.data();
    const post = {
      id: postDoc.id,
      ...postData,
      createdAt: postData.createdAt?.toDate?.()?.toISOString() || postData.createdAt,
      updatedAt: postData.updatedAt?.toDate?.()?.toISOString() || postData.updatedAt
    };

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// GET /api/posts/user/:userId - Get posts by user (requires authentication to verify ownership)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only fetch their own posts
    if (req.user.uid !== userId) {
      return res.status(403).json({ error: 'Access denied: Can only fetch your own posts' });
    }

    const snapshot = await postsCollection
      .where('authorId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const posts = [];
    snapshot.forEach(doc => {
      posts.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      });
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

// POST /api/posts - Create new post (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const now = admin.firestore.Timestamp.now();
    const postData = {
      title: title.trim(),
      content: content.trim(),
      authorId: req.user.uid,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await postsCollection.add(postData);
    
    const newPost = {
      id: docRef.id,
      ...postData,
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString()
    };

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT /api/posts/:id - Update post (requires authentication and ownership)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const postId = req.params.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Check if post exists and user owns it
    const postDoc = await postsCollection.doc(postId).get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postData = postDoc.data();
    if (postData.authorId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied: You can only edit your own posts' });
    }

    // Update the post
    const updatedData = {
      title: title.trim(),
      content: content.trim(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    await postsCollection.doc(postId).update(updatedData);

    // Return updated post
    const updatedPost = {
      id: postId,
      ...postData,
      ...updatedData,
      createdAt: postData.createdAt?.toDate?.()?.toISOString() || postData.createdAt,
      updatedAt: updatedData.updatedAt.toDate().toISOString()
    };

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/posts/:id - Delete post (requires authentication and ownership)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;

    // Check if post exists and user owns it
    const postDoc = await postsCollection.doc(postId).get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postData = postDoc.data();
    if (postData.authorId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied: You can only delete your own posts' });
    }

    // Delete the post
    await postsCollection.doc(postId).delete();

    res.json({ message: 'Post deleted successfully', id: postId });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;