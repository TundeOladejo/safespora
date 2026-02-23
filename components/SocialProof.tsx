"use client"

import { useState, useEffect } from "react";
import { Users, Star } from "@phosphor-icons/react";
import { surface } from "@/lib/utils";

export default function SocialProof() {
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchWaitlistCount() {
      try {
        const response = await fetch('/api/waitlist/count');
        const data = await response.json();
        if (data.success) {
          setWaitlistCount(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch waitlist count:', error);
      }
    }

    fetchWaitlistCount();
  }, []);

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className={`${surface} p-8 rounded-lg text-center`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users size={28} className="text-red-500" weight="bold" />
            <h3 className="text-2xl font-bold">Join Thousands Already Waiting</h3>
          </div>
          
          {waitlistCount !== null && (
            <div className="mb-6">
              {/* <p className="text-4xl font-extrabold text-red-500 mb-2">
                {waitlistCount.toLocaleString()}+
              </p> */}
              <p className="text-gray-300 text-lg">
                Nigerians have already joined the SafeSpora waitlist
              </p>
            </div>
          )}

          <div className="grid md:flex items-center justify-center gap-2 md:gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-400" weight="fill" />
              <p>Founding members get early access</p>
            </div>
            <div className="flex items-center gap-1">
              <Users size={16} className="text-green-400" weight="fill" />
              <span>Priority safety alerts</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}