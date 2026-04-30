// ============================================================
// Chatbot Engine - NLP, Entity Extraction & Recommendation
// ============================================================

import { supabase } from "./supabase";
import {
  SERVICES,
  OFFICE_LOCATIONS,
  type College,
  type Course,
} from "@magnma/shared";
import { COLLEGES_DATA, COURSES_DATA } from "@magnma/shared/data.js";

// --- Types ---
export interface CollegeCard {
  id: string;
  name: string;
  location: string;
  ranking: string;
  image: string;
  courses: string[];
}

export interface QuickAction {
  label: string;
  action: "navigate" | "intent" | "recommend" | "call" | "collect";
  value?: string;
}

export interface BotResponse {
  text: string;
  cards?: CollegeCard[];
  quickActions: QuickAction[];
}

export interface ConversationContext {
  lastIntent: string | null;
  lastCourse: string | null;
  lastLocation: string | null;
  lastCollege: string | null;
  userName: string | null;
  collectedData: Partial<LeadData>;
}

export interface LeadData {
  name: string;
  email: string;
  phone: string;
  interestedCourse: string;
  interestedCollege: string;
  preferredLocation: string;
}

// --- Synonym Maps for Entity Extraction ---
const COURSE_SYNONYMS: Record<string, string[]> = {
  mbbs: ["mbbs", "medical", "doctor", "medicine", "bachelor of medicine", "neet", "neet ug"],
  bds: ["bds", "dental", "dentistry", "dentist", "bachelor of dental surgery"],
  btech: ["btech", "b.tech", "be", "b.e", "engineering", "computer science", "cse", "mechanical", "civil", "ece", "electrical"],
  mtech: ["mtech", "m.tech", "master of technology", "me"],
  mba: ["mba", "business administration", "management", "business"],
  gnm: ["gnm", "nursing", "nurse", "general nursing", "midwifery"],
  law: ["law", "llb", "legal", "lawyer", "ba llb", "bballb"],
  pharmacy: ["pharmacy", "pharma", "bpharm", "dpharm", "b.pharm"],
  md: ["md", "doctor of medicine", "postgraduate medicine"],
  ms: ["ms", "master of surgery", "master surgery"],
  paramedical: ["paramedical", "paramedic", "allied health"],
};

const LOCATION_SYNONYMS: Record<string, string[]> = {
  kolkata: ["kolkata", "calcutta", "howrah", "jadavpur", "budge budge", "salt lake", "newtown"],
  durgapur: ["durgapur", "bardhaman", "paschim bardhaman", "malandighi", "bidhannagar", "city center"],
  bankura: ["bankura", "bodra", "junbedia"],
  bolpur: ["bolpur", "birbhum", "santiniketan", "shantiniketan"],
  haldia: ["haldia", "purba medinipur", "medinipur", "tamluk"],
  prayagraj: ["prayagraj", "allahabad", "uttar pradesh", "up"],
};

const COLLEGE_ALIASES: Record<string, string[]> = {
  "iq-city": ["iq city", "iqcity", "iq city medical", "iq medical"],
  srims: ["srims", "sri ramkrishna", "ramkrishna", "sanaka"],
  jims: ["jims", "jagannath gupta", "jagannath institute"],
  kpcmc: ["kpc", "kpc medical", "kpcmc", "kpc hospital"],
  gimsdurgapur: ["gouri devi", "gims", "gouri devi institute"],
  smcbolpur: ["santiniketan medical", "smc", "santiniketan college"],
  iimsr: ["icare", "iimsr", "icare institute", "icare haldia"],
  snu: ["sister nivedita", "snu", "sister nivedita university"],
  harvard: ["harvard", "harvard university"],
  stanford: ["stanford", "stanford university"],
  oxford: ["oxford", "university of oxford"],
  cambridge: ["cambridge", "university of cambridge"],
};

