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

    // Check if request has email/password in body (for adding new employee)
    let adminEmail = "admin@admin.com";
    let adminPassword = "admin123";

    try {
      const body = await req.json();
      if (body?.email && body?.password) {
        adminEmail = body.email;
        adminPassword = body.password;
      }
    } catch {
      // No body or invalid JSON - use defaults for initial setup
    }

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAdmin = existingUsers?.users?.find(
      (u) => u.email === adminEmail
    );

    let userId: string;

    if (existingAdmin) {
      // If using default credentials, just return success
      if (adminEmail === "admin@admin.com") {
        userId = existingAdmin.id;
        console.log("Admin user already exists:", userId);
      } else {
        // If trying to add a new employee that already exists, return error
        return new Response(
          JSON.stringify({
            success: false,
            error: "User with this email already exists",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }
    } else {
      // Create new user
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
        });

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      userId = newUser.user.id;
      console.log("User created:", userId);
    }

    // Check if admin role already assigned
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId!)
      .eq("role", "admin")
      .single();

    if (!existingRole) {
      // Assign admin role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId!,
        role: "admin",
      });

      if (roleError) {
        throw new Error(`Failed to assign admin role: ${roleError.message}`);
      }
      console.log("Admin role assigned");
    } else {
      console.log("Admin role already assigned");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: adminEmail === "admin@admin.com" ? "Admin user setup complete" : "Employee added successfully",
        email: adminEmail,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Setup error:", errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
