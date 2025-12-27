import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the authorization header to identify the requesting user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "No authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Get the requesting user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user: requestingUser }, error: userError } = await anonClient.auth.getUser();
    if (userError || !requestingUser) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const body = await req.json();
    const { targetUserId, newRole } = body;

    if (!targetUserId || !newRole) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing targetUserId or newRole" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validate new role
    const validRoles = ["admin", "manager", "user"];
    if (!validRoles.includes(newRole)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid role" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get requesting user's role
    const { data: requestingUserRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .single();

    const requesterRole = requestingUserRole?.role;
    console.log("Requester role:", requesterRole);

    // Get target user's current role
    const { data: targetUserRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", targetUserId)
      .single();

    const currentTargetRole = targetUserRole?.role || "user";
    console.log("Target current role:", currentTargetRole);

    // Check permissions
    if (requesterRole === "admin") {
      // Admins can change any role
    } else if (requesterRole === "manager") {
      // Managers can only change users to/from user role
      // Cannot promote to admin or manager, cannot demote admins or managers
      if (currentTargetRole === "admin" || currentTargetRole === "manager") {
        return new Response(
          JSON.stringify({ success: false, error: "You cannot modify admin or manager roles" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }
      if (newRole === "admin" || newRole === "manager") {
        return new Response(
          JSON.stringify({ success: false, error: "You cannot promote users to admin or manager" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "You do not have permission to change roles" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Update role in user_roles table
    const { error: updateRoleError } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", targetUserId);

    if (updateRoleError) {
      console.error("Error updating user_roles:", updateRoleError);
      throw new Error(`Failed to update role: ${updateRoleError.message}`);
    }

    // Update role in profiles table for display purposes
    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("user_id", targetUserId);

    if (updateProfileError) {
      console.error("Error updating profile role:", updateProfileError);
      // Don't throw, profile update is secondary
    }

    console.log(`Role updated: ${targetUserId} -> ${newRole}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Role updated successfully",
        newRole,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Update role error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
