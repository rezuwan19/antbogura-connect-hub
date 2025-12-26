import { useState } from "react";
import { Loader2, Shield, Key, Laptop, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activity-logger";

interface TwoFactorVerifyProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const TwoFactorVerify = ({ userId, onSuccess, onCancel }: TwoFactorVerifyProps) => {
  const [code, setCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
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

    if (/iPhone/.test(ua)) deviceName = "iPhone";
    else if (/iPad/.test(ua)) deviceName = "iPad";
    else if (/Android/.test(ua)) deviceName = "Android Device";
    else if (/Windows/.test(ua)) deviceName = "Windows PC";
    else if (/Mac/.test(ua)) deviceName = "Mac";
    else if (/Linux/.test(ua)) deviceName = "Linux PC";

    if (/Chrome/.test(ua) && !/Edge/.test(ua)) browser = "Chrome";
    else if (/Firefox/.test(ua)) browser = "Firefox";
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
    else if (/Edge/.test(ua)) browser = "Edge";

    if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
    else if (/Mac OS X/.test(ua)) os = "macOS";
    else if (/Android/.test(ua)) os = "Android";
    else if (/iOS|iPhone|iPad/.test(ua)) os = "iOS";
    else if (/Linux/.test(ua)) os = "Linux";

    return { deviceName, browser, os };
  };

  const saveAsTrustedDevice = async () => {
    try {
      const deviceToken = generateDeviceToken();
      const { deviceName, browser, os } = getDeviceInfo();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error } = await supabase.from("trusted_devices").insert({
        user_id: userId,
        device_token: deviceToken,
        device_name: deviceName,
        browser,
        os,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

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
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter a valid 6-digit code",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const totpFactor = factorsData.totp[0];
      if (!totpFactor) throw new Error("No TOTP factor found");

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code,
      });
      if (verifyError) throw verifyError;

      await logActivity({
        userId,
        eventType: "login",
        description: "Logged in with 2FA (authenticator app)",
      });

      setVerificationSuccess(true);

      if (rememberDevice) {
        await saveAsTrustedDevice();
      }

      // Short delay to show success state
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error: any) {
      console.error("Error verifying 2FA:", error);
      await logActivity({
        userId,
        eventType: "login_failed",
        description: "Failed 2FA verification attempt",
      });
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Invalid code. Please try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const hashCode = async (code: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(code.replace(/-/g, "").toUpperCase());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleVerifyRecovery = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = recoveryCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (cleanCode.length !== 8) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter a valid recovery code (8 characters)",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const codeHash = await hashCode(cleanCode);

      const { data: codes, error: fetchError } = await supabase
        .from("recovery_codes")
        .select("id")
        .eq("user_id", userId)
        .eq("code_hash", codeHash)
        .eq("used", false)
        .limit(1);

      if (fetchError) throw fetchError;

      if (!codes || codes.length === 0) {
        throw new Error("Invalid or already used recovery code");
      }

      const { error: updateError } = await supabase
        .from("recovery_codes")
        .update({ used: true, used_at: new Date().toISOString() })
        .eq("id", codes[0].id);

      if (updateError) throw updateError;

      await logActivity({
        userId,
        eventType: "2fa_recovery_used",
        description: "Logged in using a recovery code",
      });

      toast({
        title: "Recovery Code Used",
        description: "Consider generating new recovery codes in Settings",
      });

      setVerificationSuccess(true);

      if (rememberDevice) {
        await saveAsTrustedDevice();
      }

      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error: any) {
      console.error("Error verifying recovery code:", error);
      await logActivity({
        userId,
        eventType: "login_failed",
        description: "Failed recovery code verification attempt",
      });
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Invalid recovery code",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (verificationSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-600">Verification Successful</h3>
              <p className="text-muted-foreground mt-1">Redirecting to dashboard...</p>
            </div>
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
        <CardDescription>Verify your identity to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="authenticator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="authenticator">
              <Shield className="w-4 h-4 mr-2" />
              App
            </TabsTrigger>
            <TabsTrigger value="recovery">
              <Key className="w-4 h-4 mr-2" />
              Recovery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="authenticator" className="mt-4">
            <form onSubmit={handleVerifyTotp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totp-code">6-digit code from your app</Label>
                <Input
                  id="totp-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-2xl tracking-widest font-mono"
                  autoFocus
                />
              </div>

              {/* Remember Device Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="remember-device" className="cursor-pointer font-medium">
                      Remember this device
                    </Label>
                    <p className="text-xs text-muted-foreground">Skip 2FA for 30 days</p>
                  </div>
                </div>
                <Switch
                  id="remember-device"
                  checked={rememberDevice}
                  onCheckedChange={setRememberDevice}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isVerifying || code.length !== 6}>
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="recovery" className="mt-4">
            <form onSubmit={handleVerifyRecovery} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-code">Recovery Code</Label>
                <Input
                  id="recovery-code"
                  type="text"
                  placeholder="XXXX-XXXX"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                  className="text-center text-xl tracking-widest font-mono"
                />
                <p className="text-xs text-muted-foreground">Use one of your saved recovery codes</p>
              </div>

              {/* Remember Device Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="remember-device-recovery" className="cursor-pointer font-medium">
                      Remember this device
                    </Label>
                    <p className="text-xs text-muted-foreground">Skip 2FA for 30 days</p>
                  </div>
                </div>
                <Switch
                  id="remember-device-recovery"
                  checked={rememberDevice}
                  onCheckedChange={setRememberDevice}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Use Recovery Code"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <Button type="button" variant="outline" className="w-full mt-4" onClick={onCancel}>
          Back to Login
        </Button>
      </CardContent>
    </Card>
  );
};

export default TwoFactorVerify;
