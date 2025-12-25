import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Wifi, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import TwoFactorVerify from "@/components/auth/TwoFactorVerify";
import { checkTrustedDevice } from "@/components/auth/TrustedDevicePrompt";
import { logActivity } from "@/lib/activity-logger";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [mfaUserId, setMfaUserId] = useState<string | null>(null);
  const { signIn, user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!isLoading && user && !requiresMfa) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [user, isAdmin, isLoading, navigate, requiresMfa]);

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    const { error } = await signIn(data.email, data.password);
    
    if (error) {
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
      });
      return;
    }

    // Get current user to check MFA
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user;
    
    if (!currentUser) {
      setIsSubmitting(false);
      return;
    }

    // Check if MFA is required
    const { data: assuranceData, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    if (assuranceError) {
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check authentication status",
      });
      return;
    }

    // If MFA is required (user has MFA enrolled)
    if (assuranceData.nextLevel === "aal2" && assuranceData.currentLevel === "aal1") {
      // Check if this is a trusted device
      const isTrusted = await checkTrustedDevice(currentUser.id);
      
      if (isTrusted) {
        // Skip MFA for trusted device
        await logActivity({
          userId: currentUser.id,
          eventType: "login",
          description: "Logged in (2FA skipped - trusted device)",
        });
        
        setIsSubmitting(false);
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
        return;
      }

      setMfaUserId(currentUser.id);
      setRequiresMfa(true);
      setIsSubmitting(false);
      return;
    }

    // No MFA required - log activity
    await logActivity({
      userId: currentUser.id,
      eventType: "login",
      description: "Logged in successfully",
    });

    setIsSubmitting(false);
    toast({
      title: "Welcome back!",
      description: "You have been logged in successfully.",
    });
  };

  const handleMfaSuccess = () => {
    setRequiresMfa(false);
    setMfaUserId(null);
    toast({
      title: "Welcome back!",
      description: "You have been logged in successfully.",
    });
  };

  const handleMfaCancel = async () => {
    await supabase.auth.signOut();
    setRequiresMfa(false);
    setMfaUserId(null);
    loginForm.reset();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show MFA verification screen if required
  if (requiresMfa && mfaUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <TwoFactorVerify 
          userId={mfaUserId} 
          onSuccess={handleMfaSuccess} 
          onCancel={handleMfaCancel} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2">
            <Wifi className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary">ANT Bogura</span>
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="admin@admin.com"
                {...loginForm.register("email")}
              />
              {loginForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...loginForm.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
