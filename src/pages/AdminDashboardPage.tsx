import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Check, 
  X, 
  Edit,
  Trash2,
  Plus,
  Settings,
  BarChart3,
  ShoppingBag,
  Star,
  MapPin,
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import { FileUpload } from '../components/FileUpload';
import toast from 'react-hot-toast';
import { EmailService } from '../services/emailService';

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingProducts: number;
  activeUsers: number;
}

interface HeroVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  maker_name: string;
  location: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { products, updateProduct, deliveryCities, updateDeliveryCity, currentTheme, updateTheme } = useApp();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingProducts: 0,
    activeUsers: 0
  });
  const [heroVideos, setHeroVideos] = useState<HeroVideo[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'users' | 'orders' | 'hero-videos' | 'settings'>('overview');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showHeroVideoModal, setShowHeroVideoModal] = useState(false);
  const [selectedHeroVideo, setSelectedHeroVideo] = useState<HeroVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [heroVideoForm, setHeroVideoForm] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    maker_name: '',
    location: '',
    is_active: true,
    order_index: 0
  });

  // Pending sellers state
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);

  const emailService = new EmailService();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminStats();
      fetchHeroVideos();
      fetchPendingSellers();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    setIsLoading(true);
    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch orders count and revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount');

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount / 100), 0) || 0;

      // Fetch pending products
      const pendingProducts = products.filter(p => p.status === 'pending').length;

      setStats({
        totalUsers: usersCount || 0,
        totalProducts: products.length,
        totalOrders,
        totalRevenue,
        pendingProducts,
        activeUsers: usersCount || 0 // Simplified for demo
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHeroVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_videos')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setHeroVideos(data || []);
    } catch (error) {
      console.error('Error fetching hero videos:', error);
    }
  };

  const fetchPendingSellers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'seller')
      .eq('is_verified', false);
    if (!error) setPendingSellers(data || []);
  };

  const handleApproveSeller = async (seller: any) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', seller.id);
      
    if (!error) {
      toast.success(`${seller.name} approved as seller!`);
      
      // Get user's email from auth.users table
      const { data: authUser } = await supabase.auth.admin.getUserById(seller.id);
      
      if (authUser.user?.email) {
        // Send approval email
        await emailService.sendSellerApproval({
          email: authUser.user.email,
          name: seller.name || '',
          id: seller.id
        });
        console.log('Approval email sent to:', authUser.user.email);
      } else {
        console.warn('Could not find email for seller:', seller.id);
      }
      
      fetchPendingSellers();
    } else {
      toast.error('Failed to approve seller');
    }
  };

  const handleRejectSeller = async (seller: any) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', seller.id);
      
    if (!error) {
      // Also delete the auth user
      await supabase.auth.admin.deleteUser(seller.id);
      
      toast.success(`${seller.name} rejected and removed from system`);
      fetchPendingSellers();
    } else {
      toast.error('Failed to reject seller');
    }
  };

  const handleProductStatusUpdate = async (productId: string, status: 'approved' | 'rejected') => {
    const success = await updateProduct(productId, { status });
    if (success) {
      toast.success(`Product ${status} successfully!`);
      fetchAdminStats();
    }
  };

  const handleHeroVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedHeroVideo) {
        // Update existing video
        const { error } = await supabase
          .from('hero_videos')
          .update(heroVideoForm)
          .eq('id', selectedHeroVideo.id);

        if (error) throw error;
        toast.success('Hero video updated successfully!');
      } else {
        // Create new video
        const { error } = await supabase
          .from('hero_videos')
          .insert(heroVideoForm);

        if (error) throw error;
        toast.success('Hero video created successfully!');
      }

      setShowHeroVideoModal(false);
      setSelectedHeroVideo(null);
      setHeroVideoForm({
        title: '',
        description: '',
        video_url: '',
        thumbnail_url: '',
        maker_name: '',
        location: '',
        is_active: true,
        order_index: 0
      });
      fetchHeroVideos();
    } catch (error) {
      console.error('Error saving hero video:', error);
      toast.error('Failed to save hero video');
    }
  };

  const handleDeleteHeroVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this hero video?')) return;

    try {
      const { error } = await supabase
        .from('hero_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
      toast.success('Hero video deleted successfully!');
      fetchHeroVideos();
    } catch (error) {
      console.error('Error deleting hero video:', error);
      toast.error('Failed to delete hero video');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const StatCard = ({ title, value, icon: Icon, color, change }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl p-6 shadow-soft border border-primary-100`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-primary-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-primary-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-900 mb-4">Access Denied</h1>
          <p className="text-primary-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-900">Admin Dashboard</h1>
              <p className="text-primary-600 mt-1">Manage your platform and monitor performance</p>
            </div>
            <button
              onClick={fetchAdminStats}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-primary-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'products', name: 'Products', icon: Package },
                { id: 'users', name: 'Users', icon: Users },
                { id: 'hero-videos', name: 'Hero Videos', icon: Eye },
                { id: 'settings', name: 'Settings', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-primary-500 hover:text-primary-700 hover:border-primary-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers.toLocaleString()}
                  icon={Users}
                  color="bg-primary-600"
                  change={12}
                />
                <StatCard
                  title="Total Products"
                  value={stats.totalProducts.toLocaleString()}
                  icon={Package}
                  color="bg-secondary-600"
                  change={8}
                />
                <StatCard
                  title="Total Orders"
                  value={stats.totalOrders.toLocaleString()}
                  icon={ShoppingBag}
                  color="bg-accent-600"
                  change={15}
                />
                <StatCard
                  title="Revenue"
                  value={`₹${stats.totalRevenue.toLocaleString()}`}
                  icon={DollarSign}
                  color="bg-success-600"
                  change={23}
                />
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-primary-100">
                <h3 className="text-lg font-semibold text-primary-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="flex items-center space-x-3 p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
                  >
                    <Package className="w-5 h-5 text-primary-600" />
                    <div className="text-left">
                      <p className="font-medium text-primary-900">Review Products</p>
                      <p className="text-sm text-primary-600">{stats.pendingProducts} pending</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('hero-videos')}
                    className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-colors"
                  >
                    <Eye className="w-5 h-5 text-secondary-600" />
                    <div className="text-left">
                      <p className="font-medium text-secondary-900">Manage Videos</p>
                      <p className="text-sm text-secondary-600">{heroVideos.length} videos</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="flex items-center space-x-3 p-4 bg-accent-50 rounded-xl hover:bg-accent-100 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-accent-600" />
                    <div className="text-left">
                      <p className="font-medium text-accent-900">Platform Settings</p>
                      <p className="text-sm text-accent-600">Configure system</p>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl shadow-soft border border-primary-100">
              <div className="p-6 border-b border-primary-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary-900">Product Management</h3>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="w-4 h-4 text-primary-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-primary-900">Product</th>
                      <th className="text-left py-3 px-6 font-medium text-primary-900">Seller</th>
                      <th className="text-left py-3 px-6 font-medium text-primary-900">Price</th>
                      <th className="text-left py-3 px-6 font-medium text-primary-900">Status</th>
                      <th className="text-left py-3 px-6 font-medium text-primary-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-primary-100 hover:bg-primary-25">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-primary-900">{product.name}</p>
                              <p className="text-sm text-primary-600">{product.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-primary-700">{product.sellerName}</td>
                        <td className="py-4 px-6 font-medium text-primary-900">₹{product.price.toLocaleString()}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === 'approved' ? 'bg-green-100 text-green-800' :
                            product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {product.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleProductStatusUpdate(product.id, 'approved')}
                                  className="text-green-600 hover:text-green-800 p-1"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleProductStatusUpdate(product.id, 'rejected')}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowProductModal(true);
                              }}
                              className="text-primary-600 hover:text-primary-800 p-1"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'hero-videos' && (
            <div className="bg-white rounded-2xl shadow-soft border border-primary-100">
              <div className="p-6 border-b border-primary-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary-900">Hero Videos Management</h3>
                  <button
                    onClick={() => {
                      setSelectedHeroVideo(null);
                      setHeroVideoForm({
                        title: '',
                        description: '',
                        video_url: '',
                        thumbnail_url: '',
                        maker_name: '',
                        location: '',
                        is_active: true,
                        order_index: heroVideos.length
                      });
                      setShowHeroVideoModal(true);
                    }}
                    className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Video</span>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {heroVideos.map((video) => (
                    <div key={video.id} className="border border-primary-200 rounded-xl overflow-hidden">
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-primary-900">{video.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            video.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {video.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-primary-600 mb-2">{video.description}</p>
                        <p className="text-xs text-primary-500">by {video.maker_name} • {video.location}</p>
                        
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs text-primary-500">Order: {video.order_index}</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedHeroVideo(video);
                                setHeroVideoForm(video);
                                setShowHeroVideoModal(true);
                              }}
                              className="text-primary-600 hover:text-primary-800 p-1"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteHeroVideo(video.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Delivery Cities */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-primary-100">
                <h3 className="text-lg font-semibold text-primary-900 mb-4">Delivery Cities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deliveryCities.map((city) => (
                    <div key={city.id} className="flex items-center justify-between p-3 border border-primary-200 rounded-lg">
                      <span className="font-medium text-primary-900">{city.name}</span>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={city.isActive}
                          onChange={(e) => updateDeliveryCity(city.id, e.target.checked)}
                          className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-primary-600">Active</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Theme Settings */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-primary-100">
                <h3 className="text-lg font-semibold text-primary-900 mb-4">Theme Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-primary-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-primary-900">Current Theme</h4>
                      <p className="text-sm text-primary-600">{currentTheme.name}</p>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#b8926b' }}></div>
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#d49855' }}></div>
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#a8875f' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pending Sellers Section - Only show in Users tab */}
        {user?.role === 'admin' && activeTab === 'users' && (
          <div className="my-8">
            <h2 className="text-2xl font-bold mb-4">Pending Seller Approvals</h2>
            {pendingSellers.length === 0 ? (
              <p className="text-charcoal-600">No pending sellers.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Business</th>
                      <th className="px-4 py-2">Mobile</th>
                      <th className="px-4 py-2">Verification Doc</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSellers.map(seller => (
                      <tr key={seller.id} className="border-t">
                        <td className="px-4 py-2">{seller.name}</td>
                        <td className="px-4 py-2">{seller.email || seller.id}</td>
                        <td className="px-4 py-2">{seller.business_name}</td>
                        <td className="px-4 py-2">{seller.mobile}</td>
                        <td className="px-4 py-2">{seller.verification_doc}</td>
                        <td className="px-4 py-2 space-x-2">
                          <button onClick={() => handleApproveSeller(seller)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Approve</button>
                          <button onClick={() => handleRejectSeller(seller)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Hero Video Modal */}
        {showHeroVideoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-primary-200">
                <h2 className="text-xl font-bold text-primary-900">
                  {selectedHeroVideo ? 'Edit Hero Video' : 'Add Hero Video'}
                </h2>
                <button
                  onClick={() => setShowHeroVideoModal(false)}
                  className="text-primary-600 hover:text-primary-800 p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleHeroVideoSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={heroVideoForm.title}
                      onChange={(e) => setHeroVideoForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Maker Name</label>
                    <input
                      type="text"
                      required
                      value={heroVideoForm.maker_name}
                      onChange={(e) => setHeroVideoForm(prev => ({ ...prev, maker_name: e.target.value }))}
                      className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Description</label>
                  <textarea
                    required
                    value={heroVideoForm.description}
                    onChange={(e) => setHeroVideoForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Video URL</label>
                    <input
                      type="url"
                      required
                      value={heroVideoForm.video_url}
                      onChange={(e) => setHeroVideoForm(prev => ({ ...prev, video_url: e.target.value }))}
                      className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Thumbnail URL</label>
                    <input
                      type="url"
                      required
                      value={heroVideoForm.thumbnail_url}
                      onChange={(e) => setHeroVideoForm(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                      className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Location</label>
                    <input
                      type="text"
                      required
                      value={heroVideoForm.location}
                      onChange={(e) => setHeroVideoForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Order Index</label>
                    <input
                      type="number"
                      min="0"
                      value={heroVideoForm.order_index}
                      onChange={(e) => setHeroVideoForm(prev => ({ ...prev, order_index: parseInt(e.target.value) }))}
                      className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={heroVideoForm.is_active}
                        onChange={(e) => setHeroVideoForm(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm font-medium text-primary-700">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowHeroVideoModal(false)}
                    className="px-4 py-2 text-primary-600 hover:text-primary-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    {selectedHeroVideo ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};