import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    name: string,
    role: 'buyer' | 'seller' | 'admin',
    city?: string,
    businessName?: string,
    description?: string,
    mobile?: string,
    verificationDoc?: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Get initial session with better error handling
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // Don't fail completely on session errors, just log and continue
          if (mounted) setIsLoading(false);
          return;
        }
        
        if (session?.user && mounted) {
          console.log('Found existing session for:', session.user.email);
          await fetchUserProfile(session.user);
        } else {
          console.log('No existing session found');
          if (mounted) setIsLoading(false);
        }
      } catch (error) {
        console.error('Critical error in getInitialSession:', error);
        console.error('Error in getInitialSession:', error);
        // Set a fallback state instead of staying in loading forever
        if (mounted) setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'no user');
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
        console.log('User signed out');
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('Token refreshed for:', session.user.email);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      setIsLoading(true);
      console.log('Fetching profile for user:', supabaseUser.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Database error fetching profile:', error);
        createFallbackUser(supabaseUser, supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User');
        return;
      }

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile');
          const defaultName = supabaseUser.user_metadata?.name || 
                             supabaseUser.email?.split('@')[0] || 
                             'User';
          console.log('Creating new profile for user:', supabaseUser.id);
          
          try {
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: supabaseUser.id,
                name: defaultName,
                role: 'buyer',
                city: 'Mumbai',
                is_verified: false
              })
              .select()
              .single();
          
            if (insertError) {
              console.error('Error creating profile:', insertError);
              createFallbackUser(supabaseUser, defaultName);
            } else if (newProfile) {
              console.log('Profile created successfully:', newProfile);
              setUser({
                id: newProfile.id,
                email: supabaseUser.email || '',
                name: newProfile.name,
                role: newProfile.role,
                city: newProfile.city || 'Mumbai',
                isVerified: newProfile.is_verified,
                businessName: newProfile.business_name || undefined,
                description: newProfile.description || undefined
              });
            }
          } catch (insertError) {
            console.error('Error creating profile:', insertError);
            console.warn('Failed to create profile in database, using fallback');
            // Create fallback user
            createFallbackUser(supabaseUser, defaultName);
          }
        } else {
          // Other database errors - create fallback user
          const defaultName = supabaseUser.user_metadata?.name || 
                             supabaseUser.email?.split('@')[0] || 
                             'User';
          createFallbackUser(supabaseUser, defaultName);
        }
      } else if (profile) {
        console.log('Profile loaded successfully:', profile.name);
        setUser({
          id: profile.id,
          email: supabaseUser.email || '',
          name: profile.name,
          role: profile.role,
          city: profile.city || 'Mumbai',
          isVerified: profile.is_verified,
          businessName: profile.business_name || undefined,
          description: profile.description || undefined
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      console.warn('Using fallback user due to profile fetch error');
      const defaultName = supabaseUser.user_metadata?.name || 
                         supabaseUser.email?.split('@')[0] || 
                         'User';
      createFallbackUser(supabaseUser, defaultName);
    } finally {
      setIsLoading(false);
    }
  };

  const createFallbackUser = (supabaseUser: SupabaseUser, defaultName: string) => {
    console.warn('Creating fallback user profile');
    console.log('Fallback user created for:', supabaseUser.email || supabaseUser.id);
    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: defaultName,
      role: 'buyer',
      city: 'Mumbai',
      isVerified: false
    });
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Login attempt for:', email);
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        console.error('Login error:', error);
        console.error('Login failed:', error.message);
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account.');
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else {
          toast.error(error.message || 'Login failed');
        }
        return false;
      }

      if (data.user) {
        console.log('Login successful for:', data.user.email);
        console.log('Login successful, fetching profile...');
        toast.success('Welcome back!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Unexpected login error:', error);
      console.error('Critical login error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: 'buyer' | 'seller' | 'admin',
    city = 'Mumbai',
    businessName?: string,
    description?: string,
    mobile?: string,
    verificationDoc?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Registration attempt for:', email, 'as', role);
      console.log('Attempting registration for:', email);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name,
            email: email.trim().toLowerCase(),
            role,
            city,
            business_name: businessName,
            description,
            mobile,
            verification_doc: verificationDoc
          }
        }
      });
      if (error) {
        console.error('Registration error:', error);
        console.error('Registration failed:', error.message);
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please try logging in.');
        } else {
          toast.error(error.message || 'Registration failed');
        }
        return false;
      }
      if (data.user) {
        console.log('Registration successful for:', data.user.email);
        console.log('User registered, creating profile...');
        // Create profile immediately
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            role,
            city,
            business_name: businessName,
            description,
            is_verified: role === 'admin', // Only admins are auto-verified
            mobile: role === 'seller' ? mobile : undefined,
            verification_doc: role === 'seller' ? verificationDoc : undefined
          });
        if (profileError) {
          console.error('Profile creation error:', profileError);
          console.warn('Profile creation failed, but user account was created successfully');
          if (role === 'seller') {
            toast.success('Seller account created! Please wait for admin approval before you can start listing products.');
          } else {
            toast.success('Account created successfully! Profile will be set up automatically on first login.');
          }
          return true;
        }
        console.log('Profile created successfully');
        
        if (role === 'seller') {
          toast.success('Seller account created successfully! Please wait for admin approval to start listing products.');
        } else {
          toast.success('Account created successfully! Welcome to Zaryah!');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Unexpected registration error:', error);
      console.error('Critical registration error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user...');
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error('Logout failed');
      } else {
        setUser(null);
        toast.success('Logged out successfully');
        console.log('Logout successful');
      }
    } catch (error) {
      console.error('Unexpected logout error:', error);
      toast.error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};