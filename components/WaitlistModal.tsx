"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function WaitlistModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // TEMP: replace with API call later
    setTimeout(() => {
      setLoading(false);
      onOpenChange(false);

      toast.success("You're on the waiting list", {
        description:
          "Thanks for joining SafeSpora. We'll notify you when we launch in your city.",
      });
    }, 800);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0B0C0F] border border-[#1F2030] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Join the SafeSpora Waiting List
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Be among the first to know when SafeSpora launches in your city.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              required
              placeholder="Your name"
              className="bg-[#12131A] border-[#1F2030]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@email.com"
              className="bg-[#12131A] border-[#1F2030]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="e.g. Lagos, Abuja"
              className="bg-[#12131A] border-[#1F2030]"
            />
          </div>

          <Button
            type="submit"
            size={"lg"}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {loading ? "Submitting..." : "Join Waiting List"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            We respect your privacy. No spam. No forwarded messages.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
