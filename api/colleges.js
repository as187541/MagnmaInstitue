// Vercel Serverless Function: Colleges API
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

function mapCollege(row) {
  let courses = [];
  if (row.courses && Array.isArray(row.courses)) {
    courses = row.courses.map((c) => (typeof c === "object" ? c.key || "" : c)).filter(Boolean);
  } else if (row.courses_offered) {
    courses = parseArray(row.courses_offered);
  }

  return {
    id: row.id || "",
    name: row.name || "",
    logoImage: normalizeImagePath(row.logo_image || row.logoImage || ""),
    location: row.location || "",
    ranking: row.ranking || "",
    fees: row.fees || "Contact us for detailed fee structure.",
    featured: row.featured || false,
    description: row.description || "",
    approvedBy: row.approved_by || row.approvedBy || [],
    affiliatedTo: row.affiliated_to || row.affiliatedTo || "",
    admissionProcess: parseArray(row.admission_process || row.admissionProcess),
    documentsRequired: parseArray(row.documents_required || row.documentsRequired),
    images: parseArray(row.images).map(normalizeImagePath),
    courses,
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
    const path = req.url.replace("/api/colleges", "").replace("/api/colleges", "");

    // GET /api/colleges - List all
    if (req.method === "GET" && (path === "" || path === "/" || path.startsWith("?"))) {
      const { search, featured, page, limit } = req.query;
      const pageNum = parseInt(page || "1");
      const limitNum = parseInt(limit || "50");

      let query = supabase.from("colleges").select("*", { count: "exact" });

      if (featured === "true") query = query.eq("featured", true);
      if (search) query = query.ilike("name", `%${search}%`);

      const from = (pageNum - 1) * limitNum;
      const to = from + limitNum - 1;
      query = query.range(from, to).order("display_order", { ascending: true }).order("name");

      const { data, error, count } = await query;
      if (error) throw error;

      return res.status(200).json({ success: true, data: (data || []).map(mapCollege), total: count || 0 });
    }

    // GET /api/colleges/:id - Get single
    if (req.method === "GET" && path.match(/^\/[a-z0-9-]+$/)) {
      const id = path.slice(1);
      const { data, error } = await supabase.from("colleges").select("*").eq("id", id).single();
      if (error) {
        if (error.code === "PGRST116") {
          return res.status(404).json({ success: false, error: "College not found" });
        }
        throw error;
      }
      return res.status(200).json({ success: true, data: mapCollege(data) });
    }

    return res.status(404).json({ success: false, error: "Not found" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
