const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Addiction Profile Schema (embedded in User model)
const addictionProfileSchema = {
  addictionType: String,
  intensity: Number, // 1-10 scale
  frequency: String,
  peakUrgeTimes: [String],
  triggers: [String],
  duration: Number,
  durationUnit: String, // days, weeks, months, years
  previousAttempts: Boolean,
  previousAttemptsCount: Number,
  longestSobriety: Number,
  sobrietyUnit: String,
  motivations: [String],
  supportSystem: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// @route   POST /api/addiction/profile
// @desc    Create or update user's addiction profile
// @access  Private
router.post('/profile', authMiddleware, async (req, res) => {
  try {
    const {
      addictionType,
      intensity,
      frequency,
      peakUrgeTimes,
      triggers,
      duration,
      durationUnit,
      previousAttempts,
      previousAttemptsCount,
      longestSobriety,
      sobrietyUnit,
      motivations,
      supportSystem,
      notes
    } = req.body;

    // Validation
    if (!addictionType || !intensity || !frequency) {
      return res.status(400).json({
        success: false,
        message: 'Addiction type, intensity, and frequency are required'
      });
    }

    if (intensity < 1 || intensity > 10) {
      return res.status(400).json({
        success: false,
        message: 'Intensity must be between 1 and 10'
      });
    }

    // Find user and update addiction profile
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create addiction profile object
    const addictionProfile = {
      addictionType,
      intensity,
      frequency,
      peakUrgeTimes: peakUrgeTimes || [],
      triggers: triggers || [],
      duration,
      durationUnit,
      previousAttempts: previousAttempts || false,
      previousAttemptsCount: previousAttemptsCount || 0,
      longestSobriety: longestSobriety || 0,
      sobrietyUnit,
      motivations: motivations || [],
      supportSystem,
      notes,
      createdAt: user.addictionProfile?.createdAt || new Date(),
      updatedAt: new Date()
    };

    // Update user with addiction profile
    user.addictionProfile = addictionProfile;
    user.hasCompletedIntake = true;
    await user.save();

    console.log(`✅ Addiction profile created/updated for user: ${user.username}`);

    res.json({
      success: true,
      message: 'Addiction profile saved successfully',
      data: {
        profile: addictionProfile,
        hasCompletedIntake: true
      }
    });

  } catch (error) {
    console.error('❌ Error creating addiction profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving addiction profile'
    });
  }
});

// @route   GET /api/addiction/profile
// @desc    Get user's addiction profile
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addictionProfile hasCompletedIntake');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        profile: user.addictionProfile || null,
        hasCompletedIntake: user.hasCompletedIntake || false
      }
    });

  } catch (error) {
    console.error('❌ Error fetching addiction profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching addiction profile'
    });
  }
});

// @route   PUT /api/addiction/profile
// @desc    Update user's addiction profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.addictionProfile) {
      return res.status(400).json({
        success: false,
        message: 'No addiction profile found. Please create one first.'
      });
    }

    // Update only provided fields
    const updateFields = req.body;
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== undefined) {
        user.addictionProfile[key] = updateFields[key];
      }
    });

    user.addictionProfile.updatedAt = new Date();
    await user.save();

    console.log(`✅ Addiction profile updated for user: ${user.username}`);

    res.json({
      success: true,
      message: 'Addiction profile updated successfully',
      data: {
        profile: user.addictionProfile
      }
    });

  } catch (error) {
    console.error('❌ Error updating addiction profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating addiction profile'
    });
  }
});

// @route   GET /api/addiction/insights
// @desc    Get AI-generated insights based on user's addiction profile
// @access  Private
router.get('/insights', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addictionProfile username');
    
    if (!user || !user.addictionProfile) {
      return res.status(400).json({
        success: false,
        message: 'No addiction profile found. Please complete the intake form first.'
      });
    }

    const profile = user.addictionProfile;
    
    // Generate basic insights (this would be enhanced with actual AI later)
    const insights = {
      riskLevel: profile.intensity >= 8 ? 'High' : profile.intensity >= 5 ? 'Medium' : 'Low',
      primaryTriggers: profile.triggers.slice(0, 3),
      peakRiskTimes: profile.peakUrgeTimes,
      motivationalFactors: profile.motivations.slice(0, 3),
      recommendations: generateRecommendations(profile),
      progressPrediction: generateProgressPrediction(profile),
      nextSteps: generateNextSteps(profile)
    };

    res.json({
      success: true,
      data: {
        insights,
        profileSummary: {
          addictionType: profile.addictionType,
          intensity: profile.intensity,
          duration: `${profile.duration} ${profile.durationUnit}`,
          hasSupport: !!profile.supportSystem
        }
      }
    });

  } catch (error) {
    console.error('❌ Error generating addiction insights:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating insights'
    });
  }
});

// Helper function to generate recommendations
function generateRecommendations(profile) {
  const recommendations = [];
  
  if (profile.intensity >= 7) {
    recommendations.push('Consider seeking professional help or counseling');
  }
  
  if (profile.triggers.includes('Stress')) {
    recommendations.push('Practice stress management techniques like meditation or deep breathing');
  }
  
  if (profile.triggers.includes('Boredom')) {
    recommendations.push('Develop new hobbies or activities to fill idle time');
  }
  
  if (!profile.supportSystem || profile.supportSystem === 'none') {
    recommendations.push('Build a support network through friends, family, or support groups');
  }
  
  if (profile.peakUrgeTimes.length > 0) {
    recommendations.push(`Be extra vigilant during your peak urge times: ${profile.peakUrgeTimes.join(', ')}`);
  }
  
  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

// Helper function to generate progress prediction
function generateProgressPrediction(profile) {
  let prediction = 'Moderate';
  let timeframe = '3-6 months';
  
  if (profile.intensity <= 4 && profile.motivations.length >= 3) {
    prediction = 'Excellent';
    timeframe = '1-3 months';
  } else if (profile.intensity >= 8 && profile.motivations.length <= 2) {
    prediction = 'Challenging';
    timeframe = '6-12 months';
  }
  
  return {
    outlook: prediction,
    estimatedTimeframe: timeframe,
    successFactors: profile.motivations.length,
    challengeFactors: profile.triggers.length
  };
}

// Helper function to generate next steps
function generateNextSteps(profile) {
  const steps = [];
  
  steps.push('Complete daily check-ins to track your progress');
  steps.push('Use the AI chatbot for personalized support and motivation');
  
  if (profile.peakUrgeTimes.length > 0) {
    steps.push('Set up notifications for your peak urge times');
  }
  
  if (profile.motivations.length > 0) {
    steps.push('Review your motivations daily to stay focused');
  }
  
  steps.push('Connect with others in the community for mutual support');
  
  return steps;
}

module.exports = router;
