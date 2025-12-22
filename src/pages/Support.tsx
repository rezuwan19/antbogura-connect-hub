import { Phone, MessageCircle, Mail, Wifi, Router, AlertTriangle, RefreshCw, Shield, Zap } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const commonIssues = [
  {
    icon: Wifi,
    title: "No Internet Connection",
    solutions: [
      "Check if your router is powered on and all lights are normal",
      "Restart your router by unplugging it for 30 seconds",
      "Check if cables are properly connected",
      "Verify if there's a service outage in your area",
    ],
  },
  {
    icon: Zap,
    title: "Slow Internet Speed",
    solutions: [
      "Run a speed test at fast.com or speedtest.net",
      "Move closer to your router for better WiFi signal",
      "Check if other devices are consuming bandwidth",
      "Restart your router and device",
      "Update your device's network drivers",
    ],
  },
  {
    icon: Router,
    title: "WiFi Not Working",
    solutions: [
      "Check if WiFi is enabled on your device",
      "Verify the WiFi password is correct",
      "Restart your router",
      "Check for WiFi interference from other devices",
      "Try connecting to 2.4GHz or 5GHz band",
    ],
  },
  {
    icon: RefreshCw,
    title: "Frequent Disconnections",
    solutions: [
      "Check cable connections for any damage",
      "Update router firmware if available",
      "Move router away from other electronic devices",
      "Check for overheating of router",
      "Contact support for line quality check",
    ],
  },
];

const faqs = [
  {
    question: "How do I pay my monthly bill?",
    answer: "You can pay your monthly bill through bKash, Nagad, Rocket, or bank transfer. Our collection agent may also visit your location for cash collection. Contact support for payment details.",
  },
  {
    question: "What is the installation process?",
    answer: "After you request a connection, our team will survey your location within 24 hours. Installation typically takes 2-3 hours and is completely free for standard setups.",
  },
  {
    question: "Can I upgrade or downgrade my package?",
    answer: "Yes! You can change your package at any time. The change will take effect from your next billing cycle. Contact support to request a package change.",
  },
  {
    question: "What is BDIX and why is it unlimited?",
    answer: "BDIX (Bangladesh Internet Exchange) is the local internet exchange. All local content including Facebook, YouTube (cache), local websites, and gaming servers are accessible at maximum speed without counting towards your package limit.",
  },
  {
    question: "Do you provide a router?",
    answer: "Yes, we provide a dual-band WiFi router with every new connection at no extra cost. The router remains our property and should be returned if you discontinue the service.",
  },
  {
    question: "What happens if I face technical issues?",
    answer: "Our 24/7 support team is always ready to help. You can reach us via WhatsApp, phone, or email. For most issues, we can provide remote assistance. For hardware issues, our technician will visit within 24 hours.",
  },
  {
    question: "Is there a contract or commitment period?",
    answer: "No long-term contracts! Our service is month-to-month. You can cancel anytime with 15 days notice.",
  },
];

const Support = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-background via-cream to-mint">
        <div className="container-custom mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            Help & <span className="text-primary">Support</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Having trouble? Find quick solutions to common problems or 
            contact our 24/7 support team for assistance.
          </p>
        </div>
      </section>

      {/* Quick Support */}
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Need Immediate Help?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <a
              href="https://wa.me/8801332147787"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-card rounded-2xl border border-border hover:border-[#25D366] hover:shadow-xl transition-all group animate-fade-in"
            >
              <div className="w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#25D366] transition-colors">
                <MessageCircle className="w-8 h-8 text-[#25D366] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">WhatsApp</h3>
              <p className="text-sm text-muted-foreground text-center">Fastest response</p>
              <p className="text-primary font-medium mt-2">+880 1332-147787</p>
            </a>

            <a
              href="tel:09647147787"
              className="flex flex-col items-center p-6 bg-card rounded-2xl border border-border hover:border-primary hover:shadow-xl transition-all group animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                <Phone className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Phone</h3>
              <p className="text-sm text-muted-foreground text-center">24/7 available</p>
              <p className="text-primary font-medium mt-2">09647147787</p>
            </a>

            <a
              href="mailto:support@antbogura.tech"
              className="flex flex-col items-center p-6 bg-card rounded-2xl border border-border hover:border-primary hover:shadow-xl transition-all group animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                <Mail className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Email</h3>
              <p className="text-sm text-muted-foreground text-center">Detailed queries</p>
              <p className="text-primary font-medium mt-2 break-all">support@antbogura.tech</p>
            </a>
          </div>
        </div>
      </section>

      {/* Common Issues */}
      <section className="section-padding bg-card">
        <div className="container-custom mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Common Problems & Solutions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Try these troubleshooting steps before contacting support. 
              Most issues can be resolved with simple fixes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {commonIssues.map((issue, index) => (
              <div
                key={issue.title}
                className="bg-background p-6 rounded-2xl border border-border hover:shadow-lg transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <issue.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {issue.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {issue.solutions.map((solution, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {solution}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-10 h-10 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Still Having Issues?</h3>
                <p className="text-sm text-muted-foreground">
                  If the above solutions don't work, our technician will visit your location.
                </p>
              </div>
            </div>
            <Button asChild variant="hero">
              <a href="https://wa.me/8801332147787" target="_blank" rel="noopener noreferrer">
                Request Technician Visit
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our service, billing, 
              and technical support.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/30 transition-colors"
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary">
        <div className="container-custom mx-auto text-center">
          <Shield className="w-16 h-16 text-primary-foreground mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            We're Here to Help
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Our support team is available 24/7 to ensure you stay connected. 
            Don't hesitate to reach out for any assistance.
          </p>
          <Button asChild variant="secondary" size="xl">
            <a href="https://wa.me/8801332147787" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5" />
              Chat Now
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Support;
