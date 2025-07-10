import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Truck, X, Grid, List, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../contexts/AppContext';

export const ShopPage: React.FC = () => {
  const { products } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [showInstantDelivery, setShowInstantDelivery] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');

  const approvedProducts = products.filter(p => p.status === 'approved');
  
  const cities = ['all', ...Array.from(new Set(approvedProducts.map(p => p.city)))];
  const categories = ['all', ...Array.from(new Set(approvedProducts.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
    let filtered = approvedProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCity = selectedCity === 'all' || product.city === selectedCity;
      const matchesDelivery = !showInstantDelivery || product.instantDeliveryEligible;
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesCity && matchesDelivery && matchesCategory;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [approvedProducts, searchTerm, selectedCity, showInstantDelivery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-elegant pt-8">
      <div className="w-full px-2 md:px-4 xl:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
            Discover Meaningful{' '}
            <span className="text-primary-600">
              Treasures
            </span>
          </h1>
          <p className="text-xl text-neutral-700 max-w-2xl mx-auto">
            Explore unique creations from passionate artisans across India. Each piece carries a story waiting to become part of yours.
          </p>
        </motion.div>

        {/* Enhanced Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-50 rounded-3xl shadow-lg border border-neutral-200 p-6 md:p-8 mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="w-6 h-6 text-primary-500 absolute left-4 top-4" />
            <input
              type="text"
              placeholder="Search for treasures, artisans, or stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-200 focus:border-transparent transition-all text-lg"
            />
          </div>

          {/* Filter Toggle and View Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-xl hover:bg-primary-200 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 text-primary-600" />
                <span>Filters</span>
              </button>
              
              <div className="text-sm text-neutral-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
                {filteredProducts.length} of {approvedProducts.length} products
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-neutral-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-200 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-primary-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-neutral-50 shadow-sm' : 'text-primary-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-neutral-50 shadow-sm' : 'text-primary-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-primary-200 pt-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* City Filter */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-3">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full border border-primary-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-200 focus:border-transparent"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>
                        {city === 'all' ? 'All Cities' : city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-3">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-primary-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-200 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Instant Delivery Filter */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-3">
                    <Truck className="w-4 h-4 inline mr-2" />
                    Delivery
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer bg-primary-50 p-3 rounded-xl hover:bg-primary-100 transition-colors border border-primary-200">
                    <input
                      type="checkbox"
                      checked={showInstantDelivery}
                      onChange={(e) => setShowInstantDelivery(e.target.checked)}
                      className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>Express Delivery</span>
                  </label>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCity('all');
                      setSelectedCategory('all');
                      setShowInstantDelivery(false);
                    }}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-800 transition-colors bg-primary-50 px-4 py-3 rounded-xl hover:bg-primary-100 w-full justify-center border border-primary-200"
                  >
                    <X className="w-4 h-4" />
                    <span className="font-medium">Clear All</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Product Grid */}
        <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-16`}>
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};