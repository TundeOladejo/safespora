"use client"

import { WarningCircle, Siren } from "@phosphor-icons/react";
import { surface } from "@/lib/utils";

export default function LiveAlerts() {
  return (
    <section id="alerts" className="py-28 px-6 bg-black">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <h2 className="text-3xl font-bold">
            Live Alerts From Nearby Communities
          </h2>
          <p className="mt-4 text-gray-400">
            These are examples of the kind of updates SafeSpora surfaces —
            timely, local, and focused on awareness.
          </p>
        </div>

        {/* Alert feed */}
        <div className="space-y-6">
          {/* High priority */}
          <div className={`${surface} p-6 rounded-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-500 font-semibold">
                <Siren size={20} weight="fill" />
                Suspicious Activity
              </div>
              <span className="text-sm text-gray-400">4 mins ago</span>
            </div>
            <p className="mt-2 text-gray-300">
              Lekki Phase 1 — multiple residents reporting unusual movement
              along a commonly used street.
            </p>
          </div>

          {/* Medium priority */}
          <div className={`${surface} p-6 rounded-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-400 font-semibold">
                <WarningCircle size={20} weight="fill" />
                Area to Be Cautious
              </div>
              <span className="text-sm text-gray-400">12 mins ago</span>
            </div>
            <p className="mt-2 text-gray-300">
              Yaba — reports of increased tension near a bus stop during
              evening hours.
            </p>
          </div>

          {/* Informational */}
          <div className={`${surface} p-6 rounded-lg`}>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-300">
                General Awareness
              </div>
              <span className="text-sm text-gray-400">25 mins ago</span>
            </div>
            <p className="mt-2 text-gray-400">
              Gwarinpa — residents advising caution due to unusual gatherings
              late at night.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
