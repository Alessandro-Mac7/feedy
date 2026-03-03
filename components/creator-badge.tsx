"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

interface CreatorBadgeProps {
  label: string;
  creatorName?: string | null;
  creatorEmail?: string | null;
}

export function CreatorBadge({ label, creatorName, creatorEmail }: CreatorBadgeProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const hasInfo = creatorName || creatorEmail;

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={() => hasInfo && setOpen(!open)}
        className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm cursor-pointer active:scale-95 transition-transform"
        style={{
          background: "linear-gradient(135deg, #2D9F8F 0%, #22d3ab 50%, #2D9F8F 100%)",
          backgroundSize: "200% 200%",
          animation: "shimmer-badge 3s ease-in-out infinite",
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z" />
        </svg>
        {label}
      </button>

      <AnimatePresence>
        {open && hasInfo && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 z-50 mt-2 min-w-[200px] rounded-xl p-3 shadow-xl border border-white/20"
            style={{ background: "var(--background)" }}
          >
            <p className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
              Creata da
            </p>
            {creatorName && (
              <p className="text-sm font-semibold text-foreground truncate">
                {creatorName}
              </p>
            )}
            {creatorEmail && (
              <p className="text-xs text-foreground-muted truncate">
                {creatorEmail}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
