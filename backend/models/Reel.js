const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Reply cannot exceed 500 characters']
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

const reelSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    trim: true
  },
  
  // Creator Information
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Media Information
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required']
  },
  thumbnailUrl: {
    type: String,
    required: [true, 'Thumbnail URL is required']
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  thumbnailPublicId: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true,
    min: [1, 'Duration must be at least 1 second'],
    max: [300, 'Duration cannot exceed 5 minutes']
  },
  fileSize: {
    type: Number, // in bytes
    required: true
  },
  resolution: {
    width: Number,
    height: Number
  },
  
  // Content Categorization
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
    trim: true
  }],
  category: {
    type: String,
    enum: [
      'motivation',
      'meditation',
      'exercise',
      'story',
      'tips',
      'support',
      'celebration',
      'education',
      'other'
    ],
    default: 'other'
  },
  
  // Recovery-Specific Fields
  recoveryMilestone: {
    type: String,
    enum: ['1-day', '1-week', '1-month', '3-months', '6-months', '1-year', '2-years', '5-years', 'other'],
    default: null
  },
  isInspirational: {
    type: Boolean,
    default: false
  },
  triggerWarning: {
    type: Boolean,
    default: false
  },
  triggerContent: [{
    type: String,
    enum: ['substance-mention', 'relapse-discussion', 'trauma', 'mental-health', 'other']
  }],
  
  // Engagement Metrics
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    platform: {
      type: String,
      enum: ['internal', 'external'],
      default: 'internal'
    }
  }],
  saves: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    watchTime: {
      type: Number, // in seconds
      default: 0
    },
    completedView: {
      type: Boolean,
      default: false
    }
  }],
  
  // Content Moderation
  isApproved: {
    type: Boolean,
    default: true
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved'
  },
  moderationNotes: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  
  // Visibility Settings
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  
  // Analytics
  analytics: {
    totalViews: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    averageWatchTime: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    engagementRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
reelSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
reelSchema.virtual('commentCount').get(function() {
  return this.comments.filter(comment => !comment.isDeleted).length;
});

// Virtual for share count
reelSchema.virtual('shareCount').get(function() {
  return this.shares.length;
});

// Virtual for save count
reelSchema.virtual('saveCount').get(function() {
  return this.saves.length;
});

// Virtual for view count
reelSchema.virtual('viewCount').get(function() {
  return this.views.length;
});

// Indexes for better performance
reelSchema.index({ creator: 1 });
reelSchema.index({ createdAt: -1 });
reelSchema.index({ isPublic: 1, isActive: 1, isDeleted: 1 });
reelSchema.index({ category: 1 });
reelSchema.index({ tags: 1 });
reelSchema.index({ 'analytics.totalViews': -1 });
reelSchema.index({ 'analytics.engagementRate': -1 });

commentSchema.index({ user: 1 });
commentSchema.index({ createdAt: -1 });

// Pre-save middleware to update analytics
reelSchema.pre('save', function(next) {
  if (this.isModified('views') || this.isModified('likes') || this.isModified('comments') || this.isModified('shares')) {
    // Update analytics
    this.analytics.totalViews = this.views.length;
    this.analytics.uniqueViews = new Set(this.views.map(view => view.user.toString())).size;
    
    if (this.views.length > 0) {
      const totalWatchTime = this.views.reduce((sum, view) => sum + (view.watchTime || 0), 0);
      this.analytics.averageWatchTime = totalWatchTime / this.views.length;
      
      const completedViews = this.views.filter(view => view.completedView).length;
      this.analytics.completionRate = (completedViews / this.views.length) * 100;
    }
    
    // Calculate engagement rate
    const totalEngagements = this.likes.length + this.comments.length + this.shares.length;
    this.analytics.engagementRate = this.analytics.uniqueViews > 0 
      ? (totalEngagements / this.analytics.uniqueViews) * 100 
      : 0;
  }
  next();
});

// Static method to get trending reels
reelSchema.statics.getTrendingReels = function(limit = 20, timeframe = 24) {
  const hoursAgo = new Date(Date.now() - timeframe * 60 * 60 * 1000);
  
  return this.find({
    isPublic: true,
    isActive: true,
    isDeleted: false,
    isApproved: true,
    createdAt: { $gte: hoursAgo }
  })
  .populate('creator', 'username firstName lastName profilePicture isEmailVerified')
  .sort({ 'analytics.engagementRate': -1, 'analytics.totalViews': -1 })
  .limit(limit);
};

// Static method to get reels feed for user
reelSchema.statics.getFeedForUser = function(userId, page = 1, limit = 10) {
  return this.find({
    isPublic: true,
    isActive: true,
    isDeleted: false,
    isApproved: true
  })
  .populate('creator', 'username firstName lastName profilePicture isEmailVerified')
  .populate('comments.user', 'username firstName lastName profilePicture')
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
};

// Static method to get user's reels
reelSchema.statics.getUserReels = function(userId, page = 1, limit = 12) {
  return this.find({
    creator: userId,
    isActive: true,
    isDeleted: false
  })
  .populate('creator', 'username firstName lastName profilePicture')
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
};

// Instance method to add view
reelSchema.methods.addView = function(userId, watchTime = 0) {
  const existingView = this.views.find(view => view.user.toString() === userId.toString());
  
  if (existingView) {
    // Update existing view
    existingView.watchTime = Math.max(existingView.watchTime, watchTime);
    existingView.completedView = watchTime >= (this.duration * 0.8); // 80% completion
    existingView.viewedAt = new Date();
  } else {
    // Add new view
    this.views.push({
      user: userId,
      watchTime: watchTime,
      completedView: watchTime >= (this.duration * 0.8),
      viewedAt: new Date()
    });
  }
  
  return this.save();
};

// Instance method to toggle like
reelSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
    return { liked: false, likeCount: this.likes.length };
  } else {
    this.likes.push(userId);
    return { liked: true, likeCount: this.likes.length };
  }
};

// Instance method to toggle save
reelSchema.methods.toggleSave = function(userId) {
  const saveIndex = this.saves.indexOf(userId);
  
  if (saveIndex > -1) {
    this.saves.splice(saveIndex, 1);
    return { saved: false, saveCount: this.saves.length };
  } else {
    this.saves.push(userId);
    return { saved: true, saveCount: this.saves.length };
  }
};

// Instance method to add comment
reelSchema.methods.addComment = function(userId, content) {
  const comment = {
    user: userId,
    content: content,
    createdAt: new Date()
  };
  
  this.comments.push(comment);
  return this.save();
};

// Instance method to add share
reelSchema.methods.addShare = function(userId, platform = 'internal') {
  this.shares.push({
    user: userId,
    platform: platform,
    sharedAt: new Date()
  });
  
  return this.save();
};

// Static method to get platform statistics
reelSchema.statics.getPlatformStats = async function() {
  const stats = await this.aggregate([
    {
      $match: {
        isActive: true,
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        totalReels: { $sum: 1 },
        totalViews: { $sum: '$analytics.totalViews' },
        totalLikes: { $sum: { $size: '$likes' } },
        totalComments: { $sum: { $size: '$comments' } },
        totalShares: { $sum: { $size: '$shares' } },
        averageEngagement: { $avg: '$analytics.engagementRate' }
      }
    }
  ]);
  
  return stats[0] || {
    totalReels: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    averageEngagement: 0
  };
};

module.exports = mongoose.model('Reel', reelSchema);
