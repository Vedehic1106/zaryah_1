import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  User, 
  Gift, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  Package,
  History,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CartIcon } from './CartIcon';
import { CartSidebar } from './CartSidebar';
import { NotificationCenter } from './NotificationCenter';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getBuyerNavigation = () => [
    { name: 'Home', href: '/', icon: Heart },
    { name: 'Shop', href: '/shop', icon: ShoppingBag },
    { name: 'Gift Suggester', href: '/gift-suggester', icon: Gift },
    { name: 'Hamper Builder', href: '/hamper-builder', icon: Package },
    ...(user ? [{ name: 'Orders', href: '/orders', icon: History }] : [])
  ];

  const getSellerNavigation = () => [
    { name: 'Dashboard', href: '/seller/dashboard', icon: User },
  ];

  const getAdminNavigation = () => [
    { name: 'Dashboard', href: '/admin/dashboard', icon: User },
  ];

  const getNavigation = () => {
    if (!user) return getBuyerNavigation();
    switch (user.role) {
      case 'seller': return getSellerNavigation();
      case 'admin': return getAdminNavigation();
      default: return getBuyerNavigation();
    }
  };

  const navigation = getNavigation();

  // Add this helper to check if any nav link is active
  const isAnyNavActive = navigation.some((item) => location.pathname === item.href);

  return (
    <div
      className="min-h-screen bg-cream-50"
    >
      {/* Header */}
      <header className="bg-cream-50/95 backdrop-blur-md border-b border-cream-200 sticky top-0 z-50 shadow-subtle">
        {/* Desktop header row */}
        <div className="hidden lg:flex w-full items-center justify-between py-6 px-4 xl:px-6">
          {/* Logo - Left Side */}
          <div className="flex-shrink-0 flex items-center justify-start">
            <Link to="/" className="flex items-center space-x-3">
              <span className="p-2 rounded-lg flex items-center justify-center transition-colors duration-200 bg-primary-100">
                <Sparkles className="w-7 h-7 xl:w-9 xl:h-9 transition-colors duration-200 text-primary-600" />
              </span>
              <span className="text-2xl xl:text-4xl font-bold font-serif transition-colors duration-200 text-primary-700">
                Zaryah
              </span>
            </Link>
          </div>
          {/* Center Navigation */}
          <nav className="flex flex-1 items-center justify-center gap-x-6 xl:gap-x-14">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 text-lg xl:text-2xl font-semibold transition-colors duration-200 ${
                    isActive ? 'text-primary-700 underline underline-offset-8 decoration-2' : 'text-neutral-900 hover:text-primary-600'
                  }`}
                  style={{ textDecoration: 'none', background: 'none', boxShadow: 'none', padding: 0 }}
                >
                  <Icon className="w-6 h-6 xl:w-8 xl:h-8" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          {/* Right Side - User Menu */}
          <div className="flex items-center justify-end gap-3 xl:gap-5 ml-auto">
            {user && <NotificationCenter />}
            {/* Only show CartIcon for buyers or unauthenticated users */}
            {(!user || user.role === 'buyer') && <CartIcon />}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-xl px-4 xl:px-8 py-2 xl:py-3 font-bold text-lg xl:text-2xl transition-colors"
                  style={{ boxShadow: 'none' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 border border-primary-600 text-white hover:bg-primary-700 hover:border-primary-700 rounded-xl px-4 xl:px-8 py-2 xl:py-3 font-bold text-lg xl:text-2xl transition-colors shadow-lg"
                  style={{ boxShadow: 'none' }}
                >
                  Register
                </Link>
              </>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-xl px-4 xl:px-6 py-2 xl:py-3 font-bold text-lg xl:text-xl transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Tablet header */}
        <div className="hidden md:flex lg:hidden w-full items-center justify-between py-4 px-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="p-2 rounded-lg flex items-center justify-center transition-colors duration-200 bg-primary-100">
              <Sparkles className="w-6 h-6 transition-colors duration-200 text-primary-600" />
            </span>
            <span className="text-xl font-bold font-serif transition-colors duration-200 text-primary-700">
              Zaryah
            </span>
          </Link>
          <div className="flex items-center space-x-3">
            {user && <NotificationCenter />}
            {/* Only show CartIcon for buyers or unauthenticated users */}
            {(!user || user.role === 'buyer') && <CartIcon />}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-neutral-900 hover:text-neutral-100 hover:bg-neutral-100 rounded-xl transition-all"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile header: logo/icons row */}
        <div className="md:hidden w-full px-4 pt-3 pb-2 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <span className="p-2 rounded-lg flex items-center justify-center transition-colors duration-200 bg-primary-100">
              <Sparkles className="w-6 h-6 transition-colors duration-200 text-primary-600" />
            </span>
            <span className="text-lg font-bold font-serif transition-colors duration-200 text-primary-700">
              Zaryah
            </span>
          </Link>
          <div className="flex items-center space-x-3">
            {user && <NotificationCenter />}
            {/* Only show CartIcon for buyers or unauthenticated users */}
            {(!user || user.role === 'buyer') && <CartIcon />}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-neutral-900 hover:text-neutral-100 hover:bg-neutral-100 rounded-xl transition-all"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile search bar row - only show on shop page */}
        <div className="md:hidden w-full px-4 pb-3">
          <div className="flex items-center bg-white rounded-2xl px-4 py-3 border border-neutral-200 shadow focus-within:ring-2 focus-within:ring-primary-300 transition-all">
            <svg className="w-5 h-5 text-neutral-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input type="text" placeholder="Search our marketplace" className="bg-transparent outline-none flex-1 text-base text-neutral-700 placeholder-neutral-400" />
          </div>
        </div>
        
        {/* Mobile/Tablet nav dropdown */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden bg-white border-t border-neutral-200 px-4 py-4 shadow-xl rounded-b-2xl z-50"
            style={{ position: 'absolute', left: 0, right: 0, top: '100%' }}
          >
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-4 px-6 py-3 rounded-xl transition-all text-base ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-neutral-900 hover:text-primary-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-semibold">{item.name}</span>
                  </Link>
                );
              })}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-4 px-6 py-3 rounded-xl text-neutral-900 hover:text-primary-700 hover:bg-neutral-100 w-full transition-all text-base"
                >
                  <LogOut className="w-6 h-6" />
                  <span className="font-semibold">Logout</span>
                </button>
              ) : (
                <div className="flex space-x-4 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 text-center text-neutral-900 hover:text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-neutral-100 transition-all text-base"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 text-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-soft text-base"
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Cart Sidebar */}
      <CartSidebar />

      {/* Footer */}
      <footer className="bg-neutral-50 border-t border-primary-100 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-primary-600 p-2 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl lg:text-3xl font-bold text-neutral-800 font-serif">Zaryah</span>
              </div>
              <p className="text-neutral-600 mb-6 lg:mb-8 max-w-md text-base lg:text-lg leading-relaxed">
                Your path to meaningful connections through thoughtfully curated gifts. Every purchase tells a story 
                and supports passionate artisans on their creative journey.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-secondary-100 text-secondary-700 px-3 lg:px-4 py-2 rounded-full text-sm lg:text-lg font-medium border border-secondary-200">
                  🌿 Mindful Choices
                </div>
                <div className="bg-primary-100 text-primary-700 px-3 lg:px-4 py-2 rounded-full text-sm lg:text-lg font-medium border border-primary-200">
                  ✨ Artisan Stories
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-neutral-800 mb-4 lg:mb-6 text-lg lg:text-2xl">Explore</h3>
              <ul className="space-y-3">
                <li><Link to="/shop" className="text-neutral-600 hover:text-neutral-800 transition-colors text-sm lg:text-lg">Curated Collections</Link></li>
                <li><Link to="/gift-suggester" className="text-neutral-600 hover:text-neutral-800 transition-colors text-sm lg:text-lg">Gift Guidance</Link></li>
                <li><Link to="/hamper-builder" className="text-neutral-600 hover:text-neutral-800 transition-colors text-sm lg:text-lg">Create Bundles</Link></li>
                <li><Link to="/register" className="text-neutral-600 hover:text-neutral-800 transition-colors text-sm lg:text-lg">Join as Artisan</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-neutral-800 mb-4 lg:mb-6 text-lg lg:text-2xl">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-neutral-600 hover:text-neutral-800 transition-colors text-sm lg:text-lg">Help Center</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-neutral-800 transition-colors text-sm lg:text-lg">Delivery Guide</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-neutral-800 transition-colors text-sm lg:text-lg">Care & Returns</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-neutral-800 transition-colors text-sm lg:text-lg">Connect With Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary-100 mt-8 lg:mt-12 pt-6 lg:pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm lg:text-lg text-neutral-600 mb-4 md:mb-0 text-center md:text-left">
              © 2024 Zaryah. Guiding paths to meaningful connections.
            </p>
            <div className="flex items-center space-x-4 lg:space-x-6 text-sm lg:text-lg text-neutral-600">
              <a href="#" className="hover:text-neutral-800 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-neutral-800 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};