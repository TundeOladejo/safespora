import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import LiveAlerts from "@/components/LiveAlerts";
import Trust from "@/components/Trusts";
import CTA from "@/components/CTA";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-[#0B0C0F] text-white">
        <Header />
      <Hero />
      <HowItWorks />
      <LiveAlerts />
      <Trust />
      <CTA />
      <Footer />
    </main>
  );
}
