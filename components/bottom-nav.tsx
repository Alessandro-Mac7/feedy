"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/oggi",
    label: "Oggi",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <circle cx="12" cy="16" r="1.5" fill={active ? "currentColor" : "none"} />
      </svg>
    ),
  },
  {
    href: "/diete",
    label: "Diete",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    href: "/impostazioni",
    label: "Altro",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    ),
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-6 safe-area-bottom">
      <motion.nav
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", bounce: 0.15, duration: 0.6 }}
        className="glass-strong flex items-center gap-0.5 rounded-[22px] px-2 py-2"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
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
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "rgba(45, 159, 143, 0.12)",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 1px 3px rgba(45, 159, 143, 0.08)",
                  }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{item.icon(isActive)}</span>
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
