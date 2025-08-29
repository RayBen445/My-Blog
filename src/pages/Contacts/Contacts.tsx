import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
} from '@mui/material';
import {
  WhatsApp,
  Telegram,
  Email,
  Phone,
  ContactSupport,
} from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Contact } from '../../types';

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const q = query(
          collection(db, 'contacts'),
          where('isActive', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const fetchedContacts: Contact[] = [];
        querySnapshot.forEach((doc) => {
          fetchedContacts.push({
            id: doc.id,
            ...doc.data(),
          } as Contact);
        });
        setContacts(fetchedContacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <WhatsApp />;
      case 'telegram':
        return <Telegram />;
      case 'email':
        return <Email />;
      case 'phone':
        return <Phone />;
      default:
        return <ContactSupport />;
    }
  };

  const getActionUrl = (type: string, value: string) => {
    switch (type) {
      case 'whatsapp':
        return `https://wa.me/${value.replace(/\D/g, '')}`;
      case 'telegram':
        return `https://t.me/${value.replace('@', '')}`;
      case 'email':
        return `mailto:${value}`;
      case 'phone':
        return `tel:${value}`;
      default:
        return '#';
    }
  };

  const handleContact = (contact: Contact) => {
    const url = getActionUrl(contact.type, contact.value);
    if (url !== '#') {
      window.open(url, '_blank');
    }
  };

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
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Contact Information
      </Typography>
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Get in touch with us through any of these channels
      </Typography>

      {contacts.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Contact information will be available soon.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {contacts.map((contact) => (
            <Grid item xs={12} sm={6} md={4} key={contact.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleContact(contact)}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2, color: 'primary.main' }}>
                    {getIcon(contact.type)}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {contact.label}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {contact.value}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={getIcon(contact.type)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContact(contact);
                    }}
                  >
                    Contact
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mt: 6 }}>
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Need Immediate Help?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            You can also use our support form to send us a detailed message.
          </Typography>
          <Button variant="contained" href="/support" size="large">
            Send Support Message
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Contacts;