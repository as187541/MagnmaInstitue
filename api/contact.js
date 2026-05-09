// Vercel Serverless Function: Contact Form API
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY || "";

export default async function handler(req, res) {
  const corsOrigin = process.env.CORS_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", corsOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const formData = req.body;

    if (!formData.name || !formData.email || !formData.number || !formData.date || !formData.time) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, email, number, date, time",
      });
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
        return res.status(200).json({
          success: true,
          data: { message: "Thank you! We'll get back to you soon." },
        });
      }
      console.warn("Supabase insert failed, falling back to Web3Forms:", error.message);
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
      throw new Error(`Web3Forms returned ${web3Response.status}`);
    }

    return res.status(200).json({
      success: true,
      data: { message: "Thank you! We'll get back to you soon." },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