// --- Intent Detection Patterns ---
interface IntentPattern {
  name: string;
  patterns: RegExp[];
  priority: number;
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    name: "greeting",
    patterns: [/\b(hello|hi|hey|greetings|good morning|good afternoon|good evening|howdy|hola|namaste|sup)\b/i],
    priority: 1,
  },
  {
    name: "goodbye",
    patterns: [/\b(bye|goodbye|see you|later|take care|ttyl|catch you)\b/i],
    priority: 1,
  },
  {
    name: "thanks",
    patterns: [/\b(thanks|thank you|appreciate|grateful|ty|thx|cheers)\b/i],
    priority: 1,
  },
  {
    name: "college_recommendation",
    patterns: [
      /\b(best|top|good|reputed|which|suggest|recommend|find|search|looking for).*(college|colleges|university|universities|institution|institutions|school|schools)\b/i,
      /\b(college|colleges|university|universities).*(in|at|near|for|offering|with)\b/i,
      /\b(show|list|give|tell).*(college|colleges|university|universities)\b/i,
    ],
    priority: 2,
  },
  {
    name: "course_inquiry",
    patterns: [
      /\b(course|program|degree|study|learn|branch|stream).*(about|in|for|mbbs|btech|mba|bds|mtech|gnm)\b/i,
      /\b(mbbs|btech|mba|bds|mtech|gnm|law|pharmacy|md|ms).*(course|program|details|info|about)\b/i,
      /\bwhat.*(course|program|study).*(can|should|do|available)\b/i,
    ],
    priority: 2,
  },
  {
    name: "specific_college",
    patterns: [
      /\b(iq city|srims|jims|kpcmc|gouri devi|santiniketan|icare|snu|harvard|stanford|oxford|cambridge)\b/i,
    ],
    priority: 3,
  },
  {
    name: "admission_process",
    patterns: [
      /\b(admission|apply|application|process|how to get in|eligibility|requirement|criteria|get admission)\b/i,
      /\b(how.*apply|how.*get in|what.*need|what.*require)\b/i,
    ],
    priority: 2,
  },
  {
    name: "fees",
    patterns: [/\b(fee|fees|cost|price|tuition|expensive|cheap|budget|affordable|money|pay)\b/i],
    priority: 2,
  },
  {
    name: "documents",
    patterns: [/\b(document|documents|paper|papers|requirement|needed|bring|submit|checklist)\b/i],
    priority: 2,
  },
  {
    name: "services",
    patterns: [
      /\b(service|services|what do you do|help|support|offer|provide|consult|consultancy|guidance)\b/i,
    ],
    priority: 2,
  },
  {
    name: "contact",
    patterns: [
      /\b(contact|call|phone|email|reach|talk|speak|counselor|appointment|book|schedule|visit|callback)\b/i,
    ],
    priority: 2,
  },
  {
    name: "location",
    patterns: [/\b(location|address|office|where|located|place|city|reach you|find you)\b/i],
    priority: 2,
  },
  {
    name: "visa",
    patterns: [/\b(visa|immigration|study permit|passport|embassy|consulate|student visa|i20)\b/i],
    priority: 2,
  },
  {
    name: "scholarship",
    patterns: [/\b(scholarship|financial aid|fund|funding|loan|education loan|money|stipend)\b/i],
    priority: 2,
  },
  {
    name: "blog",
    patterns: [/\b(blog|article|news|update|insight|read|post|latest)\b/i],
    priority: 2,
  },
  {
    name: "about",
    patterns: [/\b(about|who are you|magnma|company|firm|established|history|background)\b/i],
    priority: 2,
  },
  {
    name: "compare",
    patterns: [/\b(compare|comparison|difference|vs|versus|better than|which is better)\b/i],
    priority: 2,
  },
  {
    name: "eligibility",
    patterns: [/\b(eligible|eligibility|qualify|qualification|criteria|requirement|marks|percentage|score)\b/i],
    priority: 2,
  },
  {
    name: "entrance_exam",
    patterns: [/\b(neet|jee|wbjee|entrance|exam|examination|test|rank|score|cutoff|cut off)\b/i],
    priority: 2,
  },
];

// --- Fuzzy Matching Utilities ---
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

function fuzzyMatchWord(word: string, target: string, maxDistance = 2): boolean {
  const dist = levenshteinDistance(word.toLowerCase(), target.toLowerCase());
  return dist <= maxDistance && Math.abs(word.length - target.length) <= maxDistance;
}

