const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Reel = require('../models/Reel');
const User = require('../models/User');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// @route   GET /api/reels
// @desc    Get reels feed
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, trending } = req.query;

    let reels;
    
    if (trending === 'true') {
      reels = await Reel.getTrendingReels(parseInt(limit));
    } else {
      reels = await Reel.getFeedForUser(req.user._id, parseInt(page), parseInt(limit));
    }

    // Add user interaction data
    const reelsWithUserData = reels.map(reel => {
      const reelObj = reel.toObject();
      return {
        ...reelObj,
        isLiked: reel.likes.includes(req.user._id),
        isSaved: reel.saves.includes(req.user._id),
        hasViewed: reel.views.some(view => view.user.toString() === req.user._id.toString())
      };
    });

    res.json({
      success: true,
      data: {
        reels: reelsWithUserData,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: reels.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get reels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reels'
    });
  }
});

// @route   GET /api/reels/:reelId
// @desc    Get specific reel
// @access  Private
router.get('/:reelId', async (req, res) => {
  try {
    const { reelId } = req.params;

    const reel = await Reel.findById(reelId)
      .populate('creator', 'username firstName lastName profilePicture isEmailVerified')
      .populate('comments.user', 'username firstName lastName profilePicture')
      .populate('comments.replies.user', 'username firstName lastName profilePicture');

    if (!reel || !reel.isActive || reel.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    // Add view if not already viewed
    await reel.addView(req.user._id, 0);

    const reelData = {
      ...reel.toObject(),
      isLiked: reel.likes.includes(req.user._id),
      isSaved: reel.saves.includes(req.user._id),
      hasViewed: true
    };

    res.json({
      success: true,
      data: { reel: reelData }
    });

  } catch (error) {
    console.error('Get reel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reel'
    });
  }
});

// @route   POST /api/reels
// @desc    Create new reel
// @access  Private
router.post('/', upload.single('video'), [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and cannot exceed 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description is required and cannot exceed 2000 characters'),
  body('category')
    .optional()
    .isIn(['motivation', 'meditation', 'exercise', 'story', 'tips', 'support', 'celebration', 'education', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Video file is required'
      });
    }

    const { title, description, category = 'other', tags = [], recoveryMilestone, triggerWarning, triggerContent = [] } = req.body;

    // Upload video to Cloudinary
    const videoUpload = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'addiction-recovery/reels',
          quality: 'auto',
          format: 'mp4'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Generate thumbnail
    const thumbnailUpload = await cloudinary.uploader.upload(
      videoUpload.secure_url.replace('.mp4', '.jpg'),
      {
        resource_type: 'image',
        folder: 'addiction-recovery/thumbnails',
        transformation: [
          { width: 400, height: 600, crop: 'fill' },
          { quality: 'auto', format: 'jpg' }
        ]
      }
    );

    // Create reel
    const reel = new Reel({
      title,
      description,
      creator: req.user._id,
      videoUrl: videoUpload.secure_url,
      thumbnailUrl: thumbnailUpload.secure_url,
      cloudinaryPublicId: videoUpload.public_id,
      thumbnailPublicId: thumbnailUpload.public_id,
      duration: videoUpload.duration || 0,
      fileSize: videoUpload.bytes,
      resolution: {
        width: videoUpload.width,
        height: videoUpload.height
      },
      category,
      tags: Array.isArray(tags) ? tags : [],
      recoveryMilestone,
      triggerWarning: triggerWarning === 'true',
      triggerContent: Array.isArray(triggerContent) ? triggerContent : []
    });

    await reel.save();

    // Update user's reel count
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalReels: 1 } });

    // Populate creator info
    await reel.populate('creator', 'username firstName lastName profilePicture isEmailVerified');

    res.status(201).json({
      success: true,
      message: 'Reel created successfully',
      data: { reel }
    });

  } catch (error) {
    console.error('Create reel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating reel'
    });
  }
});

