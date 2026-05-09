const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generatePassword() {
  return crypto.randomBytes(12).toString('base64');
}

const adminEmail = process.env.ADMIN_EMAIL || 'magnma.admin@gmail.com';
const adminPassword = process.env.ADMIN_PASSWORD || generatePassword();

if (!process.env.ADMIN_PASSWORD) {
  console.warn('ADMIN_PASSWORD not set. A random password will be generated for the new admin account.');
}

async function setup() {
  console.log('=== Magnma Institute Supabase Setup ===\n');

  // 1. Check existing tables
  console.log('1. Checking existing tables...');
  const { data: colleges, error: cErr } = await supabase.from('colleges').select('id').limit(1);
  console.log('   Colleges:', cErr ? 'ERROR: ' + cErr.message : 'OK');

  // 2. Try to create tables by inserting (will fail if table doesn't exist)
  console.log('\n2. Attempting to create tables...');
  
  // Try creating profiles table via insert (this won't work if table doesn't exist)
  // Instead, let's try a different approach - use the REST API to run SQL
  
  // Actually, with anon key we can't create tables. We need to provide instructions.
  console.log('   NOTE: Table creation requires running SQL in Supabase Dashboard.');
  console.log('   Please go to: https://supabase.com/dashboard/project/seoddejjuirokaqjjfbl');
  console.log('   Navigate to: SQL Editor > New Query');
  console.log('   Paste the schema from: supabase/schema.sql');
  console.log('   Click: Run\n');

  // 3. Check if we can create a user
  console.log('3. Creating admin user...');

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: adminEmail,
    password: adminPassword,
    options: {
      data: { full_name: 'Admin User', role: 'admin' }
    }
  });
  
  if (signUpError) {
    console.log('   Signup error:', signUpError.message);
    
    if (signUpError.message.includes('rate limit')) {
      console.log('   Rate limit hit. Waiting 60 seconds...');
      await new Promise(r => setTimeout(r, 60000));
      
      // Try again
      const { data: retryData, error: retryError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: { full_name: 'Admin User', role: 'admin' }
        }
      });
      
      if (retryError) {
        console.log('   Retry error:', retryError.message);
      } else {
        console.log('   Admin user created!');
        console.log('   Email:', adminEmail);
        console.log('   Password:', adminPassword);
        console.log('   User ID:', retryData.user?.id);
      }
    }
  } else {
    console.log('   Admin user created successfully!');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('   User ID:', signUpData.user?.id);
    console.log('\n   IMPORTANT: Check your email to confirm the account!');
  }

  // 4. Insert blog post directly (will only work if tables exist)
  console.log('\n4. Attempting to insert blog post...');
  const { error: blogError } = await supabase.from('blog_posts').insert({
    title: 'IQ City Medical College Durgapur: A Complete Guide for Aspiring Medical Students',
    slug: 'iq-city-medical-college-durgapur-guide',
    excerpt: 'Discover why IQ City Medical College in Durgapur is one of the top choices for medical education in West Bengal. Learn about admissions, courses, facilities, and more.',
    content: `<p>Are you dreaming of becoming a doctor? <strong>IQ City Medical College</strong> in Durgapur, West Bengal, might be the perfect place to start your journey. Established in 2013, this premier medical institution has quickly become one of the most sought-after colleges for aspiring medical professionals in Eastern India.</p>

<h2>Why Choose IQ City Medical College?</h2>

<p>IQ City Medical College is part of the expansive <strong>IQ City Health and Knowledge Campus</strong>, offering state-of-the-art infrastructure and a comprehensive learning environment. Here are some key reasons why students prefer this institution:</p>

<ul>
<li><strong>Recognized by NMC:</strong> The college is approved by the National Medical Commission (NMC) and WHO, ensuring your degree is valid worldwide.</li>
<li><strong>Modern Infrastructure:</strong> The campus boasts advanced laboratories, a well-stocked library, and cutting-edge medical equipment.</li>
<li><strong>Experienced Faculty:</strong> Learn from some of the best medical professionals and educators in the region.</li>
<li><strong>Clinical Exposure:</strong> The attached hospital provides hands-on training and real-world medical experience.</li>
</ul>

<h2>Courses Offered</h2>

<p>IQ City Medical College offers a range of programs for medical aspirants:</p>

<ul>
<li><strong>MBBS (Bachelor of Medicine and Bachelor of Surgery):</strong> The flagship undergraduate program.</li>
<li><strong>MD (Doctor of Medicine):</strong> Postgraduate specialization programs.</li>
<li><strong>MS (Master of Surgery):</strong> Advanced surgical training.</li>
<li><strong>Nursing Programs:</strong> Comprehensive nursing education.</li>
</ul>

<h2>Admission Process</h2>

<p>Admission to IQ City Medical College is based on <strong>NEET UG</strong> scores. Here is the step-by-step process:</p>

<ol>
<li><strong>Qualify NEET UG:</strong> Appear for the National Eligibility cum Entrance Test and secure a qualifying score.</li>
<li><strong>State Counseling:</strong> Participate in the West Bengal state counseling process (WBMCC) based on your NEET rank.</li>
<li><strong>Document Verification:</strong> Submit all required documents for verification at the time of admission.</li>
<li><strong>Fee Payment:</strong> Complete the fee payment to confirm your seat.</li>
</ol>

<h2>Documents Required</h2>

<p>Make sure you have the following documents ready:</p>

<ul>
<li>NEET UG Admit Card and Scorecard</li>
<li>Class 10th and 12th Mark Sheets and Certificates</li>
<li>ID Proof (Aadhar/PAN/Passport)</li>
<li>8 Passport-size Photographs</li>
<li>Allotment Letter from Counseling Authority</li>
<li>Caste Certificate (if applicable)</li>
<li>Migration Certificate</li>
</ul>

<h2>Campus Life</h2>

<p>Life at IQ City Medical College is vibrant and enriching. The campus provides:</p>

<ul>
<li>Comfortable hostel accommodations</li>
<li>Sports and recreational facilities</li>
<li>Cultural events and student societies</li>
<li>24/7 medical facilities and security</li>
</ul>

<h2>How Magnma Institute Can Help</h2>

<p>At <strong>Magnma Institute</strong>, we provide end-to-end admission guidance for IQ City Medical College. Our services include:</p>

<ul>
<li>NEET counseling guidance</li>
<li>Document preparation assistance</li>
<li>Seat allotment strategy</li>
<li>Post-admission support</li>
</ul>

<p><strong>Contact us today</strong> to book a free counseling session and take the first step toward your medical career!</p>`,
    featured_image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    published: true
  });
  
  if (blogError) {
    console.log('   Blog insert error:', blogError.message);
    console.log('   This is expected if the blog_posts table does not exist yet.');
  } else {
    console.log('   Blog post inserted successfully!');
  }

  console.log('\n=== Setup Complete ===');
  console.log('\nNext steps:');
  console.log('1. Go to Supabase Dashboard > SQL Editor');
  console.log('2. Run the schema from supabase/schema.sql');
  console.log('3. Confirm your admin email (check inbox)');
  console.log('4. Log in at /login with:', email, '/', password);
}

setup().catch(console.error);
