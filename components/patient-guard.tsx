"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  readCachedRole,
  writeCachedRole,
  subscribeToRoleCache,
  getServerRoleSnapshot,
} from "@/lib/auth/role-cache";

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
            writeCachedRole("nutritionist");
            router.replace("/nutrizionista");
            return;
          }
          writeCachedRole("patient");
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
