const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');

// Store active users and their socket connections
const activeUsers = new Map();

const socketHandler = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected with socket ID: ${socket.id}`);

    // Add user to active users
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      lastSeen: new Date(),
      status: 'online'
    });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Emit user online status to their contacts
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      username: socket.user.username,
      status: 'online'
    });

    // Handle joining chat rooms
    socket.on('join_chat', async (data) => {
      try {
        const { chatId } = data;
        
        // Verify user is participant in the chat
        const chat = await Chat.findById(chatId);
        if (chat && chat.participants.includes(socket.userId)) {
          socket.join(`chat_${chatId}`);
          console.log(`User ${socket.user.username} joined chat ${chatId}`);
          
          // Notify other participants that user joined
          socket.to(`chat_${chatId}`).emit('user_joined_chat', {
            chatId,
            userId: socket.userId,
            username: socket.user.username
          });
        }
      } catch (error) {
        console.error('Join chat error:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle leaving chat rooms
    socket.on('leave_chat', (data) => {
      try {
        const { chatId } = data;
        socket.leave(`chat_${chatId}`);
        console.log(`User ${socket.user.username} left chat ${chatId}`);
        
        // Notify other participants that user left
        socket.to(`chat_${chatId}`).emit('user_left_chat', {
          chatId,
          userId: socket.userId,
          username: socket.user.username
        });
      } catch (error) {
        console.error('Leave chat error:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      try {
        const { chatId } = data;
        socket.to(`chat_${chatId}`).emit('user_typing', {
          chatId,
          userId: socket.userId,
          username: socket.user.username,
          isTyping: true
        });
      } catch (error) {
        console.error('Typing start error:', error);
      }
    });

    socket.on('typing_stop', (data) => {
      try {
        const { chatId } = data;
        socket.to(`chat_${chatId}`).emit('user_typing', {
          chatId,
          userId: socket.userId,
          username: socket.user.username,
          isTyping: false
        });
      } catch (error) {
        console.error('Typing stop error:', error);
      }
    });

    // Handle real-time message delivery
    socket.on('send_message', async (data) => {
      try {
        const { chatId, message } = data;
        
        // Verify user is participant in the chat
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Emit message to all participants in the chat
        socket.to(`chat_${chatId}`).emit('new_message', {
          chatId,
          message: {
            ...message,
            sender: {
              _id: socket.userId,
              username: socket.user.username,
              firstName: socket.user.firstName,
              lastName: socket.user.lastName,
              profilePicture: socket.user.profilePicture
            }
          }
        });

        console.log(`Message sent in chat ${chatId} by ${socket.user.username}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message read receipts
    socket.on('message_read', (data) => {
      try {
        const { chatId, messageId } = data;
        socket.to(`chat_${chatId}`).emit('message_read_receipt', {
          chatId,
          messageId,
          readBy: {
            _id: socket.userId,
            username: socket.user.username
          },
          readAt: new Date()
        });
      } catch (error) {
        console.error('Message read error:', error);
      }
    });

    // Handle reel interactions
    socket.on('reel_interaction', (data) => {
      try {
        const { reelId, type, value } = data; // type: 'like', 'comment', 'share'
        
        // Broadcast reel interaction to all connected users
        socket.broadcast.emit('reel_update', {
          reelId,
          type,
          value,
          user: {
            _id: socket.userId,
            username: socket.user.username,
            profilePicture: socket.user.profilePicture
          }
        });
      } catch (error) {
        console.error('Reel interaction error:', error);
      }
    });

    // Handle user status updates
    socket.on('status_update', (data) => {
      try {
        const { status } = data; // 'online', 'away', 'busy', 'offline'
        
        if (activeUsers.has(socket.userId)) {
          activeUsers.get(socket.userId).status = status;
          activeUsers.get(socket.userId).lastSeen = new Date();
        }

        // Broadcast status update
        socket.broadcast.emit('user_status_update', {
          userId: socket.userId,
          status,
          lastSeen: new Date()
        });
      } catch (error) {
        console.error('Status update error:', error);
      }
    });

    // Handle chatbot interactions
    socket.on('chatbot_message', async (data) => {
      try {
        const { message, chatId } = data;
        
        // Simple chatbot responses (can be enhanced with AI)
        const botResponse = generateChatbotResponse(message);
        
        // Send bot response after a short delay to simulate typing
        setTimeout(() => {
          socket.emit('chatbot_response', {
            chatId,
            message: {
              _id: new Date().getTime().toString(),
              content: botResponse,
              sender: {
                _id: 'chatbot',
                username: 'SupportBot',
                firstName: 'Support',
                lastName: 'Bot',
                profilePicture: '/api/placeholder/40/40'
              },
              messageType: 'text',
              createdAt: new Date()
            }
          });
        }, 1000 + Math.random() * 2000); // 1-3 second delay
      } catch (error) {
        console.error('Chatbot message error:', error);
      }
    });

    // Handle video call signaling (for future implementation)
    socket.on('call_user', (data) => {
      try {
        const { targetUserId, offer } = data;
        socket.to(`user_${targetUserId}`).emit('incoming_call', {
          from: socket.userId,
          offer,
          caller: {
            username: socket.user.username,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
            profilePicture: socket.user.profilePicture
          }
        });
      } catch (error) {
        console.error('Call user error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.user.username} disconnected: ${reason}`);
      
      // Update user status to offline
      if (activeUsers.has(socket.userId)) {
        activeUsers.get(socket.userId).status = 'offline';
        activeUsers.get(socket.userId).lastSeen = new Date();
      }

      // Notify other users that this user went offline
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        username: socket.user.username,
        lastSeen: new Date()
      });

      // Clean up typing indicators
      socket.broadcast.emit('user_typing', {
        userId: socket.userId,
        isTyping: false
      });

      // Remove from active users after a delay (in case of reconnection)
      setTimeout(() => {
        activeUsers.delete(socket.userId);
      }, 30000); // 30 seconds
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.user.username}:`, error);
    });
  });

  // Clean up old typing indicators periodically
  setInterval(() => {
    Chat.cleanOldTypingIndicators().catch(console.error);
  }, 5 * 60 * 1000); // Every 5 minutes
};

// Simple chatbot response generator
function generateChatbotResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Recovery-focused responses
  if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
    return "I'm here to help! Remember, you're not alone in your recovery journey. Would you like to talk about what's on your mind, or would you prefer some motivational resources?";
  }
  
  if (lowerMessage.includes('craving') || lowerMessage.includes('urge')) {
    return "Cravings are temporary, but your recovery is permanent. Try the 4-7-8 breathing technique: breathe in for 4, hold for 7, exhale for 8. You've got this! 💪";
  }
  
  if (lowerMessage.includes('relapse') || lowerMessage.includes('slip')) {
    return "A slip doesn't erase your progress. Recovery is a journey with ups and downs. What matters is getting back on track. Have you reached out to your support network?";
  }
  
  if (lowerMessage.includes('motivation') || lowerMessage.includes('inspire')) {
    return "Every day sober is a victory worth celebrating! 🌟 Remember why you started this journey. You're stronger than you know and braver than you feel.";
  }
  
  if (lowerMessage.includes('anxiety') || lowerMessage.includes('stress')) {
    return "Anxiety is tough, but you're tougher. Try grounding yourself: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.";
  }
  
  if (lowerMessage.includes('lonely') || lowerMessage.includes('alone')) {
    return "You're never truly alone in this community. We're all here supporting each other. Consider joining a group chat or sharing your story in the reels section.";
  }
  
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return "You're very welcome! I'm proud of you for reaching out and staying committed to your recovery. Keep up the amazing work! 🙏";
  }
  
  // Default responses
  const defaultResponses = [
    "I understand. Recovery is a personal journey, and everyone's path is different. How can I best support you today?",
    "Thank you for sharing that with me. Your honesty and courage in recovery are inspiring. What would be most helpful right now?",
    "I hear you. Remember that seeking help is a sign of strength, not weakness. You're taking positive steps by being here.",
    "That sounds challenging. In recovery, we learn to take things one day at a time. What's one small positive step you can take today?",
    "I appreciate you opening up. The recovery community is here to support you. Have you connected with others who understand your journey?"
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Export active users for potential use in other parts of the application
module.exports = socketHandler;
module.exports.activeUsers = activeUsers;
