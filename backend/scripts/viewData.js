#!/usr/bin/env node

/**
 * MongoDB Data Viewer Script
 * View all user data, comments, chats, reels, and interactions
 * Usage: node scripts/viewData.js [collection] [userId]
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Reel = require('../models/Reel');
const Chat = require('../models/Chat');

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/addiction-recovery';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Helper function to format dates
const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Helper function to format user info
const formatUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  name: `${user.firstName} ${user.lastName}`,
  joinDate: formatDate(user.createdAt),
  lastActive: user.lastActive ? formatDate(user.lastActive) : 'Never',
  isActive: user.isActive,
  profilePicture: user.profilePicture || 'No profile picture'
});

// View all users
const viewAllUsers = async () => {
  console.log('\n🔍 === ALL USERS ===\n');
  
  const users = await User.find({}).select('-password');
  
  if (users.length === 0) {
    console.log('No users found in database.');
    return;
  }

  users.forEach((user, index) => {
    console.log(`👤 User ${index + 1}:`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Join Date: ${formatDate(user.createdAt)}`);
    console.log(`   Last Active: ${user.lastActive ? formatDate(user.lastActive) : 'Never'}`);
    console.log(`   Status: ${user.isActive ? '🟢 Active' : '🔴 Inactive'}`);
    
    // Show addiction profile if exists
    if (user.addictionProfile && user.addictionProfile.addictionType) {
      console.log(`   🎯 Addiction Profile:`);
      console.log(`      Type: ${user.addictionProfile.addictionType}`);
      console.log(`      Intensity: ${user.addictionProfile.intensity}/10`);
      console.log(`      Frequency: ${user.addictionProfile.frequency}`);
      console.log(`      Days Clean: ${user.addictionProfile.daysClean || 0}`);
    }
    
    console.log('   ─────────────────────────────────────');
  });
  
  console.log(`\n📊 Total Users: ${users.length}`);
};

// View specific user details with all their data
const viewUserDetails = async (userId) => {
  console.log(`\n🔍 === USER DETAILS: ${userId} ===\n`);
  
  try {
    // Get user info
    const user = await User.findById(userId).select('-password');
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('👤 USER INFORMATION:');
    console.log(`   ID: ${user._id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Bio: ${user.bio || 'No bio'}`);
    console.log(`   Join Date: ${formatDate(user.createdAt)}`);
    console.log(`   Last Active: ${user.lastActive ? formatDate(user.lastActive) : 'Never'}`);
    console.log(`   Status: ${user.isActive ? '🟢 Active' : '🔴 Inactive'}`);

    // Show addiction profile
    if (user.addictionProfile && user.addictionProfile.addictionType) {
      console.log('\n🎯 ADDICTION PROFILE:');
      console.log(`   Type: ${user.addictionProfile.addictionType}`);
      console.log(`   Intensity: ${user.addictionProfile.intensity}/10`);
      console.log(`   Frequency: ${user.addictionProfile.frequency}`);
      console.log(`   Duration: ${user.addictionProfile.duration}`);
      console.log(`   Days Clean: ${user.addictionProfile.daysClean || 0}`);
      console.log(`   Triggers: ${user.addictionProfile.triggers?.join(', ') || 'None listed'}`);
      console.log(`   Motivations: ${user.addictionProfile.motivations?.join(', ') || 'None listed'}`);
      console.log(`   Support System: ${user.addictionProfile.supportSystem || 'Not specified'}`);
    }

    // Get user's reels
    const userReels = await Reel.find({ creator: userId }).populate('creator', 'username firstName lastName');
    console.log(`\n🎬 USER'S REELS (${userReels.length}):`);
    if (userReels.length > 0) {
      userReels.forEach((reel, index) => {
        console.log(`   ${index + 1}. "${reel.title}"`);
        console.log(`      Description: ${reel.description}`);
        console.log(`      Likes: ${reel.likes} | Comments: ${reel.comments.length} | Shares: ${reel.shares}`);
        console.log(`      Created: ${formatDate(reel.createdAt)}`);
      });
    } else {
      console.log('   No reels created by this user.');
    }

    // Get user's comments on reels
    const reelsWithUserComments = await Reel.find({
      'comments.user': userId
    }).populate('creator', 'username firstName lastName');
    
    console.log(`\n💬 USER'S COMMENTS ON REELS:`);
    let totalComments = 0;
    reelsWithUserComments.forEach((reel) => {
      const userComments = reel.comments.filter(comment => comment.user.toString() === userId);
      totalComments += userComments.length;
      
      userComments.forEach((comment) => {
        console.log(`   📝 On "${reel.title}" by @${reel.creator.username}:`);
        console.log(`      Comment: "${comment.content}"`);
        console.log(`      Posted: ${formatDate(comment.createdAt)}`);
        console.log(`      Likes: ${comment.likes}`);
      });
    });
    console.log(`   Total Comments: ${totalComments}`);

    // Get user's chat messages
    const userChats = await Chat.find({
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    }).populate('sender recipient', 'username firstName lastName').sort({ createdAt: -1 }).limit(20);

    console.log(`\n💬 RECENT CHAT MESSAGES (Last 20):`);
    if (userChats.length > 0) {
      userChats.forEach((chat, index) => {
        const isSender = chat.sender._id.toString() === userId;
        const otherUser = isSender ? chat.recipient : chat.sender;
        console.log(`   ${index + 1}. ${isSender ? '➡️ To' : '⬅️ From'} @${otherUser.username}:`);
        console.log(`      Message: "${chat.message}"`);
        console.log(`      Time: ${formatDate(chat.createdAt)}`);
        console.log(`      Read: ${chat.isRead ? '✅' : '❌'}`);
      });
    } else {
      console.log('   No chat messages found.');
    }

  } catch (error) {
    console.error('❌ Error fetching user details:', error);
  }
};

// View all reels with comments
const viewAllReels = async () => {
  console.log('\n🔍 === ALL REELS WITH COMMENTS ===\n');
  
  const reels = await Reel.find({})
    .populate('creator', 'username firstName lastName')
    .populate('comments.user', 'username firstName lastName')
    .sort({ createdAt: -1 });

  if (reels.length === 0) {
    console.log('No reels found in database.');
    return;
  }

  reels.forEach((reel, index) => {
    console.log(`🎬 Reel ${index + 1}: "${reel.title}"`);
    console.log(`   Creator: @${reel.creator.username} (${reel.creator.firstName} ${reel.creator.lastName})`);
    console.log(`   Description: ${reel.description}`);
    console.log(`   Stats: ${reel.likes} likes, ${reel.comments.length} comments, ${reel.shares} shares, ${reel.views} views`);
    console.log(`   Created: ${formatDate(reel.createdAt)}`);
    
    if (reel.comments.length > 0) {
      console.log(`   💬 Comments:`);
      reel.comments.forEach((comment, commentIndex) => {
        console.log(`      ${commentIndex + 1}. @${comment.user.username}: "${comment.content}"`);
        console.log(`         Posted: ${formatDate(comment.createdAt)} | Likes: ${comment.likes}`);
      });
    } else {
      console.log(`   💬 No comments yet`);
    }
    console.log('   ─────────────────────────────────────');
  });
  
  console.log(`\n📊 Total Reels: ${reels.length}`);
};

// View all chat messages
const viewAllChats = async () => {
  console.log('\n🔍 === ALL CHAT MESSAGES ===\n');
  
  const chats = await Chat.find({})
    .populate('sender recipient', 'username firstName lastName')
    .sort({ createdAt: -1 })
    .limit(50);

  if (chats.length === 0) {
    console.log('No chat messages found in database.');
    return;
  }

  chats.forEach((chat, index) => {
    console.log(`💬 Message ${index + 1}:`);
    console.log(`   From: @${chat.sender.username} (${chat.sender.firstName} ${chat.sender.lastName})`);
    console.log(`   To: @${chat.recipient.username} (${chat.recipient.firstName} ${chat.recipient.lastName})`);
    console.log(`   Message: "${chat.message}"`);
    console.log(`   Time: ${formatDate(chat.createdAt)}`);
    console.log(`   Read: ${chat.isRead ? '✅' : '❌'}`);
    console.log('   ─────────────────────────────────────');
  });
  
  console.log(`\n📊 Total Messages (showing last 50): ${chats.length}`);
};

// View database statistics
const viewStats = async () => {
  console.log('\n📊 === DATABASE STATISTICS ===\n');
  
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
  
  console.log(`👥 Total Users: ${userCount}`);
  console.log(`🟢 Active Users (last 30 days): ${activeUsers}`);
  console.log(`🎬 Total Reels: ${reelCount}`);
  console.log(`💬 Total Comments: ${totalComments}`);
  console.log(`💌 Total Chat Messages: ${chatCount}`);
  
  // Recent activity
  const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(3);
  console.log('\n🆕 Recent Users:');
  recentUsers.forEach((user, index) => {
    console.log(`   ${index + 1}. @${user.username} - joined ${formatDate(user.createdAt)}`);
  });
  
  const recentReels = await Reel.find({}).populate('creator', 'username').sort({ createdAt: -1 }).limit(3);
  console.log('\n🎬 Recent Reels:');
  recentReels.forEach((reel, index) => {
    console.log(`   ${index + 1}. "${reel.title}" by @${reel.creator.username} - ${formatDate(reel.createdAt)}`);
  });
};

// Main function
const main = async () => {
  await connectDB();
  
  const args = process.argv.slice(2);
  const command = args[0];
  const userId = args[1];
  
  console.log('🗄️  ADDICTION RECOVERY APP - MongoDB Data Viewer');
  console.log('================================================');
  
  switch (command) {
    case 'users':
      await viewAllUsers();
      break;
    case 'user':
      if (!userId) {
        console.log('❌ Please provide a user ID: node scripts/viewData.js user <userId>');
        break;
      }
      await viewUserDetails(userId);
      break;
    case 'reels':
      await viewAllReels();
      break;
    case 'chats':
      await viewAllChats();
      break;
    case 'stats':
      await viewStats();
      break;
    default:
      console.log('\n📋 Available Commands:');
      console.log('   node scripts/viewData.js users          - View all users');
      console.log('   node scripts/viewData.js user <userId>  - View specific user details');
      console.log('   node scripts/viewData.js reels          - View all reels with comments');
      console.log('   node scripts/viewData.js chats          - View all chat messages');
      console.log('   node scripts/viewData.js stats          - View database statistics');
      console.log('\n💡 Examples:');
      console.log('   node scripts/viewData.js users');
      console.log('   node scripts/viewData.js user 507f1f77bcf86cd799439011');
      console.log('   node scripts/viewData.js stats');
      break;
  }
  
  mongoose.connection.close();
  console.log('\n✅ Database connection closed.');
};

// Run the script
main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
