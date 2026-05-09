// Vercel Serverless Function: Delete User API (Admin Only)
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;
const anonSupabase = supabaseUrl && process.env.VITE_SUPABASE_ANON_KEY ? createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY) : null;

export default async function handler(req, res) {
  const corsOrigin = process.env.CORS_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", corsOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  if (!supabase) {
    return res.status(503).json({ success: false, error: "Supabase service role not configured" });
  }

  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: "Missing userId" });
    }

    // Verify the requester is an admin using the anon key + their JWT
    const authHeader = req.headers.authorization || "";
    const jwt = authHeader.replace("Bearer ", "");

    if (!jwt || !anonSupabase) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { data: { user }, error: userError } = await anonSupabase.auth.getUser(jwt);
    if (userError || !user) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    // Check requester role from profiles
    const { data: requesterProfile, error: profileError } = await anonSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !requesterProfile || requesterProfile.role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden: admin only" });
    }

    // Delete from auth (this also cascades to profiles if FK with ON DELETE CASCADE is set)
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error("Auth delete error:", deleteAuthError);
      return res.status(500).json({ success: false, error: deleteAuthError.message });
    }

    // Also explicitly delete from profiles in case cascade isn't set
    await supabase.from("profiles").delete().eq("id", userId);

    return res.status(200).json({ success: true, data: { message: "User deleted successfully" } });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
