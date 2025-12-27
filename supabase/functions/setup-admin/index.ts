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
    let employeeName = "";
    let employeePhone = "";
    let isEmployee = false;
    let assignRole = "user"; // Default role for employees

    try {
      const body = await req.json();
      if (body?.email && body?.password) {
        adminEmail = body.email;
        adminPassword = body.password;
        employeeName = body.name || "";
        employeePhone = body.phone || "";
        isEmployee = body.isEmployee || false;
        assignRole = body.role || "user"; // Accept role from request
      }
    } catch {
      // No body or invalid JSON - use defaults for initial setup
    }

    // Validate role
    const validRoles = ["admin", "manager", "user"];
    if (!validRoles.includes(assignRole)) {
      assignRole = "user";
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

    // Check if role already assigned
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId!)
      .single();

    if (!existingRole) {
      // Assign role based on isEmployee flag and provided role
      const roleToAssign = isEmployee ? assignRole : "admin";
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId!,
        role: roleToAssign,
      });

      if (roleError) {
        throw new Error(`Failed to assign role: ${roleError.message}`);
      }
      console.log("Role assigned:", roleToAssign);
    } else {
      console.log("Role already assigned");
    }

    // Create or update profile if employee details provided
    if (isEmployee && (employeeName || employeePhone)) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          user_id: userId!,
          full_name: employeeName,
          phone: employeePhone,
          email: adminEmail,
          role: assignRole, // Store readable role in profile
        }, { onConflict: "user_id" });

      if (profileError) {
        console.error("Failed to create profile:", profileError.message);
      } else {
        console.log("Profile created/updated");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: adminEmail === "admin@admin.com" ? "Admin user setup complete" : "Employee added successfully",
        email: adminEmail,
        userId: userId,
        role: assignRole,
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
