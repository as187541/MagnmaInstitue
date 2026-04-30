// Netlify Function: Contact Form API
import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY || "";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success: false, error: "Method not allowed" }) };
  }

  try {
    const formData = JSON.parse(event.body || "{}");

    if (!formData.name || !formData.email || !formData.number || !formData.date || !formData.time) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Missing required fields" }),
      };
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
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ success: true, data: { message: "Thank you! We'll get back to you soon." } }),
        };
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

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: true, data: { message: "Thank you! We'll get back to you soon." } }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
