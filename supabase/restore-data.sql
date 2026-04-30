-- ============================================================
-- RESTORE ALL DATA - Run this in Supabase SQL Editor
-- This will repopulate all colleges and courses
-- ============================================================

-- Temporarily disable RLS so we can insert data
ALTER TABLE colleges DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- === COLLEGES ===

INSERT INTO colleges (id, name, logo_image, location, ranking, fees, featured, description, approved_by, affiliated_to, admission_process, documents_required, images, courses) VALUES
('iq-city', 'IQ City Medical College', 'assets/images/colleges/iqcity/iq.png', 'Durgapur, West Bengal-713212, India', 'Top Medical College in West Bengal', 'Contact us for detailed fee structure.', true, 'IQ City Medical College, located in Durgapur, West Bengal, is a leading private medical institution dedicated to providing high-quality medical education and healthcare services. Established in 2013, the college is part of the IQ City Health and Knowledge Campus, which spans a vast area and includes state-of-the-art facilities. The college is committed to producing competent and compassionate medical professionals through a rigorous curriculum, hands-on clinical training, and a focus on research and innovation.',
  ARRAY['NMC (National Medical Commission)', 'WHO'], 'West Bengal University of Health Sciences (WBUHS)',
  ARRAY['Candidates must qualify for the NEET UG entrance exam.', 'Admission is based on the NEET score through state or national counseling.', 'Our team provides complete support through the counseling and admission procedure.', 'Documentation verification is conducted at the time of admission.'],
  ARRAY['Admit Card of NEET UG', 'NEET UG Scorecard/Rank Card', 'Class 10th & 12th Mark Sheets and Passing Certificates', 'ID Proof (Aadhar/PAN/Passport)', '8 Passport-size Photographs', 'Allotment Letter from Counseling Authority', 'Caste Certificate (if applicable)', 'Migration Certificate'],
  ARRAY['assets/images/colleges/iqcity/iq2.jpg', 'assets/images/colleges/iqcity/iq3.jpg', 'assets/images/colleges/iqcity/iq4.jpg', 'assets/images/colleges/iqcity/iq5.jpg'],
  ARRAY['MBBS', 'MD', 'MS', 'Nursing']),

('srims', 'Sri Ramkrishna Institute of Medical Sciences', 'assets/images/colleges/srims/srims-logo.png', 'Malandighi, Durgapur, West Bengal-713212, India', 'An esteemed medical institution in West Bengal', 'Contact us for detailed fee structure.', true, 'Sri Ramkrishna Institute of Medical Sciences (SRIMS), a unit of the Sanaka Educational Trust, is a premier medical college located in Durgapur. Established with the vision of providing quality healthcare and medical education, it is attached to the multi-specialty Sanaka Hospitals. The institution is dedicated to nurturing future medical professionals with a focus on comprehensive knowledge, practical skills, and compassionate patient care in a state-of-the-art learning environment.',
  ARRAY['NMC (National Medical Commission)'], 'The West Bengal University of Health Sciences (WBUHS)',
  ARRAY['Candidates must qualify in the NEET UG entrance examination conducted by NTA.', 'Admission is granted based on the NEET UG rank through the state counseling process.', 'Our admission cell provides guidance for the entire application and counseling procedure.', 'Selected candidates must undergo a document verification process upon reporting to the college.'],
  ARRAY['Admit Card of NEET UG', 'NEET UG Scorecard/Rank Card', 'Class 10th & 12th Mark Sheets and Passing Certificates', 'ID Proof (Aadhar/PAN/Passport)', '8 Passport-size Photographs', 'Allotment Letter issued by the Counseling Authority', 'Caste Certificate (if applicable)', 'Migration Certificate from previous board/university'],
  ARRAY['assets/images/colleges/srims/srims-campus-1.jpg', 'assets/images/colleges/srims/srims-hospital-wing.jpg', 'assets/images/colleges/srims/srims-classroom.jpg', 'assets/images/colleges/srims/srims-library.jpg'],
  ARRAY['MBBS', 'Paramedical', 'Nursing']),

