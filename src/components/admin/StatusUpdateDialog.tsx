import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, Loader2, Check, X } from "lucide-react";

type RequestStatus = "pending" | "in_progress" | "complete" | "cancelled";

interface StatusUpdateDialogProps {
  onUpdateStatus: (status: RequestStatus, notes: string) => Promise<void>;
  isUpdating?: boolean;
}

const StatusUpdateDialog = ({ onUpdateStatus, isUpdating = false }: StatusUpdateDialogProps) => {
  const [notes, setNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | null>(null);

  const handleUpdate = async (status: RequestStatus) => {
    setSelectedStatus(status);
    await onUpdateStatus(status, notes);
    setNotes("");
    setSelectedStatus(null);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status-notes">Notes (optional)</Label>
        <Textarea
          id="status-notes"
          placeholder="Add any notes about this status change..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Update Status (SMS will be sent)</p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            disabled={isUpdating}
            onClick={() => handleUpdate("pending")}
          >
            {isUpdating && selectedStatus === "pending" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            Pending
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            disabled={isUpdating}
            onClick={() => handleUpdate("in_progress")}
          >
            {isUpdating && selectedStatus === "in_progress" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Loader2 className="w-4 h-4" />
            )}
            In Progress
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            disabled={isUpdating}
            onClick={() => handleUpdate("complete")}
          >
            {isUpdating && selectedStatus === "complete" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Complete
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-destructive"
            disabled={isUpdating}
            onClick={() => handleUpdate("cancelled")}
          >
            {isUpdating && selectedStatus === "cancelled" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateDialog;
