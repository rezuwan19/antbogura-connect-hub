import { useState, useEffect, useCallback } from "react";
import { Loader2, UserPlus, Key, Mail, Smartphone, Trash2, Shield, ShieldCheck, ShieldOff, Laptop, Users, Pencil } from "lucide-react";
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
import TwoFactorSetup from "@/components/auth/TwoFactorSetup";
import { RecoveryCodesManager } from "@/components/auth/RecoveryCodes";
import { logActivity } from "@/lib/activity-logger";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface DeviceSession {
  id: string;
  user_id: string;
  device_name: string;
  device_type: string;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  last_active: string;
  is_current: boolean | null;
  created_at: string;
}

interface TrustedDevice {
  id: string;
  user_id: string;
  device_token: string;
  device_name: string;
  browser: string | null;
  os: string | null;
  expires_at: string;
  created_at: string;
}

interface MfaFactor {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
  created_at: string;
}

interface Employee {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: string | null;
  created_at: string;
}

const Settings = () => {
  const { user, isAdmin, isManager, userRole } = useAuth();
  const { toast } = useToast();
  
  // Check if current user can manage employees (admin or manager)
  const canManageEmployees = isAdmin || isManager;

  // Add Employee State
  const [newEmployee, setNewEmployee] = useState({ 
    name: "", 
    phone: "", 
    email: "", 
    password: "", 
    confirmPassword: "",
    role: "user" as "admin" | "manager" | "user"
  });
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isDeletingEmployee, setIsDeletingEmployee] = useState(false);
  
  // Edit Role State
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [editingRole, setEditingRole] = useState<"admin" | "manager" | "user">("user");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Password Change State
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Email Change State
  const [newEmail, setNewEmail] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  // Device Sessions State
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // 2FA State
  const [mfaFactors, setMfaFactors] = useState<MfaFactor[]>([]);
  const [isLoadingMfa, setIsLoadingMfa] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  // Trusted Devices State
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [isLoadingTrusted, setIsLoadingTrusted] = useState(true);

  const fetchEmployees = useCallback(async () => {
    if (!canManageEmployees) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoadingEmployees(false);
    }
  }, [canManageEmployees]);

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

  const fetchMfaFactors = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      setMfaFactors(data.totp || []);
    } catch (error) {
      console.error("Error fetching MFA factors:", error);
    } finally {
      setIsLoadingMfa(false);
    }
  }, []);

  const fetchTrustedDevices = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("trusted_devices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrustedDevices(data || []);
    } catch (error) {
      console.error("Error fetching trusted devices:", error);
    } finally {
      setIsLoadingTrusted(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSessions();
    fetchMfaFactors();
    fetchTrustedDevices();
    if (canManageEmployees) {
      fetchEmployees();
    }
  }, [user, fetchMfaFactors, fetchTrustedDevices, canManageEmployees, fetchEmployees]);

  const handleDisableMfa = async () => {
    setIsDisabling(true);
    try {
      const factor = mfaFactors[0];
      if (!factor) return;

      const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
      if (error) throw error;

      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
      });
      setShowDisableDialog(false);
      fetchMfaFactors();
    } catch (error: any) {
      console.error("Error disabling MFA:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to disable 2FA",
      });
    } finally {
      setIsDisabling(false);
    }
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    fetchMfaFactors();
  };

  const handleRemoveTrustedDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase.from("trusted_devices").delete().eq("id", deviceId);
      if (error) throw error;

      if (user) {
        await logActivity({
          userId: user.id,
          eventType: "device_removed",
          description: "Removed a trusted device",
        });
      }

      toast({ title: "Success", description: "Trusted device removed" });
      fetchTrustedDevices();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to remove device" });
    }
  };

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

    if (!newEmployee.name.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Employee name is required" });
      return;
    }

    // Managers can only add employees (users), not admins or managers
    if (isManager && !isAdmin && (newEmployee.role === "admin" || newEmployee.role === "manager")) {
      toast({ variant: "destructive", title: "Error", description: "You can only add employees" });
      return;
    }

    setIsAddingEmployee(true);

    try {
      // Create user via edge function (server-side)
      const { data, error } = await supabase.functions.invoke("setup-admin", {
        body: { 
          email: newEmployee.email, 
          password: newEmployee.password,
          name: newEmployee.name,
          phone: newEmployee.phone,
          isEmployee: true,
          role: newEmployee.role,
        },
      });

      if (error) throw error;

      if (user) {
        await logActivity({
          userId: user.id,
          eventType: "employee_added",
          description: `Added new ${newEmployee.role}: ${newEmployee.name}`,
        });
      }

      toast({ title: "Success", description: `${newEmployee.role.charAt(0).toUpperCase() + newEmployee.role.slice(1)} added successfully. They can now login.` });
      setNewEmployee({ name: "", phone: "", email: "", password: "", confirmPassword: "", role: "user" });
      fetchEmployees();
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

  // Check if current user can delete a specific employee
  const canDeleteEmployee = (employee: Employee): boolean => {
    const employeeRole = employee.role || "user";
    
    // Admin can delete anyone
    if (isAdmin) return true;
    
    // Manager can only delete users (employees), not admins or managers
    if (isManager && !isAdmin) {
      return employeeRole === "user" || employeeRole === "employee";
    }
    
    return false;
  };

  // Check if current user can edit a specific employee's role
  const canEditRole = (employee: Employee): boolean => {
    const employeeRole = employee.role || "user";
    
    // Admin can edit anyone's role
    if (isAdmin) return true;
    
    // Manager can only edit users (employees), not admins or managers
    if (isManager && !isAdmin) {
      return employeeRole === "user" || employeeRole === "employee";
    }
    
    return false;
  };

  // Get available roles for the role selector based on current user's role
  const getAvailableRolesForEdit = (): ("admin" | "manager" | "user")[] => {
    if (isAdmin) {
      return ["admin", "manager", "user"];
    }
    // Managers can only set to user role
    return ["user"];
  };

  const handleUpdateRole = async () => {
    if (!employeeToEdit) return;
    
    // Double check permission
    if (!canEditRole(employeeToEdit)) {
      toast({ variant: "destructive", title: "Error", description: "You don't have permission to change this user's role" });
      setEmployeeToEdit(null);
      return;
    }

    setIsUpdatingRole(true);
    try {
      const { data, error } = await supabase.functions.invoke("update-user-role", {
        body: {
          targetUserId: employeeToEdit.user_id,
          newRole: editingRole,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      if (user) {
        await logActivity({
          userId: user.id,
          eventType: "status_changed",
          description: `Changed ${employeeToEdit.full_name}'s role from ${employeeToEdit.role || "user"} to ${editingRole}`,
        });
      }

      toast({ title: "Success", description: `Role updated to ${editingRole}` });
      setEmployeeToEdit(null);
      fetchEmployees();
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update role",
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    // Double check permission
    if (!canDeleteEmployee(employeeToDelete)) {
      toast({ variant: "destructive", title: "Error", description: "You don't have permission to remove this user" });
      setEmployeeToDelete(null);
      return;
    }
    
    setIsDeletingEmployee(true);
    try {
      // Delete profile first
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", employeeToDelete.id);

      if (profileError) throw profileError;

      // Delete user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", employeeToDelete.user_id);

      if (roleError) console.error("Error deleting role:", roleError);

      if (user) {
        await logActivity({
          userId: user.id,
          eventType: "employee_removed",
          description: `Removed ${employeeToDelete.role || "user"}: ${employeeToDelete.full_name}`,
        });
      }

      toast({ title: "Success", description: "Employee removed successfully" });
      setEmployeeToDelete(null);
      fetchEmployees();
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove employee",
      });
    } finally {
      setIsDeletingEmployee(false);
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

  // Determine which tabs to show based on role
  const tabItems = canManageEmployees
    ? [
        { value: "employees", label: "Employees", icon: Users },
        { value: "password", label: "Password", icon: Key },
        { value: "email", label: "Email", icon: Mail },
        { value: "security", label: "2FA", icon: Shield },
        { value: "devices", label: "Devices", icon: Smartphone },
      ]
    : [
        { value: "password", label: "Password", icon: Key },
        { value: "email", label: "Email", icon: Mail },
        { value: "security", label: "2FA", icon: Shield },
        { value: "devices", label: "Devices", icon: Smartphone },
      ];

  // Get role badge color
  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case "admin": return "destructive";
      case "manager": return "default";
      default: return "secondary";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            {canManageEmployees ? "Manage your account and employees" : "Manage your account settings"}
          </p>
        </div>

        <Tabs defaultValue={canManageEmployees ? "employees" : "password"} className="w-full">
          <TabsList className={`grid w-full lg:w-[600px]`} style={{ gridTemplateColumns: `repeat(${tabItems.length}, 1fr)` }}>
            {tabItems.map((item) => (
              <TabsTrigger key={item.value} value={item.value} className="gap-2">
                <item.icon className="w-4 h-4 hidden sm:inline" />
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Add Employee - Admin and Manager */}
          {canManageEmployees && (
            <TabsContent value="employees" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Add New User
                  </CardTitle>
                  <CardDescription>
                    Create a new account with a specific role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddEmployee} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="emp-name">Full Name *</Label>
                      <Input
                        id="emp-name"
                        type="text"
                        placeholder="John Doe"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emp-role">Role *</Label>
                      <Select
                        value={newEmployee.role}
                        onValueChange={(value: "admin" | "manager" | "user") => setNewEmployee({ ...newEmployee, role: value })}
                      >
                        <SelectTrigger id="emp-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Only admins can create admins and managers */}
                          {isAdmin && (
                            <>
                              <SelectItem value="admin">Admin (Full Access)</SelectItem>
                              <SelectItem value="manager">Manager (Can manage employees)</SelectItem>
                            </>
                          )}
                          <SelectItem value="user">Employee (Limited access)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {newEmployee.role === "admin" && "Admins have full access to all features"}
                        {newEmployee.role === "manager" && "Managers can add/remove employees but not admins"}
                        {newEmployee.role === "user" && "Employees have access to all features except employee management"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emp-phone">Phone Number</Label>
                      <Input
                        id="emp-phone"
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={newEmployee.phone}
                        onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emp-email">Email Address *</Label>
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
                      <Label htmlFor="emp-password">Password *</Label>
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
                      <Label htmlFor="emp-confirm">Confirm Password *</Label>
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
                          Add {newEmployee.role.charAt(0).toUpperCase() + newEmployee.role.slice(1)}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Employee List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User List
                  </CardTitle>
                  <CardDescription>
                    All registered users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingEmployees ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : employees.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No users found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Added</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {employees.map((employee) => (
                            <TableRow key={employee.id}>
                              <TableCell className="font-medium">
                                {employee.full_name || "N/A"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getRoleBadgeVariant(employee.role)}>
                                  {employee.role || "user"}
                                </Badge>
                              </TableCell>
                              <TableCell>{employee.phone || "N/A"}</TableCell>
                              <TableCell>{employee.email || "N/A"}</TableCell>
                              <TableCell>
                                {format(new Date(employee.created_at), "PP")}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {canEditRole(employee) && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setEmployeeToEdit(employee);
                                        setEditingRole((employee.role as "admin" | "manager" | "user") || "user");
                                      }}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {canDeleteEmployee(employee) ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => setEmployeeToDelete(employee)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    !canEditRole(employee) && (
                                      <span className="text-xs text-muted-foreground">Protected</span>
                                    )
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

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
                              <Laptop className="w-5 h-5 text-primary" />
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

          {/* Security / 2FA */}
          <TabsContent value="security" className="space-y-6">
            {showSetup ? (
              <TwoFactorSetup
                onComplete={handleSetupComplete}
                onCancel={() => setShowSetup(false)}
              />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Two-Factor Authentication
                    </CardTitle>
                    <CardDescription>
                      Add an extra layer of security using an authenticator app
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMfa ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : mfaFactors.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                          <ShieldCheck className="w-8 h-8 text-green-600" />
                          <div>
                            <p className="font-medium text-green-600">2FA is Enabled</p>
                            <p className="text-sm text-muted-foreground">
                              Your account is protected with an authenticator app
                            </p>
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2">Recovery Codes</h4>
                          <RecoveryCodesManager />
                        </div>
                        <Separator />
                        <Button variant="destructive" onClick={() => setShowDisableDialog(true)}>
                          <ShieldOff className="w-4 h-4 mr-2" />
                          Disable 2FA
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <Shield className="w-8 h-8 text-yellow-600" />
                          <div>
                            <p className="font-medium text-yellow-600">2FA is Not Enabled</p>
                            <p className="text-sm text-muted-foreground">
                              Enable two-factor authentication for better security
                            </p>
                          </div>
                        </div>
                        <Button onClick={() => setShowSetup(true)}>
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Enable 2FA
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Trusted Devices */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Laptop className="w-5 h-5" />
                          Trusted Devices
                        </CardTitle>
                        <CardDescription>
                          Devices that can skip 2FA verification for 30 days
                        </CardDescription>
                      </div>
                      {trustedDevices.length > 0 && (
                        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                          {trustedDevices.length} device{trustedDevices.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTrusted ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : trustedDevices.length === 0 ? (
                      <div className="text-center py-8 space-y-2">
                        <Laptop className="w-12 h-12 mx-auto text-muted-foreground/50" />
                        <p className="text-muted-foreground">No trusted devices</p>
                        <p className="text-xs text-muted-foreground">
                          When you log in with 2FA, you can choose to trust your device for 30 days
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {trustedDevices.map((device) => {
                          const isExpired = new Date(device.expires_at) < new Date();
                          const daysLeft = Math.max(0, Math.ceil((new Date(device.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                          const isCurrentDevice = localStorage.getItem(`trusted_device_${user?.id}`) === device.device_token;
                          
                          return (
                            <div 
                              key={device.id} 
                              className={`flex items-center justify-between p-4 rounded-lg border ${
                                isCurrentDevice ? "border-primary/50 bg-primary/5" : ""
                              } ${isExpired ? "opacity-60" : ""}`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  isCurrentDevice ? "bg-primary/10" : "bg-muted"
                                }`}>
                                  <Laptop className={`w-5 h-5 ${isCurrentDevice ? "text-primary" : "text-muted-foreground"}`} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{device.device_name}</p>
                                    {isCurrentDevice && (
                                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                                        This device
                                      </span>
                                    )}
                                    {isExpired && (
                                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                                        Expired
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {device.browser} on {device.os}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {isExpired 
                                      ? `Expired ${format(new Date(device.expires_at), "PP")}`
                                      : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining • Expires ${format(new Date(device.expires_at), "PP")}`
                                    }
                                  </p>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                                onClick={() => handleRemoveTrustedDevice(device.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Disable 2FA Confirmation Dialog */}
        <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the extra security layer from your account. You can re-enable it anytime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDisableMfa}
                disabled={isDisabling}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDisabling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  "Disable 2FA"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Employee Confirmation Dialog */}
        <AlertDialog open={!!employeeToDelete} onOpenChange={() => setEmployeeToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Employee?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {employeeToDelete?.full_name || "this employee"}? 
                This will remove their access but won't delete their account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteEmployee}
                disabled={isDeletingEmployee}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeletingEmployee ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove Employee"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Role Dialog */}
        <Dialog open={!!employeeToEdit} onOpenChange={() => setEmployeeToEdit(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Role</DialogTitle>
              <DialogDescription>
                Update the role for {employeeToEdit?.full_name || "this user"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current Role</Label>
                <Badge variant={getRoleBadgeVariant(employeeToEdit?.role || null)}>
                  {employeeToEdit?.role || "user"}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-role">New Role</Label>
                <Select
                  value={editingRole}
                  onValueChange={(value: "admin" | "manager" | "user") => setEditingRole(value)}
                >
                  <SelectTrigger id="new-role">
                    <SelectValue placeholder="Select new role" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableRolesForEdit().map((role) => (
                      <SelectItem key={role} value={role}>
                        {role === "admin" && "Admin (Full Access)"}
                        {role === "manager" && "Manager (Can manage employees)"}
                        {role === "user" && "Employee (Limited access)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {editingRole === "admin" && "Admins have full access to all features"}
                  {editingRole === "manager" && "Managers can add/remove employees but not admins"}
                  {editingRole === "user" && "Employees have access to all features except employee management"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEmployeeToEdit(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRole} disabled={isUpdatingRole || editingRole === employeeToEdit?.role}>
                {isUpdatingRole ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Role"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Settings;