('jims', 'Jagannath Gupta Institute of Medical Sciences and Hospital', 'assets/images/colleges/jims/jims-logo.png', 'Budge Budge, Kolkata, West Bengal, India', 'A prominent private medical college in Kolkata', 'Contact us for detailed fee structure.', true, 'Jagannath Gupta Institute of Medical Sciences and Hospital (JIMSH), established in 2016, is a leading medical institution run by the Urmila Devi Memorial Trust. Attached to a 720-bedded multi-specialty hospital, JIMSH is dedicated to providing high-quality, comprehensive medical education and producing skilled, ethical, and compassionate healthcare professionals to serve society.',
  ARRAY['NMC (National Medical Commission)'], 'The West Bengal University of Health Sciences (WBUHS)',
  ARRAY['Candidates must qualify in the NEET-UG examination.', 'Admission is conducted through the West Bengal state counseling process based on NEET rank.', 'An allotment letter is issued to the selected candidates by the counseling authority.', 'Candidates must report to the college for document verification and completion of admission formalities.'],
  ARRAY['Admit Card of NEET UG', 'NEET UG Scorecard/Rank Card', 'Allotment Letter', 'Class 10th & 12th Mark Sheets and Passing Certificates', 'ID Proof (Aadhar/PAN/Voter ID)', 'Passport-size Photographs', 'Caste Certificate (if applicable)', 'Migration Certificate'],
  ARRAY['assets/images/colleges/jims/jims-campus.jpg', 'assets/images/colleges/jims/jims-hospital.jpg', 'assets/images/colleges/jims/jims-classroom.jpg', 'assets/images/colleges/jims/jims-lab.jpg'],
  ARRAY['MBBS', 'MD', 'MS']),

('kpcmc', 'KPC Medical College and Hospital', 'assets/images/colleges/kpcmc/kpcmc-logo.png', 'Jadavpur, Kolkata, West Bengal', 'First modern private medical college in West Bengal', 'Contact us for detailed fee structure.', true, 'KPC Medical College and Hospital, established in 2006, is the first modern private medical college in West Bengal. It is renowned for providing world-class healthcare, excellent surgical facilities, and has a track record of producing state toppers in the MBBS examinations.',
  ARRAY['NMC (National Medical Commission)'], 'West Bengal University of Health Sciences',
  ARRAY['Candidates must qualify in the NEET UG (for MBBS) or NEET PG (for MD/MS) exams.', 'Admission is based on the NEET rank through the WB State Quota or Private Management Quota counseling (WBMCC).', 'Candidates must select the college during the choice-locking process.', 'Physical document verification and fee payment are required to confirm the admission.'],
  ARRAY['Admit Card of NEET', 'NEET Scorecard/Rank Card', 'Allotment Letter from WBMCC', 'Class 10th & 12th Mark Sheets and Certificates', 'ID Proof (Aadhar/PAN/Voter ID)', 'Passport-size Photographs', 'Caste Certificate (if applicable)', 'Migration Certificate'],
  ARRAY['assets/images/colleges/kpcmc/kpcmc-campus.jpg', 'assets/images/colleges/kpcmc/kpcmc-hospital.jpg', 'assets/images/colleges/kpcmc/kpcmc-library.jpg', 'assets/images/colleges/kpcmc/kpcmc-lab.jpg'],
  ARRAY['MBBS', 'MD/MS', 'Nursing']),

