import { useState } from "react";
import { Loader2, Shield, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activity-logger";
import TrustedDevicePrompt from "./TrustedDevicePrompt";

interface TwoFactorVerifyProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const TwoFactorVerify = ({ userId, onSuccess, onCancel }: TwoFactorVerifyProps) => {
  const [code, setCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showTrustPrompt, setShowTrustPrompt] = useState(false);
  const { toast } = useToast();

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

      setShowTrustPrompt(true);
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
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
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

      // Find and validate the recovery code
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

      // Mark code as used
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

      setShowTrustPrompt(true);
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

  if (showTrustPrompt) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Verification Successful</CardTitle>
          <CardDescription>
            Would you like to trust this device?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrustedDevicePrompt userId={userId} onContinue={onSuccess} />
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
        <CardDescription>
          Verify your identity to continue
        </CardDescription>
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
                <p className="text-xs text-muted-foreground">
                  Use one of your saved recovery codes
                </p>
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
