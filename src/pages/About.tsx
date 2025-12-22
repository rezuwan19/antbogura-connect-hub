import { Target, Eye, Users, Award, Wifi, Shield } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const values = [
  {
    icon: Wifi,
    title: "Fast & Reliable",
    description: "We deliver consistent high-speed internet that you can count on.",
  },
  {
    icon: Users,
    title: "Customer First",
    description: "Your satisfaction is our priority. We're here 24/7 to help.",
  },
  {
    icon: Shield,
    title: "Trusted Service",
    description: "Transparent pricing, honest service, no hidden surprises.",
  },
  {
    icon: Award,
    title: "Local Excellence",
    description: "Proudly serving Bogura with the best internet experience.",
  },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-background via-cream to-mint">
        <div className="container-custom mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 animate-fade-in">
              About <span className="text-primary">ANT Bogura</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Your trusted local fiber internet provider, connecting Bogura 
              to the digital world with speed, reliability, and care.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-left">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2020, ANT Bogura started with a simple mission: to provide 
                  affordable, high-speed internet to every home and business in Bogura. 
                  What began as a small local initiative has grown into a trusted name 
                  in the community.
                </p>
                <p>
                  We understand the importance of reliable internet in today's connected 
                  world. Whether it's for education, work, entertainment, or staying 
                  connected with loved ones, we're committed to keeping you online.
                </p>
                <p>
                  Our team of dedicated professionals works round the clock to ensure 
                  you get the best internet experience. With fiber optic technology 
                  and 24/7 support, we're here to serve you.
                </p>
              </div>
            </div>

            <div className="relative animate-fade-in-right">
              <div className="aspect-square bg-gradient-to-br from-cream to-mint rounded-3xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Wifi className="w-12 h-12 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Since 2020</h3>
                  <p className="text-muted-foreground">Serving Bogura with Pride</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-xl -z-10" />
              <div className="absolute -bottom-4 -left-4 w-28 h-28 bg-mint rounded-xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-card">
        <div className="container-custom mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-background p-8 rounded-2xl border border-border animate-fade-in">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground">
                To provide fast, reliable, and affordable internet services to every 
                household and business in Bogura, bridging the digital divide and 
                empowering our community to thrive in the digital age.
              </p>
            </div>

            <div className="bg-background p-8 rounded-2xl border border-border animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
              <p className="text-muted-foreground">
                To become the most trusted and loved internet service provider in 
                Bogura, known for our exceptional service quality, customer care, 
                and contribution to the community's digital transformation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Our Core Values
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="text-center p-6 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-primary">
        <div className="container-custom mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <p className="text-4xl md:text-5xl font-bold text-primary-foreground">1000+</p>
              <p className="text-primary-foreground/80 mt-2">Happy Customers</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <p className="text-4xl md:text-5xl font-bold text-primary-foreground">99.9%</p>
              <p className="text-primary-foreground/80 mt-2">Uptime</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <p className="text-4xl md:text-5xl font-bold text-primary-foreground">24/7</p>
              <p className="text-primary-foreground/80 mt-2">Support</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <p className="text-4xl md:text-5xl font-bold text-primary-foreground">4+</p>
              <p className="text-primary-foreground/80 mt-2">Years of Service</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-card">
        <div className="container-custom mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Join Our Growing Family
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Experience the ANT Bogura difference. Get connected today and enjoy 
            fast, reliable internet with the best customer service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="xl">
              <Link to="/packages">View Packages</Link>
            </Button>
            <Button asChild variant="hero-outline" size="xl">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
