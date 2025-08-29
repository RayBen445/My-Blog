import React, { useState, useEffect } from 'react';
import { apiService } from '../utils/api';

const SupportButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && contacts.length === 0) {
      fetchContacts();
    }
  }, [isOpen]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAllContacts();
      setContacts(data);
    } catch (err) {
      setError('Failed to load contacts');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getContactIcon = (type) => {
    const icons = {
      whatsapp: '📱',
      telegram: '✈️', 
      email: '✉️',
      phone: '📞',
      website: '🌐',
      other: '💬'
    };
    return icons[type] || icons.other;
  };

  const getContactUrl = (type, value) => {
    switch (type) {
      case 'whatsapp':
        return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
      case 'telegram':
        return `https://t.me/${value.replace('@', '')}`;
      case 'email':
        return `mailto:${value}`;
      case 'phone':
        return `tel:${value}`;
      case 'website':
        return value.startsWith('http') ? value : `https://${value}`;
      default:
        return '#';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors duration-200 z-50"
        aria-label="Support"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Support Panel */}
      <div className="bg-white rounded-lg shadow-2xl border w-80 max-w-[calc(100vw-2rem)]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Contact Support</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-4">
              <p className="text-red-600 mb-3">{error}</p>
              <button
                onClick={fetchContacts}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && contacts.length === 0 && (
            <p className="text-gray-500 text-center py-4">No contact methods available.</p>
          )}

          {!loading && !error && contacts.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Choose how you'd like to contact us:</p>
              {contacts.map(contact => (
                <a
                  key={contact.id}
                  href={getContactUrl(contact.type, contact.value)}
                  target={contact.type === 'email' || contact.type === 'phone' ? '_self' : '_blank'}
                  rel={contact.type === 'website' ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                >
                  <span className="text-xl">{contact.icon || getContactIcon(contact.type)}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{contact.label}</div>
                    <div className="text-sm text-gray-500">{contact.value}</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportButton;