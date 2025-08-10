import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import socketService from '../services/socket';

interface Reel {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  creator: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  tags: string[];
  createdAt: string;
}

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

const EnhancedReelsPage: React.FC = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    loadReels();
    setupSocketListeners();
    
    return () => {
      socketService.removeListener('reel_update');
    };
  }, []);

  useEffect(() => {
    // Auto-play current video and pause others
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentReelIndex) {
          video.play().catch(console.error);
        } else {
          video.pause();
        }
      }
    });
  }, [currentReelIndex]);

  const setupSocketListeners = () => {
    socketService.onReelUpdate((data: any) => {
      const { reelId, type, value, user } = data;
      
      setReels(prevReels => 
        prevReels.map(reel => {
          if (reel._id === reelId) {
            switch (type) {
              case 'like':
                return {
                  ...reel,
                  likes: value.isLiked ? reel.likes + 1 : reel.likes - 1,
                  isLiked: value.userId === getCurrentUserId() ? value.isLiked : reel.isLiked
                };
              case 'comment':
                return {
                  ...reel,
                  comments: reel.comments + 1
                };
              case 'share':
                return {
                  ...reel,
                  shares: reel.shares + 1
                };
              default:
                return reel;
            }
          }
          return reel;
        })
      );
    });
  };

  const getCurrentUserId = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user)._id : null;
  };

  const loadReels = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response = await apiService.getReels(pageNum, 10, true); // trending reels
      const newReels = response.data.data.reels;
      
      if (append) {
        setReels(prev => [...prev, ...newReels]);
      } else {
        setReels(newReels);
      }
      
      setHasMore(newReels.length === 10);
      setPage(pageNum);
    } catch (err: any) {
      console.error('Error loading reels:', err);
      setError('Failed to load reels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reelId: string) => {
    try {
      const reel = reels.find(r => r._id === reelId);
      if (!reel) return;

      // Optimistic update
      setReels(prev => 
        prev.map(r => 
          r._id === reelId 
            ? { 
                ...r, 
                isLiked: !r.isLiked, 
                likes: r.isLiked ? r.likes - 1 : r.likes + 1 
              }
            : r
        )
      );

      await apiService.likeReel(reelId);
      
      // Send real-time update
      socketService.sendReelInteraction(reelId, 'like', { 
        isLiked: !reel.isLiked,
        userId: getCurrentUserId()
      });

    } catch (err) {
      console.error('Error liking reel:', err);
      // Revert optimistic update
      setReels(prev => 
        prev.map(r => 
          r._id === reelId 
            ? { 
                ...r, 
                isLiked: !r.isLiked, 
                likes: r.isLiked ? r.likes + 1 : r.likes - 1 
              }
            : r
        )
      );
    }
  };

  const handleShare = async (reelId: string) => {
    try {
      const reel = reels.find(r => r._id === reelId);
      if (!reel) return;

      // Create shareable link
      const shareUrl = `${window.location.origin}/reels/${reelId}`;
      
      if (navigator.share) {
        // Use native sharing if available
        await navigator.share({
          title: reel.title,
          text: reel.description,
          url: shareUrl
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }

      // Update share count
      await apiService.shareReel(reelId);
      
      setReels(prev => 
        prev.map(r => 
          r._id === reelId ? { ...r, shares: r.shares + 1 } : r
        )
      );

      // Send real-time update
      socketService.sendReelInteraction(reelId, 'share', { 
        userId: getCurrentUserId()
      });

    } catch (err) {
      console.error('Error sharing reel:', err);
    }
  };

  const loadComments = async (reelId: string) => {
    try {
      const response = await apiService.getReelComments(reelId);
      setComments(response.data.data.comments);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleAddComment = async (reelId: string) => {
    if (!newComment.trim() || commentLoading) return;

    try {
      setCommentLoading(true);
      const response = await apiService.addReelComment(reelId, newComment.trim());
      const newCommentData = response.data.data.comment;
      
      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
      
      // Update comment count
      setReels(prev => 
        prev.map(r => 
          r._id === reelId ? { ...r, comments: r.comments + 1 } : r
        )
      );

      // Send real-time update
      socketService.sendReelInteraction(reelId, 'comment', { 
        comment: newCommentData,
        userId: getCurrentUserId()
      });

    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentReelIndex > 0) {
      setCurrentReelIndex(currentReelIndex - 1);
    } else if (direction === 'down' && currentReelIndex < reels.length - 1) {
      setCurrentReelIndex(currentReelIndex + 1);
      
      // Load more reels when near the end
      if (currentReelIndex >= reels.length - 3 && hasMore && !loading) {
        loadReels(page + 1, true);
      }
    }
  };

  const currentReel = reels[currentReelIndex];

  if (loading && reels.length === 0) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid rgba(139, 92, 246, 0.3)',
            borderTop: '3px solid #8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p>Loading inspiring reels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <h2 style={{ color: '#ef4444', marginBottom: '20px' }}>⚠️ Error</h2>
          <p style={{ marginBottom: '20px' }}>{error}</p>
          <button
            onClick={() => loadReels()}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#8b5cf6',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#000', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Reels Container */}
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative'
      }}>
        {reels.map((reel, index) => (
          <motion.div
            key={reel._id}
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: index === currentReelIndex ? 1 : 0,
              y: index === currentReelIndex ? 0 : 100,
              scale: index === currentReelIndex ? 1 : 0.8
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: index === currentReelIndex ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Video */}
            <video
              ref={el => videoRefs.current[index] = el}
              src={reel.videoUrl}
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onEnded={() => {
                // Auto-advance to next reel
                if (currentReelIndex < reels.length - 1) {
                  handleScroll('down');
                }
              }}
            />

            {/* Overlay Content */}
            <div style={{
              position: 'absolute',
              bottom: '100px',
              left: '20px',
              right: '80px',
              color: 'white',
              zIndex: 2
            }}>
              {/* Creator Info */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '15px',
                gap: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  {reel.creator.firstName[0]}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
                    @{reel.creator.username}
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                    {reel.creator.firstName} {reel.creator.lastName}
                  </p>
                </div>
              </div>

              {/* Title & Description */}
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {reel.title}
              </h3>
              <p style={{ 
                margin: '0 0 12px 0', 
                fontSize: '14px',
                lineHeight: '1.4',
                color: 'rgba(255,255,255,0.9)'
              }}>
                {reel.description}
              </p>

              {/* Tags */}
              {reel.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {reel.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      style={{
                        fontSize: '12px',
                        color: '#06b6d4',
                        fontWeight: 'bold'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{
              position: 'absolute',
              right: '20px',
              bottom: '100px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              alignItems: 'center'
            }}>
              {/* Like Button */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => handleLike(reel._id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: reel.isLiked ? '#ef4444' : 'white',
                  fontSize: '28px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {reel.isLiked ? '❤️' : '🤍'}
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {reel.likes}
                </span>
              </motion.button>

              {/* Comment Button */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => {
                  setShowComments(true);
                  loadComments(reel._id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '28px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                💬
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {reel.comments}
                </span>
              </motion.button>

              {/* Share Button */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => handleShare(reel._id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '28px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                📤
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {reel.shares}
                </span>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div style={{
        position: 'absolute',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        zIndex: 10
      }}>
        <button
          onClick={() => handleScroll('up')}
          disabled={currentReelIndex === 0}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: currentReelIndex === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)',
            color: currentReelIndex === 0 ? '#666' : '#000',
            fontSize: '20px',
            cursor: currentReelIndex === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ↑
        </button>
        <button
          onClick={() => handleScroll('down')}
          disabled={currentReelIndex === reels.length - 1}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: currentReelIndex === reels.length - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)',
            color: currentReelIndex === reels.length - 1 ? '#666' : '#000',
            fontSize: '20px',
            cursor: currentReelIndex === reels.length - 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ↓
        </button>
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {showComments && currentReel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'flex-end'
            }}
            onClick={() => setShowComments(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 500 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                maxHeight: '70vh',
                backgroundColor: 'rgba(26, 26, 26, 0.98)',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Comments Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                paddingBottom: '15px',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h3 style={{ color: 'white', margin: 0 }}>
                  Comments ({comments.length})
                </h3>
                <button
                  onClick={() => setShowComments(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    fontSize: '24px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Comments List */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                marginBottom: '20px'
              }}>
                {comments.map((comment) => (
                  <div
                    key={comment._id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      marginBottom: '15px',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '12px'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#8b5cf6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      {comment.user.firstName[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{ 
                          color: 'white', 
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          @{comment.user.username}
                        </span>
                        <span style={{ 
                          color: '#888', 
                          fontSize: '12px'
                        }}>
                          {new Date(comment.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p style={{
                        color: 'rgba(255,255,255,0.9)',
                        margin: 0,
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end'
              }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a supportive comment..."
                  rows={2}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  onClick={() => handleAddComment(currentReel._id)}
                  disabled={!newComment.trim() || commentLoading}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    background: (!newComment.trim() || commentLoading) 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: (!newComment.trim() || commentLoading) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {commentLoading ? '⏳' : 'Post'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading More Indicator */}
      {loading && reels.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            borderTop: '2px solid #8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Loading more reels...
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default EnhancedReelsPage;
