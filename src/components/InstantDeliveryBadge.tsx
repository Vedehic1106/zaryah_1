import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Clock } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';

interface InstantDeliveryBadgeProps {
  product: {
    city: string;
    instantDeliveryEligible: boolean;
    sellerName: string;
  };
  className?: string;
}

export const InstantDeliveryBadge: React.FC<InstantDeliveryBadgeProps> = ({ 
  product, 
  className = '' 
}) => {
  const { userCity } = useLocation();

  // Check if instant delivery is available
  const isInstantDeliveryAvailable = 
    product.instantDeliveryEligible && 
    userCity && 
    userCity.toLowerCase() === product.city.toLowerCase();

  if (!isInstantDeliveryAvailable) {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`bg-accent-100 text-charcoal-900 text-xs px-3 py-1.5 rounded-full flex items-center space-x-1 shadow-lg ${className}`}
    >
      <Truck className="w-3 h-3" />
      <span className="font-medium">Instant Delivery</span>
    </motion.div>
  );
};

export const DeliveryTimeEstimate: React.FC<InstantDeliveryBadgeProps> = ({ 
  product 
}) => {
  const { userCity } = useLocation();

  const isInstantDeliveryAvailable = 
    product.instantDeliveryEligible && 
    userCity && 
    userCity.toLowerCase() === product.city.toLowerCase();

  return (
    <div className="flex items-center space-x-2 text-sm">
      <Clock className="w-4 h-4 text-accent-500" />
      <span className="text-accent-700">
        {isInstantDeliveryAvailable 
          ? 'Delivery in 2-4 hours' 
          : 'Delivery in 3-7 days'
        }
      </span>
    </div>
  );
};