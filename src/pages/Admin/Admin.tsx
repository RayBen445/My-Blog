import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Contact, SupportMessage } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Admin: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  
  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactLabel, setContactLabel] = useState('');
  const [contactValue, setContactValue] = useState('');
  const [contactType, setContactType] = useState<Contact['type']>('email');
  const [contactActive, setContactActive] = useState(true);

  // Support messages state
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchContacts();
      fetchSupportMessages();
    }
  }, [isAdmin]);

  const fetchContacts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'contacts'));
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
    }
  };

  const fetchSupportMessages = async () => {
    try {
      const q = query(collection(db, 'supportMessages'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedMessages: SupportMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedMessages.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as SupportMessage);
      });
      setSupportMessages(fetchedMessages);
    } catch (error) {
      console.error('Error fetching support messages:', error);
    }
  };

  const resetContactForm = () => {
    setContactLabel('');
    setContactValue('');
    setContactType('email');
    setContactActive(true);
    setEditingContact(null);
  };

  const handleContactOpen = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setContactLabel(contact.label);
      setContactValue(contact.value);
      setContactType(contact.type);
      setContactActive(contact.isActive);
    } else {
      resetContactForm();
    }
    setContactDialogOpen(true);
  };

  const handleContactClose = () => {
    setContactDialogOpen(false);
    resetContactForm();
  };

  const handleContactSave = async () => {
    if (!contactLabel.trim() || !contactValue.trim()) return;

    try {
      const contactData = {
        label: contactLabel.trim(),
        value: contactValue.trim(),
        type: contactType,
        isActive: contactActive,
      };

      if (editingContact) {
        await updateDoc(doc(db, 'contacts', editingContact.id!), contactData);
      } else {
        await addDoc(collection(db, 'contacts'), contactData);
      }

      fetchContacts();
      handleContactClose();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleContactDelete = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteDoc(doc(db, 'contacts', contactId));
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const handleMessageView = (message: SupportMessage) => {
    setSelectedMessage(message);
    setMessageDialogOpen(true);

    // Mark as read if not already
    if (message.status === 'new') {
      updateDoc(doc(db, 'supportMessages', message.id!), {
        status: 'read',
      });
      fetchSupportMessages();
    }
  };

  const handleMessageStatusUpdate = async (messageId: string, status: SupportMessage['status']) => {
    try {
      await updateDoc(doc(db, 'supportMessages', messageId), { status });
      fetchSupportMessages();
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  if (!currentUser || !isAdmin) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography variant="h6">Access denied. Admin privileges required.</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Panel
      </Typography>

      <Paper elevation={2} sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Contacts Management" />
          <Tab label="Support Messages" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Manage Contact Methods</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleContactOpen()}>
              Add Contact
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Label</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.label}</TableCell>
                    <TableCell>{contact.value}</TableCell>
                    <TableCell>
                      <Chip label={contact.type} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={contact.isActive ? 'Active' : 'Inactive'}
                        color={contact.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleContactOpen(contact)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleContactDelete(contact.id!)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Support Messages
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {supportMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>{message.name}</TableCell>
                    <TableCell>{message.email}</TableCell>
                    <TableCell>{message.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={message.status}
                        color={
                          message.status === 'new' ? 'error' :
                          message.status === 'read' ? 'warning' : 'success'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleMessageView(message)}>
                        <ViewIcon />
                      </IconButton>
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <Select
                          value={message.status}
                          onChange={(e) => handleMessageStatusUpdate(message.id!, e.target.value as SupportMessage['status'])}
                        >
                          <MenuItem value="new">New</MenuItem>
                          <MenuItem value="read">Read</MenuItem>
                          <MenuItem value="replied">Replied</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onClose={handleContactClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Label"
            fullWidth
            variant="outlined"
            value={contactLabel}
            onChange={(e) => setContactLabel(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Value"
            fullWidth
            variant="outlined"
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={contactType}
              onChange={(e) => setContactType(e.target.value as Contact['type'])}
              label="Type"
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="phone">Phone</MenuItem>
              <MenuItem value="whatsapp">WhatsApp</MenuItem>
              <MenuItem value="telegram">Telegram</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={contactActive}
                onChange={(e) => setContactActive(e.target.checked)}
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleContactClose}>Cancel</Button>
          <Button onClick={handleContactSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Support Message</DialogTitle>
        <DialogContent>
          {selectedMessage && (
            <>
              <Typography variant="h6" gutterBottom>
                From: {selectedMessage.name} ({selectedMessage.email})
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Sent: {selectedMessage.createdAt.toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                {selectedMessage.message}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin;