import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, handleAPIError } from '../services/api';
import socketService from '../services/socket';

interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  isEmailVerified: boolean;
  daysSober?: number;
  sobrietyDate?: Date;
  followerCount: number;
  followingCount: number;
  totalReels: number;
  totalLikes: number;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getCurrentUser();
        const userData = response.data.data.user;
        setUser(userData);
        
        // Connect to socket with token
        socketService.connect(token);
        
        // Set up socket event listeners for user updates
        socketService.onUserStatusUpdate((data) => {
          if (data.userId === userData._id) {
            setUser(prev => prev ? { ...prev, lastSeen: data.lastSeen } : null);
          }
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear invalid tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      const { user: userData, token, refreshToken } = response.data.data;

      // Store tokens and user data
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);

      // Connect to socket
      socketService.connect(token);

      return { success: true };
    } catch (error: any) {
      const errorInfo = handleAPIError(error);
      return { success: false, message: errorInfo.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      const { user: newUser, token, refreshToken } = response.data.data;

      // Store tokens and user data
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);

      // Connect to socket
      socketService.connect(token);

      return { success: true };
    } catch (error: any) {
      const errorInfo = handleAPIError(error);
      return { success: false, message: errorInfo.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      // Call logout API (fire and forget)
      authAPI.logout().catch(console.error);
    } catch (error) {
      console.error('Logout API error:', error);
    }

    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Disconnect socket
    socketService.disconnect();
    
    // Clear user state
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authAPI.getCurrentUser();
      const updatedUser = response.data.data.user;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true };
    } catch (error: any) {
      const errorInfo = handleAPIError(error);
      return { success: false, message: errorInfo.message };
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authAPI.getCurrentUser();
      const userData = response.data.data.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