// --- Entity Extraction ---
function extractEntities(input: string): {
  course: string | null;
  location: string | null;
  college: string | null;
  intent: string;
  isRankingQuery: boolean;
  isFeeQuery: boolean;
} {
  const lower = input.toLowerCase().trim();
  let course: string | null = null;
  let location: string | null = null;
  let college: string | null = null;

  // Extract course
  for (const [key, synonyms] of Object.entries(COURSE_SYNONYMS)) {
    if (synonyms.some((s) => lower.includes(s))) {
      course = key;
      break;
    }
  }

  // Extract location
  for (const [key, synonyms] of Object.entries(LOCATION_SYNONYMS)) {
    if (synonyms.some((s) => lower.includes(s))) {
      location = key;
      break;
    }
  }

  // Extract specific college (including aliases)
  for (const [id, aliases] of Object.entries(COLLEGE_ALIASES)) {
    if (aliases.some((a) => lower.includes(a))) {
      college = id;
      break;
    }
  }
  // Also try fuzzy matching college names
  if (!college) {
    for (const c of COLLEGES_DATA) {
      const nameWords = c.name.toLowerCase().split(/\s+/);
      if (nameWords.some((nw) => lower.includes(nw)) || fuzzyMatchWord(lower, c.id, 1)) {
        college = c.id;
        break;
      }
    }
  }

  // Determine intent
  let intent = "unknown";
  let bestPriority = Infinity;
  for (const pattern of INTENT_PATTERNS) {
    if (pattern.patterns.some((p) => p.test(lower))) {
      if (pattern.priority < bestPriority) {
        intent = pattern.name;
        bestPriority = pattern.priority;
      }
    }
  }

  // If user mentions a course but no clear intent, treat as course_inquiry
  if (intent === "unknown" && course) {
    intent = "course_inquiry";
  }

  // If user mentions a college but no clear intent, treat as specific_college
  if (intent === "unknown" && college) {
    intent = "specific_college";
  }

  const isRankingQuery = /\b(best|top|good|reputed|ranking|ranked|excellent|premier|leading|prominent)\b/i.test(
    lower
  );
  const isFeeQuery = /\b(fee|fees|cost|price|tuition|expensive|cheap|budget|affordable|money|pay)\b/i.test(
    lower
  );

  return { course, location, college, intent, isRankingQuery, isFeeQuery };
}

// --- Supabase Data Fetching with Fallback ---
function mapSupabaseCollege(row: any): College {
  return {
    id: row.id,
    name: row.name,
    logoImage: row.logo_image || "",
    location: row.location || "",
    ranking: row.ranking || "",
    fees: row.fees || "",
    featured: row.featured || false,
    description: row.description || "",
    approvedBy: row.approved_by || [],
    affiliatedTo: row.affiliated_to || "",
    admissionProcess: row.admission_process || [],
    documentsRequired: row.documents_required || [],
    images: row.images || [],
    courses: row.courses || [],
  };
}

async function fetchColleges(): Promise<College[]> {
  try {
    const { data, error } = await supabase.from("colleges").select("*");
    if (error) throw error;
    return (data || []).map(mapSupabaseCollege);
  } catch {
    return COLLEGES_DATA;
  }
}

async function fetchCourses(): Promise<Course[]> {
  try {
    const { data, error } = await supabase.from("courses").select("*");
    if (error) throw error;
    return (data as Course[]) || [];
  } catch {
    return COURSES_DATA;
  }
}

async function fetchBlogPosts(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3);
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

