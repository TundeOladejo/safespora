"use client";

import {
  MapPin,
  WarningCircle,
  ShieldCheck,
} from "@phosphor-icons/react";
import { surface } from "@/lib/utils";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: MapPin,
      title: "Select Your Locations",
      text: "Choose the neighborhoods, streets, and routes you care about — like your home area, workplace, or daily commute.",
    },
    {
      step: "02",
      icon: WarningCircle,
      title: "Receive Relevant Alerts",
      text: "When something happens nearby, SafeSpora surfaces alerts based on distance, timing, and relevance — not noise.",
    },
    {
      step: "03",
      icon: ShieldCheck,
      title: "Make Safer Decisions",
      text: "Decide whether to delay, reroute, stay alert, or check in on loved ones using real information.",
    },
  ];

  return (
    <section id="how-it-works" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-14 max-w-2xl">
          <h2 className="text-3xl font-bold">
            How SafeSpora Works
          </h2>
          <p className="mt-4 text-gray-400">
            SafeSpora is designed to be simple, fast, and practical —
            especially for everyday movement in Nigerian cities.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ step, icon: Icon, title, text }) => (
            <div key={step} className={`${surface} p-6 rounded-lg`}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold text-gray-500">
                  STEP {step}
                </span>
                <Icon size={26} className="text-red-500" weight="bold" />
              </div>

              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-gray-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
