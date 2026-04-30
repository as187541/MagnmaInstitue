// Vercel Serverless Function: Courses API
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function normalizeImagePath(path) {
  const normalized = path
    .replace(/^collegeImages\//, "assets/images/colleges/")
    .replace(/^assests\/images\/collegeimages\//, "assets/images/colleges/");
  return normalized ? (normalized.startsWith("/") ? normalized : "/" + normalized) : normalized;
}

function parseArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((v) => (typeof v === "object" ? v.key || "" : String(v))).filter(Boolean);
  if (typeof val === "string") return val.split("|").map((s) => s.trim()).filter(Boolean);
  return [];
}

function mapCourse(row) {
  return {
    id: row.id || "",
    name: row.name || "",
    description: row.description || "",
    image: normalizeImagePath(row.image || ""),
    specializations: row.specializations || [],
  };
}

function mapCollege(row) {
  return {
    id: row.id || "",
    name: row.name || "",
    logoImage: normalizeImagePath(row.logo_image || row.logoImage || ""),
    location: row.location || "",
    ranking: row.ranking || "",
    fees: row.fees || "",
    featured: row.featured || false,
    description: row.description || "",
    approvedBy: row.approved_by || row.approvedBy || [],
    affiliatedTo: row.affiliated_to || row.affiliatedTo || "",
    admissionProcess: parseArray(row.admission_process || row.admissionProcess),
    documentsRequired: parseArray(row.documents_required || row.documentsRequired),
    images: parseArray(row.images).map(normalizeImagePath),
    courses: parseArray(row.courses),
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (!supabase) {
    return res.status(503).json({ success: false, error: "Supabase not configured" });
  }

  try {
    // Vercel rewrites change req.url, so read original path from query param
    const originalPath = req.query.__path || "";
    const path = "/" + originalPath;

    // GET /api/courses - List all
    if (req.method === "GET" && (path === "/" || path.startsWith("/?"))) {
      const { search } = req.query;
      let query = supabase.from("courses").select("*");
      if (search) query = query.ilike("name", `%${search}%`);
      const { data, error } = await query.order("name");
      if (error) throw error;
      return res.status(200).json({ success: true, data: (data || []).map(mapCourse) });
    }

    // GET /api/courses/:id - Get single
    if (req.method === "GET" && path.match(/^\/[a-z0-9-]+$/)) {
      const id = path.slice(1);
      const { data, error } = await supabase.from("courses").select("*").eq("id", id).single();
      if (error) {
        if (error.code === "PGRST116") {
          return res.status(404).json({ success: false, error: "Course not found" });
        }
        throw error;
      }
      return res.status(200).json({ success: true, data: mapCourse(data) });
    }

    // GET /api/courses/:id/colleges - Get colleges for course
    if (req.method === "GET" && path.match(/^\/[a-z0-9-]+\/colleges$/)) {
      const id = path.split("/")[1];

      // Get rankings from junction table
      const { data: rankingsData } = await supabase
        .from("course_college_rankings")
        .select("college_id, display_order, ranking_label")
        .eq("course_id", id)
        .order("display_order", { ascending: true });

      const rankingMap = new Map();
      let collegeIds = [];

      if (rankingsData) {
        rankingsData.forEach((r) => {
          collegeIds.push(r.college_id);
          rankingMap.set(r.college_id, { display_order: r.display_order, ranking_label: r.ranking_label });
        });
      }

      // Get all colleges
      const { data: allColleges, error: collegesError } = await supabase.from("colleges").select("*");
      if (collegesError) throw collegesError;

      // Filter matching colleges
      const courseKey = id.toLowerCase();
      const matching = (allColleges || []).filter((college) => {
        if (college.courses && Array.isArray(college.courses)) {
          return college.courses.some((c) => {
            const courseName = (typeof c === "object" ? c.key || "" : String(c)).toLowerCase();
            return courseName === courseKey || courseName.startsWith(courseKey) || courseKey.startsWith(courseName);
          });
        }
        if (college.courses_offered) {
          const offered = parseArray(college.courses_offered).map((s) => s.toLowerCase());
          return offered.some((o) => o === courseKey || o.startsWith(courseKey) || courseKey.startsWith(o));
        }
        return false;
      });

      // Sort by ranking display_order if exists, otherwise by name
      matching.sort((a, b) => {
        const rankA = rankingMap.get(a.id)?.display_order ?? 9999;
        const rankB = rankingMap.get(b.id)?.display_order ?? 9999;
        if (rankA !== rankB) return rankA - rankB;
        return (a.name || "").localeCompare(b.name || "");
      });

      return res.status(200).json({
        success: true,
        data: matching.map((c) => {
          const mapped = mapCollege(c);
          const rankInfo = rankingMap.get(c.id);
          if (rankInfo?.ranking_label) {
            mapped.ranking = rankInfo.ranking_label;
          }
          return mapped;
        }),
      });
    }

    return res.status(404).json({ success: false, error: "Not found" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
