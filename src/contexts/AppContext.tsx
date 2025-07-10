import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product, Seller, Theme, DeliveryCity } from '../types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface AppContextType {
  products: Product[];
  sellers: Seller[];
  deliveryCities: DeliveryCity[];
  currentTheme: Theme;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'sellerName'>) => Promise<boolean>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<boolean>;
  updateDeliveryCity: (cityId: string, isActive: boolean) => Promise<boolean>;
  updateTheme: (themeName: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const defaultTheme: Theme = {
  name: 'default',
  colors: {
    primary: 'primary-500',
    secondary: 'mint-400',
    accent: 'blush-400'
  },
  isActive: true
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [deliveryCities, setDeliveryCities] = useState<DeliveryCity[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    console.log('Refreshing app data...');
    setIsLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchDeliveryCities(),
        fetchCurrentTheme()
      ]);
    } catch (error) {
      console.error('Error refreshing app data:', error);
      console.error('Error refreshing data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('Fetching products from database...');
      console.log('Fetching products...');
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles!products_seller_id_fkey (
            name,
            is_verified
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error fetching products:', error);
        console.error('Error fetching products:', error);
        // Check if it's a connection error or table doesn't exist
        if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.warn('Products table not found, using fallback data');
        } else {
          console.warn('Failed to load products from database, using fallback data');
        }
        console.log('Using sample products as fallback');
        setProducts(getSampleProducts());
        return;
      }

      console.log('Products fetched:', data?.length || 0);

      const formattedProducts: Product[] = (data || []).map(product => ({
        ...product,
        id: product.id,
        sellerId: product.seller_id,
        sellerName: product.profiles?.name || 'Unknown Seller',
        name: product.name,
        price: product.price / 100, // Convert from paise to rupees
        image: product.image_url || 'https://images.pexels.com/photos/1030303/pexels-photo-1030303.jpeg?auto=compress&cs=tinysrgb&w=800',
        description: product.description,
        videoUrl: product.video_url || undefined,
        city: product.city,
        instantDeliveryEligible: product.instant_delivery_eligible,
        status: product.status,
        category: product.category,
        tags: product.tags || [],
        createdAt: product.created_at
      }));

      console.log('Formatted products:', formattedProducts.length);
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      console.warn('Failed to load products, using fallback data');
      setProducts(getSampleProducts());
    }
  };

  // Fallback sample products for when database is not available
  const getSampleProducts = (): Product[] => [
    // Sample products for demo/fallback
    {
      id: 'sample-1',
      sellerId: 'sample-seller-1',
      sellerName: 'Priya Sharma',
      name: 'Handcrafted Ceramic Vase',
      price: 1299,
      image: 'https://images.pexels.com/photos/5553045/pexels-photo-5553045.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Beautiful handmade ceramic vase with traditional patterns',
      city: 'Mumbai',
      instantDeliveryEligible: true,
      status: 'approved',
      category: 'Home Decor',
      tags: ['handmade', 'ceramic', 'home-decor'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-2',
      sellerId: 'sample-seller-2',
      sellerName: 'Ravi Kumar',
      name: 'Artisan Soy Candles',
      price: 599,
      image: 'https://images.pexels.com/photos/5624983/pexels-photo-5624983.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Natural soy candles with essential oils',
      city: 'Mumbai',
      instantDeliveryEligible: true,
      status: 'approved',
      category: 'Candles',
      tags: ['handmade', 'candles', 'natural'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-3',
      sellerId: 'sample-seller-3',
      sellerName: 'Meera Patel',
      name: 'Handwoven Textile Art',
      price: 2499,
      image: 'https://images.pexels.com/photos/6195121/pexels-photo-6195121.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Traditional handwoven textile with intricate patterns',
      city: 'Mumbai',
      instantDeliveryEligible: false,
      status: 'approved',
      category: 'Textiles',
      tags: ['handmade', 'textiles', 'traditional'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-4',
      sellerId: 'sample-seller-4',
      sellerName: 'Arjun Singh',
      name: 'Wooden Jewelry Box',
      price: 899,
      image: 'https://images.pexels.com/photos/1030303/pexels-photo-1030303.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Handcrafted wooden jewelry box with carved details',
      city: 'Delhi',
      instantDeliveryEligible: false,
      status: 'approved',
      category: 'Jewelry',
      tags: ['handmade', 'wood', 'jewelry'],
      createdAt: new Date().toISOString()
    }
  ];

  const fetchDeliveryCities = async () => {
    try {
      console.log('Fetching delivery cities...');
      const { data, error } = await supabase
        .from('delivery_cities')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching delivery cities:', error);
        console.warn('Could not fetch delivery cities, using empty array');
        return;
      }

      const formattedCities: DeliveryCity[] = (data || []).map(city => ({
        id: city.id,
        name: city.name,
        isActive: city.is_active
      }));

      console.log('Delivery cities loaded:', formattedCities.length);
      setDeliveryCities(formattedCities);
    } catch (error) {
      console.error('Error in fetchDeliveryCities:', error);
    }
  };

  const fetchCurrentTheme = async () => {
    try {
      console.log('Fetching current theme...');
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching theme:', error);
        console.warn('Could not fetch theme, using default');
        return;
      }

      if (data) {
        setCurrentTheme({
          name: data.name,
          colors: data.colors as { primary: string; secondary: string; accent: string },
          isActive: data.is_active
        });
        console.log('Theme loaded:', data.name);
      } else {
        console.log('No active theme found, using default');
      }
    } catch (error) {
      console.error('Error in fetchCurrentTheme:', error);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'sellerName'>): Promise<boolean> => {
    if (!user) {
      console.error('No user found for adding product');
      toast.error('You must be logged in to add products');
      return false;
    }

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          seller_id: productData.sellerId,
          name: productData.name,
          price: Math.round(productData.price * 100), // Convert to paise
          image_url: productData.image,
          description: productData.description,
          video_url: productData.videoUrl,
          city: productData.city,
          instant_delivery_eligible: productData.instantDeliveryEligible,
          category: productData.category,
          tags: productData.tags
        });

      if (error) {
        console.error('Database error adding product:', error);
        console.error('Error adding product:', error);
        toast.error('Failed to add product');
        return false;
      }

      toast.success('Product added successfully!');
      await fetchProducts();
      console.log('Product added successfully');
      return true;
    } catch (error) {
      console.error('Error in addProduct:', error);
      toast.error('Failed to add product');
      return false;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>): Promise<boolean> => {
    try {
      console.log('Updating product:', productId, updates);
      const dbUpdates: any = {};
      
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.price) dbUpdates.price = Math.round(updates.price * 100); // Convert to paise
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.image) dbUpdates.image_url = updates.image;
      if (updates.videoUrl !== undefined) dbUpdates.video_url = updates.videoUrl;
      if (updates.instantDeliveryEligible !== undefined) dbUpdates.instant_delivery_eligible = updates.instantDeliveryEligible;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.tags) dbUpdates.tags = updates.tags;

      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', productId);

      if (error) {
        console.error('Database error updating product:', error);
        console.error('Error updating product:', error);
        toast.error('Failed to update product');
        return false;
      }

      toast.success('Product updated successfully!');
      await fetchProducts();
      console.log('Product updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      toast.error('Failed to update product');
      return false;
    }
  };

  const updateDeliveryCity = async (cityId: string, isActive: boolean): Promise<boolean> => {
    try {
      console.log('Updating delivery city:', cityId, isActive);
      const { error } = await supabase
        .from('delivery_cities')
        .update({ is_active: isActive })
        .eq('id', cityId);

      if (error) {
        console.error('Error updating delivery city:', error);
        console.error('Database error updating delivery city:', error);
        toast.error('Failed to update delivery city');
        return false;
      }

      toast.success('Delivery city updated successfully!');
      await fetchDeliveryCities();
      return true;
    } catch (error) {
      console.error('Error in updateDeliveryCity:', error);
      toast.error('Failed to update delivery city');
      return false;
    }
  };

  const updateTheme = async (themeName: string): Promise<boolean> => {
    try {
      console.log('Updating theme to:', themeName);
      // First, deactivate all themes
      await supabase
        .from('themes')
        .update({ is_active: false })
        .neq('id', '');

      // Then activate the selected theme
      const { error } = await supabase
        .from('themes')
        .update({ is_active: true })
        .eq('name', themeName);

      if (error) {
        console.error('Database error updating theme:', error);
        console.error('Error updating theme:', error);
        toast.error('Failed to update theme');
        return false;
      }

      toast.success('Theme updated successfully!');
      await fetchCurrentTheme();
      return true;
    } catch (error) {
      console.error('Error in updateTheme:', error);
      toast.error('Failed to update theme');
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      products,
      sellers,
      deliveryCities,
      currentTheme,
      addProduct,
      updateProduct,
      updateDeliveryCity,
      updateTheme,
      refreshData,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};