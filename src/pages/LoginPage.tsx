import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email or password. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred while signing in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-elegant">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-lg w-full space-y-10 bg-cream-50/90 rounded-3xl shadow-2xl p-10 border border-blush-100"
        >
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-blush-600 p-4 rounded-2xl shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="mt-2 text-4xl font-bold text-charcoal-800">
              Welcome back to GiftFlare
            </h2>
            <p className="mt-2 text-lg text-charcoal-600">
              Sign in to your account to continue
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-base text-red-800">{error}</p>
                    <p className="text-xs text-red-600 mt-1">
                      Don't have an account? <Link to="/register" className="underline hover:no-underline">Create one here</Link>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-charcoal-800 mb-2">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 pl-12 border border-blush-300 rounded-xl focus:ring-2 focus:ring-blush-200 focus:border-transparent transition-colors text-lg"
                  placeholder="Enter your email"
                />
                <Mail className="w-6 h-6 text-blush-500 absolute left-4 top-3" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-lg font-medium text-charcoal-800 mb-2">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 pl-12 pr-12 border border-blush-300 rounded-xl focus:ring-2 focus:ring-blush-200 focus:border-transparent transition-colors text-lg"
                  placeholder="Enter your password"
                />
                <Lock className="w-6 h-6 text-blush-500 absolute left-4 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-blush-500 hover:text-blush-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-blush-600 hover:bg-blush-700 text-white py-4 px-4 rounded-xl text-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </motion.button>
            </div>

            <div className="text-center">
              <p className="text-lg text-charcoal-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blush-600 hover:text-blush-700 font-semibold transition-colors">
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2">
        <img
          className="h-full w-full object-cover"
          src="https://images.pexels.com/photos/5553045/pexels-photo-5553045.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Artisan crafting"
        />
      </div>
    </div>
  );
};