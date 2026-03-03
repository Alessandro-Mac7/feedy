"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { AuthGuard } from "@/components/auth-guard";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/nutrizionista",
    label: "Pazienti",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/nutrizionista/impostazioni",
    label: "Impostazioni",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    ),
  },
];

function NutritionistGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/nutritionist/me");
        if (res.ok) {
          const data = await res.json();
          if (!data.isNutritionist) {
            router.replace("/oggi");
            return;
          }
        } else {
          router.replace("/oggi");
          return;
        }
      } catch {
        router.replace("/oggi");
        return;
      }
      setChecked(true);
    }
    check();
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-[3px] border-primary/15" />
          <motion.div
            className="absolute inset-0 h-14 w-14 rounded-full border-[3px] border-transparent border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function NutritionistNav() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed bottom-5 left-0 right-0 z-50 flex justify-center px-6 safe-area-bottom">
      <motion.nav
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", bounce: 0.15, duration: 0.6 }}
        className="pointer-events-auto glass-strong flex items-center gap-0.5 rounded-[22px] px-2 py-2"
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/nutrizionista"
              ? pathname === "/nutrizionista" || (pathname.startsWith("/nutrizionista/") && !pathname.startsWith("/nutrizionista/impostazioni"))
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-2xl px-5 py-2 text-[11px] font-medium transition-colors min-w-[68px] min-h-[44px] justify-center",
                isActive
                  ? "text-primary-dark"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nutri-nav-pill"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "var(--nav-pill)",
                    boxShadow: "inset 0 1px 0 var(--nav-pill-shadow), 0 1px 3px var(--glass-shadow)",
                  }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <motion.span
                className="relative z-10"
                animate={isActive ? { y: [0, -3, 0] } : { y: 0 }}
                transition={isActive ? { duration: 0.35, ease: "easeOut" } : {}}
              >
                {item.icon(isActive)}
              </motion.span>
              <motion.span
                className="relative z-10"
                whileTap={{ scale: 0.92 }}
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}

export default function NutritionistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <NutritionistGuard>
        <div className="mx-auto min-h-screen max-w-lg md:max-w-2xl">
          <main className="px-5 pt-4 pb-28">{children}</main>
          <div
            className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 h-28"
            style={{
              background:
                "linear-gradient(to top, var(--background) 30%, transparent 100%)",
            }}
          />
          <NutritionistNav />
        </div>
      </NutritionistGuard>
    </AuthGuard>
  );
}
