import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  ShoppingBag, 
  Gift, 
  Heart, 
  X, 
  Check,
  Package,
  Sparkles,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useCart } from '../contexts/CartContext';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

interface HamperItem {
  product: Product;
  quantity: number;
}

export const HamperBuilderPage: React.FC = () => {
  const { products } = useApp();
  const { addToCart } = useCart();
  const [hamperItems, setHamperItems] = useState<HamperItem[]>([]);
  const [hamperName, setHamperName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCheckout, setShowCheckout] = useState(false);

  const approvedProducts = products.filter(p => p.status === 'approved');
  const categories = ['all', ...Array.from(new Set(approvedProducts.map(p => p.category)))];

  const filteredProducts = selectedCategory === 'all' 
    ? approvedProducts 
    : approvedProducts.filter(p => p.category === selectedCategory);

  const totalPrice = hamperItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItems = hamperItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToHamper = (product: Product) => {
    setHamperItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setHamperItems(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setHamperItems(prev =>
        prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const removeFromHamper = (productId: string) => {
    setHamperItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearHamper = () => {
    setHamperItems([]);
    setHamperName('');
  };

  const addHamperToCart = () => {
    hamperItems.forEach(item => {
      addToCart(item.product, {
        quantity: item.quantity,
        isGift: true,
        giftPackaging: true,
        giftNote: `Part of ${hamperName || 'Custom Hamper'}`
      });
    });
    clearHamper();
    setShowCheckout(false);
  };

  return (
    <div className="min-h-screen bg-gradient-elegant pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-blush-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal-800 mb-4">
            Create Your Perfect{' '}
            <span className="text-blush-600">
              Hamper
            </span>
          </h1>
          <p className="text-lg md:text-xl text-charcoal-600 max-w-2xl mx-auto">
            Curate a personalized gift collection from our handmade treasures
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Category Filter */}
            <div className="bg-cream-50 rounded-2xl shadow-sm border border-cream-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-charcoal-800 mb-4">Browse Products</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-blush-600 text-white shadow-lg'
                        : 'bg-cream-100 text-blush-700 hover:bg-cream-200'
                    }`}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <ProductCard product={product} />
                  {/* Quick Add Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToHamper(product)}
                    className="absolute top-4 right-4 bg-blush-600 hover:bg-blush-700 text-white p-2 rounded-full shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Hamper Builder Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-cream-50 rounded-2xl shadow-lg border border-cream-200 overflow-hidden">
                {/* Header */}
                <div className="bg-blush-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Your Hamper</h3>
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-medium">{totalItems} items</span>
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Name your hamper..."
                    value={hamperName}
                    onChange={(e) => setHamperName(e.target.value)}
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                {/* Hamper Items */}
                <div className="max-h-96 overflow-y-auto">
                  {hamperItems.length === 0 ? (
                    <div className="p-8 text-center">
                      <Package className="w-12 h-12 text-cream-300 mx-auto mb-4" />
                      <p className="text-blush-600 text-sm">
                        Start adding products to build your hamper
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      {hamperItems.map((item) => (
                        <motion.div
                          key={item.product.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex items-center space-x-3 bg-cream-50 rounded-xl p-3 border border-cream-200"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-charcoal-800 truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-primary-600">
                              ₹{item.product.price.toLocaleString()} each
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 bg-cream-200 rounded-full flex items-center justify-center hover:bg-cream-300 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 bg-cream-100 text-primary-600 rounded-full flex items-center justify-center hover:bg-cream-200 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeFromHamper(item.product.id)}
                              className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors ml-2"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {hamperItems.length > 0 && (
                  <div className="border-t border-cream-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-charcoal-800">Total</span>
                      <span className="text-2xl font-bold text-primary-600">
                        ₹{totalPrice.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCheckout(true)}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </motion.button>
                      
                      <button
                        onClick={clearHamper}
                        className="w-full bg-cream-100 text-primary-700 py-2 rounded-xl font-medium hover:bg-cream-200 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear All</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Modal */}
        <AnimatePresence>
          {showCheckout && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-charcoal-800">
                    {hamperName || 'Custom Hamper'} Summary
                  </h2>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="text-primary-600 hover:text-primary-800 p-2"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {hamperItems.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between p-4 bg-cream-50 rounded-xl border border-cream-200">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-medium text-charcoal-800">{item.product.name}</h4>
                          <p className="text-sm text-primary-600">by {item.product.sellerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-charcoal-800">
                          {item.quantity} × ₹{item.product.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-primary-600">
                          ₹{(item.quantity * item.product.price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-cream-200 pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xl font-semibold text-charcoal-800">Total Amount</span>
                    <span className="text-3xl font-bold text-primary-600">
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="flex-1 bg-cream-100 text-primary-700 py-3 px-6 rounded-xl font-semibold hover:bg-cream-200 transition-colors"
                    >
                      Continue Shopping
                    </button>
                    <button
                      onClick={addHamperToCart}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <span>Add to Cart</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};