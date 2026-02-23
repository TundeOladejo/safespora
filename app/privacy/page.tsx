import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | SafeSpora",
  description: "SafeSpora's privacy policy - how we collect, use, and protect your personal information on our community-driven safety platform.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0B0C0F] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              SafeSpora ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              community-driven safety awareness platform.
            </p>
            <p className="text-gray-300 leading-relaxed">
              By using SafeSpora, you agree to the collection and use of information in accordance with 
              this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium mb-3 text-gray-200">Personal Information</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              We may collect personal information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Name and contact information (email, phone number)</li>
              <li>Location information (state, city, area)</li>
              <li>Account credentials</li>
              <li>Profile information</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-gray-200">Usage Information</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              We automatically collect certain information about your use of our services:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Device information and identifiers</li>
              <li>Log data and usage patterns</li>
              <li>Location data (with your consent)</li>
              <li>Interaction with safety alerts and reports</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">3. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Provide and maintain our safety alert services</li>
              <li>Send you relevant safety notifications and updates</li>
              <li>Verify and filter safety reports for accuracy</li>
              <li>Improve our services and user experience</li>
              <li>Communicate with you about your account</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">4. Information Sharing</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information. We may share information in 
              the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>With your consent</li>
              <li>To comply with legal requirements</li>
              <li>To protect rights, property, or safety</li>
              <li>In connection with business transfers</li>
              <li>With service providers who assist our operations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">5. Data Security</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">6. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Opt-out of communications</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">7. Location Data</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              SafeSpora uses location information to provide relevant safety alerts. You can control 
              location sharing through your device settings. Disabling location services may limit 
              the effectiveness of our safety features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">8. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              SafeSpora is not intended for children under 13. We do not knowingly collect personal 
              information from children under 13. If we become aware of such collection, we will 
              delete the information immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">9. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">10. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="bg-[#1F2030] p-4 rounded-lg">
              <p className="text-gray-300">
                Email: privacy@safespora.com<br />
                Address: Lagos, Nigeria
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}