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
          {/* bKash Payment Section */}
          <div className="bg-card p-6 md:p-8 rounded-2xl border border-border mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-[#E2136E]/10 rounded-xl flex items-center justify-center">
                <Smartphone className="w-7 h-7 text-[#E2136E]" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-foreground">bKash Payment</h3>
                <p className="text-muted-foreground">Merchant Account: 01332-147787</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="text-sm font-semibold text-[#E2136E] mb-2">Step 1</div>
                <div className="text-2xl font-bold text-foreground mb-2">*247#</div>
                <p className="text-sm text-muted-foreground">Dial *247# on your bKash activated mobile phone</p>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="text-sm font-semibold text-[#E2136E] mb-2">Step 2</div>
                <div className="text-lg font-bold text-foreground mb-2">Select Payment</div>
                <p className="text-sm text-muted-foreground">Choose option 4. Payment from the menu</p>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="text-sm font-semibold text-[#E2136E] mb-2">Step 3</div>
                <div className="text-lg font-bold text-foreground mb-2">01332-147787</div>
                <p className="text-sm text-muted-foreground">Enter ANT Bogura bKash Merchant Number</p>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="text-sm font-semibold text-[#E2136E] mb-2">Step 4</div>
                <div className="text-lg font-bold text-foreground mb-2">Enter Amount</div>
                <p className="text-sm text-muted-foreground">Enter your bill amount</p>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="text-sm font-semibold text-[#E2136E] mb-2">Step 5</div>
                <div className="text-lg font-bold text-foreground mb-2">Reference</div>
                <p className="text-sm text-muted-foreground">Enter your Customer ID as reference</p>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="text-sm font-semibold text-[#E2136E] mb-2">Step 6</div>
                <div className="text-lg font-bold text-foreground mb-2">Enter PIN</div>
                <p className="text-sm text-muted-foreground">Enter your bKash PIN to confirm payment</p>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border lg:col-span-2">
                <div className="text-sm font-semibold text-[#E2136E] mb-2">Step 7</div>
                <div className="text-lg font-bold text-foreground mb-2">Payment Successful!</div>
                <p className="text-sm text-muted-foreground">You will receive a confirmation SMS with TrxID</p>
              </div>
            </div>
          </div>

          {/* Nagad Payment Section */}
          <div className="bg-card p-6 md:p-8 rounded-2xl border border-border mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-[#F6921E]/10 rounded-xl flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-[#F6921E]" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-foreground">Nagad Payment</h3>
                <p className="text-muted-foreground">Merchant Account: 01332-147787</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="text-sm font-semibold text-[#F6921E] mb-2">Step 1</div>
                <div className="text-2xl font-bold text-foreground mb-2">*167#</div>
                <p className="text-sm text-muted-foreground">Dial *167# on your Nagad activated mobile phone</p>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="text-sm font-semibold text-[#F6921E] mb-2">Step 2</div>
                <div className="text-lg font-bold text-foreground mb-2">Select Payment</div>
                <p className="text-sm text-muted-foreground">Choose option 4. Payment from the menu</p>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="text-sm font-semibold text-[#F6921E] mb-2">Step 3</div>
                <div className="text-lg font-bold text-foreground mb-2">01332-147787</div>
                <p className="text-sm text-muted-foreground">Enter ANT Bogura Nagad Merchant Number</p>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="text-sm font-semibold text-[#F6921E] mb-2">Step 4</div>
                <div className="text-lg font-bold text-foreground mb-2">Enter Amount</div>
                <p className="text-sm text-muted-foreground">Enter your bill amount</p>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="text-sm font-semibold text-[#F6921E] mb-2">Step 5</div>
                <div className="text-lg font-bold text-foreground mb-2">Counter No: 1</div>
                <p className="text-sm text-muted-foreground">Enter Counter No as 1</p>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="text-sm font-semibold text-[#F6921E] mb-2">Step 6</div>
                <div className="text-lg font-bold text-foreground mb-2">Reference</div>
                <p className="text-sm text-muted-foreground">Enter your Customer ID as reference</p>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="text-sm font-semibold text-[#F6921E] mb-2">Step 7</div>
                <div className="text-lg font-bold text-foreground mb-2">Enter PIN</div>
                <p className="text-sm text-muted-foreground">Enter your Nagad PIN to confirm payment</p>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="text-sm font-semibold text-[#F6921E] mb-2">Step 8</div>
                <div className="text-lg font-bold text-foreground mb-2">Payment Successful!</div>
                <p className="text-sm text-muted-foreground">You will receive a confirmation SMS with TrxID</p>
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
