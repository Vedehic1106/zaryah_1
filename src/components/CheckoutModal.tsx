import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  X, 
  CreditCard, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Package,
  Gift,
  CheckCircle,
  Loader,
  Truck,
  Clock,
  Heart
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { orderService } from '../services/orderService';
import toast from 'react-hot-toast';
import { FacebookShareButton, WhatsappShareButton, TwitterShareButton, FacebookIcon, WhatsappIcon, TwitterIcon } from 'react-share';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe('pk_test_51234567890abcdef...');

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CheckoutFormProps {
  onClose: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { items, getTotalPrice, getGiftPackagingCost, getDeliveryCost, clearCart } = useCart();
  const { user } = useAuth();
  const { userCity } = useLocation();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryType, setDeliveryType] = useState<'standard' | 'instant'>('standard');
  const [deliverToFriend, setDeliverToFriend] = useState(false);
  
  const [shippingDetails, setShippingDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: user?.city || userCity || '',
    pincode: ''
  });

  const [friendDetails, setFriendDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  const subtotal = getTotalPrice();
  const giftPackagingCost = getGiftPackagingCost();
  const deliveryCost = getDeliveryCost(deliveryType);
  const total = subtotal + giftPackagingCost + deliveryCost;

  const hasGiftItems = items.some(item => item.giftPackaging);
  const canUseInstantDelivery = userCity && ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'].includes(userCity);

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShippingDetails(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFriendDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFriendDetails(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !user) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: shippingDetails.name,
          email: shippingDetails.email,
          phone: shippingDetails.phone,
          address: {
            line1: shippingDetails.address,
            city: shippingDetails.city,
            postal_code: shippingDetails.pincode,
            country: 'IN'
          }
        }
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message || 'Payment method creation failed');
        setIsProcessing(false);
        return;
      }

      // Create order in database
      const orderData = await orderService.createOrder({
        userId: user.id,
        items,
        totalAmount: total,
        deliveryType,
        deliveryAddress: shippingDetails,
        friendDelivery: deliverToFriend ? friendDetails : undefined,
        paymentIntentId: paymentMethod.id
      });

      if (!orderData) {
        setError('Failed to create order. Please try again.');
        setIsProcessing(false);
        return;
      }

      // If instant delivery, book with Dunzo
      if (deliveryType === 'instant') {
        const dunzoResult = await orderService.bookDunzoDelivery(orderData);
        if (!dunzoResult.success) {
          toast.error('Instant delivery booking failed, but your order is confirmed');
        }
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update order status to confirmed
      await orderService.updateOrderStatus(orderData.id, 'confirmed');

      setPaymentSuccess(true);
      clearCart();
      
      toast.success('Order placed successfully!');
      
      // Close modal after showing success
      setTimeout(() => {
        onClose();
        setPaymentSuccess(false);
      }, 3000);

    } catch (err) {
      setError('Payment failed. Please try again.');
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    const shareUrl = window.location.origin + '/orders';
    const shareMessage = `I just bought a beautiful handmade gift from GiftFlare! 🎁\nCheck out amazing gifts at GiftFlare.`;
    return (
      <div className="text-center py-16">
        <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-yellow-500" />
        </div>
        <h3 className="text-3xl font-bold text-yellow-800 mb-4">Thank You for Your Order!</h3>
        <p className="text-lg text-yellow-700 mb-4 font-semibold">We truly appreciate your support for handmade gifts and artisans.</p>
        <p className="text-yellow-700 mb-6">
          {deliveryType === 'instant' 
            ? 'Your order will be delivered within 2-4 hours via Dunzo!'
            : 'Your order will be delivered in 3-7 business days.'
          }
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-base text-yellow-800">
            Order Total: <span className="font-bold">₹{total.toLocaleString()}</span>
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            You'll receive email and SMS updates about your order.<br/>
            Thank you for choosing GiftFlare!
          </p>
        </div>
        <div className="mt-8">
          <p className="text-base font-semibold text-yellow-800 mb-3">Share your excitement:</p>
          <div className="flex justify-center gap-4">
            <WhatsappShareButton url={shareUrl} title={shareMessage}>
              <WhatsappIcon size={40} round />
            </WhatsappShareButton>
            <FacebookShareButton url={shareUrl} quote={shareMessage}>
              <FacebookIcon size={40} round />
            </FacebookShareButton>
            <TwitterShareButton url={shareUrl} title={shareMessage}>
              <TwitterIcon size={40} round />
            </TwitterShareButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-900 mb-3">Order Summary</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-amber-800 flex items-center">
                {item.product.name} × {item.quantity}
                {item.giftPackaging && <Package className="w-3 h-3 ml-1 text-amber-600" />}
              </span>
              <span className="font-medium text-amber-900">
                ₹{(item.product.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
          
          {giftPackagingCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-amber-700">Gift packaging</span>
              <span className="text-amber-900">₹{giftPackagingCost}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-amber-700">Delivery</span>
            <span className="text-amber-900">
              {deliveryCost === 0 ? 'FREE' : `₹${deliveryCost}`}
            </span>
          </div>
          
          <div className="border-t border-amber-300 pt-2 flex justify-between font-bold">
            <span className="text-amber-900">Total</span>
            <span className="text-amber-600">₹{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Delivery Options */}
      <div>
        <h3 className="font-semibold text-amber-900 mb-4 flex items-center">
          <Truck className="w-5 h-5 mr-2" />
          Delivery Options
        </h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer p-3 border border-amber-200 rounded-lg hover:bg-amber-50">
            <input
              type="radio"
              name="deliveryType"
              value="standard"
              checked={deliveryType === 'standard'}
              onChange={(e) => setDeliveryType(e.target.value as 'standard')}
              className="text-amber-600 focus:ring-amber-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-amber-900">Standard Delivery</span>
              </div>
              <p className="text-sm text-amber-700">3-7 business days • {deliveryCost === 0 ? 'FREE' : `₹${getDeliveryCost('standard')}`}</p>
            </div>
          </label>
          
          {canUseInstantDelivery && (
            <label className="flex items-center space-x-3 cursor-pointer p-3 border border-amber-200 rounded-lg hover:bg-amber-50">
              <input
                type="radio"
                name="deliveryType"
                value="instant"
                checked={deliveryType === 'instant'}
                onChange={(e) => setDeliveryType(e.target.value as 'instant')}
                className="text-amber-600 focus:ring-amber-500"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-amber-900">Instant Delivery (Dunzo)</span>
                </div>
                <p className="text-sm text-amber-700">2-4 hours • ₹{getDeliveryCost('instant')}</p>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Gift Delivery Option */}
      {hasGiftItems && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={deliverToFriend}
              onChange={(e) => setDeliverToFriend(e.target.checked)}
              className="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
            />
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-orange-900">Deliver gifts to a friend</span>
            </div>
          </label>
          <p className="text-sm text-orange-700 mt-2 ml-7">
            Send your gift items directly to your friend's address
          </p>
        </div>
      )}

      {/* Shipping Details */}
      <div>
        <h3 className="font-semibold text-amber-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          {deliverToFriend ? 'Your Details' : 'Shipping Details'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={shippingDetails.name}
              onChange={handleShippingChange}
              className="w-full border border-amber-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={shippingDetails.email}
              onChange={handleShippingChange}
              className="w-full border border-amber-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              required
              value={shippingDetails.phone}
              onChange={handleShippingChange}
              className="w-full border border-amber-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">City</label>
            <input
              type="text"
              name="city"
              required
              value={shippingDetails.city}
              onChange={handleShippingChange}
              className="w-full border border-amber-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          {!deliverToFriend && (
            <>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-amber-800 mb-1">Address</label>
                <textarea
                  name="address"
                  required
                  value={shippingDetails.address}
                  onChange={handleShippingChange}
                  rows={3}
                  className="w-full border border-amber-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={shippingDetails.pincode}
                  onChange={handleShippingChange}
                  className="w-full border border-amber-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Friend Delivery Details */}
      {deliverToFriend && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-900 mb-3 flex items-center">
            <Gift className="w-5 h-5 mr-2" />
            Friend's Delivery Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-orange-800 mb-1">Friend's Name</label>
              <input
                type="text"
                name="name"
                required
                value={friendDetails.name}
                onChange={handleFriendDetailsChange}
                className="w-full border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-800 mb-1">Friend's Phone</label>
              <input
                type="tel"
                name="phone"
                required
                value={friendDetails.phone}
                onChange={handleFriendDetailsChange}
                className="w-full border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-orange-800 mb-1">Friend's Address</label>
              <textarea
                name="address"
                required
                value={friendDetails.address}
                onChange={handleFriendDetailsChange}
                rows={3}
                className="w-full border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-800 mb-1">City</label>
              <input
                type="text"
                name="city"
                required
                value={friendDetails.city}
                onChange={handleFriendDetailsChange}
                className="w-full border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-800 mb-1">Pincode</label>
              <input
                type="text"
                name="pincode"
                required
                value={friendDetails.pincode}
                onChange={handleFriendDetailsChange}
                className="w-full border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Details */}
      <div>
        <h3 className="font-semibold text-amber-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Payment Details
        </h3>
        <div className="border border-amber-300 rounded-lg p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#374151',
                  '::placeholder': {
                    color: '#fb7185',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Pay ₹{total.toLocaleString()}</span>
          </>
        )}
      </button>
    </form>
  );
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-amber-200">
              <h2 className="text-2xl font-bold text-amber-900">Checkout</h2>
              <button
                onClick={onClose}
                className="text-amber-600 hover:text-amber-800 p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <Elements stripe={stripePromise}>
                <CheckoutForm onClose={onClose} />
              </Elements>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};