import { useState } from "react";
import { Loader2, Shield, Laptop } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activity-logger";

interface TrustedDevicePromptProps {
  userId: string;
  onContinue: () => void;
}

const TrustedDevicePrompt = ({ userId, onContinue }: TrustedDevicePromptProps) => {
  const [trustDevice, setTrustDevice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const generateDeviceToken = (): string => {
    return Array.from({ length: 64 }, () => 
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 62)]
    ).join("");
  };

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let deviceName = "Unknown Device";
    let browser = "Unknown";
    let os = "Unknown";

    // Detect device
    if (/iPhone/.test(ua)) deviceName = "iPhone";
    else if (/iPad/.test(ua)) deviceName = "iPad";
    else if (/Android/.test(ua)) deviceName = "Android Device";
    else if (/Windows/.test(ua)) deviceName = "Windows PC";
    else if (/Mac/.test(ua)) deviceName = "Mac";
    else if (/Linux/.test(ua)) deviceName = "Linux PC";

    // Detect browser
    if (/Chrome/.test(ua) && !/Edge/.test(ua)) browser = "Chrome";
    else if (/Firefox/.test(ua)) browser = "Firefox";
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
    else if (/Edge/.test(ua)) browser = "Edge";

    // Detect OS
    if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
    else if (/Mac OS X/.test(ua)) os = "macOS";
    else if (/Android/.test(ua)) os = "Android";
    else if (/iOS|iPhone|iPad/.test(ua)) os = "iOS";
    else if (/Linux/.test(ua)) os = "Linux";

    return { deviceName, browser, os };
  };

  const handleContinue = async () => {
    if (trustDevice) {
      setIsSaving(true);
      try {
        const deviceToken = generateDeviceToken();
        const { deviceName, browser, os } = getDeviceInfo();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

        const { error } = await supabase.from("trusted_devices").insert({
          user_id: userId,
          device_token: deviceToken,
          device_name: deviceName,
          browser,
          os,
          expires_at: expiresAt.toISOString(),
        });

        if (error) throw error;

        // Store token in localStorage
        localStorage.setItem(`trusted_device_${userId}`, deviceToken);

        await logActivity({
          userId,
          eventType: "device_trusted",
          description: `Trusted ${deviceName} (${browser} on ${os}) for 30 days`,
        });

        toast({
          title: "Device Trusted",
          description: "This device will skip 2FA for 30 days",
        });
      } catch (error: any) {
        console.error("Error trusting device:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save trusted device",
        });
      } finally {
        setIsSaving(false);
      }
    }
    onContinue();
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-start gap-3">
        <Checkbox
          id="trust-device"
          checked={trustDevice}
          onCheckedChange={(checked) => setTrustDevice(checked === true)}
        />
        <div className="space-y-1">
          <Label htmlFor="trust-device" className="cursor-pointer flex items-center gap-2">
            <Laptop className="w-4 h-4" />
            Trust this device for 30 days
          </Label>
          <p className="text-xs text-muted-foreground">
            You won't be asked for 2FA on this device for the next 30 days
          </p>
        </div>
      </div>
      <Button onClick={handleContinue} className="w-full" disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Continue
          </>
        )}
      </Button>
    </div>
  );
};

export default TrustedDevicePrompt;

// Utility to check if device is trusted
export const checkTrustedDevice = async (userId: string): Promise<boolean> => {
  const storedToken = localStorage.getItem(`trusted_device_${userId}`);
  if (!storedToken) return false;

  try {
    const { data, error } = await supabase
      .from("trusted_devices")
      .select("id, expires_at")
      .eq("user_id", userId)
      .eq("device_token", storedToken)
      .single();

    if (error || !data) {
      localStorage.removeItem(`trusted_device_${userId}`);
      return false;
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      // Clean up expired device
      await supabase.from("trusted_devices").delete().eq("id", data.id);
      localStorage.removeItem(`trusted_device_${userId}`);
      return false;
    }

    return true;
  } catch {
    return false;
  }
};
