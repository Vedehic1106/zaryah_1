/*
  # Add Hero Videos Table

  1. New Tables
    - `hero_videos`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `video_url` (text)
      - `thumbnail_url` (text)
      - `maker_name` (text)
      - `location` (text)
      - `is_active` (boolean)
      - `order_index` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `hero_videos` table
    - Add policy for public to read active videos
    - Add policy for admins to manage all videos

  3. Sample Data
    - Insert 3 sample hero videos for immediate use
*/

CREATE TABLE IF NOT EXISTS hero_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  video_url text NOT NULL,
  thumbnail_url text NOT NULL,
  maker_name text NOT NULL,
  location text NOT NULL,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hero_videos ENABLE ROW LEVEL SECURITY;

-- Public can read active videos
CREATE POLICY "Active hero videos are readable by everyone"
  ON hero_videos
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Only admins can manage hero videos
CREATE POLICY "Only admins can manage hero videos"
  ON hero_videos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample hero videos
INSERT INTO hero_videos (title, description, video_url, thumbnail_url, maker_name, location, is_active, order_index) VALUES
  (
    'Handcrafted Pottery',
    'Watch Priya create beautiful ceramic pieces in her Mumbai studio',
    'https://images.pexels.com/photos/5553045/pexels-photo-5553045.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/5553045/pexels-photo-5553045.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Priya Sharma',
    'Mumbai',
    true,
    1
  ),
  (
    'Artisan Candles',
    'See how Ravi crafts aromatic soy candles with natural ingredients',
    'https://images.pexels.com/photos/5624983/pexels-photo-5624983.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/5624983/pexels-photo-5624983.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Ravi Kumar',
    'Mumbai',
    true,
    2
  ),
  (
    'Handwoven Textiles',
    'Discover Meera''s traditional weaving techniques passed down through generations',
    'https://images.pexels.com/photos/6195121/pexels-photo-6195121.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/6195121/pexels-photo-6195121.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Meera Patel',
    'Mumbai',
    true,
    3
  );