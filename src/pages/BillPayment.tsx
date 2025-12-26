import Layout from "@/components/layout/Layout";
import { CreditCard, Smartphone, CheckCircle } from "lucide-react";
import paymentInfoImage from "@/assets/payment-info.jpg";

const BillPayment = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-background via-cream to-mint">
        <div className="container-custom mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            Bill <span className="text-primary">Payment</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Pay your internet bill easily using bKash or Nagad. Follow the simple steps below.
          </p>
        </div>
      </section>

      {/* Payment Methods Summary */}
      <section className="section-padding bg-background">
        <div className="container-custom mx-auto">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#E2136E]/10 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-7 h-7 text-[#E2136E]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-foreground">bKash Payment</h3>
                  <p className="text-muted-foreground">Merchant Account: 01332-147787</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Dial *247# to pay via bKash</span>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#F6921E]/10 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-7 h-7 text-[#F6921E]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-foreground">Nagad Payment</h3>
                  <p className="text-muted-foreground">Merchant Account: 01332-147787</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Dial *167# to pay via Nagad</span>
              </div>
            </div>
          </div>

          {/* Payment Instructions Image */}
          <div className="bg-card p-6 md:p-8 rounded-2xl border border-border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
              Step-by-Step Payment Instructions
            </h2>
            <div className="flex justify-center">
              <img 
                src={paymentInfoImage} 
                alt="Payment instructions for bKash and Nagad - ANT Bogura" 
                className="max-w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </div>

          {/* Important Notes */}
          <div className="mt-12 bg-primary/5 p-6 rounded-2xl border border-primary/20">
            <h3 className="font-bold text-lg text-foreground mb-4">Important Notes:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Use your Customer ID as Reference when making payment</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>You will receive a confirmation SMS after successful payment</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Keep your Transaction ID (TrxID) for future reference</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>For any payment issues, contact us on WhatsApp: +880 1332-147787</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BillPayment;