// --- Recommendation Engine ---
async function getRecommendations(
  course: string | null,
  location: string | null,
  ranking: boolean
): Promise<{ colleges: College[]; message: string }> {
  const colleges = await fetchColleges();

  let filtered = colleges.filter((c) => {
    const matchCourse =
      !course ||
      c.courses.some((cr) => cr.toLowerCase().includes(course.toLowerCase()));
    const matchLocation =
      !location || c.location.toLowerCase().includes(location.toLowerCase());
    return matchCourse && matchLocation;
  });

  if (ranking) {
    filtered = filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  const topColleges = filtered.slice(0, 5);

  let message = "";
  if (topColleges.length === 0) {
    message =
      "I couldn't find colleges matching your exact criteria. Here are some popular options from our partners:";
    return { colleges: colleges.filter((c) => c.featured).slice(0, 5), message };
  } else if (course && location) {
    message = `Here are the best colleges for <strong>${course.toUpperCase()}</strong> in <strong>${location.charAt(0).toUpperCase() + location.slice(1)}</strong>:`;
  } else if (course) {
    message = `Here are the top colleges offering <strong>${course.toUpperCase()}</strong>:`;
  } else if (location) {
    message = `Here are colleges in <strong>${location.charAt(0).toUpperCase() + location.slice(1)}</strong>:`;
  } else {
    message = "Here are our featured partner colleges:";
  }

  return { colleges: topColleges, message };
}

// --- Response Generators ---

function generateGreeting(context: ConversationContext): BotResponse {
  const hour = new Date().getHours();
  let greeting = "Hello";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 17) greeting = "Good afternoon";
  else greeting = "Good evening";

  const text = context.userName
    ? `${greeting}, ${context.userName}! Welcome back to Magnma Institute. How can I help you today?`
    : `${greeting}! I'm <strong>MagnmaBot</strong>, your education consultant. I can help you find colleges, explore courses, check admission processes, or book a counseling session. What are you looking for?`;

  return {
    text,
    quickActions: [
      { label: "Find Colleges", action: "intent", value: "ask_course" },
      { label: "Explore Courses", action: "navigate", value: "/courses" },
      { label: "Book Appointment", action: "navigate", value: "/#contact" },
      { label: "Admission Process", action: "intent", value: "admission" },
    ],
  };
}

function generateCollegeInfo(collegeId: string): BotResponse {
  const college = COLLEGES_DATA.find((c) => c.id === collegeId);
  if (!college) {
    return {
      text: "I couldn't find details for that college. Would you like to see all our partner colleges?",
      quickActions: [{ label: "View All Colleges", action: "navigate", value: "/colleges" }],
    };
  }

  const card: CollegeCard = {
    id: college.id,
    name: college.name,
    location: college.location,
    ranking: college.ranking,
    image: college.logoImage,
    courses: college.courses,
  };

  return {
    text: `<strong>${college.name}</strong> is ${college.ranking}. Located in ${college.location}, it offers ${college.courses.join(", ")}.`,
    cards: [card],
    quickActions: [
      { label: "View Details", action: "navigate", value: `/college/${college.id}` },
      { label: "Book Counseling", action: "navigate", value: "/#contact" },
      { label: "Courses Offered", action: "intent", value: `courses ${college.id}` },
    ],
  };
}

function generateServicesInfo(): BotResponse {
  const text = `We offer comprehensive education consultancy services:<br><br>
<strong>🔬 Research:</strong> Complete research on best colleges<br>
<strong>🎓 Admission & Scholarship:</strong> Worldwide college applications<br>
<strong>💰 Education Funding:</strong> Education loan guidance<br>
<strong>🎯 Career Coaching:</strong> Personalized career strategies`;

  return {
    text,
    quickActions: [
      { label: "Book Free Session", action: "navigate", value: "/#contact" },
      { label: "View Colleges", action: "navigate", value: "/colleges" },
      { label: "View Courses", action: "navigate", value: "/courses" },
    ],
  };
}

function generateAdmissionProcess(course: string | null): BotResponse {
  let text = "Our admission process is smooth and straightforward:<br><br>";
  text += "1️⃣ <strong>Free Counseling:</strong> Discuss your goals with our experts<br>";
  text += "2️⃣ <strong>College Shortlisting:</strong> We recommend colleges matching your profile<br>";
  text += "3️⃣ <strong>Application:</strong> We handle all paperwork and submissions<br>";
  text += "4️⃣ <strong>Interview Prep:</strong> Mock interviews and guidance<br>";
  text += "5️⃣ <strong>Visa & Funding:</strong> Complete assistance<br>";

  if (course === "mbbs") {
    text += "<br>For <strong>MBBS</strong>, you need NEET qualification followed by state counseling (WBMCC).";
  } else if (course === "btech") {
    text += "<br>For <strong>B.Tech</strong>, you need JEE/WBJEE scores or institute-level entrance tests.";
  }

  return {
    text,
    quickActions: [
      { label: "Book Counseling", action: "navigate", value: "/#contact" },
      { label: "Documents Needed", action: "intent", value: "documents" },
      { label: "Fee Structure", action: "intent", value: "fees" },
    ],
  };
}

