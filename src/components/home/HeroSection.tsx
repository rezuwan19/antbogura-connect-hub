import { Link } from "react-router-dom";
import { ArrowRight, Wifi, Zap, Tv, Gamepad2, Shield, Clock, Package, MapPin, Users, Headphones, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const pages = [
  { name: "Packages", path: "/packages", icon: Package, description: "View our internet plans & pricing" },
  { name: "Coverage", path: "/coverage", icon: MapPin, description: "Check service availability in your area" },
  { name: "About Us", path: "/about", icon: Users, description: "Learn about ANT Bogura" },
  { name: "Support", path: "/support", icon: Headphones, description: "Get help & troubleshooting" },
  { name: "Contact", path: "/contact", icon: Mail, description: "Request a new connection" },
];

const features = [
  {
    icon: Wifi,
    title: "Unlimited Data",
    description: "No data caps or throttling. Use as much as you need.",
  },
  {
    icon: Zap,
    title: "Unlimited BDIX Speed",
    description: "Blazing fast local content access with BDIX.",
  },
  {
    icon: Tv,
    title: "4K Streaming",
    description: "Stream Netflix, YouTube in crystal clear 4K quality.",
  },
  {
    icon: Gamepad2,
    title: "Low Latency Gaming",
    description: "Experience lag-free gaming with our optimized network.",
  },
];

const whyChooseUs = [
  {
    icon: Shield,
    title: "Reliable Connection",
    description: "99.9% uptime guarantee with fiber optic infrastructure.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock technical support via WhatsApp & phone.",
  },
  {
    icon: Zap,
    title: "Fast Installation",
    description: "Get connected within 24-48 hours of your request.",
  },
];

const HeroSection = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-background via-cream to-mint overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-mint rounded-full blur-3xl" />
        </div>

        <div className="container-custom mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">Trusted by 1000+ homes in Bogura</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Fast & Reliable{" "}
              <span className="text-primary">Internet</span> in Bogura
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Experience lightning-fast fiber internet with unlimited data, 4K streaming, 
              and lag-free gaming. Your trusted local ISP since 2020.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button asChild variant="hero" size="xl">
                <Link to="/packages">
                  View Packages
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">1000+</p>
                <p className="text-sm text-muted-foreground mt-1">Happy Customers</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">99.9%</p>
                <p className="text-sm text-muted-foreground mt-1">Uptime</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">200+</p>
                <p className="text-sm text-muted-foreground mt-1">Mbps Max Speed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-card">
        <div className="container-custom mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our packages include all the features you need for an exceptional internet experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-background p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-out group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ease-out">
                  <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Choose <span className="text-primary">ANT Bogura</span>?
              </h2>
              <p className="text-muted-foreground mb-8">
                We're not just an internet service provider. We're your neighbors, 
                committed to keeping Bogura connected with the fastest and most 
                reliable fiber internet.
              </p>

              <div className="space-y-6">
                {whyChooseUs.map((item, index) => (
                  <div
                    key={item.title}
                    className="flex gap-4 animate-fade-in-left"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button asChild variant="hero" size="lg" className="mt-8">
                <Link to="/about">
                  Learn More About Us
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-mint rounded-3xl flex items-center justify-center">
                <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center animate-float">
                  <Wifi className="w-16 h-16 text-primary-foreground" />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-mint rounded-2xl -z-10" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-cream rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Explore Pages Section */}
      <section className="section-padding bg-card">
        <div className="container-custom mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Explore Our Website
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find everything you need - from pricing to support
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {pages.map((page, index) => (
              <Link
                key={page.path}
                to={page.path}
                className="group p-6 bg-background rounded-2xl border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <page.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {page.name}
                </h3>
                <p className="text-xs text-muted-foreground">{page.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary">
        <div className="container-custom mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Connected?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers enjoying fast, reliable internet. 
            Get started today with our affordable packages.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" size="xl">
              <Link to="/packages">
                View Packages
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <a href="https://wa.me/8801332147787" target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
