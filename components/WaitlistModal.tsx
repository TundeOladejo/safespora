"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import WaitlistForm from "./WaitlistForm";

export default function WaitlistModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-[#0B0C0F] border border-[#1F2030] text-white 
                   sm:max-w-md w-[95%] max-h-[50vh] overflow-y-auto 
                   rounded-lg mx-auto my-8 p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Join the <span className="text-red-500">SafeSpora</span> Waitlist
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Join thousands already waiting for early access to Nigeria's first 
            community-driven safety platform. Founding members get priority alerts! ✨
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <WaitlistForm 
            onSuccess={handleSuccess}
            showTitle={false}
            showDescription={false}
            className=""
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}