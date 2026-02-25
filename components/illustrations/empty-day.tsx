"use client";

import { motion } from "motion/react";

export function EmptyDay({ className }: { className?: string }) {
  return (
    <motion.svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: [0, -3, 0] }}
      transition={{
        opacity: { duration: 0.4 },
        y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      {/* Calendar body */}
      <rect x="8" y="14" width="48" height="40" rx="6" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      {/* Calendar top bar */}
      <rect x="8" y="14" width="48" height="12" rx="6" stroke="currentColor" strokeWidth="1.5" opacity="0.35" fill="currentColor" fillOpacity="0.05" />
      {/* Calendar hooks */}
      <line x1="22" y1="10" x2="22" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <line x1="42" y1="10" x2="42" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      {/* Question mark */}
      <text x="32" y="44" textAnchor="middle" fontSize="18" fontWeight="600" fill="currentColor" opacity="0.25">?</text>
    </motion.svg>
  );
}
