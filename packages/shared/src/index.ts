// ============================================================
// @magnma/shared - Shared types, constants, and utilities
// ============================================================

// --- College Types ---
export interface College {
  id: string;
  name: string;
  logoImage: string;
  location: string;
  ranking: string;
  fees: string;
  featured: boolean;
  description: string;
  approvedBy: string[];
  affiliatedTo: string;
  admissionProcess: string[];
  documentsRequired: string[];
  images: string[];
  courses: string[];
}

export interface CollegeSummary {
  id: string;
  name: string;
  logoImage: string;
  location: string;
  ranking: string;
  featured: boolean;
}

// --- Course Types ---
export interface Course {
  id: string;
  name: string;
  description: string;
  image?: string;
  specializations?: string[];
  featured?: boolean;
}

export interface CourseSummary {
  id: string;
  name: string;
  description: string;
  image?: string;
}

// --- Contact Types ---
export interface ContactFormData {
  name: string;
  email: string;
  number: string;
  date: string;
  time: string;
  message?: string;
  collegeApplyingFor?: string;
}

// --- API Response Types ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

// --- Office Locations ---
export interface OfficeLocation {
  id: string;
  city: string;
  address: string;
  phone: string;
  mapSrc: string;
}

export const OFFICE_LOCATIONS: OfficeLocation[] = [
  {
    id: "kolkata",
    city: "Kolkata",
    address: "88/1, Dr Abani Dutta Rd, Babudanga, Bandhaghat, Mali Panchghara, Howrah, West Bengal 711106",
    phone: "+91 7384736917",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.398935279261!2d88.3424185759685!3d22.5642449332207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0277154575b64b%3A0x43f9d5012574972!2s88%2C%201%2C%20Dr%20Abani%20Dutta%20Rd%2C%20Salkia%2C%20Howrah%2C%20West%20Bengal%20711106!5e0!3m2!1sen!2sin!4v1676288675765!5m2!1sen!2sin",
  },
  {
    id: "durgapur",
    city: "Durgapur",
    address: "A-11 ISPAT PALLY, Bidhannagar",
    phone: "+91 7384736917",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d457.3085369032905!2d87.33641751749151!3d23.51565356906591!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sA-11%20ISPAT%20PALLY%2C%20Bidhannagar!5e0!3m2!1sen!2sin!4v1752135809053!5m2!1sen!2sin",
  },
  {
    id: "bankura",
    city: "Bankura",
    address: "Junbedia Modh, Bankura Bodra",
    phone: "+91 7384736917",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14663.001541067042!2d87.04862592361133!3d23.25216874837705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f7a5fbc33cea67%3A0x1b154af159734264!2sJunbedia%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1752135577656!5m2!1sen!2sin",
  },
  {
    id: "prayagraj",
    city: "Prayagraj",
    address: "5A/3B, PC Banerjee Rd, The Adelphi, Allen Ganj, Prayagraj, Uttar Pradesh 211002",
    phone: "+91 7384736917",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3602.142613243592!2d81.86180807517285!3d25.466912977538264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399aca9dd92708eb%3A0x15c0842962ea9e4d!2s5A%2F3B%2C%20PC%20Banerjee%20Rd%2C%20The%20Adelphi%2C%20Allen%20Ganj%2C%20Prayagraj%2C%20Uttar%20Pradesh%20211002!5e0!3m2!1sen!2sin!4v1752135297236!5m2!1sen!2sin",
  },
];

// --- Services Data ---
export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
}

export const SERVICES: Service[] = [
  {
    id: "research",
    title: "RESEARCH",
    description: "We provide complete research and data on the best colleges available.",
    image: "assets/images/services/doctor.png",
  },
  {
    id: "admission",
    title: "ADMISSION & SCHOLARSHIP",
    description: "Application for worldwide colleges and scholarship applications.",
    image: "assets/images/services/doctor.png",
  },
  {
    id: "funding",
    title: "EDUCATION FUNDING",
    description: "Guidance for education loans to make studying less of a burden.",
    image: "assets/images/services/doctor.png",
  },
  {
    id: "coaching",
    title: "CAREER COACHING",
    description: "Personalized strategies and unwavering support to help you reach your career goals.",
    image: "assets/images/services/doctor.png",
  },
];

// --- Chatbot Data ---
export interface ChatbotIntent {
  keywords: string[];
  response: string;
  value?: string;
}

