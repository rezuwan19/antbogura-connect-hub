import { useState, useEffect } from "react";
import { Loader2, UserPlus, Key, Mail, Smartphone, Trash2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type DeviceSession = Tables<"device_sessions">;

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Add Employee State
  const [newEmployee, setNewEmployee] = useState({ email: "", password: "", confirmPassword: "" });
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);

  // Password Change State
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Email Change State
  const [newEmail, setNewEmail] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  // Device Sessions State
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  const fetchSessions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("device_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("last_active", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  // Track current device session
  useEffect(() => {
    const trackSession = async () => {
      if (!user) return;

      const userAgent = navigator.userAgent;
      const deviceName = getDeviceName(userAgent);
      const browser = getBrowser(userAgent);
      const os = getOS(userAgent);
      const deviceType = getDeviceType(userAgent);

      // Check if session exists for this device
      const sessionKey = `device_session_${user.id}`;
      const existingSessionId = localStorage.getItem(sessionKey);

      if (existingSessionId) {
        // Update last_active
        await supabase
          .from("device_sessions")
          .update({ last_active: new Date().toISOString(), is_current: true })
          .eq("id", existingSessionId);
      } else {
        // Create new session
        const { data } = await supabase
          .from("device_sessions")
          .insert({
            user_id: user.id,
            device_name: deviceName,
            device_type: deviceType,
            browser,
            os,
            is_current: true,
          })
          .select()
          .single();

        if (data) {
          localStorage.setItem(sessionKey, data.id);
        }
      }

      fetchSessions();
    };

    trackSession();
  }, [user]);

  const getDeviceName = (ua: string): string => {
    if (/iPhone/.test(ua)) return "iPhone";
    if (/iPad/.test(ua)) return "iPad";
    if (/Android/.test(ua)) return "Android Device";
    if (/Windows/.test(ua)) return "Windows PC";
    if (/Mac/.test(ua)) return "Mac";
    if (/Linux/.test(ua)) return "Linux PC";
    return "Unknown Device";
  };

  const getBrowser = (ua: string): string => {
    if (/Chrome/.test(ua) && !/Edge/.test(ua)) return "Chrome";
    if (/Firefox/.test(ua)) return "Firefox";
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return "Safari";
    if (/Edge/.test(ua)) return "Edge";
    if (/Opera/.test(ua)) return "Opera";
    return "Unknown";
  };

  const getOS = (ua: string): string => {
    if (/Windows NT 10/.test(ua)) return "Windows 10/11";
    if (/Windows/.test(ua)) return "Windows";
    if (/Mac OS X/.test(ua)) return "macOS";
    if (/Android/.test(ua)) return "Android";
    if (/iOS|iPhone|iPad/.test(ua)) return "iOS";
    if (/Linux/.test(ua)) return "Linux";
    return "Unknown";
  };

  const getDeviceType = (ua: string): string => {
    if (/Mobile|Android|iPhone/.test(ua)) return "mobile";
    if (/iPad|Tablet/.test(ua)) return "tablet";
    return "desktop";
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newEmployee.password !== newEmployee.confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Passwords do not match" });
      return;
    }

    if (newEmployee.password.length < 6) {
      toast({ variant: "destructive", title: "Error", description: "Password must be at least 6 characters" });
      return;
    }

    setIsAddingEmployee(true);

    try {
      // Create user via edge function (server-side)
      const { data, error } = await supabase.functions.invoke("setup-admin", {
        body: { email: newEmployee.email, password: newEmployee.password },
      });

      if (error) throw error;

      toast({ title: "Success", description: "Employee added successfully. They can now login." });
      setNewEmployee({ email: "", password: "", confirmPassword: "" });
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add employee",
      });
    } finally {
      setIsAddingEmployee(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      toast({ variant: "destructive", title: "Error", description: "Passwords do not match" });
      return;
    }

    if (passwords.new.length < 6) {
      toast({ variant: "destructive", title: "Error", description: "Password must be at least 6 characters" });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });

      if (error) throw error;

      toast({ title: "Success", description: "Password changed successfully" });
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to change password",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a valid email" });
      return;
    }

    setIsChangingEmail(true);

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) throw error;

      toast({
        title: "Verification Email Sent",
        description: "Check your new email to confirm the change",
      });
      setNewEmail("");
    } catch (error: any) {
      console.error("Error changing email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to change email",
      });
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleRemoveSession = async (sessionId: string) => {
    try {
      const { error } = await supabase.from("device_sessions").delete().eq("id", sessionId);

      if (error) throw error;

      // Remove from local storage if it's the current session
      const sessionKey = `device_session_${user?.id}`;
      if (localStorage.getItem(sessionKey) === sessionId) {
        localStorage.removeItem(sessionKey);
      }

      toast({ title: "Success", description: "Device session removed" });
      fetchSessions();
    } catch (error: any) {
      console.error("Error removing session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove session",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and employees</p>
        </div>

        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="employees" className="gap-2">
              <UserPlus className="w-4 h-4 hidden sm:inline" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="password" className="gap-2">
              <Key className="w-4 h-4 hidden sm:inline" />
              Password
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="w-4 h-4 hidden sm:inline" />
              Email
            </TabsTrigger>
            <TabsTrigger value="devices" className="gap-2">
              <Smartphone className="w-4 h-4 hidden sm:inline" />
              Devices
            </TabsTrigger>
          </TabsList>

          {/* Add Employee */}
          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Add New Employee
                </CardTitle>
                <CardDescription>
                  Create a new admin account for an employee
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddEmployee} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="emp-email">Email Address</Label>
                    <Input
                      id="emp-email"
                      type="email"
                      placeholder="employee@example.com"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emp-password">Password</Label>
                    <Input
                      id="emp-password"
                      type="password"
                      placeholder="Min 6 characters"
                      value={newEmployee.password}
                      onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emp-confirm">Confirm Password</Label>
                    <Input
                      id="emp-confirm"
                      type="password"
                      placeholder="Confirm password"
                      value={newEmployee.confirmPassword}
                      onChange={(e) => setNewEmployee({ ...newEmployee, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isAddingEmployee}>
                    {isAddingEmployee ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Employee
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Change Password */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Min 6 characters"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Change Email */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Change Email
                </CardTitle>
                <CardDescription>
                  Current email: <span className="font-medium">{user?.email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangeEmail} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="new-email">New Email Address</Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="newemail@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isChangingEmail}>
                    {isChangingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Change Email
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Device Sessions */}
          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Active Devices
                </CardTitle>
                <CardDescription>Manage devices that are logged into your account</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No active sessions found</p>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {session.device_type === "mobile" ? (
                              <Smartphone className="w-5 h-5 text-primary" />
                            ) : (
                              <Smartphone className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{session.device_name}</p>
                              {session.is_current && (
                                <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {session.browser} on {session.os}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last active: {format(new Date(session.last_active), "PPp")}
                            </p>
                          </div>
                        </div>
                        {!session.is_current && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveSession(session.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;
