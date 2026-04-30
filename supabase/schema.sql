-- ============================================================
-- Supabase Schema for Magnma Institute
-- ============================================================

-- --- Colleges Table ---
CREATE TABLE IF NOT EXISTS colleges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_image TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  ranking TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  fees TEXT NOT NULL DEFAULT 'Contact us for detailed fee structure.',
  featured BOOLEAN NOT NULL DEFAULT false,
  description TEXT NOT NULL DEFAULT '',
  approved_by TEXT[] NOT NULL DEFAULT '{}',
  affiliated_to TEXT NOT NULL DEFAULT '',
  admission_process TEXT[] NOT NULL DEFAULT '{}',
  documents_required TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  courses TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- Courses Table ---
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  specializations TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- Contact Submissions Table ---
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  number TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  college_applying_for TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- Enable Row Level Security ---
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- --- Public read access for colleges and courses ---
CREATE POLICY "Allow public read access to colleges"
  ON colleges FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to courses"
  ON courses FOR SELECT
  USING (true);

-- --- Authenticated insert for contact submissions ---
CREATE POLICY "Allow anon insert to contact_submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- --- Indexes for search ---
CREATE INDEX IF NOT EXISTS idx_colleges_name ON colleges USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_colleges_featured ON colleges (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_courses_name ON courses USING gin(to_tsvector('english', name));

-- ============================================================
-- Auth & Admin Schema (Added for Admin Panel)
-- ============================================================

-- --- Profiles Table (extends auth.users) ---
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'staff', 'student')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- Blog Posts Table ---
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  featured_image TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- Categories Table ---
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- Blog Post Categories Junction ---
CREATE TABLE IF NOT EXISTS blog_post_categories (
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_post_id, category_id)
);

-- --- Enable RLS on new tables ---
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_categories ENABLE ROW LEVEL SECURITY;

-- --- Profiles RLS Policies ---
CREATE POLICY "Allow users to read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow admin/staff to read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- --- Blog Posts RLS Policies ---
CREATE POLICY "Allow public read access to published blog posts"
  ON blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Allow admin/staff to read all blog posts"
  ON blog_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Allow admin/staff to insert blog posts"
  ON blog_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Allow admin/staff to update blog posts"
  ON blog_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Allow admin/staff to delete blog posts"
  ON blog_posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- --- Categories RLS Policies ---
CREATE POLICY "Allow public read access to categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Allow admin/staff to manage categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- --- Blog Post Categories RLS Policies ---
CREATE POLICY "Allow public read access to blog_post_categories"
  ON blog_post_categories FOR SELECT
  USING (true);

CREATE POLICY "Allow admin/staff to manage blog_post_categories"
  ON blog_post_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- --- Contact Submissions RLS Policies ---
CREATE POLICY "Allow admin/staff to read contact_submissions"
  ON contact_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Allow admin/staff to delete contact_submissions"
  ON contact_submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- --- Colleges RLS Policies (Admin/Staff can manage) ---
CREATE POLICY "Allow admin/staff to insert colleges"
  ON colleges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Allow admin/staff to update colleges"
  ON colleges FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Allow admin/staff to delete colleges"
  ON colleges FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- --- Courses RLS Policies (Admin/Staff can manage) ---
CREATE POLICY "Allow admin/staff to insert courses"
  ON courses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Allow admin/staff to update courses"
  ON courses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Allow admin/staff to delete courses"
  ON courses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- --- Profiles RLS Policy (Admin can update any profile for role assignment) ---
CREATE POLICY "Allow admin to update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- --- Indexes for performance ---
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- --- Function to auto-update updated_at ---
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --- Function to auto-lowercase role before insert/update ---
CREATE OR REPLACE FUNCTION public.lowercase_role()
RETURNS TRIGGER AS $$
BEGIN
  NEW.role = LOWER(NEW.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --- Trigger to auto-lowercase role ---
DROP TRIGGER IF EXISTS lowercase_profile_role ON public.profiles;
CREATE TRIGGER lowercase_profile_role
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.lowercase_role();

-- --- Triggers for updated_at ---
CREATE TRIGGER update_colleges_updated_at
  BEFORE UPDATE ON colleges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --- Function to create profile on user signup ---
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- Trigger to auto-create profile on signup ---
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Course-College Rankings (Course-specific ordering)
-- ============================================================

-- --- Junction table for course-specific college rankings ---
CREATE TABLE IF NOT EXISTS course_college_rankings (
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  ranking_label TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (course_id, college_id)
);

-- --- Enable RLS ---
ALTER TABLE course_college_rankings ENABLE ROW LEVEL SECURITY;

-- --- Public read access ---
CREATE POLICY "Allow public read access to course_college_rankings"
  ON course_college_rankings FOR SELECT
  USING (true);

-- --- Admin/Staff can manage ---
CREATE POLICY "Allow admin/staff to manage course_college_rankings"
  ON course_college_rankings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- --- Indexes ---
CREATE INDEX IF NOT EXISTS idx_ccr_course_order ON course_college_rankings(course_id, display_order);
CREATE INDEX IF NOT EXISTS idx_ccr_college ON course_college_rankings(college_id);

-- --- Trigger for updated_at ---
CREATE TRIGGER update_ccr_updated_at
  BEFORE UPDATE ON course_college_rankings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
