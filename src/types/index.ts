export interface User {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'seller' | 'admin';
  city?: string;
  isVerified?: boolean;
  businessName?: string;
  description?: string;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  price: number;
  image: string;
  description: string;
  videoUrl?: string;
  city: string;
  instantDeliveryEligible: boolean;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  tags: string[];
  createdAt: string;
  section?: string;
  weight?: number;
  customisable?: boolean;
  customQuestions?: string[];
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  city: string;
  isVerified: boolean;
  businessName: string;
  description: string;
  products: Product[];
  status: 'pending' | 'approved' | 'rejected';
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  isActive: boolean;
}

export interface DeliveryCity {
  id: string;
  name: string;
  isActive: boolean;
}

export interface HeroVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  maker_name: string;
  location: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
}