const express = require('express');
const User = require('../models/User');
const Reel = require('../models/Reel');
const Chat = require('../models/Chat');

const router = express.Router();

// @route   GET /api/stats/platform
// @desc    Get platform-wide statistics for counters
// @access  Private
router.get('/platform', async (req, res) => {
  try {
    // Get user statistics
    const userStats = await User.getUserStats();
    
    // Get reel statistics
    const reelStats = await Reel.getPlatformStats();
    
    // Get chat statistics
    const chatStats = await Chat.aggregate([
      {
        $group: {
          _id: null,
          totalChats: { $sum: 1 },
          totalMessages: { $sum: { $size: '$messages' } },
          activeChats: {
            $sum: {
              $cond: [{ $eq: ['$isActive', true] }, 1, 0]
            }
          }
        }
      }
    ]);

    const chatData = chatStats[0] || {
      totalChats: 0,
      totalMessages: 0,
      activeChats: 0
    };

    // Calculate additional metrics
    const totalEngagements = reelStats.totalLikes + reelStats.totalComments + reelStats.totalShares;
    const averageReelsPerUser = userStats.totalUsers > 0 ? Math.round(reelStats.totalReels / userStats.totalUsers * 100) / 100 : 0;
    const averageMessagesPerChat = chatData.totalChats > 0 ? Math.round(chatData.totalMessages / chatData.totalChats * 100) / 100 : 0;

    // Get recent activity (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: yesterday }
    });

    const recentReels = await Reel.countDocuments({
      createdAt: { $gte: yesterday },
      isActive: true,
      isDeleted: false
    });

    const recentChats = await Chat.countDocuments({
      createdAt: { $gte: yesterday },
      isActive: true
    });

    const platformStats = {
      // User Statistics
      totalUsers: userStats.totalUsers,
      activeUsers: userStats.activeUsers,
      verifiedUsers: userStats.verifiedUsers,
      newUsersToday: recentUsers,
      
      // Content Statistics
      totalReels: reelStats.totalReels,
      totalViews: reelStats.totalViews,
      totalLikes: reelStats.totalLikes,
      totalComments: reelStats.totalComments,
      totalShares: reelStats.totalShares,
      totalEngagements: totalEngagements,
      newReelsToday: recentReels,
      averageEngagement: Math.round(reelStats.averageEngagement * 100) / 100,
      
      // Chat Statistics
      totalChats: chatData.totalChats,
      totalMessages: chatData.totalMessages,
      activeChats: chatData.activeChats,
      newChatsToday: recentChats,
      
      // Calculated Metrics
      averageReelsPerUser,
      averageMessagesPerChat,
      
      // Recovery-Specific Stats
      totalDaysSober: 0, // Will be calculated from user sobriety dates
      averageSobrietyDays: 0,
      
      // Engagement Rates
      userEngagementRate: userStats.totalUsers > 0 ? Math.round((userStats.activeUsers / userStats.totalUsers) * 100) : 0,
      contentEngagementRate: reelStats.totalViews > 0 ? Math.round((totalEngagements / reelStats.totalViews) * 100) : 0,
      
      // Growth Metrics
      dailyGrowthRate: {
        users: recentUsers,
        reels: recentReels,
        chats: recentChats
      }
    };

    // Calculate recovery-specific statistics
    const sobrietyStats = await User.aggregate([
      {
        $match: {
          sobrietyDate: { $exists: true, $ne: null },
          isActive: true
        }
      },
      {
        $project: {
          daysSober: {
            $divide: [
              { $subtract: [new Date(), '$sobrietyDate'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalDaysSober: { $sum: '$daysSober' },
          averageDaysSober: { $avg: '$daysSober' },
          maxDaysSober: { $max: '$daysSober' },
          usersWithSobrietyDate: { $sum: 1 }
        }
      }
    ]);

    if (sobrietyStats.length > 0) {
      platformStats.totalDaysSober = Math.round(sobrietyStats[0].totalDaysSober);
      platformStats.averageSobrietyDays = Math.round(sobrietyStats[0].averageDaysSober);
      platformStats.maxSobrietyDays = Math.round(sobrietyStats[0].maxDaysSober);
      platformStats.usersInRecovery = sobrietyStats[0].usersWithSobrietyDate;
    }

    res.json({
      success: true,
      data: {
        stats: platformStats,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching platform statistics'
    });
  }
});

// @route   GET /api/stats/user/:userId
// @desc    Get user-specific statistics
// @access  Private
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's reels statistics
    const userReels = await Reel.find({
      creator: userId,
      isActive: true,
      isDeleted: false
    });

    const reelStats = {
      totalReels: userReels.length,
      totalViews: userReels.reduce((sum, reel) => sum + reel.analytics.totalViews, 0),
      totalLikes: userReels.reduce((sum, reel) => sum + reel.likes.length, 0),
      totalComments: userReels.reduce((sum, reel) => sum + reel.comments.length, 0),
      totalShares: userReels.reduce((sum, reel) => sum + reel.shares.length, 0),
      averageEngagement: userReels.length > 0 
        ? userReels.reduce((sum, reel) => sum + reel.analytics.engagementRate, 0) / userReels.length 
        : 0
    };

    // Get user's chat statistics
    const userChats = await Chat.find({
      participants: userId,
      isActive: true
    });

    const chatStats = {
      totalChats: userChats.length,
      totalMessages: userChats.reduce((sum, chat) => sum + chat.messages.length, 0),
      messagesSent: userChats.reduce((sum, chat) => 
        sum + chat.messages.filter(msg => msg.sender.toString() === userId).length, 0
      )
    };

    // Recovery statistics
    const recoveryStats = {
      daysSober: user.daysSober,
      sobrietyDate: user.sobrietyDate,
      streakDays: user.streakDays,
      recoveryGoals: user.recoveryGoals.length
    };

    // Social statistics
    const socialStats = {
      followers: user.followerCount,
      following: user.followingCount,
      profileViews: 0, // Can be implemented later
      profileCompleteness: calculateProfileCompleteness(user)
    };

    const userStats = {
      user: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        joinedDate: user.createdAt
      },
      content: reelStats,
      communication: chatStats,
      recovery: recoveryStats,
      social: socialStats,
      achievements: {
        // Can be expanded with achievement system
        totalAchievements: 0,
        recentAchievements: []
      }
    };

    res.json({
      success: true,
      data: {
        stats: userStats,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics'
    });
  }
});

