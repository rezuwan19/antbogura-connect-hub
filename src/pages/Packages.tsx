import { Link } from "react-router-dom";
import { Check, Zap, Star } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const packages = [
  { name: "Home Connect", speed: 25, price: 500, vat: 525 },
  { name: "Starter Plus", speed: 40, price: 700, vat: 735 },
  { name: "Power Stream", speed: 55, price: 800, vat: 840 },
  { name: "Family Fast", speed: 70, price: 1000, vat: 1050, popular: true },
  { name: "Ultra Home", speed: 85, price: 1200, vat: 1260 },
  { name: "Gaming Pro", speed: 100, price: 1400, vat: 1470, gaming: true },
  { name: "Lightning Max", speed: 120, price: 1600, vat: 1680 },
  { name: "Extreme Speed", speed: 150, price: 1800, vat: 1890 },
  { name: "Enterprise Max", speed: 200, price: 2400, vat: 2520, enterprise: true },
];

const features = [
  "Unlimited Data",
  "Unlimited BDIX Speed",
  "4K Streaming Support",
  "Low Latency Gaming",
  "24/7 Support",
  "Free Router Setup",
];

const Packages = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-background via-cream to-mint">
        <div className="container-custom mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            Choose Your <span className="text-primary">Perfect Plan</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Simple, transparent pricing with no hidden fees. All packages include 
            unlimited data and premium features.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <Card
                key={pkg.name}
                variant={pkg.popular ? "featured" : "elevated"}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" /> Most Popular
                  </div>
                )}
                {pkg.gaming && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 border border-primary/30">
                    <Zap className="w-4 h-4" /> Gaming
                  </div>
                )}
                {pkg.enterprise && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Enterprise
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">{pkg.speed}</span>
                    <span className="text-lg text-muted-foreground ml-1">Mbps</span>
                  </div>
                </CardHeader>

                <CardContent className="text-center">
                  <div className="mb-6">
                    <p className="text-3xl font-bold text-foreground">
                      ৳{pkg.vat}
                      <span className="text-sm text-muted-foreground font-normal">/month</span>
                    </p>
                    <p className="text-sm text-primary font-medium">
                      VAT Included
                    </p>
                  </div>

                  <ul className="space-y-3 text-left">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    asChild
                    variant={pkg.popular ? "hero" : "outline"}
                    className="w-full"
                    size="lg"
                  >
                    <Link to="/contact">Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="section-padding bg-card">
        <div className="container-custom mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            Package Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-background rounded-xl overflow-hidden shadow-lg">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="px-6 py-4 text-left font-semibold">Package</th>
                  <th className="px-6 py-4 text-center font-semibold">Speed</th>
                  <th className="px-6 py-4 text-center font-semibold">Price (VAT Included)</th>
                  <th className="px-6 py-4 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg, index) => (
                  <tr
                    key={pkg.name}
                    className={`border-b border-border hover:bg-accent/50 transition-colors ${
                      pkg.popular ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{pkg.name}</span>
                        {pkg.popular && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-primary">{pkg.speed} Mbps</span>
                    </td>
                    <td className="px-6 py-4 text-center text-foreground font-medium">৳{pkg.vat}</td>
                    <td className="px-6 py-4 text-center">
                      <Button asChild variant="default" size="sm">
                        <Link to="/contact">Order Now</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary">
        <div className="container-custom mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Need Help Choosing?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Our team is ready to help you find the perfect package for your needs. 
            Contact us for a free consultation.
          </p>
          <Button asChild variant="secondary" size="xl">
            <a href="https://wa.me/8801332147787" target="_blank" rel="noopener noreferrer">
              Chat With Us
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Packages;
