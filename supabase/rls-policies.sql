-- ============================================================
-- MAGNMA INSTITUTE - COMPLETE RLS POLICY RESET
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Drop ALL existing policies on ALL tables
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname, tablename, schemaname FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- 2. Disable RLS on public-facing tables (no login needed)
ALTER TABLE colleges DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions DISABLE ROW LEVEL SECURITY;

-- 3. Enable RLS on profiles (user data needs protection)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. PROFILES POLICIES

-- Admin can do ANYTHING on profiles (full CRUD)
CREATE POLICY "admin_all_profiles" ON profiles
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Staff can READ all profiles (to see users), but cannot modify roles
CREATE POLICY "staff_select_profiles" ON profiles
  FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- Any authenticated user can read their OWN profile
CREATE POLICY "user_self_select" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Any authenticated user can insert their OWN profile (on signup)
CREATE POLICY "user_self_insert" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Any authenticated user can update their OWN profile (but NOT their role)
CREATE POLICY "user_self_update" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Allow update only if role is NOT being changed, OR if the user is admin
      (OLD.role = NEW.role)
      OR
      (auth.jwt() ->> 'role' = 'admin')
    )
  );

-- 5. BLOG POSTS POLICIES (re-enable RLS for write protection)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "public_read_blog" ON blog_posts
  FOR SELECT
  USING (published = true);

-- Admin and Staff can read ALL posts (including drafts)
CREATE POLICY "admin_staff_read_all_blog" ON blog_posts
  FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- Admin and Staff can insert blog posts
CREATE POLICY "admin_staff_insert_blog" ON blog_posts
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- Admin and Staff can update blog posts
CREATE POLICY "admin_staff_update_blog" ON blog_posts
  FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- Admin and Staff can delete blog posts
CREATE POLICY "admin_staff_delete_blog" ON blog_posts
  FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- 6. CONTACT SUBMISSIONS POLICIES (re-enable RLS)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact form
CREATE POLICY "public_insert_contact" ON contact_submissions
  FOR INSERT
  WITH CHECK (true);

-- Admin and Staff can read contact submissions
CREATE POLICY "admin_staff_read_contact" ON contact_submissions
  FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- Admin can delete contact submissions
CREATE POLICY "admin_delete_contact" ON contact_submissions
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- 7. COLLEGES POLICIES (re-enable RLS for write protection)
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;

-- Anyone can read colleges
CREATE POLICY "public_read_colleges" ON colleges
  FOR SELECT
  USING (true);

-- Admin and Staff can insert colleges
CREATE POLICY "admin_staff_insert_colleges" ON colleges
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- Admin and Staff can update colleges
CREATE POLICY "admin_staff_update_colleges" ON colleges
  FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- Admin can delete colleges
CREATE POLICY "admin_delete_colleges" ON colleges
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- 8. COURSES POLICIES (re-enable RLS for write protection)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Anyone can read courses
CREATE POLICY "public_read_courses" ON courses
  FOR SELECT
  USING (true);

-- Admin and Staff can insert courses
CREATE POLICY "admin_staff_insert_courses" ON courses
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- Admin and Staff can update courses
CREATE POLICY "admin_staff_update_courses" ON courses
  FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- Admin can delete courses
CREATE POLICY "admin_delete_courses" ON courses
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- 9. Set admin role for specific user (REPLACE with your admin email)
-- Run this AFTER creating your admin account
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';

SELECT '✅ All policies created successfully!' AS result;