('gimsdurgapur', 'Gouri Devi Institute of Medical Sciences & Hospital', 'assets/images/colleges/gimsdurgapur/gims-logo.png', 'Durgapur, Paschim Bardhaman, West Bengal', 'A leading and prominent medical college in West Bengal', 'Contact us for detailed fee structure.', true, 'Established in 2016, Gouri Devi Institute of Medical Sciences & Hospital is a prominent medical institution aiming to provide quality training for future healthcare professionals. The college is attached to an 890-bed hospital with ultra-modern facilities and is committed to reducing the disparity in the national doctor-patient ratio.',
  ARRAY['NMC (National Medical Commission)'], 'West Bengal University of Health Sciences (WBUHS)',
  ARRAY['Candidates must appear for and qualify in the NEET UG examination.', 'Admission is processed through the state counseling (WBMCC) for both State and Management Quotas.', 'Aspirants must select the college during the choice-filling and locking stage.', 'Final admission is confirmed after physical document verification and fee payment at the college.'],
  ARRAY['Admit Card of NEET UG', 'NEET UG Scorecard/Rank Card', 'Allotment Letter from WBMCC', 'Class 10th & 12th Mark Sheets and Certificates', 'ID Proof (Aadhar/PAN/Voter ID)', 'Passport-size Photographs', 'Caste Certificate (if applicable)', 'Migration Certificate'],
  ARRAY['assets/images/colleges/gimsdurgapur/gims-campus.jpg', 'assets/images/colleges/gimsdurgapur/gims-hospital.jpg', 'assets/images/colleges/gimsdurgapur/gims-icu.jpg', 'assets/images/colleges/gimsdurgapur/gims-library.jpg'],
  ARRAY['MBBS', 'MD/MS', 'Paramedical']),

('smcbolpur', 'Santiniketan Medical College', 'assets/images/colleges/smcbolpur/smc-logo.png', 'Bolpur, Birbhum, West Bengal', 'A premier institute for medical education', 'Contact us for detailed fee structure.', true, 'Santiniketan Medical College, set up in 2020, is a premier institute that aspires to be a Centre of Excellence in medical education. The college emphasizes the overall growth of its students, aiming to create compassionate and accomplished healers in a modern learning environment.',
  ARRAY['NMC (National Medical Commission)'], 'West Bengal University of Health Sciences (WBUHS)',
  ARRAY['Candidates must qualify for the NEET-UG exam conducted by NTA.', 'Admission is granted through the state counseling process (WBMCC) based on NEET rank.', 'Candidates must choose Santiniketan Medical College during the choice-locking stage.', 'Final admission is subject to successful document verification and fee payment at the college.'],
  ARRAY['Admit Card of NEET UG', 'NEET UG Scorecard/Rank Card', 'Allotment Letter from WBMCC', 'Class 10th & 12th Mark Sheets and Certificates (with Physics, Chemistry, Biology)', 'ID Proof (Aadhar/PAN/Voter ID)', 'Passport-size Photographs', 'Caste Certificate (if applicable)', 'Migration Certificate'],
  ARRAY['assets/images/colleges/smcbolpur/smc-campus.jpg', 'assets/images/colleges/smcbolpur/smc-auditorium.jpg', 'assets/images/colleges/smcbolpur/smc-library.jpg', 'assets/images/colleges/smcbolpur/smc-hostel.jpg'],
  ARRAY['MBBS']),

('iimsr', 'ICARE Institute of Medical Science and Research', 'assets/images/colleges/iimsr/iimsr-logo.png', 'Haldia, Purba Medinipur, West Bengal', 'A renowned medical college for education and top-notch services', 'Contact us for detailed fee structure.', true, 'Established in 2011, ICARE Institute of Medical Science and Research is a renowned college focused on imparting a superior academic experience. It is attached to a 500-bed fully air-conditioned hospital and is equipped with advanced laboratories and facilities to provide strong practical experience.',
  ARRAY['NMC (National Medical Commission)'], 'West Bengal University of Health Sciences',
  ARRAY['Admission requires qualifying scores in the NEET UG (for MBBS) or NEET PG (for MD/MS) examinations.', 'Candidates must participate in the West Bengal state counseling process (WBMCC).', 'The college must be selected as the preferred choice during counseling.', 'Admission is finalized upon successful document verification and payment of fees at the institute.'],
  ARRAY['Admit Card of NEET', 'NEET Scorecard/Rank Card', 'Allotment Letter from WBMCC', 'Class 10th & 12th Mark Sheets and Certificates', 'ID Proof (Aadhar/PAN/Voter ID)', 'Passport-size Photographs', 'Caste Certificate (if applicable)', 'Migration Certificate'],
  ARRAY['assets/images/colleges/iimsr/iimsr-campus.jpg', 'assets/images/colleges/iimsr/iimsr-hospital.jpg', 'assets/images/colleges/iimsr/iimsr-lab.jpg', 'assets/images/colleges/iimsr/iimsr-library.jpg'],
  ARRAY['MBBS', 'MD/MS']),

