import { forwardRef } from "react";
import { MessageCircle } from "lucide-react";

const WhatsAppButton = forwardRef<HTMLAnchorElement>((_, ref) => {
  return (
    <a
      ref={ref}
      href="https://wa.me/8801332147787"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </a>
  );
});

WhatsAppButton.displayName = "WhatsAppButton";

export default WhatsAppButton;
