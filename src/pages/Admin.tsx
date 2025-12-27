import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cable, MessageSquare, AlertTriangle, Clock, CheckCircle, Loader2, Activity, TrendingUp, Users, Shield, UserCog, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { getActivityIcon, getActivityLabel, ActivityEventType } from "@/lib/activity-logger";
import { useAuth } from "@/contexts/AuthContext";

interface Stats {
  connectionRequests: { pending: number; inProgress: number; total: number };
  contactMessages: { pending: number; inProgress: number; total: number };
  problemReports: { pending: number; inProgress: number; total: number };
}

interface RoleStats {
  admins: number;
  managers: number;
  employees: number;
  total: number;
}

interface RecentActivity {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
  user_name?: string;
}

const Admin = () => {
  const { isAdmin, isManager } = useAuth();
  const canManageEmployees = isAdmin || isManager;
  
  const [stats, setStats] = useState<Stats>({
    connectionRequests: { pending: 0, inProgress: 0, total: 0 },
    contactMessages: { pending: 0, inProgress: 0, total: 0 },
    problemReports: { pending: 0, inProgress: 0, total: 0 },
  });
  const [roleStats, setRoleStats] = useState<RoleStats>({
    admins: 0,
    managers: 0,
    employees: 0,
    total: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch connection requests stats
        const { data: connectionData, error: connectionError } = await supabase
          .from("connection_requests")
          .select("status");
        
        if (connectionError) throw connectionError;
        
        // Fetch contact messages stats
        const { data: contactData, error: contactError } = await supabase
          .from("contact_messages")
          .select("status");
        
        if (contactError) throw contactError;
        
        // Fetch problem reports stats
        const { data: problemData, error: problemError } = await supabase
          .from("problem_reports")
          .select("status");
        
        if (problemError) throw problemError;

        // Fetch user role stats if user can manage employees
        if (canManageEmployees) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("role");

          if (!profileError && profileData) {
            setRoleStats({
              admins: profileData.filter((p) => p.role === "admin").length,
              managers: profileData.filter((p) => p.role === "manager").length,
              employees: profileData.filter((p) => p.role === "user" || p.role === "employee" || !p.role).length,
              total: profileData.length,
            });
          }
        }

        // Fetch recent activity logs
        const { data: activityData, error: activityError } = await supabase
          .from("activity_logs")
          .select("id, event_type, description, created_at, user_id")
          .order("created_at", { ascending: false })
          .limit(5);

        if (activityError) throw activityError;

        // Fetch user names for activity logs
        const activityWithNames = await Promise.all(
          (activityData || []).map(async (log) => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", log.user_id)
              .single();
            return { ...log, user_name: profile?.full_name || "Unknown User" };
          })
        );

        setRecentActivity(activityWithNames);

        setStats({
          connectionRequests: {
            pending: connectionData?.filter((r) => r.status === "pending").length || 0,
            inProgress: connectionData?.filter((r) => r.status === "in_progress").length || 0,
            total: connectionData?.length || 0,
          },
          contactMessages: {
            pending: contactData?.filter((m) => m.status === "pending").length || 0,
            inProgress: contactData?.filter((m) => m.status === "in_progress").length || 0,
            total: contactData?.length || 0,
          },
          problemReports: {
            pending: problemData?.filter((r) => r.status === "pending").length || 0,
            inProgress: problemData?.filter((r) => r.status === "in_progress").length || 0,
            total: problemData?.length || 0,
          },
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [canManageEmployees]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const totalPending = stats.connectionRequests.pending + stats.contactMessages.pending + stats.problemReports.pending;
  const totalInProgress = stats.connectionRequests.inProgress + stats.contactMessages.inProgress + stats.problemReports.inProgress;
  const totalItems = stats.connectionRequests.total + stats.contactMessages.total + stats.problemReports.total;

  const cards = [
    {
      title: "Connection Requests",
      icon: Cable,
      pending: stats.connectionRequests.pending,
      inProgress: stats.connectionRequests.inProgress,
      total: stats.connectionRequests.total,
      href: "/admin/connection-requests",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Contact Messages",
      icon: MessageSquare,
      pending: stats.contactMessages.pending,
      inProgress: stats.contactMessages.inProgress,
      total: stats.contactMessages.total,
      href: "/admin/contact-messages",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Problem Reports",
      icon: AlertTriangle,
      pending: stats.problemReports.pending,
      inProgress: stats.problemReports.inProgress,
      total: stats.problemReports.total,
      href: "/admin/problem-reports",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of all requests and messages
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-700">{totalPending}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">In Progress</p>
                  <p className="text-3xl font-bold text-blue-700">{totalInProgress}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Items</p>
                  <p className="text-3xl font-bold text-green-700">{totalItems}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Role Stats - Only for admins/managers */}
        {canManageEmployees && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Overview
                  </CardTitle>
                  <CardDescription>User counts by role</CardDescription>
                </div>
                <Link to="/admin/settings">
                  <span className="text-sm text-primary hover:underline">Manage Users</span>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10">
                  <Shield className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{roleStats.admins}</p>
                    <p className="text-sm text-muted-foreground">Admins</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10">
                  <UserCog className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{roleStats.managers}</p>
                    <p className="text-sm text-muted-foreground">Managers</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10">
                  <User className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{roleStats.employees}</p>
                    <p className="text-sm text-muted-foreground">Employees</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10">
                  <Users className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{roleStats.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link key={card.title} to={card.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{card.total}</div>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-yellow-600">
                      <Clock className="w-4 h-4" />
                      {card.pending} pending
                    </span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <TrendingUp className="w-4 h-4" />
                      {card.inProgress} in progress
                    </span>
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      {card.total - card.pending - card.inProgress} complete
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest status changes and actions</CardDescription>
              </div>
              <Link to="/admin/activity-logs">
                <span className="text-sm text-primary hover:underline">View All</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="text-xl">
                      {getActivityIcon(activity.event_type as ActivityEventType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {getActivityLabel(activity.event_type as ActivityEventType)}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                          {activity.user_name}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(activity.created_at), "PPp")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Admin;
