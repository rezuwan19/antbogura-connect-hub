import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Send, Clock, Wifi, AlertTriangle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Contact = () => {
  const [simpleFormData, setSimpleFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [problemFormData, setProblemFormData] = useState({
    name: "",
    phone: "",
    customerId: "",
    problemType: "",
    description: "",
  });

  const handleSimpleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! We'll get back to you soon.");
    setSimpleFormData({
      name: "",
      phone: "",
      email: "",
      message: "",
    });
  };

  const handleProblemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Problem reported successfully! Our team will contact you shortly.");
    setProblemFormData({
      name: "",
      phone: "",
      customerId: "",
      problemType: "",
      description: "",
    });
  };

  const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSimpleFormData({ ...simpleFormData, [e.target.name]: e.target.value });
  };

  const handleProblemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProblemFormData({ ...problemFormData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-background via-cream to-mint">
        <div className="container-custom mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            Get In <span className="text-primary">Touch</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Have questions or facing issues? We're here to help. 
            Reach out to us through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8 animate-fade-in-left">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Contact Information
                </h2>
                <p className="text-muted-foreground mb-8">
                  Our team is available 24/7 to assist you with any queries 
                  or concerns. Choose your preferred contact method.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                <a
                  href="https://wa.me/8801332147787"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 bg-card rounded-xl border border-border hover:border-[#25D366] hover:shadow-lg transition-all group"
                >
                  <div className="w-14 h-14 bg-[#25D366]/10 rounded-xl flex items-center justify-center group-hover:bg-[#25D366] transition-colors">
                    <MessageCircle className="w-7 h-7 text-[#25D366] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">WhatsApp</p>
                    <p className="text-muted-foreground">+880 1332-147787</p>
                  </div>
                </a>

                <a
                  href="tel:09647147787"
                  className="flex items-center gap-4 p-5 bg-card rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all group"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Phone className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Phone</p>
                    <p className="text-muted-foreground">09647147787</p>
                  </div>
                </a>

                <a
                  href="mailto:support@antbogura.tech"
                  className="flex items-center gap-4 p-5 bg-card rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all group"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Mail className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <p className="text-muted-foreground">support@antbogura.tech</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-5 bg-card rounded-xl border border-border">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                    <MapPin className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Location</p>
                    <p className="text-muted-foreground">Bogura, Bangladesh</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-card rounded-xl border border-border">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Support Hours</p>
                    <p className="text-muted-foreground">24/7 Available</p>
                  </div>
                </div>
              </div>

              {/* Quick Action */}
              <Button asChild variant="whatsapp" size="xl" className="w-full">
                <a href="https://wa.me/8801332147787" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5" />
                  Quick Chat on WhatsApp
                </a>
              </Button>
            </div>

            {/* Contact Forms with Tabs */}
            <div className="animate-fade-in-right">
              <div className="bg-card p-8 rounded-2xl border border-border">
                <Tabs defaultValue="simple" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="simple" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Contact Us
                    </TabsTrigger>
                    <TabsTrigger value="problem" className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Report Problem
                    </TabsTrigger>
                  </TabsList>

                  {/* Simple Contact Form */}
                  <TabsContent value="simple">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        Send Us a Message
                      </h2>
                      <p className="text-muted-foreground">
                        Have a question or feedback? We'd love to hear from you.
                      </p>
                    </div>

                    <form onSubmit={handleSimpleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Full Name *
                          </label>
                          <Input
                            name="name"
                            value={simpleFormData.name}
                            onChange={handleSimpleChange}
                            placeholder="Your full name"
                            required
                            className="bg-background"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Phone Number *
                          </label>
                          <Input
                            name="phone"
                            value={simpleFormData.phone}
                            onChange={handleSimpleChange}
                            placeholder="01xxxxxxxxx"
                            required
                            className="bg-background"
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
                          value={simpleFormData.email}
                          onChange={handleSimpleChange}
                          placeholder="your@email.com"
                          className="bg-background"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Message *
                        </label>
                        <Textarea
                          name="message"
                          value={simpleFormData.message}
                          onChange={handleSimpleChange}
                          placeholder="How can we help you?"
                          rows={4}
                          required
                          className="bg-background resize-none"
                        />
                      </div>

                      <Button type="submit" variant="hero" size="xl" className="w-full">
                        <Send className="w-5 h-5" />
                        Send Message
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Internet Problem Form */}
                  <TabsContent value="problem">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        Report Internet Problem
                      </h2>
                      <p className="text-muted-foreground">
                        Facing connectivity issues? Let us know and we'll fix it ASAP.
                      </p>
                    </div>

                    <form onSubmit={handleProblemSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Full Name *
                          </label>
                          <Input
                            name="name"
                            value={problemFormData.name}
                            onChange={handleProblemChange}
                            placeholder="Your full name"
                            required
                            className="bg-background"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Phone Number *
                          </label>
                          <Input
                            name="phone"
                            value={problemFormData.phone}
                            onChange={handleProblemChange}
                            placeholder="01xxxxxxxxx"
                            required
                            className="bg-background"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Customer ID
                        </label>
                        <Input
                          name="customerId"
                          value={problemFormData.customerId}
                          onChange={handleProblemChange}
                          placeholder="Your customer ID (if known)"
                          className="bg-background"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Problem Type *
                        </label>
                        <select
                          name="problemType"
                          value={problemFormData.problemType}
                          onChange={handleProblemChange}
                          required
                          className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select problem type</option>
                          <option value="no-connection">No Internet Connection</option>
                          <option value="slow-speed">Slow Internet Speed</option>
                          <option value="intermittent">Intermittent Connection</option>
                          <option value="router-issue">Router/Modem Issue</option>
                          <option value="billing">Billing Issue</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Problem Description *
                        </label>
                        <Textarea
                          name="description"
                          value={problemFormData.description}
                          onChange={handleProblemChange}
                          placeholder="Please describe your issue in detail..."
                          rows={4}
                          required
                          className="bg-background resize-none"
                        />
                      </div>

                      <Button type="submit" variant="hero" size="xl" className="w-full">
                        <Wifi className="w-5 h-5" />
                        Report Problem
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
