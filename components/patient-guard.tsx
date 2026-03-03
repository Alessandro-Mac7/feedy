"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function PatientGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/nutritionist/me");
        if (res.ok) {
          const data = await res.json();
          if (data.isNutritionist) {
            router.replace("/nutrizionista");
            return;
          }
        }
      } catch {
        // not a nutritionist, continue
      }
      setChecked(true);
    }
    check();
  }, [router]);

  if (!checked) return null;

  return <>{children}</>;
}
