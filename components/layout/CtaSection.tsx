import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function CallToAction() {
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-medium">
            Ready to take control of your expenses?
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-md text-balance">
            Join thousands of users who simplified their financial tracking.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="pr-1.5">
              <Link href={"/register"}>
                Get Started Free
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2.5}
                  className="size-3.5! opacity-50"
                />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
