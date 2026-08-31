"use client";

import type { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface RequestBannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
}

interface RequestBannerProps {
  items: RequestBannerItem[];
  icon: ReactNode;
  accent?: "primary" | "accent";
  respondingId: string | null;
  onRespond: (id: string, action: "confirm" | "reject") => void;
}

// Generic dismissable "pending request" banner (confirm/reject a pending
// association). Used for both nutritionist and family-share invites — the
// two differ only in copy, icon and data source.
export function RequestBanner({ items, icon, accent = "primary", respondingId, onRespond }: RequestBannerProps) {
  if (items.length === 0) return null;

  const iconBg = accent === "primary" ? "bg-primary/12" : "bg-accent/12";
  const iconColor = accent === "primary" ? "text-primary" : "text-accent";

  return (
    <div className="px-5 pt-3 space-y-2">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="glass-strong rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg} ${iconColor} shrink-0`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-xs text-foreground-muted mt-0.5">{item.subtitle}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => onRespond(item.id, "confirm")}
                      disabled={respondingId === item.id}
                      className="flex-1 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-light transition-colors disabled:opacity-60"
                    >
                      {respondingId === item.id ? "..." : "Accetta"}
                    </button>
                    <button
                      onClick={() => onRespond(item.id, "reject")}
                      disabled={respondingId === item.id}
                      className="flex-1 rounded-xl glass px-4 py-2 text-xs font-semibold text-danger hover:bg-danger/8 transition-colors disabled:opacity-60"
                    >
                      Rifiuta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
