import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Environment check:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please check your .env file and ensure it contains:');
  console.error('VITE_SUPABASE_URL=your_supabase_project_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.error('');
  console.error('You can find these values in your Supabase project dashboard under Settings > API');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

console.log('🔗 Connecting to Supabase:', supabaseUrl);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'giftflare-web'
    }
  },
  db: {
    schema: 'public'
  }
});

// Connection status tracking
let connectionStatus: 'connecting' | 'connected' | 'failed' = 'connecting';
let connectionAttempts = 0;
const maxAttempts = 5;
let autoRetryInterval: NodeJS.Timeout | null = null;

export const getConnectionStatus = () => connectionStatus;

const setAutoRetry = () => {
  if (autoRetryInterval) clearInterval(autoRetryInterval);
  autoRetryInterval = setInterval(() => {
    if (connectionStatus === 'failed') {
      console.log('🔄 Auto-retrying Supabase connection...');
      reconnect();
    }
  }, 15000); // Retry every 15 seconds
};

// Update connection status and set auto-retry if failed
const updateConnectionStatus = (status: 'connecting' | 'connected' | 'failed') => {
  connectionStatus = status;
  if (status === 'failed') setAutoRetry();
  else if (autoRetryInterval) clearInterval(autoRetryInterval);
};

// Enhanced connection test with better error handling
const testConnection = async () => {
  try {
    connectionAttempts++;
    console.log(`🔌 Testing Supabase connection (attempt ${connectionAttempts}/${maxAttempts}) to ${supabaseUrl}...`);
    
    // Test auth connection first
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('❌ Supabase auth error:', authError);
      if (connectionAttempts < maxAttempts) {
        console.log(`🔄 Retrying in 2 seconds...`);
        setTimeout(testConnection, 2000);
        return;
      }
      updateConnectionStatus('failed');
      return;
    }
    
    console.log('✅ Auth connection successful');
    
    // Test database connection with a simple query to a table that should exist
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true })
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      console.log('✅ Database connection successful');
    } catch (dbError: any) {
      console.warn('⚠️ Database connection issue:', dbError.message);
      // Don't fail completely if it's just a table issue
    }
    
    console.log('✅ Supabase connected successfully');
    updateConnectionStatus('connected');
    connectionAttempts = 0; // Reset attempts on success
  } catch (err) {
    console.error('❌ Supabase connection failed:', err);
    if (connectionAttempts < maxAttempts) {
      console.log(`🔄 Retrying in 2 seconds...`);
      setTimeout(testConnection, 2000);
    } else {
      console.error('❌ Max connection attempts reached. Please check your Supabase configuration.');
      updateConnectionStatus('failed');
    }
  }
};

// Initialize connection test with delay to avoid blocking app startup
setTimeout(() => {
  testConnection();
}, 1000);

// Export connection utilities
export const reconnect = () => {
  connectionAttempts = 0;
  connectionStatus = 'connecting';
  testConnection();
};

// Health check function
export const healthCheck = async () => {
  try {
    console.log('Running health check...');
    // Simple auth check
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Health check auth error:', error);
      return { healthy: false, error, hasSession: false };
    }
    
    // Test a simple database query
    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true })
        .limit(1);
      
      if (dbError) {
        console.warn('Health check database warning:', dbError);
        return { healthy: true, error: dbError, hasSession: !!session, dbAccessible: false };
      }
      
      console.log('Health check passed');
      return { healthy: true, error: null, hasSession: !!session, dbAccessible: true };
    } catch (dbError) {
      console.warn('Health check database error:', dbError);
      return { healthy: true, error: dbError, hasSession: !!session, dbAccessible: false };
    }
  } catch (err) {
    console.error('Health check failed:', err);
    return { healthy: false, error: err };
  }
};