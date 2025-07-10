import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Star, 
  Heart, 
  Share2, 
  ShoppingBag, 
  Gift, 
  Truck, 
  Shield, 
  MessageSquare,
  User,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Send,
  ThumbsUp,
  Flag,
  Award,
  Verified
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { InstantDeliveryBadge } from '../components/InstantDeliveryBadge';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: { name: string };
}

interface ProductDetails {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  video_url?: string;
  category: string;
  section?: string;
  weight?: number;
  customisable?: boolean;
  customQuestions?: string[];
  instant_delivery_eligible: boolean;
  seller_id: string;
  sellerName?: string;
  sellerCity?: string;
  sellerVerified?: boolean;
  created_at: string;
}

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [customAnswers, setCustomAnswers] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [giftPackaging, setGiftPackaging] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchSimilarProducts();
    }
  }, [product]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles!products_seller_id_fkey (
            name,
            city,
            is_verified
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const productData: ProductDetails = {
        id: data.id,
        name: data.name,
        price: data.price > 1000 ? data.price / 100 : data.price, // Convert from paise if needed
        image: data.image_url || 'https://images.pexels.com/photos/1030303/pexels-photo-1030303.jpeg?auto=compress&cs=tinysrgb&w=800',
        description: data.description,
        video_url: data.video_url,
        category: data.category,
        section: data.section,
        weight: data.weight,
        customisable: data.customisable,
        customQuestions: data.custom_questions,
        instant_delivery_eligible: data.instant_delivery_eligible,
        seller_id: data.seller_id,
        sellerName: data.profiles?.name || 'Unknown Seller',
        sellerCity: data.profiles?.city,
        sellerVerified: data.profiles?.is_verified,
        created_at: data.created_at
      };

      setProduct(productData);
      setCustomAnswers(productData.customQuestions ? Array(productData.customQuestions.length).fill('') : []);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, user:profiles!reviews_user_id_fkey (name)')
        .eq('product_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchSimilarProducts = async () => {
    if (!product) return;
    
    try {
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          profiles!products_seller_id_fkey (name)
        `)
        .neq('id', product.id)
        .or(`category.eq.${product.category},section.eq.${product.section}`)
        .eq('status', 'approved')
        .limit(4);

      setSimilarProducts(data || []);
    } catch (error) {
      console.error('Error fetching similar products:', error);
    }
  };

  const handleCustomAnswerChange = (idx: number, value: string) => {
    setCustomAnswers(prev => prev.map((a, i) => (i === idx ? value : a)));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    setReviewSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: id,
        user_id: user.id,
        rating: reviewRating,
        comment: reviewText
      });

      if (error) throw error;

      setReviewText('');
      setReviewRating(5);
      setShowReviewForm(false);
      fetchReviews();
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product, {
      quantity,
      giftPackaging,
      giftNote: giftPackaging ? giftNote : undefined
    });
    
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });
    return distribution.reverse();
  };

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blush-600"></div>
      </div>
    );
  }

  const averageRating = getAverageRating();
  const ratingDistribution = getRatingDistribution();

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 bg-blush-100 hover:bg-blush-200 text-blush-700 hover:text-blush-900 mb-8 group px-4 py-2 rounded-lg shadow"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Products</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square bg-cream-100 rounded-2xl overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 space-y-2">
                <InstantDeliveryBadge product={product} />
                {product.customisable && (
                  <div className="bg-mint-100 text-mint-800 text-xs px-3 py-1.5 rounded-full font-semibold">
                    Customisable
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="absolute top-4 right-4 space-y-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-3 rounded-full shadow-lg border transition-colors ${isLiked ? 'bg-blush-600 hover:bg-blush-700' : 'bg-blush-100 hover:bg-blush-200 border-blush-200'}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'text-white fill-current' : 'text-blush-600'}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="bg-blush-100 hover:bg-blush-200 p-3 rounded-full shadow-lg border border-blush-200 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-blush-600" />
                </button>
              </div>

              {/* Video Play Button */}
              {product.video_url && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute bottom-4 right-4 bg-blush-600 text-white p-3 rounded-full hover:bg-blush-700 transition-colors shadow-lg"
                >
                  <Play className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Additional Images Placeholder */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((_, index) => (
                <div
                  key={index}
                  className="aspect-square bg-cream-200 rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                >
                  <img
                    src={product.image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-charcoal-800 mb-2 font-serif">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-blush-600">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.weight && (
                  <span className="text-charcoal-600">
                    {product.weight}g
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(averageRating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-charcoal-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-charcoal-700 font-medium">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>

            {/* Seller Info */}
            <div className="bg-cream-50 rounded-xl p-4 border border-cream-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blush-600 p-2 rounded-full">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-charcoal-800">{product.sellerName}</span>
                    {product.sellerVerified && (
                      <Verified className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-charcoal-600">
                    <MapPin className="w-3 h-3" />
                    <span>{product.sellerCity}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-charcoal-800 mb-3">Description</h3>
              <p className="text-charcoal-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cream-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="w-4 h-4 text-charcoal-600" />
                  <span className="font-medium text-charcoal-800">Category</span>
                </div>
                <span className="text-charcoal-600">{product.category}</span>
              </div>
              
              {product.section && (
                <div className="bg-cream-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="w-4 h-4 text-charcoal-600" />
                    <span className="font-medium text-charcoal-800">Section</span>
                  </div>
                  <span className="text-charcoal-600">{product.section}</span>
                </div>
              )}
            </div>

            {/* Delivery Info */}
            <div className="bg-mint-50 rounded-xl p-4 border border-mint-200">
              <div className="flex items-center space-x-2 mb-2">
                <Truck className="w-5 h-5 text-mint-600" />
                <span className="font-semibold text-mint-800">Delivery Information</span>
              </div>
              <p className="text-mint-700">
                {product.instant_delivery_eligible 
                  ? 'Available for instant delivery (2-4 hours)' 
                  : 'Standard delivery (3-7 business days)'
                }
              </p>
            </div>

            {/* Customization */}
            {product.customisable && product.customQuestions && (
              <div className="bg-lavender-50 rounded-xl p-4 border border-lavender-200">
                <h3 className="font-semibold text-lavender-900 mb-3">Customization Options</h3>
                <div className="space-y-3">
                  {product.customQuestions.map((question, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-lavender-800 mb-1">
                        {question}
                      </label>
                      <input
                        type="text"
                        value={customAnswers[idx]}
                        onChange={(e) => handleCustomAnswerChange(idx, e.target.value)}
                        className="w-full border border-lavender-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                        placeholder="Your answer..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gift Options */}
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <label className="flex items-center space-x-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={giftPackaging}
                  onChange={(e) => setGiftPackaging(e.target.checked)}
                  className="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                />
                <div className="flex items-center space-x-2">
                  <Gift className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-900">Gift packaging (+₹30)</span>
                </div>
              </label>
              
              {giftPackaging && (
                <div>
                  <label className="block text-sm font-medium text-orange-800 mb-2">
                    Gift note (optional)
                  </label>
                  <textarea
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    placeholder="Write a personal message..."
                    className="w-full border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-charcoal-800">Quantity:</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-cream-200 rounded-full flex items-center justify-center hover:bg-cream-300 transition-colors"
                  >
                    -
                  </button>
                  <span className="font-semibold text-charcoal-900 w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-cream-200 rounded-full flex items-center justify-center hover:bg-cream-300 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#A67C5A] hover:bg-[#8a684a] text-white py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg border-2 border-[#8a684a] hover:border-black"
                >
                  <ShoppingBag className="w-5 h-5 text-white" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-[#A67C5A] hover:bg-[#8a684a] text-white py-4 px-6 rounded-xl font-semibold transition-all shadow-lg border-2 border-[#8a684a] hover:border-black"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center space-x-6 py-4 border-t border-cream-200">
              <div className="flex items-center space-x-2 text-sm text-charcoal-600">
                <Shield className="w-4 h-4" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-charcoal-600">
                <Truck className="w-4 h-4" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-charcoal-600">
                <CheckCircle className="w-4 h-4" />
                <span>Quality Assured</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-charcoal-800">Customer Reviews</h2>
              {user && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-blush-600 hover:bg-blush-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Write Review
                </button>
              )}
            </div>

            {/* Rating Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-charcoal-800 mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.floor(averageRating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-charcoal-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-charcoal-600">Based on {reviews.length} reviews</p>
              </div>

              <div className="space-y-2">
                {ratingDistribution.map((count, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm text-charcoal-600 w-8">
                      {5 - index}★
                    </span>
                    <div className="flex-1 bg-cream-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%'
                        }}
                      />
                    </div>
                    <span className="text-sm text-charcoal-600 w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Form */}
            <AnimatePresence>
              {showReviewForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleReviewSubmit}
                  className="bg-cream-50 rounded-xl p-6 mb-8 border border-cream-200"
                >
                  <h3 className="font-semibold text-charcoal-800 mb-4">Write a Review</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Your Rating
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setReviewRating(rating)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              rating <= reviewRating
                                ? 'text-yellow-400 fill-current'
                                : 'text-charcoal-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Your Review
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full border border-cream-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blush-500 focus:border-transparent"
                      rows={4}
                      placeholder="Share your experience with this product..."
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 text-charcoal-600 hover:text-charcoal-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="bg-blush-600 hover:bg-blush-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{reviewSubmitting ? 'Submitting...' : 'Submit Review'}</span>
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                  <p className="text-charcoal-600">No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-cream-200 pb-6 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blush-100 p-2 rounded-full">
                        <User className="w-5 h-5 text-blush-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-semibold text-charcoal-800">
                            {review.user?.name || 'Anonymous'}
                          </span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-charcoal-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-charcoal-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-charcoal-700 leading-relaxed">{review.comment}</p>
                        
                        <div className="flex items-center space-x-4 mt-3">
                          <button className="flex items-center space-x-1 text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Helpful</span>
                          </button>
                          <button className="flex items-center space-x-1 text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors">
                            <Flag className="w-4 h-4" />
                            <span>Report</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-charcoal-800 mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <div
                  key={similarProduct.id}
                  onClick={() => navigate(`/product/${similarProduct.id}`)}
                  className="bg-white rounded-xl shadow-sm border border-cream-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  <img
                    src={similarProduct.image_url || 'https://images.pexels.com/photos/1030303/pexels-photo-1030303.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={similarProduct.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-charcoal-800 mb-2 line-clamp-2">
                      {similarProduct.name}
                    </h3>
                    <p className="text-blush-600 font-bold mb-2">
                      ₹{(similarProduct.price > 1000 ? similarProduct.price / 100 : similarProduct.price).toLocaleString()}
                    </p>
                    <p className="text-sm text-charcoal-600">
                      by {similarProduct.profiles?.name || 'Unknown Seller'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Video Modal */}
        <AnimatePresence>
          {showVideo && product.video_url && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
              onClick={() => setShowVideo(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative max-w-4xl w-full aspect-video"
                onClick={(e) => e.stopPropagation()}
              >
                <video
                  src={product.video_url}
                  controls
                  autoPlay
                  className="w-full h-full rounded-lg"
                />
                <button
                  onClick={() => setShowVideo(false)}
                  className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                >
                  {/* Assuming X is a placeholder for a close icon, replace with actual icon if available */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x w-8 h-8"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};