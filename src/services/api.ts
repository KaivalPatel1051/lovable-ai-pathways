import axios, { AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => api.post('/auth/register', userData),

  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', { identifier: credentials.email, password: credentials.password }),

  logout: () => api.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),

  getCurrentUser: () => api.get('/auth/me'),

  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/users/profile'),

  updateProfile: (profileData: any) =>
    api.put('/users/profile', profileData),

  uploadProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return api.post('/users/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getUserById: (userId: string) => api.get(`/users/${userId}`),

  followUser: (userId: string) => api.post(`/users/${userId}/follow`),

  searchUsers: (query: string, page = 1, limit = 20) =>
    api.get(`/users/search?q=${query}&page=${page}&limit=${limit}`),

  getFollowers: (userId: string, page = 1, limit = 20) =>
    api.get(`/users/${userId}/followers?page=${page}&limit=${limit}`),

  getFollowing: (userId: string, page = 1, limit = 20) =>
    api.get(`/users/${userId}/following?page=${page}&limit=${limit}`),
};

// Chat API calls
export const chatAPI = {
  getChats: () => api.get('/chat'),

  getChatMessages: (chatId: string, page = 1, limit = 50) =>
    api.get(`/chat/${chatId}/messages?page=${page}&limit=${limit}`),

  createDirectChat: (userId: string) =>
    api.post('/chat/direct', { userId }),

  sendMessage: (chatId: string, messageData: {
    content: string;
    messageType: 'text' | 'image' | 'video' | 'audio';
    mediaUrl?: string;
  }) => api.post(`/chat/${chatId}/messages`, messageData),

  markAsRead: async (messageIds: string[]) => {
    return api.post('/chat/mark-read', { messageIds });
  },

  updateTypingStatus: (chatId: string, isTyping: boolean) =>
    api.post(`/chat/${chatId}/typing`, { isTyping }),

  addReaction: (messageId: string, emoji: string) =>
    api.post(`/chat/messages/${messageId}/react`, { emoji }),
};

// Addiction Profile APIs
export const addictionProfileAPI = {
  createAddictionProfile: async (profileData: any) => {
    return api.post('/addiction/profile', profileData);
  },

  getAddictionProfile: async () => {
    return api.get('/addiction/profile');
  },

  updateAddictionProfile: async (profileData: any) => {
    return api.put('/addiction/profile', profileData);
  },

  getAddictionInsights: async () => {
    return api.get('/addiction/insights');
  },
};

// Reels API calls
export const reelsAPI = {
  getReels: (page = 1, limit = 10, trending = false) =>
    api.get(`/reels?page=${page}&limit=${limit}&trending=${trending}`),

  getReel: (id: string) => api.get(`/reels/${id}`),

  likeReel: (id: string) => api.post(`/reels/${id}/like`),

  shareReel: (id: string) => api.post(`/reels/${id}/share`),

  addComment: (reelId: string, content: string) =>
    api.post(`/reels/${reelId}/comments`, { content }),

  getComments: (reelId: string, page = 1, limit = 20) =>
    api.get(`/reels/${reelId}/comments?page=${page}&limit=${limit}`),

  // Additional methods for EnhancedReelsPage compatibility
  getReelComments: (reelId: string, page = 1, limit = 20) =>
    api.get(`/reels/${reelId}/comments?page=${page}&limit=${limit}`),
  
  addReelComment: (reelId: string, content: string) =>
    api.post(`/reels/${reelId}/comments`, { content }),

  recordView: (reelId: string, watchTime = 0) =>
    api.post(`/reels/${reelId}/view`, { watchTime }),

  getUserReels: (userId: string, page = 1, limit = 12) =>
    api.get(`/reels/user/${userId}?page=${page}&limit=${limit}`),
};

// Stats API calls
export const statsAPI = {
  getPlatformStats: () => api.get('/stats/platform'),

  getUserStats: (userId: string) => api.get(`/stats/user/${userId}`),

  getDashboardStats: () => api.get('/stats/dashboard'),
};

// Error handling helper
export const handleAPIError = (error: AxiosError) => {
  if (error.response) {
    // Server responded with error status
    const message = (error.response.data as any)?.message || 'An error occurred';
    return { message, status: error.response.status };
  } else if (error.request) {
    // Request was made but no response received
    return { message: 'Network error. Please check your connection.', status: 0 };
  } else {
    // Something else happened
    return { message: error.message || 'An unexpected error occurred', status: 0 };
  }
};

// Combined API service object
const apiService = {
  ...authAPI,
  ...userAPI,
  ...chatAPI,
  ...addictionProfileAPI,
  ...reelsAPI,
  ...statsAPI
};

// Default export for the main API service
export default apiService;
