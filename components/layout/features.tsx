import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiScanIcon,
  Tag01Icon,
  Wallet02Icon,
  Analytics01Icon,
  ZapIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";

export default function FeaturesSection() {
  return (
    <section>
      <div className="py-24">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <HugeiconsIcon
                icon={AiScanIcon}
                size={24}
                className="text-primary"
              />
              <h3 className="text-foreground mt-5 text-lg font-semibold">
                AI Receipt Scanning
              </h3>
              <p className="text-muted-foreground mt-3 text-balance">
                Simply snap a photo or upload a PDF. Our AI extracts all the
                important data automatically.
              </p>
            </Card>

            <Card className="p-6">
              <HugeiconsIcon
                icon={Tag01Icon}
                size={24}
                className="text-primary"
              />
              <h3 className="text-foreground mt-5 text-lg font-semibold">
                Auto-Categorization
              </h3>
              <p className="text-muted-foreground mt-3 text-balance">
                Expenses are automatically categorized. Review and adjust
                anytime to keep everything organized.
              </p>
            </Card>
            <Card className="p-6">
              <HugeiconsIcon
                icon={Wallet02Icon}
                size={24}
                className="text-primary"
              />
              <h3 className="text-foreground mt-5 text-lg font-semibold">
                Budget Tracking
              </h3>
              <p className="text-muted-foreground mt-3 text-balance">
                Set monthly budgets and get alerts when you&apos;re approaching
                your limits. Stay in control of your finances.
              </p>
            </Card>
            <Card className="p-6">
              <HugeiconsIcon
                icon={Analytics01Icon}
                size={24}
                className="text-primary"
              />
              <h3 className="text-foreground mt-5 text-lg font-semibold">
                Export Reports
              </h3>
              <p className="text-muted-foreground mt-3 text-balance">
                Generate CSV exports for tax purposes or accounting. Filter by
                date, category, and more.
              </p>
            </Card>
            <Card className="p-6">
              <HugeiconsIcon
                icon={Shield01Icon}
                size={24}
                className="text-primary"
              />
              <h3 className="text-foreground mt-5 text-lg font-semibold">
                Secure & Private
              </h3>
              <p className="text-muted-foreground mt-3 text-balance">
                Your data is encrypted and stored securely. Only you can access
                your financial information.
              </p>
            </Card>
            <Card className="p-6">
              <HugeiconsIcon
                icon={ZapIcon}
                size={24}
                className="text-primary"
              />
              <h3 className="text-foreground mt-5 text-lg font-semibold">
                Fast & Easy
              </h3>
              <p className="text-muted-foreground mt-3 text-balance">
                From receipt to categorized expense in seconds. Spend less time
                on paperwork and more on what matters.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
