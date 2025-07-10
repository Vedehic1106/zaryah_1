import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Verified, Play, Star, MapPin, ShoppingBag, Gift, Package } from 'lucide-react';
import { Product } from '../types';
import { InstantDeliveryBadge, DeliveryTimeEstimate } from './InstantDeliveryBadge';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { addToCart } = useCart();

  const handleQuickAdd = () => {
    addToCart(product);
  };

  const handleGiftAdd = () => {
    addToCart(product, { giftPackaging: true });
  };

  return (
    <Link to={`/product/${product.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        className="bg-cream-50 rounded-2xl shadow-lg border border-blush-100 overflow-hidden flex flex-col h-full p-2 sm:p-4 lg:p-8"
        onHoverStart={() => setShowQuickAdd(true)}
        onHoverEnd={() => setShowQuickAdd(false)}
      >
        {/* Product Image */}
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-32 sm:h-48 lg:h-64 object-cover group-hover:scale-105 transition-transform duration-700 rounded-lg"
          />
          
          {/* Subtle Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Instant Delivery Badge */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
            <InstantDeliveryBadge product={product} />
          </div>

          {/* Video Badge */}
          {product.videoUrl && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
              <div className="bg-blush-700/80 backdrop-blur-sm text-white p-2.5 rounded-full shadow-soft">
                <Play className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>
          )}

          {/* Like Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
            className={`absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-blush-100 hover:bg-blush-200 p-2 sm:p-3 rounded-full transition-all shadow-soft border border-blush-200 ${isLiked ? 'bg-blush-600 hover:bg-blush-700' : ''}`}
          >
            <Heart 
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                isLiked ? 'text-white fill-current' : 'text-blush-600'
              }`} 
            />
          </motion.button>

          {/* Quick Add Buttons - Hidden on mobile, shown on hover for desktop */}
          <AnimatePresence>
            {showQuickAdd && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 hidden lg:flex space-x-2"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleQuickAdd}
                  className="bg-[#A67C5A] hover:bg-[#8a684a] text-white px-4 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg border-2 border-[#8a684a] hover:border-black flex items-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4 text-white" />
                  <span className="hidden sm:inline">Add to Cart</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGiftAdd}
                  className="bg-[#A67C5A] hover:bg-[#8a684a] text-white px-4 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg border-2 border-[#8a684a] hover:border-black flex items-center space-x-2"
                >
                  <Gift className="w-4 h-4 text-white" />
                  <span className="hidden sm:inline">Gift</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Info */}
        <div className="p-2 sm:p-4 lg:p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <h3 className="font-bold text-charcoal-800 text-sm sm:text-base lg:text-lg line-clamp-2 leading-tight flex-1 mr-2 font-serif">
              {product.name}
            </h3>
            <span className="text-sm sm:text-lg lg:text-xl font-bold text-blush-700 whitespace-nowrap">
              ₹{product.price.toLocaleString()}
            </span>
          </div>

          {/* Seller Info (smaller, less vertical space) */}
          <div className="flex items-center space-x-1 mb-1">
            <span className="text-xs sm:text-sm font-semibold text-charcoal-700">{product.sellerName}</span>
          </div>

          <p className="text-charcoal-600 text-xs sm:text-sm mb-2 line-clamp-2 leading-snug">
            {product.description}
          </p>

          {/* New Product Details */}
          <div className="mb-2 space-y-1">
            {product.section && (
              <div className="text-xs text-charcoal-700"><b>Section:</b> {product.section}</div>
            )}
            {product.weight && (
              <div className="text-xs text-charcoal-700"><b>Weight:</b> {product.weight}g</div>
            )}
            {product.customisable && (
              <div className="inline-block bg-mint-100 text-mint-800 text-xs px-2 py-0.5 rounded-full font-semibold mr-2">Customisable</div>
            )}
            {product.customisable && product.customQuestions && product.customQuestions.length > 0 && (
              <div className="text-xs text-charcoal-700 mt-1">
                <b>Custom Questions:</b>
                <ul className="list-disc list-inside ml-2">
                  {product.customQuestions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Delivery Time (smaller margin) */}
          <div className="mb-2">
            <DeliveryTimeEstimate product={product} />
          </div>

          {/* Rating (smaller, less margin) */}
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex items-center space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 ${
                    i < 4 ? 'text-blush-400 fill-current' : 'text-charcoal-400'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm text-charcoal-700 font-semibold">(4.8)</span>
            <span className="text-xs text-charcoal-500 hidden sm:inline">• 24 reviews</span>
          </div>

          {/* Action Buttons (smaller, more compact) - push to bottom */}
          <div className="flex space-x-1 sm:space-x-2 mt-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleQuickAdd}
              className="flex-1 bg-[#A67C5A] hover:bg-[#8a684a] text-white py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg border-2 border-[#8a684a] hover:border-black flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
            >
              <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              <span>Add</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGiftAdd}
              className="bg-[#A67C5A] hover:bg-[#8a684a] text-white px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-300 shadow-lg border-2 border-[#8a684a] hover:border-black flex items-center justify-center"
            >
              <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};