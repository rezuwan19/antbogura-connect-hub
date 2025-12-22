import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Send, Clock } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    package: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Request submitted successfully! We'll contact you soon.");
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      package: "",
      message: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
            Ready to get connected? Have questions? We're here to help. 
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

            {/* Contact Form */}
            <div className="animate-fade-in-right">
              <div className="bg-card p-8 rounded-2xl border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Request New Connection
                </h2>
                <p className="text-muted-foreground mb-6">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
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
                        className="bg-background"
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
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Address *
                    </label>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House, Road, Area, Bogura"
                      required
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Preferred Package
                    </label>
                    <select
                      name="package"
                      value={formData.package}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select a package</option>
                      <option value="home-connect">Home Connect - 25 Mbps</option>
                      <option value="starter-plus">Starter Plus - 40 Mbps</option>
                      <option value="power-stream">Power Stream - 55 Mbps</option>
                      <option value="family-fast">Family Fast - 70 Mbps</option>
                      <option value="ultra-home">Ultra Home - 85 Mbps</option>
                      <option value="gaming-pro">Gaming Pro - 100 Mbps</option>
                      <option value="lightning-max">Lightning Max - 120 Mbps</option>
                      <option value="extreme-speed">Extreme Speed - 150 Mbps</option>
                      <option value="enterprise-max">Enterprise Max - 200 Mbps</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Additional Message
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Any specific requirements or questions..."
                      rows={4}
                      className="bg-background resize-none"
                    />
                  </div>

                  <Button type="submit" variant="hero" size="xl" className="w-full">
                    <Send className="w-5 h-5" />
                    Submit Request
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