// @route   GET /api/stats/dashboard
// @desc    Get dashboard statistics for current user
// @access  Private
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's personal stats
    const user = await User.findById(userId);
    
    // Get recent activity
    const recentReels = await Reel.find({
      creator: userId,
      isActive: true,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('creator', 'username firstName lastName profilePicture');

    const recentChats = await Chat.find({
      participants: userId,
      isActive: true
    })
    .sort({ 'lastMessage.timestamp': -1 })
    .limit(5)
    .populate('participants', 'username firstName lastName profilePicture');

    // Calculate weekly progress
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyReels = await Reel.countDocuments({
      creator: userId,
      createdAt: { $gte: weekAgo },
      isActive: true,
      isDeleted: false
    });

    const weeklyMessages = await Chat.aggregate([
      {
        $match: {
          participants: userId,
          'messages.createdAt': { $gte: weekAgo }
        }
      },
      {
        $project: {
          weeklyMessages: {
            $size: {
              $filter: {
                input: '$messages',
                cond: {
                  $and: [
                    { $gte: ['$$this.createdAt', weekAgo] },
                    { $eq: ['$$this.sender', userId] }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalWeeklyMessages: { $sum: '$weeklyMessages' }
        }
      }
    ]);

    const dashboardStats = {
      personal: {
        daysSober: user.daysSober,
        streakDays: user.streakDays,
        totalReels: user.totalReels,
        totalLikes: user.totalLikes,
        followers: user.followerCount,
        following: user.followingCount
      },
      weekly: {
        reelsCreated: weeklyReels,
        messagesSent: weeklyMessages.length > 0 ? weeklyMessages[0].totalWeeklyMessages : 0,
        engagementReceived: 0 // Can be calculated from recent likes/comments
      },
      recent: {
        reels: recentReels,
        chats: recentChats
      },
      goals: {
        recoveryGoals: user.recoveryGoals,
        completedGoals: 0, // Can be implemented with goal tracking
        progressPercentage: 0
      }
    };

    res.json({
      success: true,
      data: {
        stats: dashboardStats,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
});

// Helper function to calculate profile completeness
function calculateProfileCompleteness(user) {
  let completeness = 0;
  const fields = [
    'firstName',
    'lastName',
    'bio',
    'profilePicture',
    'sobrietyDate',
    'recoveryGoals'
  ];

  fields.forEach(field => {
    if (field === 'recoveryGoals') {
      if (user[field] && user[field].length > 0) completeness += 1;
    } else if (user[field]) {
      completeness += 1;
    }
  });

  return Math.round((completeness / fields.length) * 100);
}

module.exports = router;
