"use client";

import { useState, useRef } from "react";
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

// Nigerian states
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 
  'Federal Capital Territory'
];

export default function WaitlistModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    referralSource: "",
  });
  
  // Honeypot field - should remain empty
  const [honeypot, setHoneypot] = useState("");
  
  // Track form start time to detect bots (bots fill forms too quickly)
  const formStartTime = useRef(Date.now());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Honeypot check - if filled, silently reject (bot)
    if (honeypot) {
      console.log("Honeypot triggered - bot detected");
      // Return success to fool the bot
      toast.success("Welcome to SafeSpora! 🎉", {
        description: "Check your email for confirmation and updates.",
        duration: 5000,
      });
      onOpenChange(false);
      return;
    }
    
    // Check if form was filled too quickly (less than 3 seconds - likely a bot)
    const timeElapsed = Date.now() - formStartTime.current;
    if (timeElapsed < 3000) {
      console.log("Form filled too quickly - bot detected");
      toast.success("Welcome to SafeSpora! 🎉", {
        description: "Check your email for confirmation and updates.",
        duration: 5000,
      });
      onOpenChange(false);
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Reset form
      setFormData({ 
        fullName: "", 
        email: "", 
        phone: "", 
        state: "", 
        city: "", 
        referralSource: "" 
      });
      
      // Close modal
      onOpenChange(false);

      console.log("Waitlist position:", data);

      // Show success toast with position
      if (data.alreadyExists) {
        toast.success("You're already on the waitlist! 🎉", {
          description: `You're #${data.position} in line. Check your email for updates.`,
          duration: 5000,
        });
      } else {
        toast.success("Welcome to SafeSpora! 🎉", {
          description: `You're #${data.position} in line. Check your email for confirmation.`,
          duration: 5000,
        });
      }

    } catch (error) {
      toast.error("Failed to join waitlist", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-[#0B0C0F] border border-[#1F2030] text-white 
                   sm:max-w-md w-[95%] max-h-[60vh] overflow-y-auto 
                   rounded-lg mx-auto my-8 p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Join the <span className="text-red-500">SafeSpora</span> Waitlist
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Be among the first to know when SafeSpora launches in your city. 
            Early access members get exclusive perks! ✨
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Honeypot field - hidden from real users */}
          <div className="hidden" aria-hidden="true">
            <Label htmlFor="website">Website</Label>
            <Input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              placeholder="Leave this empty"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-300">
              Full name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="John Doe"
              className="bg-[#12131A] border-[#1F2030] text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-red-500"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className="bg-[#12131A] border-[#1F2030] text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-red-500"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-300">
              Phone number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+234 801 234 5678"
              className="bg-[#12131A] border-[#1F2030] text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-red-500"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state" className="text-sm font-medium text-gray-300">
              State <span className="text-red-500">*</span>
            </Label>
            <select
              id="state"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-3 text-sm py-2 bg-[#12131A] border border-[#1F2030] text-white rounded-md focus:border-red-500 focus:ring-red-500 focus:outline-none"
              disabled={loading}
            >
              <option value="">Select your state</option>
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state} className="bg-[#12131A] text-white">
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium text-gray-300">
              City
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Lagos, Abuja, Port Harcourt"
              className="bg-[#12131A] border-[#1F2030] text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-red-500"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralSource" className="text-sm font-medium text-gray-300">
              How did you hear about us?
            </Label>
            <select
              id="referralSource"
              value={formData.referralSource}
              onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-[#12131A] border border-[#1F2030] text-white rounded-md focus:border-red-500 focus:ring-red-500 focus:outline-none"
              disabled={loading}
            >
              <option value="">Select an option</option>
              <option value="social_media" className="bg-[#12131A] text-white">Social Media</option>
              <option value="friend_referral" className="bg-[#12131A] text-white">Friend/Family</option>
              <option value="search_engine" className="bg-[#12131A] text-white">Google/Search</option>
              <option value="news_article" className="bg-[#12131A] text-white">News Article</option>
              <option value="community_group" className="bg-[#12131A] text-white">Community Group</option>
              <option value="other" className="bg-[#12131A] text-white">Other</option>
            </select>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Joining...
              </span>
            ) : (
              "Join Waiting List"
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            🤝 We respect your privacy. No spam. No forwarded messages.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}