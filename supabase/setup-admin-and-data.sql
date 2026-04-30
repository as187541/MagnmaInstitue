-- ============================================================
-- Fix RLS + Create Admin User + Insert Sample Data
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: Create Admin User (Bypasses email rate limit)
-- ============================================================

-- First, create the user in auth.users (this bypasses email confirmation)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  gen_random_uuid(),  -- id
  (SELECT instance_id FROM auth.users LIMIT 1),  -- instance_id
  'admin@magnma.com',  -- email
  crypt('Admin@123', gen_salt('bf')),  -- encrypted_password (change this!)
  NOW(),  -- email_confirmed_at (auto-confirmed)
  '{"provider":"email","providers":["email"]}',  -- raw_app_meta_data
  '{"full_name":"Admin User"}',  -- raw_user_meta_data
  NOW(),  -- created_at
  NOW(),  -- updated_at
  'authenticated',  -- role
  '',  -- confirmation_token
  '',  -- email_change
  '',  -- email_change_token_new
  ''   -- recovery_token
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- ============================================================
-- STEP 2: Create Admin Profile
-- ============================================================

INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Admin User',
  'admin',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'admin@magnma.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- ============================================================
-- STEP 3: Verify Admin User Exists
-- ============================================================

SELECT id, email, full_name, role FROM public.profiles WHERE role = 'admin';

-- ============================================================
-- STEP 4: Insert Sample Colleges (Direct SQL - bypasses RLS)
-- ============================================================

INSERT INTO public.colleges (
  id, name, logo_image, location, ranking, fees, featured, description,
  approved_by, affiliated_to, admission_process, documents_required, images, courses
) VALUES 
(
  'iq-city-medical-college',
  'IQ City Medical College',
  'https://placehold.co/400x400/0a4d68/FFF?text=IQ+City',
  'Durgapur, West Bengal',
  'Top 10 in West Bengal',
  'Contact us for detailed fee structure.',
  true,
  'IQ City Medical College is a premier medical institution offering world-class education and healthcare facilities. Established with a vision to provide quality medical education, the college boasts state-of-the-art infrastructure and experienced faculty.',
  ARRAY['MCI', 'UGC', 'NAAC'],
  'West Bengal University of Health Sciences',
  ARRAY['Fill online application form', 'Submit required documents', 'Appear for entrance examination', 'Counseling and seat allocation', 'Fee payment and admission confirmation'],
  ARRAY['10th Marksheet', '12th Marksheet', 'NEET Scorecard', 'Identity Proof', 'Domicile Certificate', 'Passport Size Photographs'],
  ARRAY['https://placehold.co/800x600/0a4d68/FFF?text=Campus+View', 'https://placehold.co/800x600/0a4d68/FFF?text=Library'],
  ARRAY['MBBS', 'BDS', 'Nursing', 'Physiotherapy']
),
(
  'narayana-medical-college',
  'Narayana Medical College',
  'https://placehold.co/400x400/0a4d68/FFF?text=Narayana',
  'Nellore, Andhra Pradesh',
  'Top 20 in South India',
  'Contact us for detailed fee structure.',
  true,
  'Narayana Medical College is renowned for its excellence in medical education and research. The college provides comprehensive training with modern laboratories and hospital facilities.',
  ARRAY['MCI', 'UGC'],
  'Dr. NTR University of Health Sciences',
  ARRAY['Online registration', 'Document verification', 'Entrance test', 'Personal interview', 'Final admission'],
  ARRAY['10th Certificate', '12th Certificate', 'NEET Rank Card', 'Birth Certificate', 'Category Certificate'],
  ARRAY['https://placehold.co/800x600/0a4d68/FFF?text=Building', 'https://placehold.co/800x600/0a4d68/FFF?text=Lab'],
  ARRAY['MBBS', 'MD', 'MS', 'BSc Nursing']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 5: Insert Sample Courses (Direct SQL - bypasses RLS)
-- ============================================================

INSERT INTO public.courses (
  id, name, description, image, specializations
) VALUES 
(
  'mbbs',
  'MBBS (Bachelor of Medicine and Bachelor of Surgery)',
  'MBBS is a professional undergraduate medical degree that prepares students to become doctors. The course covers anatomy, physiology, biochemistry, pharmacology, pathology, and clinical training.',
  'https://placehold.co/400x300/0a4d68/FFF?text=MBBS',
  ARRAY['General Medicine', 'Surgery', 'Pediatrics', 'Orthopedics', 'ENT']
),
(
  'bds',
  'BDS (Bachelor of Dental Surgery)',
  'BDS is a professional dental degree that trains students in dental sciences, oral surgery, and dental care. The course includes theoretical knowledge and practical clinical training.',
  'https://placehold.co/400x300/0a4d68/FFF?text=BDS',
  ARRAY['Oral Surgery', 'Orthodontics', 'Periodontics', 'Endodontics', 'Prosthodontics']
),
(
  'bsc-nursing',
  'B.Sc Nursing',
  'B.Sc Nursing is a comprehensive nursing program that prepares students to provide quality healthcare services. The course covers medical-surgical nursing, community health, pediatric nursing, and midwifery.',
  'https://placehold.co/400x300/0a4d68/FFF?text=Nursing',
  ARRAY['Medical-Surgical Nursing', 'Community Health Nursing', 'Pediatric Nursing', 'Obstetrics and Gynecology', 'Psychiatric Nursing']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 6: Verify Data Inserted
-- ============================================================

SELECT 'Colleges inserted:' as info;
SELECT id, name, location FROM public.colleges;

SELECT 'Courses inserted:' as info;
SELECT id, name FROM public.courses;

SELECT 'Admin user:' as info;
SELECT id, email, full_name, role FROM public.profiles WHERE role = 'admin';
