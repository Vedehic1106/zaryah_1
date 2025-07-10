import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Truck, Users, Award, ArrowRight, Package, Gift, Sparkles } from 'lucide-react';
import { VideoCarousel } from '../components/VideoCarousel';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../contexts/AppContext';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';

export const HomePage: React.FC = () => {
  const { products } = useApp();
  const featuredProducts = products.filter(p => p.status === 'approved').slice(0, 6);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  // Get the top offset of the hero section
  const heroHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  // Animate opacity and scale as user scrolls past hero
  const fadeOut = useTransform(scrollY, [0, heroHeight * 0.7, heroHeight], [1, 0.7, 0]);
  const scaleOut = useTransform(scrollY, [0, heroHeight * 0.7, heroHeight], [1, 0.98, 0.95]);

  const features = [
    {
      icon: Heart,
      title: 'Crafted with Purpose',
      description: 'Each piece carries the passion and dedication of skilled artisans who believe in creating something truly meaningful.'
    },
    {
      icon: Truck,
      title: 'Swift Connections',
      description: 'Bridge distances quickly with our express delivery service, bringing heartfelt gifts to your loved ones in hours.'
    },
    {
      icon: Users,
      title: 'Empower Dreams',
      description: 'Every purchase directly supports independent artisans, helping them continue their creative journey and preserve traditional crafts.'
    },
    {
      icon: Award,
      title: 'Trusted Artisans',
      description: 'Our carefully curated community of verified creators ensures authentic craftsmanship and genuine stories behind every piece.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-elegant pt-0 md:pt-0">
      {/* Sticky/Fade/Scale Hero */}
      <div ref={heroRef} className="relative w-full overflow-visible mt-0">
        <motion.div
          className="sticky top-0 z-30 w-full"
          style={{ opacity: fadeOut, scale: scaleOut }}
        >
          <VideoCarousel />
        </motion.div>
      </div>

      {/* Shop by Category */}
      <section className="pt-8 pb-4 bg-cream-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal-800 mb-10 text-center font-serif">Shop by Category</h2>
          {/* Mobile: horizontal scroll, Desktop: grid */}
          <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { title: 'For Her', img: '/assets/for-her.jpg', link: '/shop?cat=her' },
              { title: 'For Him', img: '/assets/for-him.jpg', link: '/shop?cat=him' },
              { title: 'For Kids', img: '/assets/for-kids.jpg', link: '/shop?cat=kids' },
              { title: 'Home', img: '/assets/home.jpg', link: '/shop?cat=home' },
              { title: 'Occasions', img: '/assets/occasion.jpg', link: '/shop?cat=occasions' },
              { title: 'Personalised', img: '/assets/personalised.jpg', link: '/shop?cat=personalised' },
            ].map(cat => (
              <Link to={cat.link} key={cat.title} className="group block rounded-2xl overflow-hidden bg-white border border-cream-200 shadow-subtle hover:shadow-lg transition-all">
                <img src={cat.img} alt={cat.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="p-4 text-center">
                  <span className="text-lg font-semibold text-charcoal-800 group-hover:text-blush-700 transition-colors">{cat.title}</span>
                </div>
              </Link>
            ))}
          </div>
          {/* Mobile horizontal scroll */}
          <div className="sm:hidden flex space-x-4 overflow-x-auto pb-2">
            {[
              { title: 'For Her', img: '/assets/for-her.jpg', link: '/shop?cat=her' },
              { title: 'For Him', img: '/assets/for-him.jpg', link: '/shop?cat=him' },
              { title: 'For Kids', img: '/assets/for-kids.jpg', link: '/shop?cat=kids' },
              { title: 'Home', img: '/assets/home.jpg', link: '/shop?cat=home' },
              { title: 'Occasions', img: '/assets/occasion.jpg', link: '/shop?cat=occasions' },
              { title: 'Personalised', img: '/assets/personalised.jpg', link: '/shop?cat=personalised' },
            ].map(cat => (
              <Link to={cat.link} key={cat.title} className="min-w-[60vw] max-w-[70vw] group block rounded-2xl overflow-hidden bg-white border border-cream-200 shadow-subtle hover:shadow-lg transition-all">
                <img src={cat.img} alt={cat.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="p-4 text-center">
                  <span className="text-lg font-semibold text-charcoal-800 group-hover:text-blush-700 transition-colors">{cat.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="products-section" className="pt-8 pb-4 bg-cream-100 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center space-x-4 bg-primary-100 px-14 py-6 rounded-full mb-10 shadow-subtle">
            <Gift className="w-8 h-8 text-primary-600" />
            <span className="text-primary-700 font-semibold text-xl">Curated Collections</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-800 mb-6 font-serif">
            Handpicked{' '}
            <span className="text-primary-600">Treasures</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed font-light">
            Discover meaningful creations from passionate artisans who pour their heart into every piece
          </p>
        </motion.div>
        {/* Desktop grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 w-full px-4 lg:px-8 xl:px-12 mb-8 lg:mb-12">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
        {/* Mobile horizontal scroll */}
        <div className="sm:hidden flex space-x-4 overflow-x-auto px-4 mb-8 pb-2">
          {featuredProducts.map((product, index) => (
            <div key={product.id} className="min-w-[280px] max-w-[300px] flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/shop"
            className="inline-flex items-center space-x-4 bg-white text-primary-700 px-12 py-5 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 group text-2xl"
          >
            <span>Begin Your Journey</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Gift Inspiration & Stories */}
      <section className="pt-8 pb-4 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-10 text-center font-serif">Stories That Inspire</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Example static inspiration cards - replace with real stories/images as needed */}
            <div className="bg-neutral-50 rounded-2xl shadow-subtle border border-primary-100 p-6 flex flex-col items-center text-center">
              <img src="/assets/ins1.jpg" alt="Inspiration 1" className="w-full h-48 object-cover rounded-xl mb-4" />
              <h3 className="text-xl font-bold text-primary-700 mb-2">A Path to Her Heart</h3>
              <p className="text-neutral-600">"Through Zaryah, I discovered the perfect handcrafted piece that spoke to my mother's soul. The artisan's story made it even more special."</p>
            </div>
            <div className="bg-neutral-50 rounded-2xl shadow-subtle border border-primary-100 p-6 flex flex-col items-center text-center">
              <img src="/assets/ins2.jpg" alt="Inspiration 2" className="w-full h-48 object-cover rounded-xl mb-4" />
              <h3 className="text-xl font-bold text-primary-700 mb-2">Memories Woven Together</h3>
              <p className="text-neutral-600">"Our anniversary collection was thoughtfully curated, each piece telling part of our story. Zaryah helped us celebrate our journey beautifully."</p>
            </div>
            <div className="bg-neutral-50 rounded-2xl shadow-subtle border border-primary-100 p-6 flex flex-col items-center text-center">
              <img src="/assets/ins3.jpg" alt="Inspiration 3" className="w-full h-48 object-cover rounded-xl mb-4" />
              <h3 className="text-xl font-bold text-primary-700 mb-2">Connecting Hearts</h3>
              <p className="text-neutral-600">"Every purchase through Zaryah connects me with passionate creators. I'm not just buying a gift, I'm supporting dreams and preserving traditions."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="pt-8 pb-4 bg-neutral-50 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-4 bg-primary-100 px-14 py-6 rounded-full mb-10">
            <Sparkles className="w-8 h-8 text-primary-600" />
            <span className="text-primary-700 font-semibold text-xl">The Zaryah Way</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-800 mb-6 font-serif">
            Where{' '}
            <span className="text-primary-600">Stories</span>
            {' '}Meets{' '}
            <span className="text-secondary-600">Soul</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed font-light">
            Every piece in our collection carries the essence of its creator's journey, connecting hearts across distances through meaningful gifts.
          </p>
        </motion.div>
        <div className="w-full overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full px-1 sm:px-2 md:px-4 xl:px-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-primary-100 rounded-2xl p-2 sm:p-6 flex flex-col items-center justify-between shadow-subtle hover:shadow-warm transition-all duration-500 border border-primary-200 min-h-[140px] sm:min-h-[300px]"
                >
                  <div className="bg-primary-600 w-7 h-7 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-2 sm:mb-4">
                    <Icon className="w-4 h-4 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-base sm:text-2xl font-bold text-neutral-800 mb-1 sm:mb-2 font-serif text-center">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-lg text-neutral-600 leading-relaxed font-light text-center">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action - Mobile Optimized */}
      <section className="py-16 md:py-24 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-lg md:text-xl text-primary-100 mb-10 leading-relaxed">
              Join a community of thoughtful gift-givers who believe in the power of meaningful connections 
              and supporting passionate artisans.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/shop"
                className="inline-flex items-center space-x-2 bg-white text-primary-700 px-10 md:px-12 py-4 md:py-5 rounded-2xl font-semibold hover:shadow-xl transition-all text-lg"
              >
                <span>Explore Collections</span>
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 bg-primary-700 hover:bg-primary-800 text-white px-10 md:px-12 py-4 md:py-5 rounded-2xl font-semibold transition-all border-2 border-primary-500 text-lg"
              >
                <span>Share Your Craft</span>
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};