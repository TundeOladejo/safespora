"use client"

import { CheckCircle, WarningCircle, Users } from "@phosphor-icons/react";
import { surface } from "@/lib/utils";

export default function Trust() {
  return (
    <section id="trust" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl font-bold">
            Built on Trust, Not Panic
          </h2>
          <p className="mt-4 text-gray-400">
            Safety information is only useful when it is clear, relevant, and
            responsible. SafeSpora is designed to help people stay aware —
            without spreading fear or misinformation.
          </p>
        </div>

        {/* Trust pillars */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Community-driven */}
          <div className={`${surface} p-6 rounded-lg`}>
            <Users size={28} className="text-red-500 mb-4" weight="bold" />
            <h3 className="text-xl font-semibold">
              Community-Driven Reports
            </h3>
            <p className="mt-3 text-gray-400">
              Alerts come from people in nearby areas who are experiencing or
              observing events in real time — not anonymous viral messages.
            </p>
          </div>

          {/* Relevance-focused */}
          <div className={`${surface} p-6 rounded-lg`}>
            <CheckCircle size={28} className="text-red-500 mb-4" weight="bold" />
            <h3 className="text-xl font-semibold">
              Focused on Relevance
            </h3>
            <p className="mt-3 text-gray-400">
              SafeSpora prioritizes proximity and timing. You see what is close
              to you and recent — not unrelated incidents happening far away.
            </p>
          </div>

          {/* Responsible alerts */}
          <div className={`${surface} p-6 rounded-lg`}>
            <WarningCircle size={28} className="text-red-500 mb-4" weight="bold" />
            <h3 className="text-xl font-semibold">
              Responsibility First
            </h3>
            <p className="mt-3 text-gray-400">
              Alerts are framed for awareness, not alarm. The goal is to help
              you stay informed and decide calmly, not to cause panic.
            </p>
          </div>
        </div>

        {/* Transparency block */}
        <div className="mt-20 max-w-4xl">
          <h3 className="text-2xl font-semibold">
            What SafeSpora Is — And What It Is Not
          </h3>

          <div className="mt-6 grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-green-400 mb-2">
                What it is
              </h4>
              <ul className="space-y-2 text-gray-400 list-disc list-inside">
                <li>A tool for situational awareness</li>
                <li>A way to see what people nearby are reporting</li>
                <li>Designed to support everyday decision-making</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-yellow-400 mb-2">
                What it is not
              </h4>
              <ul className="space-y-2 text-gray-400 list-disc list-inside">
                <li>Not a replacement for emergency services</li>
                <li>Not a source of official law enforcement updates</li>
                <li>Not a platform for rumors or forwarded messages</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Closing reassurance */}
        <div className="mt-20 max-w-3xl">
          <p className="text-gray-400 text-lg">
            In a country where information often travels faster than
            verification, SafeSpora is built to slow things down just enough
            to help people think clearly and move safely.
          </p>
        </div>
      </div>
    </section>
  );
}
