import { useState } from "react";
import { MapPin, CheckCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const coverageAreas: Record<string, string[]> = {
  "Bogra Sadar": [
    "Satmatha",
    "Borogola",
    "Thana Road",
    "College Para",
    "Hospital Para",
    "Jhawtala",
    "Char Para",
    "Khalifa More",
    "Rangpur Road",
    "Banani",
    "Sunflower Para",
    "Kabi Nazrul Islam Street",
    "BSCIC Industrial Area",
    "Sherpur Road Area",
    "Railway Station Area",
    "Bus Terminal Area",
  ],
  "Adamdighi": [],
  "Dhunat": [],
  "Dhupchanchia": [],
  "Gabtali": [],
  "Kahalu": [],
  "Nandigram": [],
  "Shajahanpur": [],
  "Shibganj": [],
  "Sherpur": [],
  "Sariakandi": [],
  "Sonatala": [],
};
const Coverage = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("Bogura");
  const [selectedUpazila, setSelectedUpazila] = useState("Bogra Sadar");

  const currentAreas = coverageAreas[selectedUpazila] || [];

  return (
    <Layout>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-background via-cream to-mint">
        <div className="container-custom mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            Our <span className="text-primary">Coverage Area</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            ANT Bogura provides high-speed fiber internet across Bogura city. 
            Check if your area is covered.
          </p>
        </div>
      </section>

      {/* Location Selector */}
      <section className="section-padding bg-background pb-0">
        <div className="container-custom mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                District
              </label>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
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
                Upazila/Thana
              </label>
              <Select
                value={selectedUpazila}
                onValueChange={setSelectedUpazila}
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
        </div>
      </section>

      {/* Map Section */}
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                {selectedUpazila} Coverage
              </h2>
              <div className="aspect-video bg-card rounded-2xl overflow-hidden border border-border shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57841.46825879396!2d89.34376!3d24.846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fc5525a18bb8eb%3A0x2eb31f21dc54bc6f!2sBogura!5e0!3m2!1sen!2sbd!4v1640000000000!5m2!1sen!2sbd"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="ANT Bogura Coverage Map"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                * The highlighted area shows our current fiber network coverage in Bogura.
              </p>
            </div>

            {/* Area List */}
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Covered Areas in {selectedUpazila}
              </h2>
              
              {currentAreas.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentAreas.map((area, index) => (
                    <div
                      key={area}
                      className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border hover:border-primary/30 transition-all"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{area}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/50 p-8 rounded-2xl text-center border border-border">
                  <p className="text-muted-foreground">
                    Coverage coming soon to {selectedUpazila}. Contact us to express interest.
                  </p>
                </div>
              )}

              <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2">
                  Don't see your area?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We're constantly expanding our network. Contact us to check 
                  availability in your area or request coverage.
                </p>
                <Button asChild variant="hero">
                  <Link to="/contact">Request Coverage</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expansion Notice */}
      <section className="section-padding bg-card">
        <div className="container-custom mx-auto">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Expanding Soon!
            </h2>
            <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-6">
              We're actively expanding our fiber network to new areas in Bogura. 
              Stay tuned for updates or contact us to express your interest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="lg">
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <a href="https://wa.me/8801332147787" target="_blank" rel="noopener noreferrer">
                  WhatsApp Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Coverage;
