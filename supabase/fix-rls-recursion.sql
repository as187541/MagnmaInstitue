-- ============================================================
-- FIX: Infinite Recursion in RLS Policies
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Create a security definer function to get user role
-- This bypasses RLS so it won't cause recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  RETURN user_role;
END;
$$;

-- Step 2: Drop old recursive policies on profiles
DROP POLICY IF EXISTS "Allow admin/staff to read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin to update any profile" ON public.profiles;

-- Step 3: Recreate profiles policies using the function (no recursion)
CREATE POLICY "Allow admin/staff to read all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR public.get_user_role() IN ('admin', 'staff')
  );

CREATE POLICY "Allow admin to update any profile"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id
    OR public.get_user_role() = 'admin'
  );

-- Step 4: Drop old recursive policies on other tables
DROP POLICY IF EXISTS "Allow admin/staff to read all blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admin/staff to insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admin/staff to update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admin/staff to delete blog posts" ON public.blog_posts;

DROP POLICY IF EXISTS "Allow admin/staff to manage categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin/staff to manage blog_post_categories" ON public.blog_post_categories;

DROP POLICY IF EXISTS "Allow admin/staff to read contact_submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Allow admin/staff to delete contact_submissions" ON public.contact_submissions;

DROP POLICY IF EXISTS "Allow admin/staff to insert colleges" ON public.colleges;
DROP POLICY IF EXISTS "Allow admin/staff to update colleges" ON public.colleges;
DROP POLICY IF EXISTS "Allow admin/staff to delete colleges" ON public.colleges;

DROP POLICY IF EXISTS "Allow admin/staff to insert courses" ON public.courses;
DROP POLICY IF EXISTS "Allow admin/staff to update courses" ON public.courses;
DROP POLICY IF EXISTS "Allow admin/staff to delete courses" ON public.courses;

-- Step 5: Recreate blog_posts policies using the function
CREATE POLICY "Allow admin/staff to read all blog posts"
  ON public.blog_posts FOR SELECT
  USING (public.get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Allow admin/staff to insert blog posts"
  ON public.blog_posts FOR INSERT
  WITH CHECK (public.get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Allow admin/staff to update blog posts"
  ON public.blog_posts FOR UPDATE
  USING (public.get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Allow admin/staff to delete blog posts"
  ON public.blog_posts FOR DELETE
  USING (public.get_user_role() IN ('admin', 'staff'));

-- Step 6: Recreate categories policies
CREATE POLICY "Allow admin/staff to manage categories"
  ON public.categories FOR ALL
  USING (public.get_user_role() IN ('admin', 'staff'));

-- Step 7: Recreate blog_post_categories policies
CREATE POLICY "Allow admin/staff to manage blog_post_categories"
  ON public.blog_post_categories FOR ALL
  USING (public.get_user_role() IN ('admin', 'staff'));

-- Step 8: Recreate contact_submissions policies
CREATE POLICY "Allow anon insert to contact_submissions"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow admin/staff to read contact_submissions"
  ON public.contact_submissions FOR SELECT
  USING (public.get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Allow admin/staff to delete contact_submissions"
  ON public.contact_submissions FOR DELETE
  USING (public.get_user_role() IN ('admin', 'staff'));

-- Step 9: Recreate colleges policies
CREATE POLICY "Allow admin/staff to insert colleges"
  ON public.colleges FOR INSERT
  WITH CHECK (public.get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Allow admin/staff to update colleges"
  ON public.colleges FOR UPDATE
  USING (public.get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Allow admin/staff to delete colleges"
  ON public.colleges FOR DELETE
  USING (public.get_user_role() IN ('admin', 'staff'));

-- Step 10: Recreate courses policies
CREATE POLICY "Allow admin/staff to insert courses"
  ON public.courses FOR INSERT
  WITH CHECK (public.get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Allow admin/staff to update courses"
  ON public.courses FOR UPDATE
  USING (public.get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Allow admin/staff to delete courses"
  ON public.courses FOR DELETE
  USING (public.get_user_role() IN ('admin', 'staff'));

-- Step 11: Verify the function works
SELECT 'Testing get_user_role function...' as info;
SELECT public.get_user_role() as current_user_role;

-- Step 12: Show all policies
SELECT 'Policies fixed. Current policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
