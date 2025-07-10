/*
  # Initial GiftFlare Database Schema

  1. New Tables
    - `profiles` - User profiles extending Supabase auth
      - `id` (uuid, references auth.users)
      - `name` (text)
      - `role` (enum: buyer, seller, admin)
      - `city` (text)
      - `is_verified` (boolean)
      - `business_name` (text, for sellers)
      - `description` (text, for sellers)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `products` - Product listings
      - `id` (uuid, primary key)
      - `seller_id` (uuid, references profiles)
      - `name` (text)
      - `price` (integer, in paise)
      - `image_url` (text)
      - `description` (text)
      - `video_url` (text, optional)
      - `city` (text)
      - `instant_delivery_eligible` (boolean)
      - `status` (enum: pending, approved, rejected)
      - `category` (text)
      - `tags` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `delivery_cities` - Cities supporting instant delivery
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `is_active` (boolean)
      - `created_at` (timestamp)

    - `themes` - Seasonal themes
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `colors` (jsonb)
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
    - Profiles are readable by authenticated users
    - Products are readable by all, writable by sellers/admins
    - Admin-only access for delivery_cities and themes
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE product_status AS ENUM ('pending', 'approved', 'rejected');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'buyer',
  city text,
  is_verified boolean DEFAULT false,
  business_name text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  price integer NOT NULL CHECK (price > 0),
  image_url text,
  description text NOT NULL,
  video_url text,
  city text NOT NULL,
  instant_delivery_eligible boolean DEFAULT false,
  status product_status DEFAULT 'pending',
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Delivery cities table
CREATE TABLE IF NOT EXISTS delivery_cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Themes table
CREATE TABLE IF NOT EXISTS themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  colors jsonb NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are readable by authenticated users"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Products are readable by everyone"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Sellers can insert own products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

CREATE POLICY "Sellers can update own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = seller_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

CREATE POLICY "Admins can manage all products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Delivery cities policies (admin only)
CREATE POLICY "Delivery cities are readable by authenticated users"
  ON delivery_cities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage delivery cities"
  ON delivery_cities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Themes policies (admin only)
CREATE POLICY "Themes are readable by everyone"
  ON themes
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only admins can manage themes"
  ON themes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert initial data
INSERT INTO delivery_cities (name, is_active) VALUES
  ('Mumbai', true),
  ('Delhi', false),
  ('Bangalore', false),
  ('Chennai', false),
  ('Kolkata', false),
  ('Hyderabad', false);

INSERT INTO themes (name, colors, is_active) VALUES
  ('default', '{"primary": "#EC4899", "secondary": "#F472B6", "accent": "#FDE047"}', true),
  ('christmas', '{"primary": "#DC2626", "secondary": "#16A34A", "accent": "#FBBF24"}', false),
  ('diwali', '{"primary": "#F59E0B", "secondary": "#EA580C", "accent": "#DC2626"}', false);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();