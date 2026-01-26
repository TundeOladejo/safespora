import { Button } from "@/components/ui/button";
import { surface } from "@/lib/utils";

export default function CTA() {
  return (
    <section className="py-24 px-6">
      <div className={`${surface} max-w-4xl mx-auto p-10 rounded-lg text-center`}>
        <h2 className="text-4xl font-extrabold">
          Awareness Is the First Line of Defense
        </h2>
        <p className="mt-4 text-gray-400">
          Join SafeSpora and help build safer Nigerian communities.
        </p>

        <Button size="lg" className="mt-6 bg-red-600 hover:bg-red-700">
          Get Early Access
        </Button>
      </div>
    </section>
  );
}
