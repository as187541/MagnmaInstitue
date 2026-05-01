// ============================================================
// @magnma/api-courses - Courses Microservice
// ============================================================

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import type { Course, College, ApiResponse } from "@magnma/shared";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// --- Supabase Client ---
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// --- Map Supabase row to frontend Course type ---
function normalizeImagePath(path: string): string {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path
    .replace(/^collegeImages\//, "assets/images/colleges/")
    .replace(/^assests\/images\/collegeimages\//, "assets/images/colleges/");
  return normalized ? (normalized.startsWith("/") ? normalized : "/" + normalized) : normalized;
}

function mapCourse(row: any): Course {
  return {
    id: row.id || "",
    name: row.name || "",
    description: row.description || "",
    image: normalizeImagePath(row.image || ""),
    specializations: row.specializations || [],
  };
}

// --- Routes ---

// GET /api/courses - List all courses
app.get("/api/courses", async (req, res) => {
  try {
    const { search } = req.query;

    if (supabase) {
      let query = supabase.from("courses").select("*");

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;

      const mapped = (data || []).map(mapCourse);
      const response: ApiResponse<Course[]> = {
        success: true,
        data: mapped,
      };
      return res.json(response);
    }

    const response: ApiResponse<Course[]> = { success: true, data: [] };
    return res.json(response);
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    const response: ApiResponse<null> = { success: false, error: error.message };
    return res.status(500).json(response);
  }
});

// GET /api/courses/:id - Get a single course by ID
app.get("/api/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (supabase) {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          const response: ApiResponse<null> = {
            success: false,
            error: "Course not found",
          };
          return res.status(404).json(response);
        }
        throw error;
      }

      const response: ApiResponse<Course> = { success: true, data: mapCourse(data) };
      return res.json(response);
    }

    const response: ApiResponse<null> = { success: false, error: "Supabase not configured" };
    return res.status(503).json(response);
  } catch (error: any) {
    console.error("Error fetching course:", error);
    const response: ApiResponse<null> = { success: false, error: error.message };
    return res.status(500).json(response);
  }
});

// GET /api/courses/:id/colleges - Get colleges offering a specific course
app.get("/api/courses/:id/colleges", async (req, res) => {
  try {
    const { id } = req.params;

    if (supabase) {
      // First, try to get rankings from the junction table
      const { data: rankingsData, error: rankingsError } = await supabase
        .from("course_college_rankings")
        .select("college_id, display_order, ranking_label")
        .eq("course_id", id)
        .order("display_order", { ascending: true });

      if (rankingsError) throw rankingsError;

      let collegeIds: string[] = [];
      const rankingMap = new Map<string, { display_order: number; ranking_label: string }>();

      if (rankingsData && rankingsData.length > 0) {
        // Use junction table ordering
        rankingsData.forEach((r: any) => {
          collegeIds.push(r.college_id);
          rankingMap.set(r.college_id, {
            display_order: r.display_order || 0,
            ranking_label: r.ranking_label || "",
          });
        });
      }

      // Also query colleges that have this course in their courses array
      // (fallback for colleges without explicit ranking entries)
      const { data: allColleges, error: collegesError } = await supabase
        .from("colleges")
        .select("*");

      if (collegesError) throw collegesError;

      // Filter colleges that offer this course
      const matching = (allColleges || []).filter((college: any) => {
        const courseKey = id.toLowerCase();
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

      // Build a set of already-ranked college IDs
      const rankedIds = new Set(collegeIds);

      // Add any matching colleges that don't have a ranking entry yet
      matching.forEach((college: any) => {
        if (!rankedIds.has(college.id)) {
          collegeIds.push(college.id);
          rankingMap.set(college.id, {
            display_order: college.display_order || 9999,
            ranking_label: college.ranking || "",
          });
        }
      });

      // Sort collegeIds by display_order
      collegeIds.sort((a, b) => {
        const orderA = rankingMap.get(a)?.display_order || 9999;
        const orderB = rankingMap.get(b)?.display_order || 9999;
        return orderA - orderB;
      });

      // Build ordered college objects
      const parseArray = (val: any): string[] => {
        if (!val) return [];
        if (Array.isArray(val)) return val.map((v: any) => (typeof v === "object" ? v.key || "" : String(v))).filter(Boolean);
        if (typeof val === "string") return val.split("|").map((s: string) => s.trim()).filter(Boolean);
        return [];
      };

      const collegeMap = new Map((allColleges || []).map((c: any) => [c.id, c]));

      const mapped = collegeIds.map((collegeId) => {
        const row = collegeMap.get(collegeId);
        if (!row) return null;
        const rankInfo = rankingMap.get(collegeId);
        return {
          id: row.id || "",
          name: row.name || "",
          logoImage: normalizeImagePath(row.logo_image || row.logoImage || ""),
          location: row.location || "",
          ranking: rankInfo?.ranking_label || row.ranking || "",
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
      }).filter(Boolean);

      const response: ApiResponse<College[]> = {
        success: true,
        data: mapped as College[],
      };
      return res.json(response);
    }

    const response: ApiResponse<College[]> = { success: true, data: [] };
    return res.json(response);
  } catch (error: any) {
    console.error("Error fetching colleges for course:", error);
    const response: ApiResponse<null> = { success: false, error: error.message };
    return res.status(500).json(response);
  }
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-courses" });
});

app.listen(PORT, () => {
  console.log(`📚 Courses API running on http://localhost:${PORT}`);
});