function generateDocumentsResponse(course: string | null): BotResponse {
  const docs = [
    "Admit Card & Scorecard of entrance exam (NEET/JEE/etc)",
    "Class 10th & 12th Mark Sheets and Certificates",
    "ID Proof (Aadhar/PAN/Passport)",
    "Passport-size Photographs",
    "Migration Certificate",
    "Caste Certificate (if applicable)",
    "Allotment Letter from Counseling Authority",
    "Domicile Certificate (if applicable)",
  ];

  let text = "Here are the documents generally required:<br><br>";
  docs.forEach((doc, i) => {
    text += `${i + 1}. ${doc}<br>`;
  });

  if (course) {
    text += `<br>Specific requirements for <strong>${course.toUpperCase()}</strong> may vary by college.`;
  }

  return {
    text,
    quickActions: [
      { label: "Book Appointment", action: "navigate", value: "/#contact" },
      { label: "View Colleges", action: "navigate", value: "/colleges" },
    ],
  };
}

function generateFeesResponse(): BotResponse {
  return {
    text: "Fee structures vary by college and course. We provide detailed fee breakdowns including tuition, hostel, and miscellaneous charges during our counseling sessions. Contact us for the most accurate and up-to-date information.",
    quickActions: [
      { label: "Contact for Fees", action: "navigate", value: "/#contact" },
      { label: "View Colleges", action: "navigate", value: "/colleges" },
    ],
  };
}

function generateContactInfo(): BotResponse {
  return {
    text: `You can reach us at:<br><br>
📞 <strong>Phone:</strong> +91 7384736917<br>
📧 <strong>Email:</strong> info@magnmainstitute.com<br>
🏢 <strong>Offices:</strong> Kolkata, Durgapur, Bankura, Prayagraj<br><br>
Book a free counseling session and we'll call you back!`,
    quickActions: [
      { label: "Book Free Session", action: "navigate", value: "/#contact" },
      { label: "Our Locations", action: "intent", value: "location" },
    ],
  };
}

function generateLocationInfo(): BotResponse {
  const locations = OFFICE_LOCATIONS.map(
    (loc) => `📍 <strong>${loc.city}:</strong> ${loc.address}`
  ).join("<br>");

  return {
    text: `Our offices are located at:<br><br>${locations}<br><br>Visit us or book an appointment online!`,
    quickActions: [
      { label: "Book Appointment", action: "navigate", value: "/#contact" },
      { label: "Call Us", action: "call", value: "+917384736917" },
    ],
  };
}

function generateVisaInfo(): BotResponse {
  return {
    text: "We provide complete student visa assistance including:<br><br>• Document preparation & verification<br>• Visa application filling<br>• Interview preparation & mock sessions<br>• Financial documentation guidance<br>• Post-study work visa guidance<br><br>Our experts have helped hundreds of students secure visas for USA, UK, Canada, Australia, and more.",
    quickActions: [
      { label: "Book Visa Consultation", action: "navigate", value: "/#contact" },
      { label: "View International Colleges", action: "navigate", value: "/colleges" },
    ],
  };
}

function generateScholarshipInfo(): BotResponse {
  return {
    text: "We help students secure scholarships and education funding:<br><br>• Merit-based scholarships<br>• Need-based financial aid<br>• Government scholarship schemes<br>• Education loan facilitation<br>• Institution-specific grants<br><br>During counseling, we assess your profile and match you with the best funding opportunities.",
    quickActions: [
      { label: "Check Eligibility", action: "navigate", value: "/#contact" },
      { label: "View Colleges", action: "navigate", value: "/colleges" },
    ],
  };
}

