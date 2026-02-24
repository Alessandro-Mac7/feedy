"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session.isPending && !session.data) {
      router.replace("/auth/sign-in");
    }
  }, [session.isPending, session.data, router]);

  if (session.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-white/30" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
          </div>
          <span className="text-sm text-foreground-muted">Caricamento...</span>
        </div>
      </div>
    );
  }

  if (!session.data) {
    return null;
  }

  return <>{children}</>;
}