export const CHATBOT_INTENTS: Record<string, ChatbotIntent> = {
  greeting: {
    keywords: ["hello", "hi", "hey", "helo", "yo", "greetings"],
    response: "Hello! I'm MagnmaBot. You can ask about a specific course like 'CSE' or 'MBBS', or about our 'services'.",
  },
  coursesAndLevels: {
    keywords: ["courses", "course", "program", "programs", "major", "btech", "b.tech", "b tech"],
    response: "We offer guidance on a wide range of courses like CSE, ECE, MBBS, and more.",
    value: "courses",
  },
  services: {
    keywords: ["services", "what you do", "help", "support", "offer"],
    response: "We offer end-to-end support including Academic Research, International Admissions, Education Funding, and Career Coaching.",
    value: "services",
  },
  applicationProcess: {
    keywords: ["application", "apply", "admission", "admissions", "process", "how to apply", "intake", "deadline"],
    response: "Our admission process is designed to be smooth and straightforward. We handle everything from shortlisting universities to submitting your final application.",
    value: "contact",
  },
  visa: {
    keywords: ["visa", "visas", "immigration", "study permit", "post study work", "psw"],
    response: "We provide complete student visa assistance, from filling out forms to preparing you for the visa interview.",
    value: "contact",
  },
  contact: {
    keywords: ["contact", "phone", "email", "address", "location", "talk to", "speak to", "counselor", "appointment"],
    response: "You can reach us through our contact form, book a free appointment, or find our office addresses there.",
    value: "contact",
  },
  colleges: {
    keywords: ["college", "colleges", "universities", "university", "institution", "collge", "clg", "universty"],
    response: "We partner with many prestigious institutions. You can also ask me about a specific one like 'IQ City' or 'Heritage'.",
    value: "college",
  },
};

export const QUICK_REPLIES = [
  { text: "View Courses", value: "courses" },
  { text: "View Colleges", value: "college" },
  { text: "Contact Us", value: "contact" },
];

// --- Course Info for Chatbot ---
export const CHATBOT_COURSE_INFO: Record<string, string> = {
  cse: "Computer Science and Engineering (CSE) is a very popular choice. We have partnerships with top engineering colleges for this branch.",
  "cse aiml": "CSE with a specialization in AI & Machine Learning is a high-demand field. We can guide you on the best colleges with strong AI programs.",
  "cse data science": "CSE in Data Science is an excellent career choice. We offer expert counseling for universities known for their data science curriculum.",
  "cse cyber security": "CSE in Cyber Security is crucial in today's world. We can help you find colleges with specialized labs and faculty for this stream.",
  robotics: "Robotics and Automation is an exciting, hands-on field. We can connect you with colleges that have excellent robotics labs and faculty.",
  it: "Information Technology (IT) is a core branch with wide applications. We provide counseling for top IT programs in various universities.",
  ece: "Electronics and Communication Engineering (ECE) is a fundamental branch with great scope. We can help you explore top ECE colleges.",
  mechanical: "Mechanical Engineering is a classic branch with diverse opportunities. We can help you find the best universities for it.",
  civil: "Civil Engineering is all about building the future. We provide guidance for top colleges in this field.",
  aerospace: "Aerospace Engineering is a dream for many. We can guide you on the specialized institutions offering this course.",
  biotechnology: "Biotechnology is a fascinating mix of biology and technology. We have partner institutions with strong biotech departments.",
  biomedical: "Biomedical Engineering combines medicine with engineering to solve healthcare challenges. It's a noble and growing field.",
  mbbs: "MBBS (Bachelor of Medicine, Bachelor of Surgery) is the path to becoming a doctor. We provide comprehensive guidance for medical school admissions, both domestic and abroad.",
  "mbbs surgeon": "To become a surgeon, you first complete your MBBS and then pursue a Master of Surgery (MS). We can guide you through the entire pathway.",
  bds: "BDS (Bachelor of Dental Surgery) is the primary degree for a career in dentistry. We can help you navigate the admissions process for top dental colleges.",
  bams: "BAMS (Bachelor of Ayurvedic Medicine and Surgery) is a wonderful traditional system of medicine. We can guide you on the best Ayurvedic colleges.",
  "bvsc & ah": "BVSc & AH is the path to becoming a veterinarian. We assist with admissions to colleges known for their veterinary science programs.",
  bhms: "BHMS (Bachelor of Homeopathic Medicine and Surgery) is a popular alternative medicine field. We can provide information on leading homeopathic institutions.",
};
