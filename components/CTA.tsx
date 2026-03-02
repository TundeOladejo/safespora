import Link from "next/link";
import { Button } from "@/components/ui/button";
import { surface } from "@/lib/utils";

export default function CTA() {
  return (
    <section className="py-24 px-6">
      <div className={`${surface} max-w-4xl mx-auto p-10 rounded-lg text-center`}>
        <h2 className="text-4xl font-extrabold">
          Help Build Safer Routes Across Nigeria
        </h2>
        <p className="mt-4 text-gray-400">
          Be among the first 20,000 users to get early access to SafeSpora.
        </p>

        <Button size="lg" className="mt-6 bg-red-600 hover:bg-red-700" asChild>
          <Link href="/waitlist">
            Join Waiting List
          </Link>
        </Button>
      </div>
    </section>
  );
}
