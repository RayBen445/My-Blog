import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

class FirebaseService {
  constructor() {
    this.postsCollection = collection(db, 'posts');
  }

  // Helper method to convert Firestore timestamps to ISO strings
  formatPostData(doc) {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
    };
  }

  // Get all posts (public)
  async getAllPosts() {
    try {
      const q = query(this.postsCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const posts = [];
      snapshot.forEach(doc => {
        posts.push(this.formatPostData(doc));
      });
      
      return posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts');
    }
  }

  // Get single post by ID (public)
  async getPost(id) {
    try {
      const docRef = doc(this.postsCollection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Post not found');
      }

      return this.formatPostData(docSnap);
    } catch (error) {
      console.error('Error fetching post:', error);
      if (error.message === 'Post not found') {
        throw error;
      }
      throw new Error('Failed to fetch post');
    }
  }

  // Get posts by user (requires authentication)
  async getUserPosts(userId, currentUser) {
    try {
      // Verify user can only fetch their own posts
      if (!currentUser || currentUser.uid !== userId) {
        throw new Error('Access denied: You can only fetch your own posts');
      }

      const q = query(
        this.postsCollection, 
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      const posts = [];
      snapshot.forEach(doc => {
        posts.push(this.formatPostData(doc));
      });
      
      return posts;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      if (error.message.includes('Access denied')) {
        throw error;
      }
      throw new Error('Failed to fetch user posts');
    }
  }

  // Create post (requires authentication)
  async createPost(postData, currentUser) {
    try {
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      const { title, content } = postData;

      if (!title || !content) {
        throw new Error('Title and content are required');
      }

      const now = Timestamp.now();
      const newPostData = {
        title: title.trim(),
        content: content.trim(),
        authorId: currentUser.uid,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(this.postsCollection, newPostData);
      
      return {
        id: docRef.id,
        ...newPostData,
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString()
      };
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.message === 'Authentication required' || error.message === 'Title and content are required') {
        throw error;
      }
      throw new Error('Failed to create post');
    }
  }

  // Update post (requires authentication and ownership)
  async updatePost(id, postData, currentUser) {
    try {
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      const { title, content } = postData;

      if (!title || !content) {
        throw new Error('Title and content are required');
      }

      // Check if post exists and user owns it
      const docRef = doc(this.postsCollection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Post not found');
      }

      const existingData = docSnap.data();
      if (existingData.authorId !== currentUser.uid) {
        throw new Error('Access denied: You can only edit your own posts');
      }

      // Update the post
      const updatedData = {
        title: title.trim(),
        content: content.trim(),
        updatedAt: Timestamp.now()
      };

      await updateDoc(docRef, updatedData);

      // Return updated post
      return {
        id,
        ...existingData,
        ...updatedData,
        createdAt: existingData.createdAt?.toDate?.()?.toISOString() || existingData.createdAt,
        updatedAt: updatedData.updatedAt.toDate().toISOString()
      };
    } catch (error) {
      console.error('Error updating post:', error);
      if (error.message.includes('Authentication required') || 
          error.message.includes('Title and content are required') ||
          error.message.includes('Post not found') ||
          error.message.includes('Access denied')) {
        throw error;
      }
      throw new Error('Failed to update post');
    }
  }

  // Delete post (requires authentication and ownership)
  async deletePost(id, currentUser) {
    try {
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      // Check if post exists and user owns it
      const docRef = doc(this.postsCollection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Post not found');
      }

      const existingData = docSnap.data();
      if (existingData.authorId !== currentUser.uid) {
        throw new Error('Access denied: You can only delete your own posts');
      }

      // Delete the post
      await deleteDoc(docRef);

      return { message: 'Post deleted successfully', id };
    } catch (error) {
      console.error('Error deleting post:', error);
      if (error.message.includes('Authentication required') || 
          error.message.includes('Post not found') ||
          error.message.includes('Access denied')) {
        throw error;
      }
      throw new Error('Failed to delete post');
    }
  }
}

export const firebaseService = new FirebaseService();