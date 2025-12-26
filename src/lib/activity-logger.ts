import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type ActivityEventType = 
  | "login"
  | "login_failed"
  | "logout"
  | "password_changed"
  | "email_changed"
  | "2fa_enabled"
  | "2fa_disabled"
  | "2fa_recovery_used"
  | "device_trusted"
  | "device_removed"
  | "session_removed"
  | "employee_added"
  | "employee_removed"
  | "status_changed";

interface LogActivityParams {
  userId: string;
  eventType: ActivityEventType;
  description: string;
  metadata?: Json;
}

export const logActivity = async ({
  userId,
  eventType,
  description,
  metadata = {},
}: LogActivityParams) => {
  try {
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
    
    await supabase.from("activity_logs").insert([{
      user_id: userId,
      event_type: eventType,
      description,
      user_agent: userAgent,
      metadata,
    }]);
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

export const getActivityIcon = (eventType: ActivityEventType): string => {
  const icons: Record<ActivityEventType, string> = {
    login: "🔐",
    login_failed: "❌",
    logout: "👋",
    password_changed: "🔑",
    email_changed: "📧",
    "2fa_enabled": "🛡️",
    "2fa_disabled": "⚠️",
    "2fa_recovery_used": "🔓",
    device_trusted: "✅",
    device_removed: "🗑️",
    session_removed: "📱",
    employee_added: "👤",
    employee_removed: "🚫",
    status_changed: "📋",
  };
  return icons[eventType] || "📝";
};

export const getActivityLabel = (eventType: ActivityEventType): string => {
  const labels: Record<ActivityEventType, string> = {
    login: "Login",
    login_failed: "Failed Login",
    logout: "Logout",
    password_changed: "Password Changed",
    email_changed: "Email Changed",
    "2fa_enabled": "2FA Enabled",
    "2fa_disabled": "2FA Disabled",
    "2fa_recovery_used": "Recovery Code Used",
    device_trusted: "Device Trusted",
    device_removed: "Device Removed",
    session_removed: "Session Removed",
    employee_added: "Employee Added",
    employee_removed: "Employee Removed",
    status_changed: "Status Changed",
  };
  return labels[eventType] || eventType;
};
