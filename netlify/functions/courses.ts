// Netlify Function: Courses API
import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function normalizeImagePath(path: string): string {
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

function mapCourse(row: any) {
  return {
    id: row.id || "",
    name: row.name || "",
    description: row.description || "",
    image: normalizeImagePath(row.image || ""),
    specializations: row.specializations || [],
  };
}

function mapCollege(row: any) {
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

export const handler: Handler = async (event) => {
  const path = event.path.replace("/.netlify/functions/courses", "").replace("/api/courses", "");
  const method = event.httpMethod;

  if (!supabase) {
    return { statusCode: 503, body: JSON.stringify({ success: false, error: "Supabase not configured" }) };
  }

  try {
    // GET /api/courses - List all
    if (method === "GET" && (path === "" || path === "/")) {
      const { search } = event.queryStringParameters || {};
      let query = supabase.from("courses").select("*");
      if (search) query = query.ilike("name", `%${search}%`);
      const { data, error } = await query.order("name");
      if (error) throw error;
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: true, data: (data || []).map(mapCourse) }),
      };
    }

    // GET /api/courses/:id - Get single
    if (method === "GET" && path.match(/^\/[a-z0-9-]+$/)) {
      const id = path.slice(1);
      const { data, error } = await supabase.from("courses").select("*").eq("id", id).single();
      if (error) {
        if (error.code === "PGRST116") {
          return { statusCode: 404, body: JSON.stringify({ success: false, error: "Course not found" }) };
        }
        throw error;
      }
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: true, data: mapCourse(data) }),
      };
    }

    // GET /api/courses/:id/colleges - Get colleges for course
    if (method === "GET" && path.match(/^\/[a-z0-9-]+\/colleges$/)) {
      const id = path.split("/")[1];
      
      // Get rankings from junction table
      const { data: rankingsData } = await supabase
        .from("course_college_rankings")
        .select("college_id, display_order, ranking_label")
        .eq("course_id", id)
        .order("display_order", { ascending: true });

      const rankingMap = new Map();
      let collegeIds: string[] = [];
      
      if (rankingsData) {
        rankingsData.forEach((r: any) => {
          collegeIds.push(r.college_id);
          rankingMap.set(r.college_id, { display_order: r.display_order, ranking_label: r.ranking_label });
        });
      }

      // Get all colleges
      const { data: allColleges, error: collegesError } = await supabase.from("colleges").select("*");
      if (collegesError) throw collegesError;

      // Filter matching colleges
      const courseKey = id.toLowerCase();
      const matching = (allColleges || []).filter((college: any) => {
        if (college.courses && Array.isArray(college.courses)) {
          if (college.courses.some((c: any) => {
            const courseName = (typeof c === "object" ? c.key || "" : String(c)).toLowerCase();
            return courseName === courseKey || courseName.startsWith(courseKey) || courseKey.startsWith(courseName);
          })) return true;
        }
        if (college.courses_offered) {
          const offered = college.courses_offered.split("|").map((s: string) => s.trim().toLowerCase());
          if (offered.some((c: string) => c === courseKey || c.startsWith(courseKey))) return true;
        }
        return false;
      });

      // Add unranked colleges
      const rankedIds = new Set(collegeIds);
      matching.forEach((college: any) => {
        if (!rankedIds.has(college.id)) {
          collegeIds.push(college.id);
          rankingMap.set(college.id, { display_order: college.display_order || 9999, ranking_label: college.ranking || "" });
        }
      });

      // Sort
      collegeIds.sort((a, b) => {
        const orderA = rankingMap.get(a)?.display_order || 9999;
        const orderB = rankingMap.get(b)?.display_order || 9999;
        return orderA - orderB;
      });

      const collegeMap = new Map((allColleges || []).map((c: any) => [c.id, c]));
      const mapped = collegeIds.map((cid) => {
        const row = collegeMap.get(cid);
        if (!row) return null;
        const rankInfo = rankingMap.get(cid);
        return {
          ...mapCollege(row),
          ranking: rankInfo?.ranking_label || row.ranking || "",
        };
      }).filter(Boolean);

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: true, data: mapped }),
      };
    }

    return { statusCode: 404, body: JSON.stringify({ success: false, error: "Not found" }) };
  } catch (error: any) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: error.message }) };
  }
};
