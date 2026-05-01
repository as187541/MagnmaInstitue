-- ============================================================
-- Supabase Storage Setup for Magnma Institute
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Create the storage bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'magnma-images',
  'magnma-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

-- Policy: Allow anyone to read images (public bucket)
CREATE POLICY "Allow public read access"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'magnma-images');

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'magnma-images'
    AND auth.role() = 'authenticated'
  );

-- Policy: Allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated updates"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'magnma-images'
    AND auth.role() = 'authenticated'
  );

-- Policy: Allow authenticated users to delete images
CREATE POLICY "Allow authenticated deletes"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'magnma-images'
    AND auth.role() = 'authenticated'
  );
