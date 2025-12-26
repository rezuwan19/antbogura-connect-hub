import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import StatusUpdateDialog from "@/components/admin/StatusUpdateDialog";
import { logActivity } from "@/lib/activity-logger";

interface ProblemReport {
  id: string;
  name: string;
  phone: string;
  customer_id: string | null;
  problem_type: string;
  description: string;
  status: string;
  status_notes: string | null;
  updated_by: string | null;
  sms_sent: boolean | null;
  created_at: string;
  updated_at: string;
  updated_by_name?: string;
}

type RequestStatus = "pending" | "in_progress" | "complete" | "cancelled";

const statusColors: Record<RequestStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  complete: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const problemTypeLabels: Record<string, string> = {
  no_connection: "No Connection",
  slow_speed: "Slow Speed",
  intermittent: "Intermittent Connection",
  billing: "Billing Issue",
  other: "Other",
};

const ProblemReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProblemReport | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      let query = supabase
        .from("problem_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus as RequestStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch updater names from profiles
      const reportsWithNames = await Promise.all(
        (data || []).map(async (report) => {
          if (report.updated_by) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", report.updated_by)
              .single();
            return { ...report, updated_by_name: profile?.full_name || "Unknown" };
          }
          return { ...report, updated_by_name: undefined };
        })
      );

      setReports(reportsWithNames);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch problem reports.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const updateStatus = async (status: RequestStatus, notes: string) => {
    if (!selectedReport || !user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("problem_reports")
        .update({ 
          status,
          status_notes: notes || null,
          updated_by: user.id,
        })
        .eq("id", selectedReport.id);

      if (error) throw error;

      // Log the activity
      await logActivity({
        userId: user.id,
        eventType: "status_changed",
        description: `Problem report for ${selectedReport.name} changed to ${status}${notes ? ` - ${notes}` : ""}`,
        metadata: {
          table: "problem_reports",
          recordId: selectedReport.id,
          oldStatus: selectedReport.status,
          newStatus: status,
          notes,
        },
      });

      toast({
        title: "Status Updated",
        description: `Report status changed to ${status}.`,
      });

      fetchReports();
      setSelectedReport(null);
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Problem Reports</h1>
            <p className="text-muted-foreground mt-1">
              Handle customer service issues and complaints
            </p>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No problem reports found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{report.name}</h3>
                        <Badge variant="outline" className={statusColors[report.status as RequestStatus]}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{report.phone}</p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Issue:</span>{" "}
                        <span className="font-medium">
                          {problemTypeLabels[report.problem_type] || report.problem_type}
                        </span>
                      </p>
                      {report.updated_by_name && (
                        <p className="text-xs text-muted-foreground">
                          Updated by: <span className="font-medium">{report.updated_by_name}</span>
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(report.created_at), "PPp")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Problem Report Details</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedReport.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedReport.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer ID</p>
                    <p className="font-medium">{selectedReport.customer_id || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Problem Type</p>
                    <p className="font-medium">
                      {problemTypeLabels[selectedReport.problem_type] || selectedReport.problem_type}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium whitespace-pre-wrap">{selectedReport.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium">
                    {format(new Date(selectedReport.created_at), "PPpp")}
                  </p>
                </div>
                {selectedReport.status_notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Previous Notes</p>
                    <p className="font-medium bg-muted p-2 rounded">{selectedReport.status_notes}</p>
                  </div>
                )}
                {selectedReport.updated_by_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated By</p>
                    <p className="font-medium">{selectedReport.updated_by_name}</p>
                  </div>
                )}
                <StatusUpdateDialog onUpdateStatus={updateStatus} isUpdating={isUpdating} />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ProblemReports;
