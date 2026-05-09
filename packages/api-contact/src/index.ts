// ============================================================
// @magnma/api-contact - Contact Form Microservice
// ============================================================

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import type { ContactFormData, ApiResponse } from "@magnma/shared";
import { sanitizeInput, securityHeaders, rateLimit } from "./security";

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use(sanitizeInput);
app.use(securityHeaders);
app.use(rateLimit(15 * 60 * 1000, 100));

// --- Supabase Client ---
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

if (supabase) {
  console.log("✅ Supabase client initialized");
} else {
  console.warn("⚠️ Supabase client NOT initialized — missing URL or ANON_KEY");
}

// --- Web3Forms Fallback ---
const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY;
if (!WEB3FORMS_ACCESS_KEY) {
  console.warn("WEB3FORMS_ACCESS_KEY not set. Web3Forms fallback will be disabled if Supabase insertion fails.");
}

// --- Routes ---

// POST /api/contact - Submit a contact form
app.post("/api/contact", async (req, res) => {
  try {
    const formData: ContactFormData = req.body;

    // Validate required fields
    if (!formData.name || !formData.email || !formData.number || !formData.date || !formData.time) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Missing required fields: name, email, number, date, time",
      };
      return res.status(400).json(response);
    }

    // Try Supabase first
    if (supabase) {
      const { error } = await supabase.from("contact_submissions").insert({
        name: formData.name,
        email: formData.email,
        number: formData.number,
        date: formData.date,
        time: formData.time,
        message: formData.message || "",
        college_applying_for: formData.collegeApplyingFor || "",
      });

      if (!error) {
        const response: ApiResponse<{ message: string }> = {
          success: true,
          data: { message: "Thank you! We'll get back to you soon." },
        };
        return res.json(response);
      }

      console.warn("Supabase insert failed, falling back to Web3Forms:", JSON.stringify(error, null, 2));
    }

    if (!WEB3FORMS_ACCESS_KEY) {
      return res.status(500).json({
        success: false,
        error: "Contact fallback service unavailable because WEB3FORMS_ACCESS_KEY is not configured.",
      });
    }

    // Fallback to Web3Forms
    const web3Response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        name: formData.name,
        email: formData.email,
        number: formData.number,
        date: formData.date,
        time: formData.time,
        message: formData.message || "",
        college_applying_for: formData.collegeApplyingFor || "",
      }),
    });

    if (!web3Response.ok) {
      const web3Body = await web3Response.text().catch(() => "");
      console.error("Web3Forms error response:", web3Response.status, web3Body);
      throw new Error(`Web3Forms returned ${web3Response.status}: ${web3Body}`);
    }

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Thank you! We'll get back to you soon." },
    };
    return res.json(response);
  } catch (error: any) {
    console.error("Error submitting contact form:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to submit form. Please try again later.",
    };
    return res.status(500).json(response);
  }
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-contact" });
});

app.listen(PORT, () => {
  console.log(`📧 Contact API running on http://localhost:${PORT}`);
});
