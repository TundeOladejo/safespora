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
                Kidnapping Risk Alert
              </div>
              <span className="text-sm text-gray-400">4 mins ago</span>
            </div>
            <p className="mt-2 text-gray-300">
              Lagos-Ibadan Expressway — multiple reports of suspicious vehicles 
              blocking traffic near Berger area. Avoid route if possible.
            </p>
          </div>

          {/* Medium priority */}
          <div className={`${surface} p-6 rounded-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-400 font-semibold">
                <WarningCircle size={20} weight="fill" />
                Armed Robbery Alert
              </div>
              <span className="text-sm text-gray-400">12 mins ago</span>
            </div>
            <p className="mt-2 text-gray-300">
              Abuja — reports of armed men targeting vehicles at traffic lights 
              along Airport Road. Exercise extreme caution.
            </p>
          </div>

          {/* Informational */}
          <div className={`${surface} p-6 rounded-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-400 font-semibold">
                <WarningCircle size={20} weight="fill" />
                Suspicious Checkpoint Activity
              </div>
              <span className="text-sm text-gray-400">25 mins ago</span>
            </div>
            <p className="mt-2 text-gray-400">
              Port Harcourt — travelers reporting unusual checkpoint behavior 
              on East-West Road. Consider alternative routes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
