"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

const ROLE_CACHE_KEY = "feedy-role";

function subscribeToRoleCache() {
  return () => {};
}

function readCachedRole(): string | null {
  return localStorage.getItem(ROLE_CACHE_KEY);
}

function getServerRoleSnapshot(): string | null {
  return null;
}

export function PatientGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  // Paint immediately from the last known role while the real check runs below.
  const cachedRole = useSyncExternalStore(
    subscribeToRoleCache,
    readCachedRole,
    getServerRoleSnapshot
  );

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/nutritionist/me");
        if (res.ok) {
          const data = await res.json();
          if (data.isNutritionist) {
            localStorage.setItem(ROLE_CACHE_KEY, "nutritionist");
            router.replace("/nutrizionista");
            return;
          }
          localStorage.setItem(ROLE_CACHE_KEY, "patient");
        }
      } catch {
        // not a nutritionist, continue
      }
      setChecked(true);
    }
    check();
  }, [router]);

  if (!checked && cachedRole !== "patient") return null;

  return <>{children}</>;
}
