const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function() {
      return !this.media && !this.voiceNote;
    },
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'voice', 'emoji', 'system'],
    default: 'text'
  },
  media: {
    url: String,
    publicId: String, // For Cloudinary
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'document']
    },
    size: Number,
    filename: String
  },
  voiceNote: {
    url: String,
    publicId: String,
    duration: Number // in seconds
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  chatType: {
    type: String,
    enum: ['direct', 'group', 'support'],
    default: 'direct'
  },
  chatName: {
    type: String,
    maxlength: [100, 'Chat name cannot exceed 100 characters']
  },
  chatImage: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [messageSchema],
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'voice', 'emoji', 'system'],
      default: 'text'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Typing indicators
  typingUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastTyping: {
      type: Date,
      default: Date.now
    }
  }],
  // Chat settings
  settings: {
    muteNotifications: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      mutedUntil: Date
    }],
    allowNewMembers: {
      type: Boolean,
      default: true
    },
    onlyAdminsCanMessage: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for unread message count per user
chatSchema.virtual('unreadCount').get(function() {
  // This will be calculated dynamically in the API
  return 0;
});

// Virtual for participant count
chatSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Indexes for better performance
chatSchema.index({ participants: 1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ chatType: 1 });

messageSchema.index({ sender: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ 'readBy.user': 1 });

// Pre-save middleware to update lastMessage
chatSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessage = {
      content: lastMsg.content || 'Media message',
      sender: lastMsg.sender,
      timestamp: lastMsg.createdAt || new Date(),
      messageType: lastMsg.messageType
    };
  }
  next();
});

// Static method to find chats for a user
chatSchema.statics.findUserChats = function(userId, page = 1, limit = 20) {
  return this.find({
    participants: userId,
    isActive: true
  })
  .populate('participants', 'username firstName lastName profilePicture isActive')
  .populate('lastMessage.sender', 'username firstName lastName profilePicture')
  .sort({ 'lastMessage.timestamp': -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
};

// Static method to find or create direct chat
chatSchema.statics.findOrCreateDirectChat = async function(user1Id, user2Id) {
  let chat = await this.findOne({
    chatType: 'direct',
    participants: { $all: [user1Id, user2Id], $size: 2 }
  }).populate('participants', 'username firstName lastName profilePicture isActive');

  if (!chat) {
    chat = await this.create({
      participants: [user1Id, user2Id],
      chatType: 'direct'
    });
    
    chat = await this.findById(chat._id)
      .populate('participants', 'username firstName lastName profilePicture isActive');
  }

  return chat;
};

// Instance method to add message
chatSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  return this.save();
};

// Instance method to mark messages as read
chatSchema.methods.markAsRead = function(userId, messageIds = []) {
  if (messageIds.length === 0) {
    // Mark all messages as read
    this.messages.forEach(message => {
      const existingRead = message.readBy.find(read => read.user.toString() === userId.toString());
      if (!existingRead) {
        message.readBy.push({ user: userId, readAt: new Date() });
      }
    });
  } else {
    // Mark specific messages as read
    messageIds.forEach(msgId => {
      const message = this.messages.id(msgId);
      if (message) {
        const existingRead = message.readBy.find(read => read.user.toString() === userId.toString());
        if (!existingRead) {
          message.readBy.push({ user: userId, readAt: new Date() });
        }
      }
    });
  }
  
  return this.save();
};

// Instance method to add reaction
chatSchema.methods.addReaction = function(messageId, userId, emoji) {
  const message = this.messages.id(messageId);
  if (!message) throw new Error('Message not found');
  
  // Remove existing reaction from this user
  message.reactions = message.reactions.filter(
    reaction => reaction.user.toString() !== userId.toString()
  );
  
  // Add new reaction
  message.reactions.push({
    user: userId,
    emoji: emoji,
    createdAt: new Date()
  });
  
  return this.save();
};

// Instance method to remove reaction
chatSchema.methods.removeReaction = function(messageId, userId) {
  const message = this.messages.id(messageId);
  if (!message) throw new Error('Message not found');
  
  message.reactions = message.reactions.filter(
    reaction => reaction.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Instance method to update typing status
chatSchema.methods.updateTypingStatus = function(userId, isTyping) {
  if (isTyping) {
    const existingTyping = this.typingUsers.find(
      typing => typing.user.toString() === userId.toString()
    );
    
    if (existingTyping) {
      existingTyping.lastTyping = new Date();
    } else {
      this.typingUsers.push({
        user: userId,
        lastTyping: new Date()
      });
    }
  } else {
    this.typingUsers = this.typingUsers.filter(
      typing => typing.user.toString() !== userId.toString()
    );
  }
  
  return this.save();
};

// Static method to clean old typing indicators
chatSchema.statics.cleanOldTypingIndicators = function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  return this.updateMany(
    {},
    {
      $pull: {
        typingUsers: {
          lastTyping: { $lt: fiveMinutesAgo }
        }
      }
    }
  );
};

module.exports = mongoose.model('Chat', chatSchema);
