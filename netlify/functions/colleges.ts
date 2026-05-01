// Netlify Function: Colleges API
import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function normalizeImagePath(path: string): string {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path
    .replace(/^collegeImages\//, "assets/images/colleges/")
    .replace(/^assests\/images\/collegeimages\//, "assets/images/colleges/");
  return normalized ? (normalized.startsWith("/") ? normalized : "/" + normalized) : normalized;
}

function parseArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((v: any) => (typeof v === "object" ? v.key || "" : String(v))).filter(Boolean);
  if (typeof val === "string") return val.split("|").map((s: string) => s.trim()).filter(Boolean);
  return [];
}

function mapCollege(row: any) {
  let courses: string[] = [];
  if (row.courses && Array.isArray(row.courses)) {
    courses = row.courses.map((c: any) => (typeof c === "object" ? c.key || "" : c)).filter(Boolean);
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

export const handler: Handler = async (event) => {
  const path = event.path.replace("/.netlify/functions/colleges", "").replace("/api/colleges", "");
  const method = event.httpMethod;

  if (!supabase) {
    return { statusCode: 503, body: JSON.stringify({ success: false, error: "Supabase not configured" }) };
  }

  try {
    // GET /api/colleges - List all
    if (method === "GET" && (path === "" || path === "/")) {
      const { search, featured, page, limit } = event.queryStringParameters || {};
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

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: true, data: (data || []).map(mapCollege), total: count || 0 }),
      };
    }

    // GET /api/colleges/:id - Get single
    if (method === "GET" && path.match(/^\/[a-z0-9-]+$/)) {
      const id = path.slice(1);
      const { data, error } = await supabase.from("colleges").select("*").eq("id", id).single();
      if (error) {
        if (error.code === "PGRST116") {
          return { statusCode: 404, body: JSON.stringify({ success: false, error: "College not found" }) };
        }
        throw error;
      }
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: true, data: mapCollege(data) }),
      };
    }

    return { statusCode: 404, body: JSON.stringify({ success: false, error: "Not found" }) };
  } catch (error: any) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: error.message }) };
  }
};
