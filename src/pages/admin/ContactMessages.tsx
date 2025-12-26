import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Eye, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  status: string;
  status_notes: string | null;
  updated_by: string | null;
  sms_sent: boolean | null;
  created_at: string;
  updated_by_name?: string;
}

type RequestStatus = "pending" | "in_progress" | "complete" | "cancelled";

const statusColors: Record<RequestStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  complete: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const ContactMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { toast } = useToast();

  const filteredMessages = messages.filter((message) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      message.name.toLowerCase().includes(query) ||
      message.phone.toLowerCase().includes(query) ||
      (message.email?.toLowerCase().includes(query) ?? false) ||
      message.message.toLowerCase().includes(query)
    );
  });

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus as RequestStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch updater names from profiles
      const messagesWithNames = await Promise.all(
        (data || []).map(async (message) => {
          if (message.updated_by) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", message.updated_by)
              .single();
            return { ...message, updated_by_name: profile?.full_name || "Unknown" };
          }
          return { ...message, updated_by_name: undefined };
        })
      );

      setMessages(messagesWithNames);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch contact messages.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filterStatus]);

  const updateStatus = async (status: RequestStatus, notes: string) => {
    if (!selectedMessage || !user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ 
          status,
          status_notes: notes || null,
          updated_by: user.id,
        })
        .eq("id", selectedMessage.id);

      if (error) throw error;

      // Log the activity
      await logActivity({
        userId: user.id,
        eventType: "status_changed",
        description: `Contact message from ${selectedMessage.name} changed to ${status}${notes ? ` - ${notes}` : ""}`,
        metadata: {
          table: "contact_messages",
          recordId: selectedMessage.id,
          oldStatus: selectedMessage.status,
          newStatus: status,
          notes,
        },
      });

      toast({
        title: "Status Updated",
        description: `Message status changed to ${status}.`,
      });

      fetchMessages();
      setSelectedMessage(null);
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
            <h1 className="text-3xl font-bold">Contact Messages</h1>
            <p className="text-muted-foreground mt-1">
              View and respond to customer inquiries
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

        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                {searchQuery ? "No matching messages found." : "No contact messages found."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredMessages.map((message) => (
              <Card key={message.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{message.name}</h3>
                        <Badge variant="outline" className={statusColors[message.status as RequestStatus]}>
                          {message.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.phone}</p>
                      <p className="text-sm line-clamp-1">{message.message}</p>
                      {message.updated_by_name && (
                        <p className="text-xs text-muted-foreground">
                          Updated by: <span className="font-medium">{message.updated_by_name}</span>
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), "PPp")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMessage(message)}
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

        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Contact Message Details</DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedMessage.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedMessage.email || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Message</p>
                  <p className="font-medium whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium">
                    {format(new Date(selectedMessage.created_at), "PPpp")}
                  </p>
                </div>
                {selectedMessage.status_notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Previous Notes</p>
                    <p className="font-medium bg-muted p-2 rounded">{selectedMessage.status_notes}</p>
                  </div>
                )}
                {selectedMessage.updated_by_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated By</p>
                    <p className="font-medium">{selectedMessage.updated_by_name}</p>
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

export default ContactMessages;