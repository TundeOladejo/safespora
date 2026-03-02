import Link from "next/link";
import { ArrowLeft, Users, Shield, Bell, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Metadata } from "next";
import WaitlistForm from "@/components/WaitlistForm";
import SocialProof from "@/components/SocialProof";

export const metadata: Metadata = {
  title: "Join the Waitlist | SafeSpora",
  description: "Join thousands of Nigerians waiting for early access to SafeSpora - Nigeria's first community-driven safety platform. Get priority alerts and exclusive features.",
  keywords: "SafeSpora waitlist, Nigeria safety app, community safety, security alerts, early access",
  openGraph: {
    title: "Join the SafeSpora Waitlist",
    description: "Be among the first to access Nigeria's community-driven safety platform",
    type: "website",
  },
};

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-[#0B0C0F] text-white">
      {/* Header */}
      <header className="border-b border-[#1F2030]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/safespora.svg" className="h-8 w-8" alt="SafeSpora logo" />
            <span className="font-semibold text-lg tracking-tight">SafeSpora</span>
          </Link>
          
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-red-500 mb-6">
            <Shield size={24} weight="fill" />
            <span className="text-sm font-semibold tracking-wide uppercase">
              Early Access Program
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Be Among the First to Experience
            <span className="block text-red-500">Safer Communities</span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            SafeSpora is launching soon across Nigeria. Join our waitlist to get early access, 
            exclusive features, and help shape the future of community safety.
          </p>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-[#1F2030] p-6 rounded-xl">
              <Bell size={32} className="text-red-500 mb-4 mx-auto" weight="bold" />
              <h3 className="text-lg font-semibold mb-2">Priority Alerts</h3>
              <p className="text-gray-400 text-sm">
                Get real-time safety notifications before anyone else
              </p>
            </div>

            <div className="bg-[#1F2030] p-6 rounded-xl">
              <Users size={32} className="text-red-500 mb-4 mx-auto" weight="bold" />
              <h3 className="text-lg font-semibold mb-2">Founding Member</h3>
              <p className="text-gray-400 text-sm">
                Exclusive access to premium features during launch
              </p>
            </div>

            <div className="bg-[#1F2030] p-6 rounded-xl">
              <CheckCircle size={32} className="text-red-500 mb-4 mx-auto" weight="bold" />
              <h3 className="text-lg font-semibold mb-2">Shape the Future</h3>
              <p className="text-gray-400 text-sm">
                Your feedback helps us build better safety features
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <SocialProof />

      {/* Waitlist Form Section */}
      <section id="waitlist-form" className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <WaitlistForm 
            className="bg-[#1F2030] p-8 rounded-2xl border border-[#2A2D3A]"
            showTitle={false}
            showDescription={false}
          />
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 px-6 bg-[#1A1B23]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What You'll Get Early Access To</h2>
            <p className="text-gray-400 text-lg">
              Be the first to experience these powerful safety features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#0B0C0F] p-6 rounded-xl border border-[#1F2030]">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <Bell size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Alerts</h3>
              <p className="text-gray-400">
                Get instant notifications about security incidents in your area, 
                verified by community members.
              </p>
            </div>

            <div className="bg-[#0B0C0F] p-6 rounded-xl border border-[#1F2030]">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Network</h3>
              <p className="text-gray-400">
                Connect with neighbors and local communities to share safety 
                information and support each other.
              </p>
            </div>

            <div className="bg-[#0B0C0F] p-6 rounded-xl border border-[#1F2030]">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <Shield size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Reports</h3>
              <p className="text-gray-400">
                All safety reports are filtered and verified using proximity, 
                recency, and pattern matching for accuracy.
              </p>
            </div>

            <div className="bg-[#0B0C0F] p-6 rounded-xl border border-[#1F2030]">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Staff Directory</h3>
              <p className="text-gray-400">
                Access verified profiles of security personnel, emergency 
                responders, and community leaders.
              </p>
            </div>

            <div className="bg-[#0B0C0F] p-6 rounded-xl border border-[#1F2030]">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <Bell size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Route Safety</h3>
              <p className="text-gray-400">
                Get safety information about your daily routes and alternative 
                paths during incidents.
              </p>
            </div>

            <div className="bg-[#0B0C0F] p-6 rounded-xl border border-[#1F2030]">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Emergency Contacts</h3>
              <p className="text-gray-400">
                Quick access to emergency services, trusted contacts, and 
                community safety resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400 text-lg">
              Everything you need to know about SafeSpora
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-[#1F2030] p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-3">When will SafeSpora launch?</h3>
              <p className="text-gray-400">
                We're currently in final development and testing phases. Waitlist members 
                will be the first to know when we launch in their state.
              </p>
            </div>

            <div className="bg-[#1F2030] p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Is SafeSpora free to use?</h3>
              <p className="text-gray-400">
                Yes! SafeSpora's core safety features are completely free. Waitlist members 
                get exclusive access to premium features during the launch period.
              </p>
            </div>

            <div className="bg-[#1F2030] p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-3">How does SafeSpora verify safety reports?</h3>
              <p className="text-gray-400">
                We use advanced filtering based on proximity, timing, and community patterns. 
                Reports are cross-referenced and verified by multiple community members.
              </p>
            </div>

            <div className="bg-[#1F2030] p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-3">Which states will launch first?</h3>
              <p className="text-gray-400">
                We're launching nationwide, but priority goes to states with the highest 
                waitlist signups. Join now to help bring SafeSpora to your area first!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make Your Community Safer?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of Nigerians already on the waitlist
          </p>
          <Link 
            href="#waitlist-form" 
            className="inline-block bg-white text-red-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Join the Waitlist Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1F2030] py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/safespora.svg" className="h-6 w-6" alt="SafeSpora logo" />
            <span className="font-semibold">SafeSpora</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Building safer communities across Nigeria
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}