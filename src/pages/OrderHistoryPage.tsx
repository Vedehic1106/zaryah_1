import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  RotateCcw,
  Eye,
  MapPin,
  Calendar,
  CreditCard,
  Gift,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { orderService, OrderData } from '../services/orderService';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export const OrderHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
      // Real-time subscription for order updates
      const channel = supabase
        .channel('orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            ...(user.role === 'admin' ? {} : { filter: `user_id=eq.${user.id}` }),
          },
          (payload) => {
            fetchOrders();
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let fetchedOrders: OrderData[] = [];
      if (user.role === 'admin') {
        fetchedOrders = await orderService.getAllOrders();
      } else {
        fetchedOrders = await orderService.getOrdersByUser(user.id);
      }
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load order history');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'confirmed':
        return 'bg-accent-100 text-accent-800 border-accent-200';
      case 'shipped':
        return 'bg-support-100 text-support-800 border-support-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-neutral-50 text-charcoal-800 border-neutral-200';
    }
  };

  const handleReorder = (order: OrderData) => {
    order.items.forEach((item: any) => {
      addToCart(item.product, {
        quantity: item.quantity,
        giftPackaging: item.giftPackaging
      });
    });
    toast.success('Items added to cart!');
  };

  const handleViewDetails = (order: OrderData) => {
    setSelectedOrder(order);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-2">Order History</h1>
          <p className="text-amber-700">Track your orders and reorder your favorites</p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-amber-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-amber-900 mb-4">No orders yet</h3>
            <p className="text-amber-700 mb-8 max-w-md mx-auto">
              Start shopping for beautiful handmade items and your orders will appear here.
            </p>
            <button
              onClick={() => window.location.href = '/shop'}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg"
            >
              Start Shopping
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-amber-100 bg-amber-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                      <div className="bg-amber-600 p-3 rounded-xl">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-amber-900">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-amber-700">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CreditCard className="w-4 h-4" />
                            <span>₹{(order.total_amount / 100).toLocaleString()}</span>
                          </div>
                        </div>
                        {/* Admin: Show buyer info */}
                        {user.role === 'admin' && order.buyer && (
                          <div className="mt-1 text-xs text-amber-700">
                            <span className="font-semibold">Buyer:</span> {order.buyer.name} ({order.buyer.email})
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center space-x-2 px-3 py-2 rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-medium capitalize">{order.status}</span>
                      </div>
                      
                      {order.delivery_type === 'instant' && (
                        <div className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium border border-green-200">
                          <Truck className="w-4 h-4 inline mr-1" />
                          Instant
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {order.items.slice(0, 3).map((item: any, itemIndex: number) => (
                      <div key={itemIndex} className="flex items-center space-x-3 bg-amber-50 rounded-lg p-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-amber-900 text-sm truncate">
                            {item.product.name}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-amber-600">
                            <span>Qty: {item.quantity}</span>
                            {item.giftPackaging && (
                              <div className="flex items-center space-x-1">
                                <Gift className="w-3 h-3" />
                                <span>Gift</span>
                              </div>
                            )}
                          </div>
                          {/* Admin: Show seller info */}
                          {user.role === 'admin' && item.seller && (
                            <div className="mt-1 text-xs text-amber-700">
                              <span className="font-semibold">Seller:</span> {item.seller.name} ({item.seller.email})
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {order.items.length > 3 && (
                      <div className="flex items-center justify-center bg-amber-100 rounded-lg p-3 text-amber-700 font-medium">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Delivery Address</h4>
                        <p className="text-sm text-gray-700">
                          {order.delivery_address.name}<br />
                          {order.delivery_address.address}<br />
                          {order.delivery_address.city}, {order.delivery_address.pincode}
                        </p>
                        {order.tracking_number && (
                          <p className="text-sm text-blue-600 mt-2">
                            <strong>Tracking:</strong> {order.tracking_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="flex-1 bg-amber-100 text-amber-700 py-3 px-4 rounded-xl font-semibold hover:bg-amber-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleReorder(order)}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reorder</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center p-6 border-b border-amber-200">
                <h2 className="text-2xl font-bold text-amber-900">
                  Order Details #{selectedOrder.id.slice(-8).toUpperCase()}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-amber-600 hover:text-amber-800 p-2"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                {/* Order Status */}
                <div className="bg-amber-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(selectedOrder.status)}
                      <span className="font-semibold text-amber-900 capitalize">
                        {selectedOrder.status}
                      </span>
                    </div>
                    <span className="text-sm text-amber-700">
                      {formatDistanceToNow(new Date(selectedOrder.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h3 className="font-semibold text-amber-900 mb-4">Items Ordered</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-amber-50 rounded-lg">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-amber-900">{item.product.name}</h4>
                          <p className="text-sm text-amber-700">by {item.product.sellerName}</p>
                          <div className="flex items-center space-x-4 text-sm text-amber-600 mt-1">
                            <span>Qty: {item.quantity}</span>
                            <span>₹{item.product.price.toLocaleString()} each</span>
                            {item.giftPackaging && (
                              <div className="flex items-center space-x-1 text-orange-600">
                                <Gift className="w-3 h-3" />
                                <span>Gift wrapped</span>
                              </div>
                            )}
                          </div>
                          {item.giftNote && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              Gift note: "{item.giftNote}"
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-amber-900">
                            ₹{(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{((selectedOrder.total_amount - 3000) / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>₹30</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>₹{(selectedOrder.total_amount / 100).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Delivery Information</h3>
                  <div className="text-sm text-blue-800">
                    <p><strong>Type:</strong> {selectedOrder.delivery_type === 'instant' ? 'Instant Delivery' : 'Standard Delivery'}</p>
                    <p><strong>Address:</strong> {selectedOrder.delivery_address.address}</p>
                    <p><strong>City:</strong> {selectedOrder.delivery_address.city}</p>
                    {selectedOrder.tracking_number && (
                      <p><strong>Tracking:</strong> {selectedOrder.tracking_number}</p>
                    )}
                    {selectedOrder.estimated_delivery && (
                      <p><strong>Estimated Delivery:</strong> {new Date(selectedOrder.estimated_delivery).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};