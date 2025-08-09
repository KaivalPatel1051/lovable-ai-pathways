const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -refreshTokens')
      .populate('recoveryGoals');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('sobrietyDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid sobriety date format'),
  body('recoveryGoals')
    .optional()
    .isArray()
    .withMessage('Recovery goals must be an array'),
  body('privacySettings.profileVisibility')
    .optional()
    .isIn(['public', 'friends', 'private'])
    .withMessage('Invalid profile visibility setting')
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

    const allowedUpdates = [
      'firstName',
      'lastName',
      'bio',
      'sobrietyDate',
      'recoveryGoals',
      'privacySettings',
      'notificationSettings'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   POST /api/users/profile/picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile/picture', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Profile picture file is required'
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'addiction-recovery/profiles',
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto', format: 'jpg' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Update user profile picture
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          profilePicture: result.secure_url,
          profilePicturePublicId: result.public_id
        }
      },
      { new: true }
    ).select('-password -refreshTokens');

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading profile picture'
    });
  }
});

// @route   GET /api/users/:userId
// @desc    Get user profile by ID
// @access  Private
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password -refreshTokens -email')
      .populate('recoveryGoals');

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check privacy settings
    if (user.privacySettings.profileVisibility === 'private' && 
        userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }

    // Filter data based on privacy settings and relationship
    const publicProfile = {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      bio: user.bio,
      joinedDate: user.createdAt,
      isEmailVerified: user.isEmailVerified,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      totalReels: user.totalReels
    };

    // Add more details if it's the user's own profile or if they're friends
    if (userId === req.user._id.toString() || 
        user.privacySettings.profileVisibility === 'public') {
      publicProfile.daysSober = user.daysSober;
      publicProfile.sobrietyDate = user.sobrietyDate;
      publicProfile.recoveryGoals = user.recoveryGoals;
    }

    res.json({
      success: true,
      data: { user: publicProfile }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
});

// @route   POST /api/users/:userId/follow
// @desc    Follow/unfollow user
// @access  Private
router.post('/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following.includes(userId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { following: userId },
        $inc: { followingCount: -1 }
      });
      
      await User.findByIdAndUpdate(userId, {
        $pull: { followers: req.user._id },
        $inc: { followerCount: -1 }
      });

      res.json({
        success: true,
        message: 'User unfollowed successfully',
        data: { following: false }
      });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { following: userId },
        $inc: { followingCount: 1 }
      });
      
      await User.findByIdAndUpdate(userId, {
        $addToSet: { followers: req.user._id },
        $inc: { followerCount: 1 }
      });

      res.json({
        success: true,
        message: 'User followed successfully',
        data: { following: true }
      });
    }

  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while following/unfollowing user'
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    const users = await User.find({
      $and: [
        { isActive: true },
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { username: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex },
            { $expr: { $regexMatch: { input: { $concat: ['$firstName', ' ', '$lastName'] }, regex: searchRegex } } }
          ]
        }
      ]
    })
    .select('username firstName lastName profilePicture bio isEmailVerified followerCount')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .sort({ followerCount: -1, createdAt: -1 });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: users.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users'
    });
  }
});

// @route   GET /api/users/:userId/followers
// @desc    Get user followers
// @access  Private
router.get('/:userId/followers', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const followers = await User.find({
      _id: { $in: user.followers }
    })
    .select('username firstName lastName profilePicture bio isEmailVerified')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        followers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: followers.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching followers'
    });
  }
});

// @route   GET /api/users/:userId/following
// @desc    Get users that this user is following
// @access  Private
router.get('/:userId/following', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const following = await User.find({
      _id: { $in: user.following }
    })
    .select('username firstName lastName profilePicture bio isEmailVerified')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        following,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: following.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching following'
    });
  }
});

module.exports = router;
