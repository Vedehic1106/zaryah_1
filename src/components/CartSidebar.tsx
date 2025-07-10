import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Gift, 
  Package,
  MessageSquare,
  CreditCard,
  Truck,
  Clock
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { CheckoutModal } from './CheckoutModal';

export const CartSidebar: React.FC = () => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    updateCartItem,
    getTotalPrice, 
    getTotalItems,
    getGiftPackagingCost,
    getDeliveryCost,
    isCartOpen, 
    setIsCartOpen 
  } = useCart();
  
  const [showCheckout, setShowCheckout] = useState(false);

  const handleGiftPackagingToggle = (itemId: string, giftPackaging: boolean) => {
    updateCartItem(itemId, { giftPackaging, giftNote: giftPackaging ? '' : undefined });
  };

  const handleGiftNoteChange = (itemId: string, giftNote: string) => {
    updateCartItem(itemId, { giftNote });
  };

  const subtotal = getTotalPrice();
  const giftPackagingCost = getGiftPackagingCost();
  const standardDeliveryCost = getDeliveryCost('standard');
  const instantDeliveryCost = getDeliveryCost('instant');

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />

            {/* Cart Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-primary-200 bg-primary-50">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-600 p-2 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-primary-900">Your Cart</h2>
                    <p className="text-sm text-primary-700">{getTotalItems()} items</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-primary-600 hover:text-primary-800 p-2 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-primary-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary-900 mb-2">Your cart is empty</h3>
                    <p className="text-primary-700 text-sm">Add some beautiful handmade items to get started</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item.id} className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                        {/* Product Info */}
                        <div className="flex items-start space-x-3 mb-4">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-amber-900 text-sm line-clamp-2">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-primary-600 mb-2">by {item.product.sellerName}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-primary-800">
                                ₹{item.product.price.toLocaleString()}
                              </span>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center hover:bg-primary-300 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-semibold text-primary-900 w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center hover:bg-primary-300 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="font-bold text-primary-800">
                            ₹{(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>

                        {/* Gift Packaging Option */}
                        <div className="space-y-3 border-t border-primary-200 pt-3">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.giftPackaging}
                              onChange={(e) => handleGiftPackagingToggle(item.id, e.target.checked)}
                              className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="flex items-center space-x-2">
                              <Package className="w-4 h-4 text-primary-600" />
                              <span className="text-sm font-medium text-primary-900">
                                Gift packaging (+₹30)
                              </span>
                            </div>
                          </label>

                          {item.giftPackaging && (
                            <div className="ml-7">
                              <div className="flex items-center space-x-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-primary-600" />
                                <span className="text-sm font-medium text-primary-900">Gift note</span>
                              </div>
                              <textarea
                                value={item.giftNote || ''}
                                onChange={(e) => handleGiftNoteChange(item.id, e.target.value)}
                                placeholder="Write a personal message..."
                                className="w-full text-xs border border-primary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                rows={2}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-primary-200 p-6 bg-white">
                  {/* Price Breakdown */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-700">Subtotal</span>
                      <span className="text-primary-900">₹{subtotal.toLocaleString()}</span>
                    </div>
                    
                    {giftPackagingCost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-primary-700">Gift packaging</span>
                        <span className="text-primary-900">₹{giftPackagingCost}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-700">Standard delivery</span>
                      <span className="text-primary-900">
                        {standardDeliveryCost === 0 ? 'FREE' : `₹${standardDeliveryCost}`}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-700 flex items-center">
                        <Truck className="w-3 h-3 mr-1" />
                        Instant delivery (Dunzo)
                      </span>
                      <span className="text-primary-900">₹{instantDeliveryCost}</span>
                    </div>
                    
                    <div className="border-t border-primary-200 pt-2 flex justify-between font-bold">
                      <span className="text-primary-900">Total (Standard)</span>
                      <span className="text-primary-600">
                        ₹{(subtotal + giftPackagingCost + standardDeliveryCost).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Checkout</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={showCheckout} 
        onClose={() => setShowCheckout(false)} 
      />
    </>
  );
};