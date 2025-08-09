const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/chat
// @desc    Get user's chats
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const chats = await Chat.findUserChats(req.user._id, parseInt(page), parseInt(limit));
    
    // Calculate unread count for each chat
    const chatsWithUnread = chats.map(chat => {
      const unreadCount = chat.messages.filter(message => 
        message.sender.toString() !== req.user._id.toString() &&
        !message.readBy.some(read => read.user.toString() === req.user._id.toString())
      ).length;
      
      return {
        ...chat.toObject(),
        unreadCount
      };
    });

    res.json({
      success: true,
      data: {
        chats: chatsWithUnread,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: chats.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chats'
    });
  }
});

// @route   GET /api/chat/:chatId
// @desc    Get specific chat with messages
// @access  Private
router.get('/:chatId', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate('participants', 'username firstName lastName profilePicture isActive')
      .populate('messages.sender', 'username firstName lastName profilePicture')
      .populate('messages.reactions.user', 'username firstName lastName profilePicture');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Paginate messages (newest first)
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedMessages = chat.messages
      .slice()
      .reverse()
      .slice(startIndex, endIndex);

    const chatData = {
      ...chat.toObject(),
      messages: paginatedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: endIndex < chat.messages.length
      }
    };

    res.json({
      success: true,
      data: { chat: chatData }
    });

  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat'
    });
  }
});

// @route   POST /api/chat/direct
// @desc    Create or get direct chat
// @access  Private
router.post('/direct', [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId } = req.body;

    // Check if trying to chat with self
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create chat with yourself'
      });
    }

    // Check if other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find or create direct chat
    const chat = await Chat.findOrCreateDirectChat(req.user._id, userId);

    res.json({
      success: true,
      data: { chat }
    });

  } catch (error) {
    console.error('Create direct chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating chat'
    });
  }
});

// @route   POST /api/chat/:chatId/messages
// @desc    Send message to chat
// @access  Private
router.post('/:chatId/messages', [
  body('content')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'voice', 'emoji'])
    .withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { chatId } = req.params;
    const { content, messageType = 'text', replyTo, media, voiceNote } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate message content
    if (!content && !media && !voiceNote) {
      return res.status(400).json({
        success: false,
        message: 'Message content, media, or voice note is required'
      });
    }

    // Create message
    const messageData = {
      sender: req.user._id,
      content,
      messageType,
      replyTo,
      media,
      voiceNote
    };

    await chat.addMessage(messageData);

    // Get the newly added message with populated sender
    const updatedChat = await Chat.findById(chatId)
      .populate('messages.sender', 'username firstName lastName profilePicture');
    
    const newMessage = updatedChat.messages[updatedChat.messages.length - 1];

    // Emit real-time message via Socket.io
    if (req.io) {
      chat.participants.forEach(participantId => {
        if (participantId.toString() !== req.user._id.toString()) {
          req.io.to(`user_${participantId}`).emit('new_message', {
            chatId: chat._id,
            message: newMessage,
            chat: {
              _id: chat._id,
              chatType: chat.chatType,
              participants: chat.participants,
              lastMessage: chat.lastMessage
            }
          });
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: newMessage }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
});

// @route   PUT /api/chat/:chatId/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/:chatId/messages/:messageId/read', async (req, res) => {
  try {
    const { chatId, messageId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await chat.markAsRead(req.user._id, [messageId]);

    // Emit read receipt via Socket.io
    if (req.io) {
      chat.participants.forEach(participantId => {
        if (participantId.toString() !== req.user._id.toString()) {
          req.io.to(`user_${participantId}`).emit('message_read', {
            chatId: chat._id,
            messageId,
            readBy: req.user._id
          });
        }
      });
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking message as read'
    });
  }
});

// @route   POST /api/chat/:chatId/messages/:messageId/reactions
// @desc    Add reaction to message
// @access  Private
router.post('/:chatId/messages/:messageId/reactions', [
  body('emoji')
    .notEmpty()
    .withMessage('Emoji is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { chatId, messageId } = req.params;
    const { emoji } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await chat.addReaction(messageId, req.user._id, emoji);

    // Emit reaction via Socket.io
    if (req.io) {
      chat.participants.forEach(participantId => {
        req.io.to(`user_${participantId}`).emit('message_reaction', {
          chatId: chat._id,
          messageId,
          reaction: {
            user: req.user._id,
            emoji,
            createdAt: new Date()
          }
        });
      });
    }

    res.json({
      success: true,
      message: 'Reaction added successfully'
    });

  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding reaction'
    });
  }
});

// @route   POST /api/chat/:chatId/typing
// @desc    Update typing status
// @access  Private
router.post('/:chatId/typing', [
  body('isTyping')
    .isBoolean()
    .withMessage('isTyping must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { chatId } = req.params;
    const { isTyping } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await chat.updateTypingStatus(req.user._id, isTyping);

    // Emit typing status via Socket.io
    if (req.io) {
      chat.participants.forEach(participantId => {
        if (participantId.toString() !== req.user._id.toString()) {
          req.io.to(`user_${participantId}`).emit('typing_status', {
            chatId: chat._id,
            userId: req.user._id,
            isTyping,
            user: {
              _id: req.user._id,
              username: req.user.username,
              firstName: req.user.firstName,
              lastName: req.user.lastName
            }
          });
        }
      });
    }

    res.json({
      success: true,
      message: 'Typing status updated'
    });

  } catch (error) {
    console.error('Update typing status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating typing status'
    });
  }
});

module.exports = router;
