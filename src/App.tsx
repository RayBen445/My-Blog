import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import Header from './components/Header/Header';
import Home from './pages/Home/Home';
import PostPage from './pages/PostPage/PostPage';
import Dashboard from './pages/Dashboard/Dashboard';
import Admin from './pages/Admin/Admin';
import Support from './pages/Support/Support';
import Contacts from './pages/Contacts/Contacts';
import { AuthProvider } from './contexts/AuthContext';
import { PostProvider } from './contexts/PostContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <PostProvider>
          <Router>
            <div className="App">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/post/:id" element={<PostPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/contacts" element={<Contacts />} />
                </Routes>
              </main>
            </div>
          </Router>
        </PostProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;