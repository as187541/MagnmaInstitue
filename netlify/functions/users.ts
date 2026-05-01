// Netlify Function: Delete User API (Admin Only)
import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;
const anonSupabase = supabaseUrl && process.env.VITE_SUPABASE_ANON_KEY ? createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY) : null;

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: "Method not allowed" }),
    };
  }

  if (!supabase) {
    return {
      statusCode: 503,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: "Supabase service role not configured" }),
    };
  }

  try {
    const { userId } = JSON.parse(event.body || "{}");
    if (!userId) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ success: false, error: "Missing userId" }),
      };
    }

    // Verify the requester is an admin using the anon key + their JWT
    const authHeader = event.headers.authorization || "";
    const jwt = authHeader.replace("Bearer ", "");

    if (!jwt || !anonSupabase) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ success: false, error: "Unauthorized" }),
      };
    }

    const { data: { user }, error: userError } = await anonSupabase.auth.getUser(jwt);
    if (userError || !user) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ success: false, error: "Invalid token" }),
      };
    }

    // Check requester role from profiles
    const { data: requesterProfile, error: profileError } = await anonSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !requesterProfile || requesterProfile.role !== "admin") {
      return {
        statusCode: 403,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ success: false, error: "Forbidden: admin only" }),
      };
    }

    // Delete from auth (this also cascades to profiles if FK with ON DELETE CASCADE is set)
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error("Auth delete error:", deleteAuthError);
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ success: false, error: deleteAuthError.message }),
      };
    }

    // Also explicitly delete from profiles in case cascade isn't set
    await supabase.from("profiles").delete().eq("id", userId);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, data: { message: "User deleted successfully" } }),
    };
  } catch (error: any) {
    console.error("Delete user error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
