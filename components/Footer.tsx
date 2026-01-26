"use client"

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0B0C0F] border-t border-[#1F2030]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-semibold text-lg">SafeSpora</h3>
            <p className="mt-2 text-sm text-gray-400">
              Community-driven safety awareness for Nigerian cities.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-medium mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>How it works</li>
              <li>Live alerts</li>
              <li>Verification</li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-medium mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>About</li>
              <li>Contact</li>
              <li>Careers</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#1F2030] text-sm text-gray-500 flex flex-col md:flex-row justify-between gap-4">
          <span>© {new Date().getFullYear()} SafeSpora. All rights reserved.</span>
          <span>Built for Nigerian communities 🇳🇬</span>
        </div>
      </div>
    </footer>
  );
}
