import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Edit, 
  Trash2,
  Upload,
  Save,
  X,
  Star,
  Calendar,
  BarChart3,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { FileUpload } from '../components/FileUpload';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface SellerStats {
  totalProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  totalRevenue: number;
  totalOrders: number;
  averageRating: number;
}

export const SellerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { products, addProduct } = useApp();
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    totalRevenue: 0,
    totalOrders: 0,
    averageRating: 4.5
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'add-product' | 'analytics'>('overview');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    tags: '',
    city: user?.city || 'Mumbai',
    instantDeliveryEligible: false,
    section: '',
    weight: '',
    customisable: false,
    customQuestions: ['']
  });

  const [productImages, setProductImages] = useState<File[] | null>(null);
  const [productVideo, setProductVideo] = useState<File | null>(null);

  const categories = [
    'Jewelry', 'Home Decor', 'Art', 'Textiles', 'Candles', 'Pottery', 
    'Accessories', 'Bags', 'Clothing', 'Toys', 'Stationery', 'Other'
  ];

  const sections = [
    'For Her', 'For Him', 'For Kids', 'Home', 'Occasions', 'Personalised'
  ];

  useEffect(() => {
    if (user?.role === 'seller') {
      calculateStats();
    }
  }, [user, products]);

  const calculateStats = () => {
    const sellerProducts = products.filter(p => p.sellerId === user?.id);
    const approvedProducts = sellerProducts.filter(p => p.status === 'approved');
    const pendingProducts = sellerProducts.filter(p => p.status === 'pending');

    setStats({
      totalProducts: sellerProducts.length,
      approvedProducts: approvedProducts.length,
      pendingProducts: pendingProducts.length,
      totalRevenue: 0, // Would be calculated from actual orders
      totalOrders: 0, // Would be calculated from actual orders
      averageRating: 4.5 // Would be calculated from actual reviews
    });
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !productImages || productImages.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Upload all images to Supabase Storage and get URLs
      const imageUrls: string[] = [];
      for (const file of productImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const { data, error } = await supabase.storage.from('product-images').upload(fileName, file);
        if (error) throw error;
        const { publicUrl } = supabase.storage.from('product-images').getPublicUrl(fileName).data;
        imageUrls.push(publicUrl);
      }
      const videoUrl = productVideo ? URL.createObjectURL(productVideo) : undefined;

      const customQuestions = productForm.customisable 
        ? productForm.customQuestions.filter(q => q.trim() !== '')
        : [];

      const success = await addProduct({
        sellerId: user.id,
        name: productForm.name,
        price: parseFloat(productForm.price),
        image_urls: imageUrls,
        description: productForm.description,
        videoUrl,
        city: productForm.city,
        instantDeliveryEligible: productForm.instantDeliveryEligible,
        status: 'pending',
        category: productForm.category,
        tags: productForm.tags.split(',').map(tag => tag.trim()),
        section: productForm.section,
        weight: productForm.weight ? parseInt(productForm.weight) : undefined,
        customisable: productForm.customisable,
        customQuestions: customQuestions.length > 0 ? customQuestions : undefined
      });

      if (success) {
        setShowAddProductModal(false);
        resetForm();
        toast.success('Product added successfully! It will be reviewed by admin.');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      price: '',
      description: '',
      category: '',
      tags: '',
      city: user?.city || 'Mumbai',
      instantDeliveryEligible: false,
      section: '',
      weight: '',
      customisable: false,
      customQuestions: ['']
    });
    setProductImages(null);
    setProductVideo(null);
  };

  const handleCustomQuestionChange = (index: number, value: string) => {
    const newQuestions = [...productForm.customQuestions];
    newQuestions[index] = value;
    setProductForm(prev => ({ ...prev, customQuestions: newQuestions }));
  };

  const addCustomQuestion = () => {
    setProductForm(prev => ({
      ...prev,
      customQuestions: [...prev.customQuestions, '']
    }));
  };

  const removeCustomQuestion = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== index)
    }));
  };

  const sellerProducts = products.filter(p => p.sellerId === user?.id);

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

  if (user?.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-900 mb-4">Access Denied</h1>
          <p className="text-primary-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }
  
  if (!user.isVerified) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="bg-yellow-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-primary-900 mb-4">Account Pending Verification</h1>
          <p className="text-lg text-primary-700 mb-6 leading-relaxed">
            Thank you for registering as a seller! Your account is currently under review by our admin team.
          </p>
          <div className="bg-primary-50 rounded-xl p-6 mb-6 border border-primary-200">
            <h3 className="font-semibold text-primary-900 mb-3">What happens next?</h3>
            <div className="space-y-2 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span className="text-primary-700">Our team will review your seller application</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span className="text-primary-700">You'll receive an email notification once approved</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span className="text-primary-700">After approval, you can start listing your products</span>
              </div>
            </div>
          </div>
          <p className="text-primary-600">
            This process typically takes 1-2 business days. We appreciate your patience!
          </p>
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
              <h1 className="text-3xl font-bold text-primary-900">Seller Dashboard</h1>
              <p className="text-primary-600 mt-1">Welcome back, {user.name}!</p>
            </div>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-primary-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'products', name: 'My Products', icon: Package },
                { id: 'analytics', name: 'Analytics', icon: TrendingUp }
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
                  title="Total Products"
                  value={stats.totalProducts}
                  icon={Package}
                  color="bg-primary-600"
                />
                <StatCard
                  title="Approved Products"
                  value={stats.approvedProducts}
                  icon={CheckCircle}
                  color="bg-success-600"
                />
                <StatCard
                  title="Pending Review"
                  value={stats.pendingProducts}
                  icon={Clock}
                  color="bg-warning-600"
                />
                <StatCard
                  title="Average Rating"
                  value={stats.averageRating.toFixed(1)}
                  icon={Star}
                  color="bg-accent-600"
                />
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-primary-100">
                <h3 className="text-lg font-semibold text-primary-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="flex items-center space-x-3 p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-primary-600" />
                    <div className="text-left">
                      <p className="font-medium text-primary-900">Add New Product</p>
                      <p className="text-sm text-primary-600">List a new item</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-colors"
                  >
                    <Package className="w-5 h-5 text-secondary-600" />
                    <div className="text-left">
                      <p className="font-medium text-secondary-900">Manage Products</p>
                      <p className="text-sm text-secondary-600">{stats.totalProducts} products</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="flex items-center space-x-3 p-4 bg-accent-50 rounded-xl hover:bg-accent-100 transition-colors"
                  >
                    <TrendingUp className="w-5 h-5 text-accent-600" />
                    <div className="text-left">
                      <p className="font-medium text-accent-900">View Analytics</p>
                      <p className="text-sm text-accent-600">Performance insights</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Products */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-primary-100">
                <h3 className="text-lg font-semibold text-primary-900 mb-4">Recent Products</h3>
                <div className="space-y-4">
                  {sellerProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center space-x-4 p-4 bg-primary-25 rounded-xl">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-primary-900">{product.name}</h4>
                        <p className="text-sm text-primary-600">₹{product.price.toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'approved' ? 'bg-green-100 text-green-800' :
                        product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl shadow-soft border border-primary-100">
              <div className="p-6 border-b border-primary-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary-900">My Products</h3>
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sellerProducts.map((product) => (
                    <div key={product.id} className="border border-primary-200 rounded-xl overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-primary-900">{product.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === 'approved' ? 'bg-green-100 text-green-800' :
                            product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                        <p className="text-sm text-primary-600 mb-2">₹{product.price.toLocaleString()}</p>
                        <p className="text-xs text-primary-500 mb-4">{product.category}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowEditModal(true);
                              }}
                              className="text-primary-600 hover:text-primary-800 p-1"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="text-primary-600 hover:text-primary-800 p-1"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-primary-500">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-primary-100">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Analytics</h3>
              <div className="text-center py-16">
                <BarChart3 className="w-16 h-16 text-primary-300 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-primary-900 mb-2">Analytics Coming Soon</h4>
                <p className="text-primary-600">Detailed analytics and insights will be available soon.</p>
              </div>
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        {showAddProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-primary-200">
                <h2 className="text-xl font-bold text-primary-900">Add New Product</h2>
                <button
                  onClick={() => setShowAddProductModal(false)}
                  className="text-primary-600 hover:text-primary-800 p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleProductSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={productForm.price}
                      onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter price"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={4}
                    placeholder="Describe your product"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={productForm.category}
                      onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Section</label>
                    <select
                      value={productForm.section}
                      onChange={(e) => setProductForm(prev => ({ ...prev, section: e.target.value }))}
                      className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select section</option>
                      {sections.map(section => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Weight (grams)</label>
                    <input
                      type="number"
                      min="1"
                      value={productForm.weight}
                      onChange={(e) => setProductForm(prev => ({ ...prev, weight: e.target.value }))}
                      className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Product weight"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Tags</label>
                  <input
                    type="text"
                    value={productForm.tags}
                    onChange={(e) => setProductForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter tags separated by commas"
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.instantDeliveryEligible}
                      onChange={(e) => setProductForm(prev => ({ ...prev, instantDeliveryEligible: e.target.checked }))}
                      className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm font-medium text-primary-700">Instant Delivery Eligible</span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.customisable}
                      onChange={(e) => setProductForm(prev => ({ ...prev, customisable: e.target.checked }))}
                      className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm font-medium text-primary-700">Customisable</span>
                  </label>
                </div>

                {productForm.customisable && (
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Custom Questions</label>
                    {productForm.customQuestions.map((question, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={question}
                          onChange={(e) => handleCustomQuestionChange(index, e.target.value)}
                          className="flex-1 border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Enter custom question"
                        />
                        {productForm.customQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCustomQuestion(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addCustomQuestion}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      + Add Question
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUpload
                    type="image"
                    onFileSelect={setProductImages}
                    currentFiles={productImages}
                    placeholder="Upload product images (you can select multiple)"
                  />
                  <FileUpload
                    type="video"
                    onFileSelect={setProductVideo}
                    currentFile={productVideo}
                    placeholder="Upload product video (optional)"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="px-6 py-2 text-primary-600 hover:text-primary-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Add Product</span>
                      </>
                    )}
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