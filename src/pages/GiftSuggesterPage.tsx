import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Search, 
  Filter, 
  Heart, 
  Star, 
  Sparkles, 
  ArrowRight,
  Users,
  Calendar,
  DollarSign,
  Target,
  Palette,
  BookOpen
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../contexts/AppContext';
import { useCart } from '../contexts/CartContext';
import { 
  giftSuggestionService, 
  GiftSuggestionCriteria, 
  GiftSuggestion 
} from '../services/giftSuggestionService';
import toast from 'react-hot-toast';

export const GiftSuggesterPage: React.FC = () => {
  const { products } = useApp();
  const { addToCart } = useCart();
  const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const [criteria, setCriteria] = useState<GiftSuggestionCriteria>({
    occasion: '',
    relation: '',
    ageGroup: '',
    budget: 1000,
    interests: [],
    personality: ''
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const occasions = giftSuggestionService.getPopularOccasions();
  const relations = giftSuggestionService.getRelationTypes();
  const ageGroups = giftSuggestionService.getAgeGroups();
  const personalities = giftSuggestionService.getPersonalityTypes();
  const interests = giftSuggestionService.getInterests();

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedCriteria = {
        ...criteria,
        interests: selectedInterests
      };

      const results = await giftSuggestionService.getGiftSuggestions(updatedCriteria, products);
      setSuggestions(results);
      setShowForm(false);
      
      if (results.length === 0) {
        toast.error('No perfect matches found. Try adjusting your criteria.');
    } else {
        toast.success(`Found ${results.length} perfect gift suggestions!`);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast.error('Failed to get suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCriteria({
      occasion: '',
      relation: '',
      ageGroup: '',
      budget: 1000,
      interests: [],
      personality: ''
    });
    setSelectedInterests([]);
    setSuggestions([]);
    setShowForm(true);
  };

  const handleAddToCart = (suggestion: GiftSuggestion) => {
    addToCart(suggestion.product);
    toast.success(`${suggestion.product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center space-x-2 bg-blush-100 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-blush-600" />
            <span className="text-blush-700 font-semibold text-sm">Intelligent Gift Discovery</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-charcoal-800 mb-4 font-serif">
            Find the Perfect{' '}
            <span className="text-blush-600">
              Gift
            </span>
          </h1>
          <p className="text-base md:text-xl text-charcoal-600 max-w-2xl mx-auto leading-relaxed font-light">
            Our sophisticated AI helps you discover the perfect handcrafted gift based on occasion, 
            relationship, and personal preferences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-16">
          {/* Form Section */}
                <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
                >
            <div className="bg-cream-50 rounded-2xl p-4 sm:p-8 shadow-subtle border border-cream-200">
              <div className="flex items-center space-x-4 mb-10">
                <div className="bg-blush-600 p-3 rounded-xl">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-charcoal-800 font-serif">Gift Preferences</h2>
                    </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Occasion */}
                <div>
                  <label className="block text-base font-semibold text-charcoal-700 mb-3">
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Occasion
                  </label>
                  <select
                    value={criteria.occasion}
                    onChange={(e) => setCriteria(prev => ({ ...prev, occasion: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:border-blush-400 focus:ring-2 focus:ring-blush-200 transition-all bg-cream-50 text-sm"
                    required
                  >
                    <option value="">Select an occasion</option>
                    {occasions.map(occasion => (
                      <option key={occasion} value={occasion}>
                        {occasion.charAt(0).toUpperCase() + occasion.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                    </div>

                {/* Relation */}
                <div>
                  <label className="block text-base font-semibold text-charcoal-700 mb-3">
                    <Users className="w-5 h-5 inline mr-2" />
                    Relationship
                  </label>
                  <select
                    value={criteria.relation}
                    onChange={(e) => setCriteria(prev => ({ ...prev, relation: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:border-blush-400 focus:ring-2 focus:ring-blush-200 transition-all bg-cream-50 text-sm"
                    required
                  >
                    <option value="">Select relationship</option>
                    {relations.map(relation => (
                      <option key={relation} value={relation}>
                        {relation.charAt(0).toUpperCase() + relation.slice(1)}
                      </option>
                    ))}
                  </select>
                  </div>

                {/* Age Group */}
                <div>
                  <label className="block text-base font-semibold text-charcoal-700 mb-3">
                    <Target className="w-5 h-5 inline mr-2" />
                    Age Group
                  </label>
                  <select
                    value={criteria.ageGroup}
                    onChange={(e) => setCriteria(prev => ({ ...prev, ageGroup: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:border-blush-400 focus:ring-2 focus:ring-blush-200 transition-all bg-cream-50 text-sm"
                    required
                  >
                    <option value="">Select age group</option>
                    {ageGroups.map(age => (
                      <option key={age} value={age}>
                        {age.charAt(0).toUpperCase() + age.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                  </div>

                {/* Budget */}
                <div>
                  <label className="block text-base font-semibold text-charcoal-700 mb-3">
                    <DollarSign className="w-5 h-5 inline mr-2" />
                    Budget (₹)
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={criteria.budget}
                    onChange={(e) => setCriteria(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                    className="w-full h-3 bg-cream-300 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-base text-charcoal-600 mt-2">
                    <span>₹100</span>
                    <span className="font-semibold text-blush-600">₹{criteria.budget.toLocaleString()}</span>
                    <span>₹10,000</span>
                  </div>
                </div>

                {/* Personality */}
                <div>
                  <label className="block text-base font-semibold text-charcoal-700 mb-3">
                    <Palette className="w-5 h-5 inline mr-2" />
                    Personality Type
                  </label>
                  <select
                    value={criteria.personality}
                    onChange={(e) => setCriteria(prev => ({ ...prev, personality: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:border-blush-400 focus:ring-2 focus:ring-blush-200 transition-all bg-cream-50 text-sm"
                  >
                    <option value="">Select personality (optional)</option>
                    {personalities.map(personality => (
                      <option key={personality} value={personality}>
                        {personality.charAt(0).toUpperCase() + personality.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
          </div>

                {/* Interests */}
                <div>
                  <label className="block text-base font-semibold text-charcoal-700 mb-3">
                    <BookOpen className="w-5 h-5 inline mr-2" />
                    Interests (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {interests.map(interest => (
                  <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-4 py-3 rounded-lg text-base font-medium transition-all ${
                          selectedInterests.includes(interest)
                            ? 'bg-blush-600 text-white border border-blush-600'
                            : 'bg-cream-100 text-charcoal-700 border border-cream-300 hover:bg-cream-200'
                        }`}
                  >
                        {interest.charAt(0).toUpperCase() + interest.slice(1)}
                  </button>
                ))}
              </div>
            </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blush-600 hover:bg-blush-700 text-white py-5 rounded-xl font-semibold transition-all shadow-soft hover:shadow-warm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 text-lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Discovering Perfect Gifts...</span>
                    </>
                  ) : (
                    <>
                      <Gift className="w-6 h-6" />
                      <span>Discover Perfect Gifts</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Results Section */}
              <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {showForm ? (
              <div className="bg-cream-50 rounded-2xl p-16 shadow-subtle border border-cream-200 text-center">
                <div className="bg-blush-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-10">
                  <Gift className="w-16 h-16 text-blush-600" />
                </div>
                <h3 className="text-4xl font-bold text-charcoal-800 mb-8 font-serif">
                  Ready to Discover the Perfect Gift?
                </h3>
                <p className="text-xl text-charcoal-600 mb-10 text-lg leading-relaxed">
                  Fill out the form to get personalized gift suggestions based on your preferences.
                </p>
                <div className="flex items-center justify-center space-x-8 text-base text-charcoal-500">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-gold-400" />
                    <span>AI-Powered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-blush-400" />
                    <span>Personalized</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-sage-400" />
                    <span>Handcrafted</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Results Header */}
                <div className="bg-cream-50 rounded-2xl p-10 shadow-subtle border border-cream-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-4xl font-bold text-charcoal-800 font-serif">
                      Perfect Gift Suggestions
                    </h3>
                    <button
                      onClick={handleReset}
                      className="text-charcoal-600 hover:text-charcoal-800 font-semibold text-lg"
                    >
                      Start Over
                    </button>
                  </div>
                  <p className="text-xl text-charcoal-600">
                    Found {suggestions.length} perfect matches for your criteria
                  </p>
                </div>

                {/* Suggestions Grid */}
                {suggestions.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion.product.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-cream-50 rounded-2xl p-8 shadow-subtle border border-cream-200"
                      >
                        <div className="flex items-start space-x-6">
                          <img
                            src={suggestion.product.image}
                            alt={suggestion.product.name}
                            className="w-24 h-24 rounded-2xl object-cover shadow-soft"
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-charcoal-800 mb-3 font-serif text-lg">
                              {suggestion.product.name}
                            </h4>
                            <p className="text-base text-charcoal-600 mb-6 line-clamp-2 leading-relaxed">
                              {suggestion.reason}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <Star className="w-5 h-5 text-gold-400 fill-current" />
                                  <span className="text-base font-semibold text-charcoal-700">
                                    {suggestion.matchScore}%
                                  </span>
                                </div>
                                <span className="text-xl font-bold text-blush-600">
                                  ₹{suggestion.product.price.toLocaleString()}
                                </span>
                              </div>
                              <button
                                onClick={() => handleAddToCart(suggestion)}
                                className="bg-blush-600 hover:bg-blush-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-soft hover:shadow-warm flex items-center space-x-3 text-base"
                              >
                                <span>Add to Cart</span>
                                <ArrowRight className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-cream-50 rounded-2xl p-16 shadow-subtle border border-cream-200 text-center">
                    <div className="bg-blush-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-10">
                      <Gift className="w-16 h-16 text-blush-600" />
                    </div>
                    <h3 className="text-4xl font-bold text-charcoal-800 mb-8 font-serif">
                      No Perfect Matches Found
                    </h3>
                    <p className="text-xl text-charcoal-600 mb-10 leading-relaxed">
                      Try adjusting your criteria or increasing your budget to find more options.
                    </p>
                    <button
                      onClick={handleReset}
                      className="bg-blush-600 hover:bg-blush-700 text-white px-10 py-5 rounded-xl font-semibold transition-all shadow-soft hover:shadow-warm text-lg"
                    >
                      Adjust Criteria
                    </button>
                  </div>
                )}
              </div>
            )}
              </motion.div>
        </div>
      </div>
    </div>
  );
};