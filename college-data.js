// --- COMPLETE AND CLEANED college-data.js ---


const colleges = {
  // --- Correct and verified entry ---
  "iq-city": {
    name: "IQ City Medical College",
    logoImage: "collegeImages/iqcity/iq.png",
    location: "Durgapur, West Bengal-713212, India",
    ranking: "Top Medical College in West Bengal",
    fees: "Contact us for detailed fee structure.",
    featured: true,
    description:
      "IQ City Medical College, located in Durgapur, West Bengal, is a leading private medical institution dedicated to providing high-quality medical education and healthcare services. Established in 2013, the college is part of the IQ City Health and Knowledge Campus, which spans a vast area and includes state-of-the-art facilities. The college is committed to producing competent and compassionate medical professionals through a rigorous curriculum, hands-on clinical training, and a focus on research and innovation.",
    approvedBy: ["NMC (National Medical Commission)", "WHO"],
    affiliatedTo: "West Bengal University of Health Sciences (WBUHS)",
    admissionProcess: [
      "Candidates must qualify for the NEET UG entrance exam.",
      "Admission is based on the NEET score through state or national counseling.",
      "Our team provides complete support through the counseling and admission procedure.",
      "Documentation verification is conducted at the time of admission.",
    ],
    documentsRequired: [
      "Admit Card of NEET UG",
      "NEET UG Scorecard/Rank Card",
      "Class 10th & 12th Mark Sheets and Passing Certificates",
      "ID Proof (Aadhar/PAN/Passport)",
      "8 Passport-size Photographs",
      "Allotment Letter from Counseling Authority",
      "Caste Certificate (if applicable)",
      "Migration Certificate",
    ],
    images: [
      "collegeImages/iqcity/iq2.jpg",
      "collegeImages/iqcity/iq3.jpg",
      "collegeImages/iqcity/iq4.jpg",
      "collegeImages/iqcity/iq5.jpg",
    ],
    courses: ["MBBS", "MD", "MS", "Nursing"],
  },

  // --- Verified entry ---
  srims: {
    name: "Sri Ramkrishna Institute of Medical Sciences",
    logoImage: "collegeImages/srims/srims-logo.png",
    location: "Malandighi, Durgapur, West Bengal-713212, India",
    ranking: "An esteemed medical institution in West Bengal",
    fees: "Contact us for detailed fee structure.",
    featured: true,
    description:
      "Sri Ramkrishna Institute of Medical Sciences (SRIMS), a unit of the Sanaka Educational Trust, is a premier medical college located in Durgapur. Established with the vision of providing quality healthcare and medical education, it is attached to the multi-specialty Sanaka Hospitals. The institution is dedicated to nurturing future medical professionals with a focus on comprehensive knowledge, practical skills, and compassionate patient care in a state-of-the-art learning environment.",
    approvedBy: ["NMC (National Medical Commission)"],
    affiliatedTo: "The West Bengal University of Health Sciences (WBUHS)",
    admissionProcess: [
      "Candidates must qualify in the NEET UG entrance examination conducted by NTA.",
      "Admission is granted based on the NEET UG rank through the state counseling process.",
      "Our admission cell provides guidance for the entire application and counseling procedure.",
      "Selected candidates must undergo a document verification process upon reporting to the college.",
    ],
    documentsRequired: [
      "Admit Card of NEET UG",
      "NEET UG Scorecard/Rank Card",
      "Class 10th & 12th Mark Sheets and Passing Certificates",
      "ID Proof (Aadhar/PAN/Passport)",
      "8 Passport-size Photographs",
      "Allotment Letter issued by the Counseling Authority",
      "Caste Certificate (if applicable)",
      "Migration Certificate from previous board/university",
    ],
    images: [
      "collegeImages/srims/srims-campus-1.jpg",
      "collegeImages/srims/srims-hospital-wing.jpg",
      "collegeImages/srims/srims-classroom.jpg",
      "collegeImages/srims/srims-library.jpg",
    ],
    courses: ["MBBS", "Paramedical", "Nursing"],
  },

  // --- Verified entry ---
  jims: {
    name: "Jagannath Gupta Institute of Medical Sciences and Hospital",
    logoImage: "collegeImages/jims/jims-logo.png",
    location: "Budge Budge, Kolkata, West Bengal, India",
    ranking: "A prominent private medical college in Kolkata",
    featured: true,
    fees: "Contact us for detailed fee structure.",
    description:
      "Jagannath Gupta Institute of Medical Sciences and Hospital (JIMSH), established in 2016, is a leading medical institution run by the Urmila Devi Memorial Trust. Attached to a 720-bedded multi-specialty hospital, JIMSH is dedicated to providing high-quality, comprehensive medical education and producing skilled, ethical, and compassionate healthcare professionals to serve society.",
    approvedBy: ["NMC (National Medical Commission)"],
    affiliatedTo: "The West Bengal University of Health Sciences (WBUHS)",
    admissionProcess: [
      "Candidates must qualify in the NEET-UG examination.",
      "Admission is conducted through the West Bengal state counseling process based on NEET rank.",
      "An allotment letter is issued to the selected candidates by the counseling authority.",
      "Candidates must report to the college for document verification and completion of admission formalities.",
    ],
    documentsRequired: [
      "Admit Card of NEET UG",
      "NEET UG Scorecard/Rank Card",
      "Allotment Letter",
      "Class 10th & 12th Mark Sheets and Passing Certificates",
      "ID Proof (Aadhar/PAN/Voter ID)",
      "Passport-size Photographs",
      "Caste Certificate (if applicable)",
      "Migration Certificate",
    ],
    images: [
      "collegeImages/jims/jims-campus.jpg",
      "collegeImages/jims/jims-hospital.jpg",
      "collegeImages/jims/jims-classroom.jpg",
      "collegeImages/jims/jims-lab.jpg",
    ],
    courses: ["MBBS", "MD", "MS"],
  },

  // --- NEWLY ADDED AND VERIFIED ENTRY (KPC) ---
  kpcmc: {
    name: "KPC Medical College and Hospital",
    logoImage: "collegeImages/kpcmc/kpcmc-logo.png",
    location: "Jadavpur, Kolkata, West Bengal",
    ranking: "First modern private medical college in West Bengal",
    featured: true,
    fees: "Contact us for detailed fee structure.",
    description:
      "KPC Medical College and Hospital, established in 2006, is the first modern private medical college in West Bengal. It is renowned for providing world-class healthcare, excellent surgical facilities, and has a track record of producing state toppers in the MBBS examinations.",
    approvedBy: ["NMC (National Medical Commission)"],
    affiliatedTo: "West Bengal University of Health Sciences",
    admissionProcess: [
      "Candidates must qualify in the NEET UG (for MBBS) or NEET PG (for MD/MS) exams.",
      "Admission is based on the NEET rank through the WB State Quota or Private Management Quota counseling (WBMCC).",
      "Candidates must select the college during the choice-locking process.",
      "Physical document verification and fee payment are required to confirm the admission.",
    ],
    documentsRequired: [
      "Admit Card of NEET",
      "NEET Scorecard/Rank Card",
      "Allotment Letter from WBMCC",
      "Class 10th & 12th Mark Sheets and Certificates",
      "ID Proof (Aadhar/PAN/Voter ID)",
      "Passport-size Photographs",
      "Caste Certificate (if applicable)",
      "Migration Certificate",
    ],
    images: [
      "collegeImages/kpcmc/kpcmc-campus.jpg",
      "collegeImages/kpcmc/kpcmc-hospital.jpg",
      "collegeImages/kpcmc/kpcmc-library.jpg",
      "collegeImages/kpcmc/kpcmc-lab.jpg",
    ],
    courses: ["MBBS", "MD/MS", "Nursing"],
  },

  // --- NEWLY ADDED AND VERIFIED ENTRY (GOURI DEVI) ---
  gimsdurgapur: {
    name: "Gouri Devi Institute of Medical Sciences & Hospital",
    logoImage: "collegeImages/gimsdurgapur/gims-logo.png",
    location: "Durgapur, Paschim Bardhaman, West Bengal",
    ranking: "A leading and prominent medical college in West Bengal",
    featured: true,
    fees: "Contact us for detailed fee structure.",
    description:
      "Established in 2016, Gouri Devi Institute of Medical Sciences & Hospital is a prominent medical institution aiming to provide quality training for future healthcare professionals. The college is attached to an 890-bed hospital with ultra-modern facilities and is committed to reducing the disparity in the national doctor-patient ratio.",
    approvedBy: ["NMC (National Medical Commission)"],
    affiliatedTo: "West Bengal University of Health Sciences (WBUHS)",
    admissionProcess: [
      "Candidates must appear for and qualify in the NEET UG examination.",
      "Admission is processed through the state counseling (WBMCC) for both State and Management Quotas.",
      "Aspirants must select the college during the choice-filling and locking stage.",
      "Final admission is confirmed after physical document verification and fee payment at the college.",
    ],
    documentsRequired: [
      "Admit Card of NEET UG",
      "NEET UG Scorecard/Rank Card",
      "Allotment Letter from WBMCC",
      "Class 10th & 12th Mark Sheets and Certificates",
      "ID Proof (Aadhar/PAN/Voter ID)",
      "Passport-size Photographs",
      "Caste Certificate (if applicable)",
      "Migration Certificate",
    ],
    images: [
      "collegeImages/gimsdurgapur/gims-campus.jpg",
      "collegeImages/gimsdurgapur/gims-hospital.jpg",
      "collegeImages/gimsdurgapur/gims-icu.jpg",
      "collegeImages/gimsdurgapur/gims-library.jpg",
    ],
    courses: ["MBBS", "MD/MS", "Paramedical"],
  },

  // --- NEWLY ADDED AND VERIFIED ENTRY (SANTINIKETAN) ---
  smcbolpur: {
    name: "Santiniketan Medical College",
    logoImage: "collegeImages/smcbolpur/smc-logo.png",
    location: "Bolpur, Birbhum, West Bengal",
    ranking: "A premier institute for medical education",
    featured: true,
    fees: "Contact us for detailed fee structure.",
    description:
      "Santiniketan Medical College, set up in 2020, is a premier institute that aspires to be a Centre of Excellence in medical education. The college emphasizes the overall growth of its students, aiming to create compassionate and accomplished healers in a modern learning environment.",
    approvedBy: ["NMC (National Medical Commission)"],
    affiliatedTo: "West Bengal University of Health Sciences (WBUHS)",
    admissionProcess: [
      "Candidates must qualify for the NEET-UG exam conducted by NTA.",
      "Admission is granted through the state counseling process (WBMCC) based on NEET rank.",
      "Candidates must choose Santiniketan Medical College during the choice-locking stage.",
      "Final admission is subject to successful document verification and fee payment at the college.",
    ],
    documentsRequired: [
      "Admit Card of NEET UG",
      "NEET UG Scorecard/Rank Card",
      "Allotment Letter from WBMCC",
      "Class 10th & 12th Mark Sheets and Certificates (with Physics, Chemistry, Biology)",
      "ID Proof (Aadhar/PAN/Voter ID)",
      "Passport-size Photographs",
      "Caste Certificate (if applicable)",
      "Migration Certificate",
    ],
    images: [
      "collegeImages/smcbolpur/smc-campus.jpg",
      "collegeImages/smcbolpur/smc-auditorium.jpg",
      "collegeImages/smcbolpur/smc-library.jpg",
      "collegeImages/smcbolpur/smc-hostel.jpg",
    ],
    courses: ["MBBS"],
  },

  // --- NEWLY ADDED AND VERIFIED ENTRY (ICARE) ---
  iimsr: {
    name: "ICARE Institute of Medical Science and Research",
    logoImage: "collegeImages/iimsr/iimsr-logo.png",
    location: "Haldia, Purba Medinipur, West Bengal",
    ranking: "A renowned medical college for education and top-notch services",
    fees: "Contact us for detailed fee structure.",
    featured: true,
    description:
      "Established in 2011, ICARE Institute of Medical Science and Research is a renowned college focused on imparting a superior academic experience. It is attached to a 500-bed fully air-conditioned hospital and is equipped with advanced laboratories and facilities to provide strong practical experience.",
    approvedBy: ["NMC (National Medical Commission)"],
    affiliatedTo: "West Bengal University of Health Sciences",
    admissionProcess: [
      "Admission requires qualifying scores in the NEET UG (for MBBS) or NEET PG (for MD/MS) examinations.",
      "Candidates must participate in the West Bengal state counseling process (WBMCC).",
      "The college must be selected as the preferred choice during counseling.",
      "Admission is finalized upon successful document verification and payment of fees at the institute.",
    ],
    documentsRequired: [
      "Admit Card of NEET",
      "NEET Scorecard/Rank Card",
      "Allotment Letter from WBMCC",
      "Class 10th & 12th Mark Sheets and Certificates",
      "ID Proof (Aadhar/PAN/Voter ID)",
      "Passport-size Photographs",
      "Caste Certificate (if applicable)",
      "Migration Certificate",
    ],
    images: [
      "collegeImages/iimsr/iimsr-campus.jpg",
      "collegeImages/iimsr/iimsr-hospital.jpg",
      "collegeImages/iimsr/iimsr-lab.jpg",
      "collegeImages/iimsr/iimsr-library.jpg",
    ],
    courses: ["MBBS", "MD/MS"],
  },

  // --- CLEANED PLACEHOLDER ENTRIES (REQUIRE CORRECT DATA) ---
  harvard: {
    name: "Harvard University",
    logoImage: "collegeImages/harvard/1.jpeg",
    location: "Cambridge, Massachusetts, USA",

    ranking: "#1 in many global rankings",
    fees: "Varies by program. Financial aid is available.",
    description:
      "Harvard University is a private Ivy League research university in Cambridge, Massachusetts. Established in 1636, it is the oldest institution of higher learning in the United States.",
    approvedBy: ["Various US accreditation bodies"],
    affiliatedTo: "Ivy League",
    admissionProcess: [
      "Requires submission of SAT/ACT scores, essays, and letters of recommendation.",
      "Highly competitive admission process.",
    ],
    documentsRequired: [
      "High school transcript",
      "Standardized test scores",
      "Application form",
      "Essays",
    ],
    images: [
      "collegeImages/harvard/1.jpeg",
      "collegeImages/harvard/harvard2.jpg",
      "collegeImages/harvard/harvard3.jpg",
    ],
    courses: ["Law", "Business", "Medicine", "Arts & Sciences"],
  },
  stanford: {
    name: "Stanford University",
    logoImage: "collegeImages/stanford/2.jpeg",
    location: "Stanford, California, USA",
    ranking: "Top 5 globally",

    fees: "Varies by program. Known for strong research funding.",
    description:
      "Stanford University is a private research university in Stanford, California, known for its academic strength, wealth, and proximity to Silicon Valley.",
    approvedBy: ["WASC Senior College and University Commission"],
    affiliatedTo: "N/A",
    admissionProcess: [
      "Holistic review process including academic excellence, intellectual vitality, and personal context.",
    ],
    documentsRequired: [
      "Application with essays",
      "High school transcript",
      "Letters of recommendation",
      "Standardized test scores (optional for some years).",
    ],
    images: [
      "collegeImages/stanford/2.jpeg",
      "collegeImages/stanford/stanford2.jpg",
      "collegeImages/stanford/stanford3.jpg",
    ],
    courses: ["Engineering", "Computer Science", "Business", "Education"],
  },
  snu: {
    name: "Sister Nivedita University (SNU)",
    logoImage: "collegeImages/snu/4.jpeg",
    location: "Kolkata, West Bengal, India",
    featured: true,
    ranking: "Prominent private university in East India",
    fees: "Contact us for program-specific fees.",
    description:
      "Sister Nivedita University (SNU) is a private university in Kolkata, West Bengal, offering a wide range of undergraduate, postgraduate, and doctoral programs across various disciplines.",
    approvedBy: ["UGC", "AICTE", "BCI"],
    affiliatedTo: "Autonomous University",
    admissionProcess: [
      "Admission is based on university-specific entrance tests (SNUET) or national level exam scores depending on the course.",
    ],
    documentsRequired: [
      "Class 10th & 12th Mark Sheets",
      "ID Proof",
      "Photographs",
      "Entrance Exam Scorecard",
    ],
    images: ["collegeImages/snu/4.jpeg", "collegeImages/snu/snu2.jpg"],
    courses: [
      "B.Tech in Computer Science",
      "B.Tech in Mechanical Engineering",
      "B.Tech in Electronics & Communication",
      "B.Tech in Civil Engineering",
      // Other courses remain the same
      "BBA",
      "LAW",
      "Design",
      "Pharmacy",
    ],
  },
  oxford: {
    name: "University of Oxford",
    logoImage: "collegeImages/oxford/5.jpeg",
    location: "Oxford, England",

    ranking: "Consistently ranked among the top 3 universities in the world.",
    fees: "Varies for UK and international students.",
    description:
      "The University of Oxford is a collegiate research university in Oxford, England. There is evidence of teaching as early as 1096, making it the oldest university in the English-speaking world.",
    approvedBy: ["UK Government", "Privy Council"],
    affiliatedTo: "Russell Group, G5",
    admissionProcess: [
      "Requires UCAS application, written tests for some subjects, and interviews.",
    ],
    documentsRequired: [
      "UCAS application",
      "Personal statement",
      "Academic references",
      "Predicted grades.",
    ],
    images: ["collegeImages/oxford/5.jpeg", "collegeImages/oxford/oxford2.jpg"],
    courses: [
      "Humanities",
      "Mathematics",
      "Medical Sciences",
      "Social Sciences",
    ],
  },
  cambridge: {
    name: "University of Cambridge",
    logoImage: "collegeImages/cambridge/6.jpeg",
    location: "Cambridge, England",

    ranking: "Consistently ranked among the top 3 universities in the world.",
    fees: "Varies for UK and international students.",
    description:
      "The University of Cambridge is a collegiate public research university in Cambridge, England. Founded in 1209, it is the second-oldest university in the English-speaking world.",
    approvedBy: ["UK Government", "Privy Council"],
    affiliatedTo: "Russell Group, G5",
    admissionProcess: [
      "Requires UCAS application, may require pre-interview assessments, and interviews at the college level.",
    ],
    documentsRequired: [
      "UCAS application",
      "Personal statement",
      "Academic references",
      "SAQ (Supplementary Application Questionnaire).",
    ],
    images: [
      "collegeImages/cambridge/6.jpeg",
      "collegeImages/cambridge/cambridge2.jpg",
    ],
    courses: [
      "Natural Sciences",
      "Engineering",
      "History",
      "B.Tech in Computer Science",
      "Economics",
    ],
  },
};

