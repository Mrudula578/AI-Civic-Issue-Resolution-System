/**
 * API Client for CivicResolve Frontend
 * Handles all backend API calls with authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('accessToken') || null;
  }

  // Set token after login
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return !!this.token;
  }

  // Generic request method
  async request(method, endpoint, data = null, headers = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (this.token) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get('content-type');
      let responseData;

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        const error = new Error(
          responseData?.error?.message || 
          `API Error: ${response.status} ${response.statusText}`
        );
        error.status = response.status;
        error.data = responseData;
        throw error;
      }

      return responseData;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Request with FormData (for file uploads)
  async requestFormData(method, endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method,
      headers: {},
    };

    if (this.token) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
    }

    config.body = formData;

    try {
      const response = await fetch(url, config);
      const responseData = await response.json();

      if (!response.ok) {
        const error = new Error(
          responseData?.error?.message || 
          `API Error: ${response.status} ${response.statusText}`
        );
        error.status = response.status;
        error.data = responseData;
        throw error;
      }

      return responseData;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ============ HEALTH ============
  async getHealth() {
    return this.request('GET', '/health');
  }

  // ============ AUTH ============
  async register(email, password, name) {
    const response = await this.request('POST', '/auth/register', {
      email,
      password,
      name,
    });
    if (response.tokens?.accessToken) {
      this.setToken(response.tokens.accessToken);
    }
    return response;
  }

  async login(email, password) {
    const response = await this.request('POST', '/auth/login', {
      email,
      password,
    });
    if (response.tokens?.accessToken) {
      this.setToken(response.tokens.accessToken);
    }
    return response;
  }

  async logout() {
    try {
      await this.request('POST', '/auth/logout', {});
    } catch (error) {
      console.error('Logout error (non-fatal):', error);
    }
    this.setToken(null);
  }

  async refresh() {
    const response = await this.request('POST', '/auth/refresh', {});
    if (response.tokens?.accessToken) {
      this.setToken(response.tokens.accessToken);
    }
    return response;
  }

  // ============ USERS ============
  async getMe() {
    return this.request('GET', '/users/me');
  }

  async updateMe(data) {
    return this.request('PUT', '/users/me', data);
  }

  async deleteMe() {
    return this.request('DELETE', '/users/me');
  }

  async getStats() {
    return this.request('GET', '/users/me/stats');
  }

  async exportData() {
    return this.request('GET', '/users/me/export');
  }

  // ============ CATEGORIES ============
  async getCategories(search = '', limit = 50) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit);
    
    const queryString = params.toString();
    const endpoint = `/categories${queryString ? '?' + queryString : ''}`;
    return this.request('GET', endpoint);
  }

  async getCategoryById(id) {
    return this.request('GET', `/categories/${id}`);
  }

  async getCategoryStats() {
    return this.request('GET', '/categories/stats');
  }

  // ============ COMPLAINTS ============
  async submitComplaint(complaintData, files = []) {
    const formData = new FormData();
    formData.append('title', complaintData.title);
    formData.append('description', complaintData.description);
    formData.append('categoryId', complaintData.categoryId);
    formData.append('location', complaintData.location);

    // Add files
    files.forEach(file => {
      formData.append('images', file);
    });

    return this.requestFormData('POST', '/complaints', formData);
  }

  async getComplaintById(id) {
    return this.request('GET', `/complaints/${id}`);
  }

  async getUserComplaints(userId, filters = {}) {
    const params = new URLSearchParams(filters);
    const queryString = params.toString();
    const endpoint = `/complaints/user/${userId}${queryString ? '?' + queryString : ''}`;
    return this.request('GET', endpoint);
  }

  async getMyComplaints(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const endpoint = `/complaints/user/${await this.getMyId()}${queryString ? '?' + queryString : ''}`;
    return this.request('GET', endpoint);
  }

  async getComplaintStats() {
    return this.request('GET', '/complaints/stats');
  }

  async addComplaintImage(complaintId, file) {
    const formData = new FormData();
    formData.append('image', file);
    return this.requestFormData('POST', `/complaints/${complaintId}/images`, formData);
  }

  async deleteComplaintImage(imageId) {
    return this.request('DELETE', `/complaints/images/${imageId}`);
  }

  async updateComplaintStatus(complaintId, status) {
    return this.request('PATCH', `/complaints/${complaintId}/status`, { status });
  }

  async searchComplaints(query, filters = {}) {
    const params = new URLSearchParams({ q: query, ...filters });
    const queryString = params.toString();
    const endpoint = `/complaints/search?${queryString}`;
    return this.request('GET', endpoint);
  }

  async getAllComplaints(filters = {}) {
    const params = new URLSearchParams(filters);
    const queryString = params.toString();
    const endpoint = `/complaints${queryString ? '?' + queryString : ''}`;
    return this.request('GET', endpoint);
  }

  // Helper to get current user ID
  async getMyId() {
    try {
      const user = await this.getMe();
      return user.user.id;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }
}

export const apiClient = new APIClient();
export default apiClient;
