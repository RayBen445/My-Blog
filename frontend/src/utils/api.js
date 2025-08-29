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
      return await this.request(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${idToken}`,
        },
      });
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
}

export const apiService = new ApiService();