function generateAboutInfo(): BotResponse {
  return {
    text: "<strong>Magnma Institute</strong> is a contemporary education consulting firm established in 2019. We specialize in delivering educational services including academic research, international admissions, education funding, and career coaching. Our team consists of knowledgeable educational consultants, researchers, and academic experts with a strong track record of delivering exceptional results.",
    quickActions: [
      { label: "Our Services", action: "intent", value: "services" },
      { label: "Contact Us", action: "navigate", value: "/#contact" },
      { label: "View Blog", action: "navigate", value: "/blog" },
    ],
  };
}

function generateEntranceExamInfo(course: string | null): BotResponse {
  let text = "Entrance exams are crucial for admission. Here is what you need to know:<br><br>";
  if (course === "mbbs" || course === "bds") {
    text += "<strong>NEET UG</strong> is mandatory for MBBS/BDS admissions in India.<br>";
    text += "• Conducted by NTA annually<br>";
    text += "• Subjects: Physics, Chemistry, Biology<br>";
    text += "• Qualifying marks vary by category<br>";
  } else if (course === "btech") {
    text += "<strong>JEE Main/Advanced</strong> or <strong>WBJEE</strong> for engineering.<br>";
    text += "• JEE Main: National level (NTA)<br>";
    text += "• WBJEE: West Bengal state level<br>";
    text += "• Some colleges have their own entrance tests<br>";
  } else {
    text += "<strong>NEET</strong> for medical courses<br>";
    text += "<strong>JEE/WBJEE</strong> for engineering<br>";
    text += "<strong>CAT/MAT</strong> for MBA<br>";
    text += "<strong>CLAT</strong> for law<br>";
  }
  text += "<br>We provide complete exam preparation guidance and counseling.";

  return {
    text,
    quickActions: [
      { label: "Book Exam Guidance", action: "navigate", value: "/#contact" },
      { label: "View Courses", action: "navigate", value: "/courses" },
    ],
  };
}

function generateEligibilityInfo(course: string | null): BotResponse {
  let text = "Eligibility criteria vary by course and college:<br><br>";
  if (course === "mbbs" || course === "bds") {
    text += "<strong>MBBS/BDS:</strong><br>";
    text += "• 10+2 with Physics, Chemistry, Biology<br>";
    text += "• Minimum 50% aggregate (40% for reserved categories)<br>";
    text += "• NEET UG qualification mandatory<br>";
  } else if (course === "btech") {
    text += "<strong>B.Tech:</strong><br>";
    text += "• 10+2 with Physics, Chemistry, Mathematics<br>";
    text += "• Minimum 45-50% aggregate<br>";
    text += "• JEE/WBJEE or institute entrance exam<br>";
  } else if (course === "mba") {
    text += "<strong>MBA:</strong><br>";
    text += "• Bachelor's degree in any discipline<br>";
    text += "• Minimum 50% aggregate<br>";
    text += "• CAT/MAT/CMAT or institute entrance exam<br>";
  } else {
    text += "Generally:<br>";
    text += "• 10+2 for undergraduate courses<br>";
    text += "• Bachelor's degree for postgraduate courses<br>";
    text += "• Relevant entrance exam qualification<br>";
  }
  text += "<br>Contact us for detailed eligibility assessment.";

  return {
    text,
    quickActions: [
      { label: "Check My Eligibility", action: "navigate", value: "/#contact" },
      { label: "View Courses", action: "navigate", value: "/courses" },
    ],
  };
}

function generateBlogInfo(): BotResponse {
  return {
    text: "Check out our blog for the latest insights on education, admissions, career tips, and more. We regularly publish articles to help students make informed decisions.",
    quickActions: [
      { label: "Read Blog", action: "navigate", value: "/blog" },
      { label: "Contact Us", action: "navigate", value: "/#contact" },
    ],
  };
}

function generateGoodbye(context: ConversationContext): BotResponse {
  const name = context.userName ? `, ${context.userName}` : "";
  return {
    text: `Goodbye${name}! Feel free to come back anytime if you have more questions about colleges, courses, or admissions. Have a great day! 🎓`,
    quickActions: [
      { label: "Start Over", action: "intent", value: "greeting" },
      { label: "Contact Us", action: "navigate", value: "/#contact" },
    ],
  };
}

