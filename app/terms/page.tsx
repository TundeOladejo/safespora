import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | SafeSpora",
  description: "SafeSpora's terms of service - user responsibilities, guidelines, and legal terms for using our community safety platform.",
};

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
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
            <h2 className="text-2xl font-semibold mb-4 text-red-500">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              By accessing and using SafeSpora ("the Service"), you accept and agree to be bound by 
              the terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">2. Description of Service</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              SafeSpora is a community-driven safety awareness platform that provides real-time 
              security alerts and information to help Nigerian communities stay informed about 
              safety incidents in their areas.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              <strong className="text-red-400">Important:</strong> SafeSpora is not a replacement 
              for emergency services. In case of immediate danger, contact local emergency services 
              or law enforcement directly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">3. User Responsibilities</h2>
            
            <h3 className="text-xl font-medium mb-3 text-gray-200">Accurate Information</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              You agree to provide accurate, current, and complete information when reporting 
              safety incidents or creating an account.
            </p>

            <h3 className="text-xl font-medium mb-3 text-gray-200">Responsible Reporting</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              When reporting safety incidents, you must:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Report only factual information you have personally observed or verified</li>
              <li>Avoid spreading rumors, unverified information, or panic</li>
              <li>Respect the privacy and dignity of individuals involved</li>
              <li>Not use the platform for harassment, discrimination, or hate speech</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-gray-200">Prohibited Uses</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              You may not use SafeSpora to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Post false, misleading, or malicious information</li>
              <li>Violate any local, state, or federal laws</li>
              <li>Infringe on intellectual property rights</li>
              <li>Distribute spam or unsolicited communications</li>
              <li>Attempt to gain unauthorized access to the system</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">4. Content and Information</h2>
            
            <h3 className="text-xl font-medium mb-3 text-gray-200">User-Generated Content</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              You retain ownership of content you submit but grant SafeSpora a license to use, 
              modify, and distribute such content for the purpose of providing the service.
            </p>

            <h3 className="text-xl font-medium mb-3 text-gray-200">Information Accuracy</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              While we strive to verify and filter information, SafeSpora cannot guarantee the 
              accuracy, completeness, or timeliness of all safety alerts and reports. Users should 
              exercise their own judgment when acting on information received through the platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">5. Privacy and Data</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs 
              your use of the Service, to understand our practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">6. Disclaimers and Limitations</h2>
            
            <h3 className="text-xl font-medium mb-3 text-gray-200">Service Availability</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              SafeSpora is provided "as is" without warranties of any kind. We do not guarantee 
              uninterrupted or error-free service.
            </p>

            <h3 className="text-xl font-medium mb-3 text-gray-200">Limitation of Liability</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              SafeSpora shall not be liable for any direct, indirect, incidental, special, or 
              consequential damages resulting from the use or inability to use the service.
            </p>

            <h3 className="text-xl font-medium mb-3 text-gray-200">Emergency Situations</h3>
            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg mb-4">
              <p className="text-red-300 font-medium">
                ⚠️ IMPORTANT: SafeSpora is not an emergency service. In case of immediate danger 
                or emergency, contact local emergency services (police, fire, medical) directly.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">7. Account Termination</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We reserve the right to terminate or suspend accounts that violate these terms, 
              engage in harmful behavior, or compromise the safety and integrity of the platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">8. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              The SafeSpora platform, including its design, features, and content, is protected 
              by intellectual property laws. You may not copy, modify, or distribute our proprietary 
              content without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">9. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              These terms shall be governed by and construed in accordance with the laws of the 
              Federal Republic of Nigeria, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">10. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We reserve the right to modify these terms at any time. Users will be notified of 
              significant changes, and continued use of the service constitutes acceptance of 
              modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">11. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-[#1F2030] p-4 rounded-lg">
              <p className="text-gray-300">
                Email: legal@safespora.com<br />
                Address: Lagos, Nigeria
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">12. Community Guidelines</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              SafeSpora is built on trust and community cooperation. We expect all users to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>Act with integrity and responsibility</li>
              <li>Respect fellow community members</li>
              <li>Prioritize public safety over personal interests</li>
              <li>Report violations of these terms</li>
              <li>Help maintain a constructive and helpful environment</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}