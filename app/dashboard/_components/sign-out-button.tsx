"use client"

import { signOut } from "../../lib/auth-client"

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="w-full py-2 px-4 border rounded-md hover:bg-accent"
    >
      Sign Out
    </button>
  )
}
