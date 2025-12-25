import { useState, useEffect } from "react";
import { Loader2, History, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { getActivityIcon, getActivityLabel, ActivityEventType } from "@/lib/activity-logger";

interface ActivityLog {
  id: string;
  user_id: string;
  event_type: string;
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: unknown;
  created_at: string;
}

const ActivityLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  const fetchLogs = async (reset = false) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const currentPage = reset ? 0 : page;
      let query = supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      if (filterType !== "all") {
        query = query.eq("event_type", filterType);
      }

      if (searchTerm) {
        query = query.ilike("description", `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (reset) {
        setLogs(data || []);
        setPage(0);
      } else {
        setLogs(prev => [...prev, ...(data || [])]);
      }
      
      setHasMore((data?.length || 0) === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(true);
  }, [user, filterType]);

  const handleSearch = () => {
    fetchLogs(true);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    fetchLogs();
  };

  const getBrowserFromUA = (ua: string | null): string => {
    if (!ua) return "Unknown";
    if (ua.includes("Chrome") && !ua.includes("Edge")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return "Unknown";
  };

  const eventTypes: ActivityEventType[] = [
    "login",
    "login_failed",
    "logout",
    "password_changed",
    "email_changed",
    "2fa_enabled",
    "2fa_disabled",
    "2fa_recovery_used",
    "device_trusted",
    "device_removed",
    "session_removed",
    "employee_added",
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground mt-1">Track security events and account activity</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              View login attempts, settings changes, and security events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Search activity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getActivityIcon(type)} {getActivityLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Logs List */}
            {isLoading && logs.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No activity logs found
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-2xl">
                      {getActivityIcon(log.event_type as ActivityEventType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {getActivityLabel(log.event_type as ActivityEventType)}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {getBrowserFromUA(log.user_agent)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(log.created_at), "PPpp")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && logs.length > 0 && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ActivityLogs;
