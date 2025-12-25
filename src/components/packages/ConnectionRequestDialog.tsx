import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ConnectionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPackage?: string;
}

const UPAZILAS = [
  "Adamdighi",
  "Bogra Sadar",
  "Dhunat",
  "Dhupchanchia",
  "Gabtali",
  "Kahalu",
  "Nandigram",
  "Shajahanpur",
  "Shibganj",
  "Sherpur",
  "Sariakandi",
  "Sonatala",
];

const ConnectionRequestDialog = ({
  open,
  onOpenChange,
  selectedPackage,
}: ConnectionRequestDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    district: "Bogura",
    upazila: "",
    address: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendSms = async (phone: string, message: string, recordId: string) => {
    try {
      await supabase.functions.invoke("send-sms", {
        body: { phone, message, type: "form_submission", recordId, tableName: "connection_requests" },
      });
    } catch (error) {
      console.error("SMS sending failed:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const recordId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : ([1e7] as any +-1e3 +-4e3 +-8e3 +-1e11).replace(/[018]/g, (c: any) =>
              (
                c ^
                ((typeof crypto !== "undefined" && crypto.getRandomValues
                  ? crypto.getRandomValues(new Uint8Array(1))[0]
                  : Math.random() * 256) &
                  (15 >> (c / 4)))
              ).toString(16)
            );

      const { error } = await supabase.from("connection_requests").insert({
        id: recordId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        district: formData.district,
        upazila: formData.upazila,
        address: formData.address,
        message: formData.message || null,
        package_name: selectedPackage || null,
      });

      if (error) throw error;

      // Send SMS to customer
      await sendSms(
        formData.phone,
        `ধন্যবাদ ${formData.name}! আপনার কানেকশন রিকোয়েস্ট পেয়েছি${selectedPackage ? ` (${selectedPackage})` : ""}। ২৪ ঘন্টার মধ্যে যোগাযোগ করব। - ANT Bogura`,
        recordId
      );

      toast.success("Connection request submitted successfully! We'll contact you soon.");
      setFormData({
        name: "",
        phone: "",
        email: "",
        district: "Bogura",
        upazila: "",
        address: "",
        message: "",
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Connection request submit error:", error);
      const message =
        typeof error?.message === "string" ? error.message : "Failed to submit request. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Request New Connection
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {selectedPackage ? (
              <>
                You selected: <span className="font-semibold text-primary">{selectedPackage}</span>
              </>
            ) : (
              "Fill out the form below and we'll get back to you within 24 hours."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
                className="bg-card border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number *
              </label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="01xxxxxxxxx"
                required
                className="bg-card border-border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="bg-card border-border"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                District *
              </label>
              <Select
                value={formData.district}
                onValueChange={(value) => setFormData({ ...formData, district: value })}
              >
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bogura">Bogura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Upazila/Thana *
              </label>
              <Select
                value={formData.upazila}
                onValueChange={(value) => setFormData({ ...formData, upazila: value })}
              >
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Select Upazila" />
                </SelectTrigger>
                <SelectContent>
                  {UPAZILAS.map((upazila) => (
                    <SelectItem key={upazila} value={upazila}>
                      {upazila}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Full Address *
            </label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="House, Road, Area"
              required
              className="bg-card border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Additional Message
            </label>
            <Textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Any specific requirements..."
              rows={3}
              className="bg-card border-border resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="hero"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionRequestDialog;
