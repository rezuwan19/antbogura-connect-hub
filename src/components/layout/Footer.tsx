import { Link } from "react-router-dom";
import { Wifi, Phone, Mail, MapPin, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-custom mx-auto section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground flex items-center justify-center">
                <Wifi className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold">ANT Bogura</span>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Your trusted local fiber internet provider in Bogura, Bangladesh.
              Fast, reliable, and affordable internet for every home and business.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {["Packages", "Coverage", "About", "Support", "Contact"].map((link) => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase()}`}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Our Services</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li>Home Broadband</li>
              <li>Business Internet</li>
              <li>Gaming Packages</li>
              <li>Enterprise Solutions</li>
              <li>Fiber Optic Connection</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <a
                  href="https://wa.me/8801332147787"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  +880 1332-147787
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <a
                  href="tel:09647147787"
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  09647147787
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <a
                  href="mailto:support@antbogura.tech"
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  support@antbogura.tech
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm text-primary-foreground/80">
                  Bogura, Bangladesh
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex justify-center items-center">
            <p className="text-sm text-primary-foreground/70">
              © {new Date().getFullYear()} ANT Bogura. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
