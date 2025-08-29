const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async authenticatedRequest(endpoint, options = {}, getIdToken) {
    try {
      const idToken = await getIdToken();
      
      const config = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${idToken}`,
        },
      };

      // Don't set Content-Type for FormData
      if (!(config.body instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
        
        if (config.body && typeof config.body !== 'string') {
          config.body = JSON.stringify(config.body);
        }
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Posts API
  async getAllPosts() {
    return await this.request('/posts');
  }

  async getPost(id) {
    return await this.request(`/posts/${id}`);
  }

  async getUserPosts(userId, getIdToken) {
    return await this.authenticatedRequest(`/posts/user/${userId}`, {}, getIdToken);
  }

  async createPost(postData, getIdToken) {
    return await this.authenticatedRequest('/posts', {
      method: 'POST',
      body: postData,
    }, getIdToken);
  }

  async updatePost(id, postData, getIdToken) {
    return await this.authenticatedRequest(`/posts/${id}`, {
      method: 'PUT',
      body: postData,
    }, getIdToken);
  }

  async deletePost(id, getIdToken) {
    return await this.authenticatedRequest(`/posts/${id}`, {
      method: 'DELETE',
    }, getIdToken);
  }

  // Contacts API
  async getAllContacts() {
    return await this.request('/contacts');
  }

  async getAdminContacts(getIdToken) {
    return await this.authenticatedRequest('/contacts/admin', {}, getIdToken);
  }

  async createContact(contactData, getIdToken) {
    return await this.authenticatedRequest('/contacts', {
      method: 'POST',
      body: contactData,
    }, getIdToken);
  }

  async updateContact(id, contactData, getIdToken) {
    return await this.authenticatedRequest(`/contacts/${id}`, {
      method: 'PUT',
      body: contactData,
    }, getIdToken);
  }

  async deleteContact(id, getIdToken) {
    return await this.authenticatedRequest(`/contacts/${id}`, {
      method: 'DELETE',
    }, getIdToken);
  }

  // Support Messages API
  async sendSupportMessage(messageData) {
    return await this.request('/support', {
      method: 'POST',
      body: messageData,
    });
  }

  async getSupportMessages(getIdToken) {
    return await this.authenticatedRequest('/support', {}, getIdToken);
  }

  // Media API
  async uploadMedia(files, getIdToken) {
    const formData = new FormData();
    
    // Add files to FormData
    if (Array.isArray(files)) {
      files.forEach(file => {
        formData.append('media', file);
      });
    } else {
      formData.append('media', files);
    }

    return await this.authenticatedRequest('/media/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header for FormData, browser will set it with boundary
      }
    }, getIdToken);
  }

  async deleteMedia(filename, getIdToken) {
    return await this.authenticatedRequest(`/media/file/${filename}`, {
      method: 'DELETE',
    }, getIdToken);
  }
}

export const apiService = new ApiService();