function generateThanks(): BotResponse {
  return {
    text: "You're welcome! 😊 I'm glad I could help. If you have any more questions about colleges, courses, or admissions, feel free to ask!",
    quickActions: [
      { label: "Find Colleges", action: "recommend", value: "colleges" },
      { label: "Book Appointment", action: "navigate", value: "/#contact" },
    ],
  };
}

function generateFallback(): BotResponse {
  return {
    text: "I'm sorry, I didn't quite understand that. I can help you with:<br><br>• Finding colleges and courses<br>• Admission processes and documents<br>• Fees and scholarships<br>• Visa assistance<br>• Booking counseling sessions<br><br>What would you like to know?",
    quickActions: [
      { label: "Find Colleges", action: "recommend", value: "colleges" },
      { label: "Explore Courses", action: "navigate", value: "/courses" },
      { label: "Contact Us", action: "navigate", value: "/#contact" },
      { label: "Our Services", action: "intent", value: "services" },
    ],
  };
}

// --- Main Engine ---

export async function processMessage(
  userInput: string,
  context: ConversationContext
): Promise<{ response: BotResponse; updatedContext: ConversationContext }> {
  // Handle special intent values from quick actions before NLP extraction
  const trimmedInput = userInput.trim().toLowerCase();
  if (trimmedInput === "ask_course") {
    const updatedContext: ConversationContext = {
      ...context,
      lastIntent: "ask_course",
    };
    const response: BotResponse = {
      text: "Great! I'd love to help you find the perfect college. <strong>Which course are you interested in?</strong>",
      quickActions: [
        { label: "MBBS", action: "recommend", value: "best mbbs colleges" },
        { label: "B.Tech", action: "recommend", value: "best btech colleges" },
        { label: "MBA", action: "recommend", value: "best mba colleges" },
        { label: "BDS", action: "recommend", value: "best bds colleges" },
        { label: "M.Tech", action: "recommend", value: "best mtech colleges" },
        { label: "Law", action: "recommend", value: "best law colleges" },
        { label: "Pharmacy", action: "recommend", value: "best pharmacy colleges" },
        { label: "Nursing", action: "recommend", value: "best nursing colleges" },
      ],
    };
    return { response, updatedContext };
  }

  const entities = extractEntities(userInput);
  const updatedContext: ConversationContext = {
    ...context,
    lastIntent: entities.intent,
    lastCourse: entities.course || context.lastCourse,
    lastLocation: entities.location || context.lastLocation,
    lastCollege: entities.college || context.lastCollege,
  };

  let response: BotResponse;

  switch (entities.intent) {
    case "greeting":
      response = generateGreeting(updatedContext);
      break;
    case "goodbye":
      response = generateGoodbye(updatedContext);
      break;
    case "thanks":
      response = generateThanks();
      break;
    case "ask_course": {
      response = {
        text: "Great! I'd love to help you find the perfect college. <strong>Which course are you interested in?</strong>",
        quickActions: [
          { label: "MBBS", action: "recommend", value: "best mbbs colleges" },
          { label: "B.Tech", action: "recommend", value: "best btech colleges" },
          { label: "MBA", action: "recommend", value: "best mba colleges" },
          { label: "BDS", action: "recommend", value: "best bds colleges" },
          { label: "M.Tech", action: "recommend", value: "best mtech colleges" },
          { label: "Law", action: "recommend", value: "best law colleges" },
          { label: "Pharmacy", action: "recommend", value: "best pharmacy colleges" },
          { label: "Nursing", action: "recommend", value: "best nursing colleges" },
        ],
      };
      break;
    }
    case "college_recommendation":
    case "recommend": {
      const { colleges, message } = await getRecommendations(
        entities.course || updatedContext.lastCourse,
        entities.location || updatedContext.lastLocation,
        entities.isRankingQuery
      );
      const cards: CollegeCard[] = colleges.map((c) => ({
        id: c.id,
        name: c.name,
        location: c.location,
        ranking: c.ranking,
        image: c.logoImage,
        courses: c.courses,
      }));
      response = {
        text: message,
        cards,
        quickActions: [
          { label: "View All Colleges", action: "navigate", value: "/colleges" },
          { label: "Book Counseling", action: "navigate", value: "/#contact" },
          { label: "Compare Colleges", action: "intent", value: "compare" },
        ],
      };
      break;
    }
    case "course_inquiry": {
      const course = COURSES_DATA.find(
        (c) => c.id === (entities.course || updatedContext.lastCourse)
      );
      if (course) {
        response = {
          text: `<strong>${course.name}</strong><br><br>${course.description}<br><br>Would you like to see colleges offering this course?`,
          quickActions: [
            { label: "Find Colleges", action: "recommend", value: `best ${course.id} colleges` },
            { label: "View All Courses", action: "navigate", value: "/courses" },
            { label: "Admission Process", action: "intent", value: "admission" },
          ],
        };
      } else {
        response = {
          text: "We offer a wide range of courses including MBBS, B.Tech, MBA, BDS, M.Tech, GNM, Law, and Pharmacy. Which one interests you?",
          quickActions: [
            { label: "MBBS", action: "intent", value: "course mbbs" },
            { label: "B.Tech", action: "intent", value: "course btech" },
            { label: "MBA", action: "intent", value: "course mba" },
            { label: "BDS", action: "intent", value: "course bds" },
            { label: "View All", action: "navigate", value: "/courses" },
          ],
        };
      }
      break;
    }
    case "specific_college":
      if (entities.college) {
        response = generateCollegeInfo(entities.college);
      } else {
        response = generateFallback();
      }
      break;
    case "admission_process":
      response = generateAdmissionProcess(entities.course || updatedContext.lastCourse);
      break;
    case "fees":
      response = generateFeesResponse();
      break;
    case "documents":
      response = generateDocumentsResponse(entities.course || updatedContext.lastCourse);
      break;
    case "services":
      response = generateServicesInfo();
      break;
    case "contact":
      response = generateContactInfo();
      break;
    case "location":
      response = generateLocationInfo();
      break;
    case "visa":
      response = generateVisaInfo();
      break;
    case "scholarship":
      response = generateScholarshipInfo();
      break;
    case "blog":
      response = generateBlogInfo();
      break;
    case "about":
      response = generateAboutInfo();
      break;
    case "entrance_exam":
      response = generateEntranceExamInfo(entities.course || updatedContext.lastCourse);
      break;
    case "eligibility":
      response = generateEligibilityInfo(entities.course || updatedContext.lastCourse);
      break;
    case "compare": {
      const colleges = await fetchColleges();
      const featured = colleges.filter((c) => c.featured).slice(0, 3);
      const cards: CollegeCard[] = featured.map((c) => ({
        id: c.id,
        name: c.name,
        location: c.location,
        ranking: c.ranking,
        image: c.logoImage,
        courses: c.courses,
      }));
      response = {
        text: "Here are some of our top partner colleges for comparison:",
        cards,
        quickActions: [
          { label: "View All Colleges", action: "navigate", value: "/colleges" },
          { label: "Book Counseling", action: "navigate", value: "/#contact" },
        ],
      };
      break;
    }
    default:
      // Try to handle follow-up context
      if (updatedContext.lastIntent === "course_inquiry" && !entities.intent) {
        const course = COURSES_DATA.find(
          (c) => c.id === (entities.course || updatedContext.lastCourse)
        );
        if (course) {
          response = {
            text: `<strong>${course.name}</strong><br><br>${course.description}<br><br>Would you like to see colleges offering this course?`,
            quickActions: [
              { label: "Find Colleges", action: "recommend", value: course.id },
              { label: "View All Courses", action: "navigate", value: "/courses" },
            ],
          };
          break;
        }
      }
      response = generateFallback();
  }

  return { response, updatedContext };
}

export function createInitialContext(): ConversationContext {
  return {
    lastIntent: null,
    lastCourse: null,
    lastLocation: null,
    lastCollege: null,
    userName: null,
    collectedData: {},
  };
}
