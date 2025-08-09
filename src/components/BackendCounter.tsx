import React, { useEffect, useState } from 'react';
import { statsAPI, handleAPIError } from '../services/api';
import Counter from './Counter';

interface BackendCounterProps {
  type: 'users' | 'reels' | 'messages' | 'daysSober' | 'engagements' | 'activeUsers' | 'chats';
  label?: string;
  fontSize?: number;
  refreshInterval?: number; // in milliseconds
  containerStyle?: React.CSSProperties;
  counterStyle?: React.CSSProperties;
  digitStyle?: React.CSSProperties;
  textColor?: string;
  fontWeight?: React.CSSProperties["fontWeight"];
  places?: number[];
  gap?: number;
  borderRadius?: number;
  horizontalPadding?: number;
  gradientHeight?: number;
  gradientFrom?: string;
  gradientTo?: string;
  topGradientStyle?: React.CSSProperties;
  bottomGradientStyle?: React.CSSProperties;
  showLabel?: boolean;
  labelStyle?: React.CSSProperties;
  loadingValue?: number;
  errorValue?: number;
}

const BackendCounter: React.FC<BackendCounterProps> = ({
  type,
  label,
  refreshInterval = 30000, // 30 seconds default
  showLabel = true,
  labelStyle,
  loadingValue = 0,
  errorValue = 0,
  ...counterProps
}) => {
  const [count, setCount] = useState<number>(loadingValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await statsAPI.getPlatformStats();
      const stats = response.data.data.stats;
      
      let newCount = 0;
      switch (type) {
        case 'users':
          newCount = stats.totalUsers || 0;
          break;
        case 'reels':
          newCount = stats.totalReels || 0;
          break;
        case 'messages':
          newCount = stats.totalMessages || 0;
          break;
        case 'daysSober':
          newCount = stats.totalDaysSober || 0;
          break;
        case 'engagements':
          newCount = stats.totalEngagements || 0;
          break;
        case 'activeUsers':
          newCount = stats.activeUsers || 0;
          break;
        case 'chats':
          newCount = stats.totalChats || 0;
          break;
        default:
          newCount = 0;
      }
      
      setCount(newCount);
      setError(null);
    } catch (err: any) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
      setCount(errorValue);
      console.error(`Failed to fetch ${type} stats:`, errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStats();
    
    // Set up interval for refreshing stats
    const interval = setInterval(fetchStats, refreshInterval);
    
    return () => clearInterval(interval);
  }, [type, refreshInterval]);

  const getDefaultLabel = () => {
    switch (type) {
      case 'users':
        return 'Total Users';
      case 'reels':
        return 'Total Reels';
      case 'messages':
        return 'Messages Sent';
      case 'daysSober':
        return 'Days Sober';
      case 'engagements':
        return 'Total Engagements';
      case 'activeUsers':
        return 'Active Users';
      case 'chats':
        return 'Total Chats';
      default:
        return 'Count';
    }
  };

  const defaultLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    ...labelStyle
  };

  return (
    <div className="backend-counter-wrapper">
      <Counter
        value={count}
        {...counterProps}
      />
      {showLabel && (
        <div style={defaultLabelStyle}>
          {label || getDefaultLabel()}
          {loading && (
            <span style={{ marginLeft: '4px', opacity: 0.6 }}>
              ⟳
            </span>
          )}
          {error && (
            <span 
              style={{ 
                marginLeft: '4px', 
                color: '#EF4444',
                fontSize: '12px'
              }}
              title={error}
            >
              ⚠
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Specialized counter components for common use cases
export const UserCounter: React.FC<Omit<BackendCounterProps, 'type'>> = (props) => (
  <BackendCounter type="users" {...props} />
);

export const ReelCounter: React.FC<Omit<BackendCounterProps, 'type'>> = (props) => (
  <BackendCounter type="reels" {...props} />
);

export const MessageCounter: React.FC<Omit<BackendCounterProps, 'type'>> = (props) => (
  <BackendCounter type="messages" {...props} />
);

export const SobrietyCounter: React.FC<Omit<BackendCounterProps, 'type'>> = (props) => (
  <BackendCounter type="daysSober" {...props} />
);

export const EngagementCounter: React.FC<Omit<BackendCounterProps, 'type'>> = (props) => (
  <BackendCounter type="engagements" {...props} />
);

export const ActiveUserCounter: React.FC<Omit<BackendCounterProps, 'type'>> = (props) => (
  <BackendCounter type="activeUsers" {...props} />
);

export const ChatCounter: React.FC<Omit<BackendCounterProps, 'type'>> = (props) => (
  <BackendCounter type="chats" {...props} />
);

export default BackendCounter;
