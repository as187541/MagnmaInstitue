// Netlify Function: Contact Form API
import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { getSecurityHeaders, getCorsPreflightHeaders, sanitizeString, isValidEmail, isValidPhone } from "./security";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY || "";

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: getCorsPreflightHeaders(), body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: getSecurityHeaders(), body: JSON.stringify({ success: false, error: "Method not allowed" }) };
  }

  try {
    const formData = JSON.parse(event.body || "{}");

    // Validate required fields
    if (!formData.name || !formData.email || !formData.number || !formData.date || !formData.time) {
      return {
        statusCode: 400,
        headers: getSecurityHeaders(),
        body: JSON.stringify({ success: false, error: "Missing required fields" }),
      };
    }

    // Validate email format
    if (!isValidEmail(formData.email)) {
      return {
        statusCode: 400,
        headers: getSecurityHeaders(),
        body: JSON.stringify({ success: false, error: "Invalid email format" }),
      };
    }

    // Validate phone format
    if (!isValidPhone(formData.number)) {
      return {
        statusCode: 400,
        headers: getSecurityHeaders(),
        body: JSON.stringify({ success: false, error: "Invalid phone number format" }),
      };
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeString(formData.name),
      email: sanitizeString(formData.email),
      number: sanitizeString(formData.number),
      date: sanitizeString(formData.date),
      time: sanitizeString(formData.time),
      message: sanitizeString(formData.message),
      college_applying_for: sanitizeString(formData.collegeApplyingFor),
    };

    // Try Supabase first
    if (supabase) {
      const { error } = await supabase.from("contact_submissions").insert(sanitizedData);

      if (!error) {
        return {
          statusCode: 200,
          headers: getSecurityHeaders(),
          body: JSON.stringify({ success: true, data: { message: "Thank you! We'll get back to you soon." } }),
        };
      }
      console.warn("Supabase insert failed, falling back to Web3Forms:", error.message);
    }

    // Fallback to Web3Forms
    if (!WEB3FORMS_ACCESS_KEY) {
      return {
        statusCode: 500,
        headers: getSecurityHeaders(),
        body: JSON.stringify({ success: false, error: "Contact fallback service unavailable" }),
      };
    }

    const web3Response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        ...sanitizedData,
      }),
    });

    if (!web3Response.ok) {
      throw new Error(`Web3Forms returned ${web3Response.status}`);
    }

    return {
      statusCode: 200,
      headers: getSecurityHeaders(),
      body: JSON.stringify({ success: true, data: { message: "Thank you! We'll get back to you soon." } }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: getSecurityHeaders(),
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
