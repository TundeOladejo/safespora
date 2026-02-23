"use client"

import { Shield, CheckCircle } from "@phosphor-icons/react";
import { surface } from "@/lib/utils";

export default function ProofSection() {
  return (
    <section className="py-20 px-6 bg-black">
      <div className="max-w-4xl mx-auto">
        {/* Statistics Block */}
        <div className={`${surface} p-8 rounded-lg text-center`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield size={24} className="text-red-500" weight="bold" />
            <h3 className="text-2xl font-bold">The Reality of Insecurity in Nigeria</h3>
          </div>
          
          <div className="mb-6">
            <p className="text-4xl font-extrabold text-red-500 mb-2">
              Over 10,000
            </p>
            <p className="text-gray-300 text-lg">
              security incidents reported across Nigerian states in 2024 alone*
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
            <CheckCircle size={20} weight="fill" />
            <p className="font-semibold">
              Reports are filtered and verified using proximity, recency, and pattern matching
            </p>
          </div>

          <p className="text-gray-400 text-sm">
            *Data compiled from verified news sources, security agencies, and community reports
          </p>
        </div>
      </div>
    </section>
  );
}