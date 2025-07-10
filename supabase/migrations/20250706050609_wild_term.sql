/*
  # Hero Videos Table Migration

  1. New Tables
    - `hero_videos`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, required)
      - `video_url` (text, required)
      - `thumbnail_url` (text, required)
      - `maker_name` (text, required)
      - `location` (text, required)
      - `is_active` (boolean, default true)
      - `order_index` (integer, default 0)
      - `created_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `hero_videos` table
    - Add policy for public read access to active videos
    - Add policy for admin management of all videos
*/

-- Create hero_videos table if it doesn't exist
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

-- Enable RLS
ALTER TABLE hero_videos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Active hero videos are readable by everyone" ON hero_videos;
DROP POLICY IF EXISTS "Only admins can manage hero videos" ON hero_videos;

-- Policy for public read access to active videos
CREATE POLICY "Active hero videos are readable by everyone"
  ON hero_videos
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Policy for admin management of all videos
CREATE POLICY "Only admins can manage hero videos"
  ON hero_videos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );