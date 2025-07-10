import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, Database, User, Wifi, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, getConnectionStatus, healthCheck } from '../lib/supabase';

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, isLoading } = useAuth();

  const collectDebugInfo = async () => {
    setIsRefreshing(true);
    const info: any = {
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'Present' : 'Missing',
        supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
        mode: import.meta.env.MODE,
        dev: import.meta.env.DEV,
        actualUrl: import.meta.env.VITE_SUPABASE_URL ? 
          import.meta.env.VITE_SUPABASE_URL.substring(0, 30) + '...' : 'Not set',
      },
      auth: {
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          city: user.city,
        } : null,
        isLoading,
      },
      connection: {
        status: getConnectionStatus(),
      },
    };

    // Test database connection
    try {
      const { data: session, error } = await supabase.auth.getSession();
      info.auth.session = session.session ? 'Present' : 'None';
      info.auth.sessionError = error ? error.message : null;
    } catch (error) {
      info.auth.sessionError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test health check
    try {
      const health = await healthCheck();
      info.connection.health = health;
    } catch (error) {
      info.connection.healthError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test database tables
    const tables = ['profiles', 'products', 'orders', 'notifications', 'hero_videos'];
    info.database = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true })
          .limit(1);
        
        if (error) {
          info.database[table] = `Error: ${error.message}`;
        } else {
          info.database[table] = 'Accessible';
        }
      } catch (error) {
        info.database[table] = `Exception: ${error instanceof Error ? error.message : 'Unknown'}`;
      }
    }

    // Test specific operations
    info.operations = {};
    
    // Test profile creation (if user exists)
    if (user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        info.operations.profileFetch = error ? `Error: ${error.message}` : 'Success';
      } catch (error) {
        info.operations.profileFetch = `Exception: ${error instanceof Error ? error.message : 'Unknown'}`;
      }
    }

    setDebugInfo(info);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (isOpen) {
      collectDebugInfo();
    }
  }, [isOpen, user]);

  const getStatusIcon = (status: string) => {
    if (status === 'Success' || status === 'Accessible' || status === 'Present') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (status === 'None' || status === 'Missing') {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'Success' || status === 'Accessible' || status === 'Present') {
      return 'text-green-600';
    } else if (status === 'None' || status === 'Missing') {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  };

  if (import.meta.env.PROD) {
    return null; // Don't show in production
  }

  return (
    <>
      {/* Debug Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg z-40 transition-all"
        title="Debug Panel"
      >
        <Bug className="w-5 h-5" />
      </button>

      {/* Debug Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-red-50">
                <div className="flex items-center space-x-2">
                  <Bug className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-red-900">Debug Panel</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={collectDebugInfo}
                    disabled={isRefreshing}
                    className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Environment */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    Environment
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Supabase URL:</span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(debugInfo.environment?.supabaseUrl || 'Missing')}
                        <span className={getStatusColor(debugInfo.environment?.supabaseUrl || 'Missing')}>
                          {debugInfo.environment?.supabaseUrl || 'Missing'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Supabase Key:</span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(debugInfo.environment?.supabaseKey || 'Missing')}
                        <span className={getStatusColor(debugInfo.environment?.supabaseKey || 'Missing')}>
                          {debugInfo.environment?.supabaseKey || 'Missing'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Mode:</span>
                      <span className="text-gray-600">{debugInfo.environment?.mode}</span>
                    </div>
                    {debugInfo.environment?.actualUrl && (
                      <div className="text-xs text-gray-500 mt-2">
                        URL: {debugInfo.environment.actualUrl}
                      </div>
                    )}
                  </div>
                </div>

                {/* Connection Status */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Wifi className="w-4 h-4 mr-2" />
                    Connection
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(debugInfo.connection?.status || 'Unknown')}
                        <span className={getStatusColor(debugInfo.connection?.status || 'Unknown')}>
                          {debugInfo.connection?.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Health Check:</span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(debugInfo.connection?.health?.healthy ? 'Success' : 'Failed')}
                        <span className={getStatusColor(debugInfo.connection?.health?.healthy ? 'Success' : 'Failed')}>
                          {debugInfo.connection?.health?.healthy ? 'Healthy' : 'Failed'}
                        </span>
                      </div>
                    </div>
                    {debugInfo.connection?.healthError && (
                      <div className="text-xs text-red-600 mt-1">
                        Error: {debugInfo.connection.healthError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Authentication */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Authentication
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                      <span>User:</span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(debugInfo.auth?.user ? 'Present' : 'None')}
                        <span className={getStatusColor(debugInfo.auth?.user ? 'Present' : 'None')}>
                          {debugInfo.auth?.user ? 'Logged In' : 'Not Logged In'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Session:</span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(debugInfo.auth?.session || 'None')}
                        <span className={getStatusColor(debugInfo.auth?.session || 'None')}>
                          {debugInfo.auth?.session || 'None'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Loading:</span>
                      <span className="text-gray-600">{debugInfo.auth?.isLoading ? 'Yes' : 'No'}</span>
                    </div>
                    {debugInfo.auth?.user && (
                      <div className="mt-2 p-2 bg-white rounded border text-xs">
                        <div>ID: {debugInfo.auth.user.id}</div>
                        <div>Email: {debugInfo.auth.user.email}</div>
                        <div>Role: {debugInfo.auth.user.role}</div>
                        <div>Verified: {debugInfo.auth.user.isVerified ? 'Yes' : 'No'}</div>
                      </div>
                    )}
                    {debugInfo.auth?.sessionError && (
                      <div className="text-xs text-red-600 mt-1">
                        Session Error: {debugInfo.auth.sessionError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Database Tables */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="font-semibold text-gray-900 mb-2">Database Tables</h3>
                  <div className="space-y-1 text-sm">
                    {Object.entries(debugInfo.database || {}).map(([table, status]) => (
                      <div key={table} className="flex justify-between items-center">
                        <span>{table}:</span>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(status as string)}
                          <span className={`text-xs ${getStatusColor(status as string)}`}>
                            {status as string}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operations */}
                {debugInfo.operations && Object.keys(debugInfo.operations).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="font-semibold text-gray-900 mb-2">Operations</h3>
                    <div className="space-y-1 text-sm">
                      {Object.entries(debugInfo.operations).map(([operation, status]) => (
                        <div key={operation} className="flex justify-between items-center">
                          <span>{operation}:</span>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(status as string)}
                            <span className={`text-xs ${getStatusColor(status as string)}`}>
                              {status as string}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <h3 className="font-semibold text-blue-900 mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        console.log('Debug Info:', debugInfo);
                        alert('Debug info logged to console');
                      }}
                      className="w-full text-left text-sm bg-blue-100 hover:bg-blue-200 p-2 rounded transition-colors"
                    >
                      Log Debug Info to Console
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
                        alert('Debug info copied to clipboard');
                      }}
                      className="w-full text-left text-sm bg-blue-100 hover:bg-blue-200 p-2 rounded transition-colors"
                    >
                      Copy Debug Info
                    </button>
                  </div>
                </div>

                {/* Troubleshooting Tips */}
                <div className="bg-yellow-50 rounded-lg p-3">
                  <h3 className="font-semibold text-yellow-900 mb-2">Troubleshooting</h3>
                  <div className="text-xs text-yellow-800 space-y-1">
                    {!debugInfo.environment?.supabaseUrl && (
                      <div>• Add VITE_SUPABASE_URL to your .env file</div>
                    )}
                    {!debugInfo.environment?.supabaseKey && (
                      <div>• Add VITE_SUPABASE_ANON_KEY to your .env file</div>
                    )}
                    {debugInfo.connection?.status === 'failed' && (
                      <div>• Check your Supabase project is active</div>
                    )}
                    {debugInfo.auth?.sessionError && (
                      <div>• Authentication service may be down</div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Last updated: {debugInfo.timestamp ? new Date(debugInfo.timestamp).toLocaleTimeString() : 'Never'}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};