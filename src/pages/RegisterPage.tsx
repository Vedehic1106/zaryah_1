import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, MapPin, Eye, EyeOff, Sparkles, Building, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer' as 'buyer' | 'seller' | 'admin',
    city: 'Mumbai',
    businessName: '',
    description: '',
    mobile: '',
    verificationDoc: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.role === 'seller' && !formData.businessName.trim()) {
      setError('Business name is required for sellers');
      setIsLoading(false);
      return;
    }
    if (formData.role === 'seller' && !formData.mobile.trim()) {
      setError('Mobile number is required for sellers');
      setIsLoading(false);
      return;
    }
    if (formData.role === 'seller' && !formData.verificationDoc.trim()) {
      setError('Verification document is required for sellers');
      setIsLoading(false);
      return;
    }

    try {
      const success = await register(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.city,
        formData.role === 'seller' ? formData.businessName : undefined,
        formData.role === 'seller' ? formData.description : undefined
      );
      
      if (success) {
        navigate('/');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-elegant">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2">
        <img
          className="h-full w-full object-cover"
          src="https://images.pexels.com/photos/5624983/pexels-photo-5624983.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Handmade crafts"
        />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-lg w-full space-y-10 bg-cream-50/90 rounded-3xl shadow-2xl p-10 border border-blush-100"
        >
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-blush-600 p-4 rounded-2xl shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="mt-2 text-4xl font-bold text-charcoal-900">
              Join GiftFlare Community
            </h2>
            <p className="mt-2 text-lg text-charcoal-600">
              Create your account to start gifting
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-base">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-lg font-medium text-charcoal-800 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['buyer', 'seller', 'admin'] as const).map((roleOption) => (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: roleOption })}
                    className={`px-4 py-3 rounded-xl text-lg font-semibold transition-colors ${
                      formData.role === roleOption
                        ? 'bg-blush-600 text-white border-2 border-blush-600'
                        : 'bg-white text-blush-700 border-2 border-blush-300 hover:bg-cream-50'
                    }`}
                  >
                    {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-lg font-medium text-charcoal-800 mb-2">
                Full Name
              </label>
              <div className="mt-1 relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 pl-12 border border-blush-300 rounded-xl focus:ring-2 focus:ring-blush-200 focus:border-transparent text-lg"
                  placeholder="Enter your full name"
                />
                <User className="w-6 h-6 text-blush-500 absolute left-4 top-3" />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 pl-12 border border-blush-300 rounded-xl focus:ring-2 focus:ring-blush-200 focus:border-transparent text-lg"
                  placeholder="Enter your email"
                />
                <Mail className="w-6 h-6 text-blush-500 absolute left-4 top-3" />
              </div>
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-lg font-medium text-charcoal-800 mb-2">
                City
              </label>
              <div className="mt-1 relative">
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 pl-12 border border-blush-300 rounded-xl focus:ring-2 focus:ring-blush-200 focus:border-transparent text-lg"
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <MapPin className="w-6 h-6 text-blush-500 absolute left-4 top-3" />
              </div>
            </div>

            {/* Seller-specific fields */}
            {formData.role === 'seller' && (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900">Seller Account Verification</h4>
                      <p className="text-sm text-yellow-800 mt-1">
                        Seller accounts require admin approval before you can start listing products. 
                        You'll receive an email notification once your account is verified.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="businessName" className="block text-lg font-medium text-charcoal-800 mb-2">
                    Business Name
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 pl-12 border border-primary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                      placeholder="Enter your business name"
                    />
                    <Building className="w-6 h-6 text-primary-500 absolute left-4 top-3" />
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="block text-lg font-medium text-charcoal-800 mb-2">
                    Business Description
                  </label>
                  <div className="mt-1 relative">
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 pl-12 border border-primary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                      placeholder="Describe your business"
                      rows={3}
                    />
                    <Sparkles className="w-6 h-6 text-primary-500 absolute left-4 top-3" />
                  </div>
                </div>
                <div>
                  <label htmlFor="mobile" className="block text-lg font-medium text-charcoal-800 mb-2">
                    Mobile Number
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 pl-12 border border-primary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                      placeholder="Enter your mobile number"
                    />
                    <User className="w-6 h-6 text-primary-500 absolute left-4 top-3" />
                  </div>
                </div>
                <div>
                  <label htmlFor="verificationDoc" className="block text-lg font-medium text-charcoal-800 mb-2">
                    Verification Info <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-charcoal-600 mb-2">
                    Please provide verification information such as:
                  </p>
                  <ul className="text-sm text-charcoal-600 mb-3 ml-4 list-disc">
                    <li>Instagram handle showcasing your work</li>
                    <li>Website or portfolio link</li>
                    <li>Previous marketplace experience</li>
                    <li>Business registration details</li>
                  </ul>
                  <div className="mt-1 relative">
                    <textarea
                      id="verificationDoc"
                      name="verificationDoc"
                      required
                      value={formData.verificationDoc}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-primary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                      placeholder="e.g., Instagram: @myhandmadecrafts, Website: www.mycrafts.com, Previous experience on Etsy..."
                      rows={3}
                    />
                  </div>
                </div>
              </>
            )}

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
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 pl-12 pr-12 border border-primary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                  placeholder="Enter your password"
                />
                <Lock className="w-6 h-6 text-primary-500 absolute left-4 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-primary-500 hover:text-primary-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-lg font-medium text-charcoal-800 mb-2">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 pl-12 pr-12 border border-primary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                  placeholder="Re-enter your password"
                />
                <Lock className="w-6 h-6 text-primary-500 absolute left-4 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-primary-500 hover:text-primary-700 transition-colors"
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
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 px-4 rounded-xl text-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing up...
                  </div>
                ) : (
                  'Sign up'
                )}
              </motion.button>
            </div>

            <div className="text-center">
              <p className="text-lg text-primary-700">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-800 font-semibold transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};