# Addiction Recovery App - Backend API

A comprehensive Node.js backend for the addiction recovery social media app with real-time chat, reels, authentication, and social features.

## 🚀 Features

- **Authentication & Security**: JWT-based auth, email verification, password reset
- **Real-time Chat**: Socket.io powered messaging with typing indicators, read receipts
- **Reels System**: Video upload, likes, comments, shares with Cloudinary integration
- **User Management**: Profiles, following/followers, search functionality
- **Statistics API**: Platform and user analytics for dynamic counters
- **Recovery Features**: Sobriety tracking, goals, chatbot support
- **Cloud Storage**: Cloudinary integration for media files
- **Rate Limiting**: Protection against abuse and spam
- **Error Handling**: Comprehensive error management and logging

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account for media storage
- Email service (Gmail, SendGrid, etc.)

## 🛠️ Installation

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Setup:**
```bash
cp .env.example .env
```

4. **Configure environment variables in `.env`:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/addiction-recovery
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/addiction-recovery

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret-here
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_SECRET=your-session-secret-here
```

5. **Start the server:**
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 🔗 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh-token` - Refresh JWT token
- `POST /verify-email` - Email verification
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset confirmation
- `GET /me` - Get current user info

### User Routes (`/api/users`)
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile
- `POST /profile/picture` - Upload profile picture
- `GET /:userId` - Get user by ID
- `POST /:userId/follow` - Follow/unfollow user
- `GET /search` - Search users
- `GET /:userId/followers` - Get user followers
- `GET /:userId/following` - Get user following

### Chat Routes (`/api/chat`)
- `GET /` - Get user's chats
- `POST /direct` - Create direct chat
- `POST /:chatId/messages` - Send message
- `PUT /:chatId/read` - Mark messages as read
- `POST /:chatId/typing` - Update typing status
- `POST /messages/:messageId/react` - Add message reaction

### Reels Routes (`/api/reels`)
- `GET /` - Get reels feed
- `GET /:reelId` - Get specific reel
- `POST /` - Create new reel
- `POST /:reelId/like` - Toggle like
- `POST /:reelId/save` - Toggle save
- `POST /:reelId/comments` - Add comment
- `POST /:reelId/share` - Share reel
- `POST /:reelId/view` - Record view
- `GET /user/:userId` - Get user's reels

### Statistics Routes (`/api/stats`)
- `GET /platform` - Platform-wide statistics
- `GET /user/:userId` - User-specific statistics
- `GET /dashboard` - Dashboard statistics for current user

## 🔌 Socket.io Events

### Client to Server Events
- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `send_message` - Send real-time message
- `message_read` - Mark message as read
- `reel_interaction` - Reel like/comment/share
- `status_update` - Update user status
- `chatbot_message` - Send message to chatbot

### Server to Client Events
- `user_online` - User came online
- `user_offline` - User went offline
- `user_typing` - Typing indicator update
- `new_message` - New message received
- `message_read_receipt` - Message read confirmation
- `reel_update` - Reel interaction update
- `chatbot_response` - Chatbot response
- `user_status_update` - User status change

## 🎯 Frontend Integration

### 1. Install Frontend Dependencies
```bash
# In your React app directory
npm install axios socket.io-client
```

### 2. Create API Service
```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3. Create Socket Service
```javascript
// src/services/socket.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    this.socket = io('http://localhost:5000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Chat methods
  joinChat(chatId) {
    this.socket?.emit('join_chat', { chatId });
  }

  sendMessage(chatId, message) {
    this.socket?.emit('send_message', { chatId, message });
  }

  startTyping(chatId) {
    this.socket?.emit('typing_start', { chatId });
  }

  stopTyping(chatId) {
    this.socket?.emit('typing_stop', { chatId });
  }

  // Event listeners
  onNewMessage(callback) {
    this.socket?.on('new_message', callback);
  }

  onUserTyping(callback) {
    this.socket?.on('user_typing', callback);
  }

  onReelUpdate(callback) {
    this.socket?.on('reel_update', callback);
  }
}

export default new SocketService();
```

### 4. Update Counter Components
```javascript
// src/components/Counter.tsx - Example integration
import { useEffect, useState } from 'react';
import api from '../services/api';

export const Counter = ({ type, ...props }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats/platform');
        const stats = response.data.data.stats;
        
        switch (type) {
          case 'users':
            setCount(stats.totalUsers);
            break;
          case 'reels':
            setCount(stats.totalReels);
            break;
          case 'messages':
            setCount(stats.totalMessages);
            break;
          case 'daysSober':
            setCount(stats.totalDaysSober);
            break;
          default:
            setCount(0);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [type]);

  return <div className="counter">{count.toLocaleString()}</div>;
};
```

### 5. Update Chat Component
```javascript
// src/pages/ChatPage.tsx - Add real-time functionality
import { useEffect, useState } from 'react';
import api from '../services/api';
import socketService from '../services/socket';

export const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  useEffect(() => {
    // Connect to socket
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
    }

    // Load chats
    loadChats();

    // Socket event listeners
    socketService.onNewMessage((data) => {
      if (data.chatId === currentChat?._id) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const loadChats = async () => {
    try {
      const response = await api.get('/chat');
      setChats(response.data.data.chats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const sendMessage = async (content) => {
    try {
      const response = await api.post(`/chat/${currentChat._id}/messages`, {
        content,
        messageType: 'text'
      });
      
      // Also emit via socket for real-time delivery
      socketService.sendMessage(currentChat._id, response.data.data.message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Rest of your chat component...
};
```

### 6. Update Reels Component
```javascript
// src/pages/ReelsPage.tsx - Add backend integration
import { useEffect, useState } from 'react';
import api from '../services/api';
import socketService from '../services/socket';

export const ReelsPage = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReels();
    
    // Listen for real-time reel updates
    socketService.onReelUpdate((data) => {
      setReels(prev => prev.map(reel => 
        reel._id === data.reelId 
          ? { ...reel, [data.type + 'Count']: data.value }
          : reel
      ));
    });
  }, []);

  const loadReels = async () => {
    try {
      const response = await api.get('/reels');
      setReels(response.data.data.reels);
    } catch (error) {
      console.error('Failed to load reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (reelId) => {
    try {
      const response = await api.post(`/reels/${reelId}/like`);
      const { liked, likeCount } = response.data.data;
      
      setReels(prev => prev.map(reel => 
        reel._id === reelId 
          ? { ...reel, isLiked: liked, likeCount }
          : reel
      ));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  // Rest of your reels component...
};
```

## 🚀 Deployment

### Using Heroku
1. Create Heroku app: `heroku create your-app-name`
2. Set environment variables: `heroku config:set MONGODB_URI=your-mongo-uri`
3. Deploy: `git push heroku main`

### Using DigitalOcean/AWS
1. Set up MongoDB Atlas for database
2. Configure environment variables
3. Use PM2 for process management
4. Set up reverse proxy with Nginx

## 🔧 Development

### Running Tests
```bash
npm test
```

### Code Formatting
```bash
npm run format
```

### Database Seeding
```bash
npm run seed
```

## 📚 Additional Resources

- [Socket.io Documentation](https://socket.io/docs/)
- [Cloudinary API Reference](https://cloudinary.com/documentation)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/)

## 🤝 Support

For issues and questions, please check the API documentation or create an issue in the repository.

---

**Note**: Make sure to update the `FRONTEND_URL` in your environment variables when deploying to production to match your frontend domain.
