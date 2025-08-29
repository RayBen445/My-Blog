import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { BlogPost } from '../../types';
import { usePost } from '../../contexts/PostContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { posts, setPosts } = usePost();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          where('published', '==', true),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedPosts: BlogPost[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedPosts.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as BlogPost);
        });
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [setPosts]);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        Welcome to My Blog
      </Typography>
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Sharing thoughts, ideas, and experiences
      </Typography>

      {posts.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
          <Typography variant="h6" color="text.secondary">
            No posts yet. Check back soon!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {posts.map((post) => (
            <Grid item xs={12} md={6} lg={4} key={post.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={post.mediaUrls[0]}
                    alt={post.title}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {post.summary}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    By {post.authorName} • {post.createdAt.toLocaleDateString()}
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
                  <Button size="small" onClick={() => navigate(`/post/${post.id}`)}>
                    Read More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Home;