('snu', 'Sister Nivedita University (SNU)', 'assets/images/colleges/snu/4.jpeg', 'Kolkata, West Bengal, India', 'Prominent private university in East India', 'Contact us for program-specific fees.', true, 'Sister Nivedita University (SNU) is a private university in Kolkata, West Bengal, offering a wide range of undergraduate, postgraduate, and doctoral programs across various disciplines.',
  ARRAY['UGC', 'AICTE', 'BCI'], 'Autonomous University',
  ARRAY['Admission is based on university-specific entrance tests (SNUET) or national level exam scores depending on the course.'],
  ARRAY['Class 10th & 12th Mark Sheets', 'ID Proof', 'Photographs', 'Entrance Exam Scorecard'],
  ARRAY['assets/images/colleges/snu/4.jpeg', 'assets/images/colleges/snu/snu2.jpg'],
  ARRAY['B.Tech in Computer Science', 'B.Tech in Mechanical Engineering', 'B.Tech in Electronics & Communication', 'B.Tech in Civil Engineering', 'BBA', 'LAW', 'Design', 'Pharmacy']),

('harvard', 'Harvard University', 'assets/images/colleges/harvard/1.jpeg', 'Cambridge, Massachusetts, USA', '#1 in many global rankings', 'Varies by program. Financial aid is available.', false, 'Harvard University is a private Ivy League research university in Cambridge, Massachusetts. Established in 1636, it is the oldest institution of higher learning in the United States.',
  ARRAY['Various US accreditation bodies'], 'Ivy League',
  ARRAY['Requires submission of SAT/ACT scores, essays, and letters of recommendation.', 'Highly competitive admission process.'],
  ARRAY['High school transcript', 'Standardized test scores', 'Application form', 'Essays'],
  ARRAY['assets/images/colleges/harvard/1.jpeg', 'assets/images/colleges/harvard/harvard2.jpg', 'assets/images/colleges/harvard/harvard3.jpg'],
  ARRAY['Law', 'Business', 'Medicine', 'Arts & Sciences']),

('stanford', 'Stanford University', 'assets/images/colleges/stanford/2.jpeg', 'Stanford, California, USA', 'Top 5 globally', 'Varies by program. Known for strong research funding.', false, 'Stanford University is a private research university in Stanford, California, known for its academic strength, wealth, and proximity to Silicon Valley.',
  ARRAY['WASC Senior College and University Commission'], 'N/A',
  ARRAY['Holistic review process including academic excellence, intellectual vitality, and personal context.'],
  ARRAY['Application with essays', 'High school transcript', 'Letters of recommendation', 'Standardized test scores (optional for some years).'],
  ARRAY['assets/images/colleges/stanford/2.jpeg', 'assets/images/colleges/stanford/stanford2.jpg', 'assets/images/colleges/stanford/stanford3.jpg'],
  ARRAY['Engineering', 'Computer Science', 'Business', 'Education']),

('oxford', 'University of Oxford', 'assets/images/colleges/oxford/5.jpeg', 'Oxford, England', 'Consistently ranked among the top 3 universities in the world.', 'Varies for UK and international students.', false, 'The University of Oxford is a collegiate research university in Oxford, England. There is evidence of teaching as early as 1096, making it the oldest university in the English-speaking world.',
  ARRAY['UK Government', 'Privy Council'], 'Russell Group, G5',
  ARRAY['Requires UCAS application, written tests for some subjects, and interviews.'],
  ARRAY['UCAS application', 'Personal statement', 'Academic references', 'Predicted grades.'],
  ARRAY['assets/images/colleges/oxford/5.jpeg', 'assets/images/colleges/oxford/oxford2.jpg'],
  ARRAY['Humanities', 'Mathematics', 'Medical Sciences', 'Social Sciences']),

