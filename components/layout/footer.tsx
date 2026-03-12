import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TwitterIcon,
  GithubIcon,
  Coffee02Icon,
} from "@hugeicons/core-free-icons";

const links = [
  { label: "Home", href: "#" },
  { label: "Features", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "About", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Contact", href: "#" },
];

const social = [
  { icon: TwitterIcon, href: "#", label: "Twitter" },
  { icon: GithubIcon, href: "#", label: "GitHub" },
  { icon: Coffee02Icon, href: "#", label: "Buy Me a Coffee" },
];

export default function Footer() {
  return (
    <footer className="bg-background @container border-t py-12">
      <div className="mx-auto max-w-3xl px-6">
        <div className="grid gap-8">
          <div className="col-span-full border-b pb-8">
            <Link href="/" className="flex items-center gap-2">
              AI Expense Manager
            </Link>
            <div className="-ml-2 mt-6 flex">
              {social.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground flex size-8 transition-colors *:m-auto"
                  aria-label={item.label}
                >
                  <HugeiconsIcon size={20} icon={item.icon} />
                </Link>
              ))}
            </div>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-t pt-8">
            <p className="text-muted-foregro(und text-sm">
              &copy; {new Date().getFullYear()} Veil, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
