import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  giftPackaging: boolean;
  giftNote?: string;
}

export interface CheckoutDetails {
  deliverToFriend: boolean;
  friendDetails?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  shippingDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  deliveryType: 'standard' | 'instant';
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, options?: { giftPackaging?: boolean; quantity?: number }) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getGiftPackagingCost: () => number;
  getDeliveryCost: (deliveryType: 'standard' | 'instant') => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('giftflare-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('giftflare-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, options: { giftPackaging?: boolean; quantity?: number } = {}) => {
    const existingItem = items.find(item => 
      item.product.id === product.id && 
      item.giftPackaging === (options.giftPackaging || false)
    );

    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + (options.quantity || 1));
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${Date.now()}-${options.giftPackaging ? 'gift' : 'regular'}`,
        product,
        quantity: options.quantity || 1,
        giftPackaging: options.giftPackaging || false,
        giftNote: ''
      };
      setItems(prev => [...prev, newItem]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const updateCartItem = (itemId: string, updates: Partial<CartItem>) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getGiftPackagingCost = () => {
    return items.filter(item => item.giftPackaging).length * 30; // ₹30 per gift item
  };

  const getDeliveryCost = (deliveryType: 'standard' | 'instant') => {
    if (deliveryType === 'instant') {
      return 99; // ₹99 for instant delivery via Dunzo
    }
    return getTotalPrice() >= 500 ? 0 : 50; // Free delivery above ₹500, otherwise ₹50
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateCartItem,
      clearCart,
      getTotalPrice,
      getTotalItems,
      getGiftPackagingCost,
      getDeliveryCost,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};