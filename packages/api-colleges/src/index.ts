// ============================================================
// @magnma/api-colleges - College Microservice
// ============================================================

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import type { College, ApiResponse } from "@magnma/shared";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// --- Supabase Client ---
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// --- Map Supabase row to frontend College type ---
function mapCollege(row: any): College {
  // Parse pipe-delimited strings into arrays
  const parseArray = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map((v: any) => (typeof v === "object" ? v.key || "" : v)).filter(Boolean);
    if (typeof val === "string") return val.split("|").map((s: string) => s.trim()).filter(Boolean);
    return [];
  };

  // Parse courses: handle both courses_offered (pipe string) and courses (array of {key})
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

// Normalize image paths from various old formats to new assets structure
function normalizeImagePath(path: string): string {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path
    .replace(/^collegeImages\//, "assets/images/colleges/")
    .replace(/^assests\/images\/collegeimages\//, "assets/images/colleges/");
  // Ensure leading slash for browser serving from public/
  return normalized ? (normalized.startsWith("/") ? normalized : "/" + normalized) : normalized;
}

// --- Routes ---

// GET /api/colleges - List all colleges
app.get("/api/colleges", async (req, res) => {
  try {
    const { search, featured, page, limit } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;

    if (supabase) {
      let query = supabase.from("colleges").select("*", { count: "exact" });

      if (featured === "true") {
        query = query.eq("featured", true);
      }

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const from = (pageNum - 1) * limitNum;
      const to = from + limitNum - 1;
      query = query.range(from, to).order("display_order", { ascending: true }).order("name");

      const { data, error, count } = await query;

      if (error) throw error;

      const mapped = (data || []).map(mapCollege);
      const response: ApiResponse<College[]> & { total?: number } = {
        success: true,
        data: mapped,
        total: count || 0,
      };
      return res.json(response);
    }

    const response: ApiResponse<College[]> & { total?: number } = {
      success: true,
      data: [],
      total: 0,
    };
    return res.json(response);
  } catch (error: any) {
    console.error("Error fetching colleges:", error);
    const response: ApiResponse<null> = { success: false, error: error.message };
    return res.status(500).json(response);
  }
});

// GET /api/colleges/:id - Get a single college by ID
app.get("/api/colleges/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (supabase) {
      const { data, error } = await supabase
        .from("colleges")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          const response: ApiResponse<null> = {
            success: false,
            error: "College not found",
          };
          return res.status(404).json(response);
        }
        throw error;
      }

      const response: ApiResponse<College> = { success: true, data: mapCollege(data) };
      return res.json(response);
    }

    const response: ApiResponse<null> = { success: false, error: "Supabase not configured" };
    return res.status(503).json(response);
  } catch (error: any) {
    console.error("Error fetching college:", error);
    const response: ApiResponse<null> = { success: false, error: error.message };
    return res.status(500).json(response);
  }
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-colleges" });
});

app.listen(PORT, () => {
  console.log(`🏛️  Colleges API running on http://localhost:${PORT}`);
});
