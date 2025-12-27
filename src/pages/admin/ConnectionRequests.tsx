import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Eye, Download, Search } from "lucide-react";
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
import { exportToCSV } from "@/lib/csv-export";
import { Input } from "@/components/ui/input";

interface ConnectionRequest {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  package_name: string | null;
  district: string | null;
  upazila: string | null;
  message: string | null;
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

const statusMessages: Record<RequestStatus, string> = {
  pending: "আপনার কানেকশন রিকোয়েস্ট পেন্ডিং আছে। শীঘ্রই আপডেট দিব। - ANT Bogura",
  in_progress: "আপনার কানেকশন রিকোয়েস্ট প্রসেস হচ্ছে। আমাদের টিম কাজ করছে। - ANT Bogura",
  complete: "অভিনন্দন! আপনার কানেকশন সম্পন্ন হয়েছে। ইন্টারনেট উপভোগ করুন! - ANT Bogura",
  cancelled: "দুঃখিত! আপনার কানেকশন রিকোয়েস্ট বাতিল করা হয়েছে। বিস্তারিত জানতে যোগাযোগ করুন। - ANT Bogura",
};

const ConnectionRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ConnectionRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { toast } = useToast();

  const filteredRequests = requests.filter((request) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.name.toLowerCase().includes(query) ||
      request.phone.toLowerCase().includes(query) ||
      (request.email?.toLowerCase().includes(query) ?? false) ||
      (request.package_name?.toLowerCase().includes(query) ?? false) ||
      (request.address?.toLowerCase().includes(query) ?? false)
    );
  });

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from("connection_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus as RequestStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch updater names from profiles
      const requestsWithNames = await Promise.all(
        (data || []).map(async (request) => {
          if (request.updated_by) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", request.updated_by)
              .single();
            return { ...request, updated_by_name: profile?.full_name || "Unknown" };
          }
          return { ...request, updated_by_name: undefined };
        })
      );

      setRequests(requestsWithNames);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch connection requests.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const sendStatusSms = async (phone: string, status: RequestStatus, recordId: string) => {
    try {
      await supabase.functions.invoke("send-sms", {
        body: {
          phone,
          message: statusMessages[status],
          type: "status_update",
          recordId,
          tableName: "connection_requests",
        },
      });
    } catch (error) {
      console.error("SMS sending failed:", error);
    }
  };

  const updateStatus = async (status: RequestStatus, notes: string) => {
    if (!selectedRequest || !user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("connection_requests")
        .update({ 
          status,
          status_notes: notes || null,
          updated_by: user.id,
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      // Log the activity
      await logActivity({
        userId: user.id,
        eventType: "status_changed",
        description: `Connection request for ${selectedRequest.name} changed to ${status}${notes ? ` - ${notes}` : ""}`,
        metadata: {
          table: "connection_requests",
          recordId: selectedRequest.id,
          oldStatus: selectedRequest.status,
          newStatus: status,
          notes,
        },
      });

      // Send SMS notification (fire-and-forget)
      void sendStatusSms(selectedRequest.phone, status, selectedRequest.id);

      toast({
        title: "Status Updated",
        description: `Request status changed to ${status}.`,
      });

      fetchRequests();
      setSelectedRequest(null);
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
            <h1 className="text-3xl font-bold">Connection Requests</h1>
            <p className="text-muted-foreground mt-1">
              Manage new connection requests from customers
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-[220px]"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(filteredRequests, "connection_requests", [
                { key: "name", label: "Name" },
                { key: "phone", label: "Phone" },
                { key: "email", label: "Email" },
                { key: "package_name", label: "Package" },
                { key: "district", label: "District" },
                { key: "upazila", label: "Upazila" },
                { key: "address", label: "Address" },
                { key: "message", label: "Message" },
                { key: "status", label: "Status" },
                { key: "status_notes", label: "Status Notes" },
                { key: "updated_by_name", label: "Updated By" },
                { key: "created_at", label: "Created At" },
              ])}
              disabled={filteredRequests.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
        </div>

        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                {searchQuery ? "No matching requests found." : "No connection requests found."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{request.name}</h3>
                        <Badge variant="outline" className={statusColors[request.status as RequestStatus]}>
                          {request.status}
                        </Badge>
                        {request.sms_sent && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600">
                            SMS Sent
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{request.phone}</p>
                      {request.package_name && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Package:</span>{" "}
                          <span className="font-medium">{request.package_name}</span>
                        </p>
                      )}
                      {request.updated_by_name && (
                        <p className="text-xs text-muted-foreground">
                          Updated by: <span className="font-medium">{request.updated_by_name}</span>
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(request.created_at), "PPp")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
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

        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Connection Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedRequest.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedRequest.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Package</p>
                    <p className="font-medium">{selectedRequest.package_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">District</p>
                    <p className="font-medium">{selectedRequest.district || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Upazila</p>
                    <p className="font-medium">{selectedRequest.upazila || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedRequest.address || "N/A"}</p>
                </div>
                {selectedRequest.message && (
                  <div>
                    <p className="text-sm text-muted-foreground">Message</p>
                    <p className="font-medium">{selectedRequest.message}</p>
                  </div>
                )}
                {selectedRequest.status_notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Previous Notes</p>
                    <p className="font-medium bg-muted p-2 rounded">{selectedRequest.status_notes}</p>
                  </div>
                )}
                {selectedRequest.updated_by_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated By</p>
                    <p className="font-medium">{selectedRequest.updated_by_name}</p>
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

export default ConnectionRequests;
