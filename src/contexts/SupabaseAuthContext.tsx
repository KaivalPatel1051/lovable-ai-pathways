import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';

// Types
interface AuthContextType {
  user: User | null;
  profile: Tables<'profiles'> | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: SignUpData) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Tables<'profiles'>>) => Promise<{ error: any }>;
}

interface SignUpData {
  username: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

interface SupabaseAuthProviderProps {
  children: React.ReactNode;
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');
        
        // Check if we have valid Supabase credentials
        const hasValidSupabase = import.meta.env.VITE_SUPABASE_URL && 
                                 import.meta.env.VITE_SUPABASE_ANON_KEY &&
                                 !import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
        
        if (!hasValidSupabase) {
          console.warn('No valid Supabase credentials found - using development mode');
          // For development without Supabase, create a mock user to show the dashboard
          const mockUser = {
            id: 'dev-user-123',
            email: 'dev@example.com',
            user_metadata: {
              username: 'Developer',
              first_name: 'Dev',
              last_name: 'User'
            }
          } as any;
          
          setUser(mockUser);
          setProfile({
            id: 'dev-user-123',
            username: 'developer',
            first_name: 'Dev',
            last_name: 'User',
            email: 'dev@example.com',
            days_sober: 42,
            is_active: true,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as any);
          setLoading(false);
          return;
        }
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth timeout')), 5000);
        });
        
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('Error getting session:', error);
          // Continue without session - show login page
        } else {
          console.log('Session retrieved:', session?.user?.email || 'No user');
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            try {
              const userProfile = await fetchProfile(session.user.id);
              setProfile(userProfile);
            } catch (profileError) {
              console.error('Error fetching profile:', profileError);
              // Continue without profile
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Set loading to false even on error to show login page
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        // Ensure we leave the login page after successful sign-in
        if (event === 'SIGNED_IN') {
          try {
            // Use a hard redirect to avoid stale router state
            window.location.replace('/dashboard');
          } catch (_) {
            // no-op
          }
        }

        // Ensure we go to login after sign-out from anywhere
        if (event === 'SIGNED_OUT') {
          try {
            window.location.replace('/login');
          } catch (_) {
            // no-op
          }
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, userData: SignUpData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData.username,
            first_name: userData.firstName,
            last_name: userData.lastName,
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: error as AuthError };
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: error as AuthError };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }

      setUser(null);
      setProfile(null);
      setSession(null);

      // Force a full redirect to clear any stale nested routes
      try {
        window.location.replace('/login');
      } catch (_) {
        // no-op
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error as AuthError };
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Reset password error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as AuthError };
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<Tables<'profiles'>>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Update profile error:', error);
        return { error };
      }

      setProfile(data);
      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default SupabaseAuthProvider;