('cambridge', 'University of Cambridge', 'assets/images/colleges/cambridge/6.jpeg', 'Cambridge, England', 'Consistently ranked among the top 3 universities in the world.', 'Varies for UK and international students.', false, 'The University of Cambridge is a collegiate public research university in Cambridge, England. Founded in 1209, it is the second-oldest university in the English-speaking world.',
  ARRAY['UK Government', 'Privy Council'], 'Russell Group, G5',
  ARRAY['Requires UCAS application, may require pre-interview assessments, and interviews at the college level.'],
  ARRAY['UCAS application', 'Personal statement', 'Academic references', 'SAQ (Supplementary Application Questionnaire).'],
  ARRAY['assets/images/colleges/cambridge/6.jpeg', 'assets/images/colleges/cambridge/cambridge2.jpg'],
  ARRAY['Natural Sciences', 'Engineering', 'Mathematics', 'Medicine'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  logo_image = EXCLUDED.logo_image,
  location = EXCLUDED.location,
  ranking = EXCLUDED.ranking,
  fees = EXCLUDED.fees,
  featured = EXCLUDED.featured,
  description = EXCLUDED.description,
  approved_by = EXCLUDED.approved_by,
  affiliated_to = EXCLUDED.affiliated_to,
  admission_process = EXCLUDED.admission_process,
  documents_required = EXCLUDED.documents_required,
  images = EXCLUDED.images,
  courses = EXCLUDED.courses;

-- === COURSES ===

INSERT INTO courses (id, name, description, image, specializations) VALUES
('mbbs', 'MBBS (Bachelor of Medicine, Bachelor of Surgery)', 'The MBBS is an undergraduate degree program in the medical field. It is a rigorous course that prepares students to become qualified doctors, covering subjects like anatomy, pharmacology, pathology, and practical surgery.', 'assets/images/courses/course-banner-mbbs.jpg', ARRAY[]::text[]),
('btech', 'B.Tech (Bachelor of Technology)', 'The Bachelor of Technology is an undergraduate engineering degree awarded for programs focusing on practical, skill-oriented training. It covers various specializations like Computer Science, Mechanical, Civil, and Electrical Engineering.', 'assets/images/courses/course-banner-btech.jpg', ARRAY['Computer Science', 'Mechanical Engineering', 'Electronics & Communication', 'Civil Engineering']),
('mtech', 'M.Tech (Master of Technology)', 'The Master of Technology is a postgraduate degree in engineering that provides advanced knowledge and specialization in a chosen field. It is research-intensive and prepares students for senior roles in industry and academia.', 'assets/images/courses/course-banner-mtech.jpg', ARRAY[]::text[]),
('bds', 'BDS (Bachelor of Dental Surgery)', 'The Bachelor of Dental Surgery is an undergraduate dentistry course. The program provides students with the knowledge and skills necessary to diagnose, treat, and prevent dental and oral diseases.', 'assets/images/courses/course-banner-bds.jpg', ARRAY[]::text[]),
('gnm', 'GNM (General Nursing and Midwifery)', 'General Nursing and Midwifery is a diploma course that trains students to work as nurses. The curriculum focuses on providing care to individuals, families, and communities, covering all aspects of healthcare.', 'assets/images/courses/course-banner-gnm.jpg', ARRAY[]::text[]),
('mba', 'MBA (Master of Business Administration)', 'The Master of Business Administration is a postgraduate degree focused on business management and leadership. It covers areas like marketing, finance, operations, and strategy to prepare graduates for managerial roles.', 'assets/images/courses/course-banner-mba.jpg', ARRAY[]::text[])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  specializations = EXCLUDED.specializations;

-- Re-enable RLS
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Make sure public read policies exist
DROP POLICY IF EXISTS "Allow public read access to colleges" ON colleges;
CREATE POLICY "Allow public read access to colleges" ON colleges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to courses" ON courses;
CREATE POLICY "Allow public read access to courses" ON courses FOR SELECT USING (true);

-- Allow anon inserts for contact form
DROP POLICY IF EXISTS "Allow anon insert to contact_submissions" ON contact_submissions;
CREATE POLICY "Allow anon insert to contact_submissions" ON contact_submissions FOR INSERT WITH CHECK (true);

SELECT '✅ Data restored successfully!' AS result;
SELECT COUNT(*) || ' colleges' FROM colleges;
SELECT COUNT(*) || ' courses' FROM courses;
