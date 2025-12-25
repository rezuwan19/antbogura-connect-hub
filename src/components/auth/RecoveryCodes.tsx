import { useState } from "react";
import { Copy, Check, Download, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { logActivity } from "@/lib/activity-logger";

interface RecoveryCodesProps {
  codes: string[];
  onClose: () => void;
  isNewSetup?: boolean;
}

const RecoveryCodes = ({ codes, onClose, isNewSetup = false }: RecoveryCodesProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied", description: "Recovery codes copied to clipboard" });
  };

  const handleDownload = () => {
    const content = `NetNest BD - 2FA Recovery Codes\n${"=".repeat(40)}\n\nKeep these codes safe. Each code can only be used once.\n\n${codes.map((code, i) => `${i + 1}. ${code}`).join("\n")}\n\nGenerated: ${new Date().toLocaleString()}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Recovery codes saved to file" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Save Your Recovery Codes
        </CardTitle>
        <CardDescription>
          {isNewSetup 
            ? "Save these codes in a safe place. You'll need them if you lose access to your authenticator app."
            : "These are your recovery codes. Each code can only be used once."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted rounded-lg p-4">
          <div className="grid grid-cols-2 gap-2">
            {codes.map((code, index) => (
              <code
                key={index}
                className="bg-background px-3 py-2 rounded text-sm font-mono text-center"
              >
                {code}
              </code>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleCopy}>
            {copied ? (
              <Check className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? "Copied!" : "Copy All"}
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-sm text-yellow-600 dark:text-yellow-500">
            <strong>Important:</strong> Store these codes securely. Without them, you may lose access 
            to your account if you lose your authenticator device.
          </p>
        </div>

        <Button onClick={onClose} className="w-full">
          I've Saved My Codes
        </Button>
      </CardContent>
    </Card>
  );
};

// Component to manage recovery codes
interface RecoveryCodesManagerProps {
  onGenerate?: (codes: string[]) => void;
}

export const RecoveryCodesManager = ({ onGenerate }: RecoveryCodesManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);
  const [showCodes, setShowCodes] = useState(false);
  const [remainingCodes, setRemainingCodes] = useState<number | null>(null);

  const generateCodes = (): string[] => {
    const newCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Array.from({ length: 8 }, () => 
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
      ).join("");
      newCodes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return newCodes;
  };

  const hashCode = async (code: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(code.replace("-", "").toUpperCase());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const handleGenerateCodes = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      // Delete existing codes
      await supabase.from("recovery_codes").delete().eq("user_id", user.id);

      // Generate new codes
      const newCodes = generateCodes();
      
      // Hash and store codes
      const hashedCodes = await Promise.all(
        newCodes.map(async (code) => ({
          user_id: user.id,
          code_hash: await hashCode(code),
        }))
      );

      const { error } = await supabase.from("recovery_codes").insert(hashedCodes);
      if (error) throw error;

      setCodes(newCodes);
      setShowCodes(true);
      setRemainingCodes(10);
      onGenerate?.(newCodes);

      await logActivity({
        userId: user.id,
        eventType: "2fa_enabled",
        description: "Generated new recovery codes",
      });

      toast({ title: "Success", description: "Recovery codes generated" });
    } catch (error: any) {
      console.error("Error generating codes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate recovery codes",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchRemainingCodes = async () => {
    if (!user) return;
    const { count } = await supabase
      .from("recovery_codes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("used", false);
    setRemainingCodes(count);
  };

  useState(() => {
    fetchRemainingCodes();
  });

  if (showCodes && codes.length > 0) {
    return (
      <RecoveryCodes
        codes={codes}
        onClose={() => {
          setShowCodes(false);
          setCodes([]);
        }}
        isNewSetup
      />
    );
  }

  return (
    <div className="space-y-4">
      {remainingCodes !== null && (
        <p className="text-sm text-muted-foreground">
          You have <span className="font-medium">{remainingCodes}</span> unused recovery codes remaining.
        </p>
      )}
      <Button onClick={handleGenerateCodes} disabled={isGenerating} variant="outline">
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            {remainingCodes === 0 || remainingCodes === null ? "Generate Recovery Codes" : "Regenerate Codes"}
          </>
        )}
      </Button>
      {remainingCodes !== null && remainingCodes <= 3 && remainingCodes > 0 && (
        <p className="text-sm text-yellow-600">
          ⚠️ You're running low on recovery codes. Consider generating new ones.
        </p>
      )}
    </div>
  );
};

export default RecoveryCodes;
