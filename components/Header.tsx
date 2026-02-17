"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { List, Siren } from "@phosphor-icons/react";
import WaitlistModal from "./WaitlistModal";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0B0C0F] border-b border-[#1F2030]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/safespora.svg" className="h-8 w-8 md:h-8 md:w-8" alt="safespora logo" />
          <span className="font-semibold text-lg tracking-tight">
            SafeSpora
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <Link href="#how-it-works" className="hover:text-white">
            How it works
          </Link>
          <Link href="#alerts" className="hover:text-white">
            Alerts
          </Link>
          <Link href="#trust" className="hover:text-white">
            Trust
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Button
          size={"lg"}
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setOpen(true)}
          >
            Join Waiting List
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <List size={36} />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="bg-[#0B0C0F] border-l border-[#1F2030] text-white"
            >
              <nav className="mt-10 flex flex-col gap-6 text-lg p-6">
                <Link
                  href="#how-it-works"
                  onClick={() => setMenuOpen(false)}
                >
                  How it works
                </Link>
                <Link
                  href="#alerts"
                  onClick={() => setMenuOpen(false)}
                >
                  Alerts
                </Link>
                <Link
                  href="#trust"
                  onClick={() => setMenuOpen(false)}
                >
                  Trust
                </Link>

                <Button
                  className="mt-6 bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    setMenuOpen(false);
                    setOpen(true);
                  }}
                >
                  Join Waiting List
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <WaitlistModal open={open} onOpenChange={setOpen} />
    </header>
  );
}
