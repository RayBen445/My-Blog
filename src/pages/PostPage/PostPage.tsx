import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  Grid,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { BlogPost } from '../../types';

const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPost({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as BlogPost);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography variant="h6">Post not found</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Back to Home
      </Button>
      
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {post.title}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="text.secondary">
            By {post.authorName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Published on {post.createdAt.toLocaleDateString()} 
            {post.updatedAt.getTime() !== post.createdAt.getTime() && 
              ` • Updated on ${post.updatedAt.toLocaleDateString()}`}
          </Typography>
        </Box>

        {post.tags && post.tags.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {post.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
            ))}
          </Box>
        )}

        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {post.mediaUrls.map((mediaUrl, index) => (
              <Grid item xs={12} md={6} key={index}>
                {mediaUrl.includes('.mp4') || mediaUrl.includes('.webm') || mediaUrl.includes('.ogg') ? (
                  <video
                    controls
                    style={{ width: '100%', maxWidth: '100%', height: 'auto' }}
                  >
                    <source src={mediaUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={mediaUrl}
                    alt={`Media ${index + 1}`}
                    style={{ width: '100%', maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        )}

        <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
          {post.content}
        </Typography>
      </Paper>
    </Container>
  );
};

export default PostPage;