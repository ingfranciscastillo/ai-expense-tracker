"use client";

import { signOut } from "../../lib/auth-client";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { LogoutIcon } from "@hugeicons/core-free-icons";

export function SignOutButton() {
  return (
    <Button variant="ghost" onClick={() => signOut()}>
      <HugeiconsIcon icon={LogoutIcon} />
    </Button>
  );
}
