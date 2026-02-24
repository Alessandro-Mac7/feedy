"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth/react/ui";
import { authClient } from "@/lib/auth/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <NeonAuthUIProvider
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      authClient={authClient as any}
      redirectTo="/oggi"
    >
      {children}
    </NeonAuthUIProvider>
  );
}
