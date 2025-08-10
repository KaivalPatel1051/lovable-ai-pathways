const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Reel = require('../models/Reel');
const Chat = require('../models/Chat');

// Admin middleware (simple password protection)
const adminAuth = (req, res, next) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const providedPassword = req.headers['x-admin-password'] || req.query.password;
  
  if (providedPassword !== adminPassword) {
    return res.status(401).json({ 
      success: false, 
      message: 'Admin authentication required. Add ?password=admin123 to URL or set X-Admin-Password header' 
    });
  }
  next();
};

// Get all users with their data
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    const usersWithStats = await Promise.all(users.map(async (user) => {
      // Get user's reels count
      const reelsCount = await Reel.countDocuments({ creator: user._id });
      
      // Get user's comments count
      const reelsWithComments = await Reel.find({ 'comments.user': user._id });
      const commentsCount = reelsWithComments.reduce((total, reel) => {
        return total + reel.comments.filter(comment => comment.user.toString() === user._id.toString()).length;
      }, 0);
      
      // Get user's chat messages count
      const chatCount = await Chat.countDocuments({
        $or: [{ sender: user._id }, { recipient: user._id }]
      });

      return {
        ...user.toObject(),
        stats: {
          reelsCreated: reelsCount,
          commentsPosted: commentsCount,
          messagesExchanged: chatCount
        }
      };
    }));

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        total: users.length
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Get specific user details with all their activity
router.get('/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user info
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get user's reels
    const userReels = await Reel.find({ creator: userId })
      .populate('creator', 'username firstName lastName')
      .sort({ createdAt: -1 });

    // Get user's comments
    const reelsWithUserComments = await Reel.find({ 'comments.user': userId })
      .populate('creator', 'username firstName lastName')
      .populate('comments.user', 'username firstName lastName');
    
    const userComments = [];
    reelsWithUserComments.forEach(reel => {
      reel.comments.forEach(comment => {
        if (comment.user._id.toString() === userId) {
          userComments.push({
            ...comment.toObject(),
            reelTitle: reel.title,
            reelCreator: reel.creator.username
          });
        }
      });
    });

    // Get user's chat messages
    const userChats = await Chat.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
    .populate('sender recipient', 'username firstName lastName')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({
      success: true,
      data: {
        user,
        reels: userReels,
        comments: userComments,
        chats: userChats,
        stats: {
          reelsCreated: userReels.length,
          commentsPosted: userComments.length,
          messagesExchanged: userChats.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user details' });
  }
});

// Get all reels with comments
router.get('/reels', adminAuth, async (req, res) => {
  try {
    const reels = await Reel.find({})
      .populate('creator', 'username firstName lastName profilePicture')
      .populate('comments.user', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        reels,
        total: reels.length
      }
    });
  } catch (error) {
    console.error('Error fetching reels:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reels' });
  }
});

// Get all chat messages
router.get('/chats', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({})
      .populate('sender recipient', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Chat.countDocuments();

    res.json({
      success: true,
      data: {
        chats,
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chats' });
  }
});

// Get database statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const reelCount = await Reel.countDocuments();
    const chatCount = await Chat.countDocuments();
    
    // Comment count
    const reelsWithComments = await Reel.find({});
    const totalComments = reelsWithComments.reduce((total, reel) => total + reel.comments.length, 0);
    
    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      lastActive: { $gte: thirtyDaysAgo }
    });

    // Users with addiction profiles
    const usersWithProfiles = await User.countDocuments({
      'addictionProfile.addictionType': { $exists: true, $ne: null }
    });

    // Recent activity
    const recentUsers = await User.find({})
      .select('username firstName lastName createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentReels = await Reel.find({})
      .populate('creator', 'username')
      .select('title creator createdAt likes comments shares')
      .sort({ createdAt: -1 })
      .limit(5);

    // Top creators
    const topCreators = await Reel.aggregate([
      {
        $group: {
          _id: '$creator',
          reelCount: { $sum: 1 },
          totalLikes: { $sum: '$likes' },
          totalComments: { $sum: { $size: '$comments' } }
        }
      },
      { $sort: { reelCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: userCount,
          activeUsers,
          totalReels: reelCount,
          totalComments,
          totalChats: chatCount,
          usersWithAddictionProfiles: usersWithProfiles
        },
        recentActivity: {
          recentUsers,
          recentReels
        },
        topCreators
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// Search functionality
router.get('/search', adminAuth, async (req, res) => {
  try {
    const { query, type } = req.query;
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }

    let results = {};

    if (!type || type === 'users') {
      results.users = await User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } }
        ]
      }).select('-password').limit(10);
    }

    if (!type || type === 'reels') {
      results.reels = await Reel.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      })
      .populate('creator', 'username firstName lastName')
      .limit(10);
    }

    if (!type || type === 'comments') {
      results.comments = await Reel.find({
        'comments.content': { $regex: query, $options: 'i' }
      })
      .populate('creator', 'username')
      .populate('comments.user', 'username firstName lastName')
      .limit(10);
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

module.exports = router;