// @route   POST /api/reels/:reelId/like
// @desc    Toggle like on reel
// @access  Private
router.post('/:reelId/like', async (req, res) => {
  try {
    const { reelId } = req.params;

    const reel = await Reel.findById(reelId);
    if (!reel || !reel.isActive || reel.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    const result = reel.toggleLike(req.user._id);
    await reel.save();

    // Update creator's like count
    if (result.liked) {
      await User.findByIdAndUpdate(reel.creator, { $inc: { totalLikes: 1 } });
    } else {
      await User.findByIdAndUpdate(reel.creator, { $inc: { totalLikes: -1 } });
    }

    // Emit real-time update via Socket.io
    if (req.io) {
      req.io.emit('reel_like_update', {
        reelId: reel._id,
        likeCount: result.likeCount,
        liked: result.liked,
        userId: req.user._id
      });
    }

    res.json({
      success: true,
      message: result.liked ? 'Reel liked' : 'Reel unliked',
      data: {
        liked: result.liked,
        likeCount: result.likeCount
      }
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling like'
    });
  }
});

// @route   POST /api/reels/:reelId/save
// @desc    Toggle save on reel
// @access  Private
router.post('/:reelId/save', async (req, res) => {
  try {
    const { reelId } = req.params;

    const reel = await Reel.findById(reelId);
    if (!reel || !reel.isActive || reel.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    const result = reel.toggleSave(req.user._id);
    await reel.save();

    res.json({
      success: true,
      message: result.saved ? 'Reel saved' : 'Reel unsaved',
      data: {
        saved: result.saved,
        saveCount: result.saveCount
      }
    });

  } catch (error) {
    console.error('Toggle save error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling save'
    });
  }
});

// @route   POST /api/reels/:reelId/comments
// @desc    Add comment to reel
// @access  Private
router.post('/:reelId/comments', [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment is required and cannot exceed 500 characters')
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

    const { reelId } = req.params;
    const { content } = req.body;

    const reel = await Reel.findById(reelId);
    if (!reel || !reel.isActive || reel.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    await reel.addComment(req.user._id, content);

    // Update creator's comment count
    await User.findByIdAndUpdate(reel.creator, { $inc: { totalComments: 1 } });

    // Get the updated reel with populated comment
    const updatedReel = await Reel.findById(reelId)
      .populate('comments.user', 'username firstName lastName profilePicture');
    
    const newComment = updatedReel.comments[updatedReel.comments.length - 1];

    // Emit real-time update via Socket.io
    if (req.io) {
      req.io.emit('reel_comment_added', {
        reelId: reel._id,
        comment: newComment,
        commentCount: updatedReel.commentCount
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: newComment }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
});

// @route   POST /api/reels/:reelId/share
// @desc    Share reel
// @access  Private
router.post('/:reelId/share', [
  body('platform')
    .optional()
    .isIn(['internal', 'external'])
    .withMessage('Invalid platform')
], async (req, res) => {
  try {
    const { reelId } = req.params;
    const { platform = 'internal' } = req.body;

    const reel = await Reel.findById(reelId);
    if (!reel || !reel.isActive || reel.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    await reel.addShare(req.user._id, platform);

    // Emit real-time update via Socket.io
    if (req.io) {
      req.io.emit('reel_share_update', {
        reelId: reel._id,
        shareCount: reel.shareCount
      });
    }

    res.json({
      success: true,
      message: 'Reel shared successfully',
      data: {
        shareCount: reel.shareCount
      }
    });

  } catch (error) {
    console.error('Share reel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sharing reel'
    });
  }
});

// @route   POST /api/reels/:reelId/view
// @desc    Record reel view
// @access  Private
router.post('/:reelId/view', [
  body('watchTime')
    .optional()
    .isNumeric()
    .withMessage('Watch time must be a number')
], async (req, res) => {
  try {
    const { reelId } = req.params;
    const { watchTime = 0 } = req.body;

    const reel = await Reel.findById(reelId);
    if (!reel || !reel.isActive || reel.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    await reel.addView(req.user._id, parseFloat(watchTime));

    res.json({
      success: true,
      message: 'View recorded successfully'
    });

  } catch (error) {
    console.error('Record view error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording view'
    });
  }
});

// @route   GET /api/reels/user/:userId
// @desc    Get user's reels
// @access  Private
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const reels = await Reel.getUserReels(userId, parseInt(page), parseInt(limit));

    // Add user interaction data
    const reelsWithUserData = reels.map(reel => {
      const reelObj = reel.toObject();
      return {
        ...reelObj,
        isLiked: reel.likes.includes(req.user._id),
        isSaved: reel.saves.includes(req.user._id)
      };
    });

    res.json({
      success: true,
      data: {
        reels: reelsWithUserData,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: reels.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user reels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user reels'
    });
  }
});

module.exports = router;
