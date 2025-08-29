import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  CardActions,
  Grid,
  Switch,
  FormControlLabel,
  Chip,
  Input,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { usePost } from '../../contexts/PostContext';
import { BlogPost } from '../../types';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { posts, setPosts, addPost, updatePost, deletePost } = usePost();
  const [open, setOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserPosts = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          where('authorId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const userPosts: BlogPost[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userPosts.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as BlogPost);
        });
        setPosts(userPosts);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };

    fetchUserPosts();
  }, [currentUser, setPosts]);

  const resetForm = () => {
    setTitle('');
    setSummary('');
    setContent('');
    setPublished(false);
    setTags([]);
    setNewTag('');
    setMediaFiles([]);
    setEditingPost(null);
  };

  const handleOpen = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setTitle(post.title);
      setSummary(post.summary);
      setContent(post.content);
      setPublished(post.published);
      setTags(post.tags || []);
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const uploadMedia = async (): Promise<string[]> => {
    const uploadPromises = mediaFiles.map(async (file) => {
      const fileName = `${Date.now()}-${file.name}`;
      const fileRef = ref(storage, `posts/${fileName}`);
      await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef);
    });
    return await Promise.all(uploadPromises);
  };

  const handleSave = async () => {
    if (!currentUser || !title.trim() || !content.trim()) return;

    setUploading(true);
    try {
      const mediaUrls = mediaFiles.length > 0 ? await uploadMedia() : [];

      const postData = {
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        published,
        tags,
        mediaUrls,
        updatedAt: Timestamp.now(),
      };

      if (editingPost) {
        // Update existing post
        const postRef = doc(db, 'posts', editingPost.id!);
        await updateDoc(postRef, postData);
        const updatedPost = {
          ...editingPost,
          ...postData,
          updatedAt: new Date(),
        };
        updatePost(updatedPost);
      } else {
        // Create new post
        const newPostData = {
          ...postData,
          authorId: currentUser.uid,
          authorName: currentUser.displayName || currentUser.email || 'Anonymous',
          createdAt: Timestamp.now(),
        };
        const docRef = await addDoc(collection(db, 'posts'), newPostData);
        const newPost = {
          id: docRef.id,
          ...newPostData,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as BlogPost;
        addPost(newPost);
      }

      handleClose();
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteDoc(doc(db, 'posts', postId));
        deletePost(postId);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (!currentUser) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography variant="h6">Please log in to access the dashboard.</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          My Posts Dashboard
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          New Post
        </Button>
      </Box>

      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} md={6} lg={4} key={post.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {post.summary}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {post.published ? 'Published' : 'Draft'} • {post.createdAt.toLocaleDateString()}
                </Typography>
                {post.tags && post.tags.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {post.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpen(post)}>
                  Edit
                </Button>
                <Button size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(post.id!)}>
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Post Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingPost ? 'Edit Post' : 'New Post'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Summary"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            variant="outlined"
            multiline
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel htmlFor="media-upload">Upload Images/Videos</InputLabel>
            <Input
              id="media-upload"
              type="file"
              inputProps={{ multiple: true, accept: 'image/*,video/*' }}
              onChange={(e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) {
                  setMediaFiles(Array.from(files));
                }
              }}
            />
          </FormControl>

          <Box sx={{ mb: 2 }}>
            <TextField
              label="Add Tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              sx={{ mr: 1 }}
            />
            <Button onClick={addTag}>Add Tag</Button>
            <Box sx={{ mt: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => removeTag(tag)}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
            }
            label="Publish immediately"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={uploading || !title.trim() || !content.trim()}>
            {uploading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;