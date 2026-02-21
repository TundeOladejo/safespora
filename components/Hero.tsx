"use client"

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Siren, MapPin, Users } from "@phosphor-icons/react";
import WaitlistModal from "./WaitlistModal";

export default function Hero() {
    const [open, setOpen] = useState(false);

    return (
        <section className="relative min-h-screen flex items-center px-6">
            <Image
                src="/images/lagos-night.jpg"
                alt="Lagos city at night"
                fill
                priority
                className="object-cover opacity-70"
            />

            <div className="absolute inset-0 bg-black/75" />

            <div className="relative w-full max-w-7xl mx-auto">
                {/* Badge */}
                <div className="flex items-center gap-2 text-red-500 mt-6 md:mt-0 mb-6">
                    <Siren size={22} weight="fill" />
                    <span className="text-sm font-semibold tracking-wide">
                        REAL-TIME COMMUNITY SAFETY ALERTS
                    </span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
                    Know What’s Happening
                    <span className="block text-red-500">
                        Before You Get There
                    </span>
                </h1>

                {/* Description */}
                <p className="mt-6 text-gray-300 max-w-2xl text-lg">
                    SafeSpora helps Nigerians stay informed about security incidents
                    happening around their neighborhoods, daily routes, and places
                    they care about — in real time.
                </p>

                {/* Supporting points */}
                <div className="mt-8 grid md:grid-cols-3 gap-6 max-w-3xl">
                    <div className="flex items-start gap-3">
                        <MapPin size={22} className="text-red-500 mt-1" />
                        <p className="text-gray-400">
                            Follow specific streets, areas, and routes you use every day
                        </p>
                    </div>

                    <div className="flex items-start gap-3">
                        <Users size={22} className="text-red-500 mt-1" />
                        <p className="text-gray-400">
                            See what people nearby are reporting, not forwarded messages
                        </p>
                    </div>

                    <div className="flex items-start gap-3">
                        <Siren size={22} className="text-red-500 mt-1" />
                        <p className="text-gray-400">
                            Get alerts early enough to wait, reroute, or stay alert
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-10 flex flex-wrap gap-4">
                    <Button
                        size="lg"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => setOpen(true)}
                    >
                        Join Waiting List
                    </Button>

                    <Button size="lg" variant="outline">
                        See How It Works
                    </Button>
                </div>

                <WaitlistModal open={open} onOpenChange={setOpen} />
            </div>
        </section>
    );
}
