"use client";

import { motion } from "motion/react";

export function EmptyPlate({ className }: { className?: string }) {
  return (
    <motion.svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: [0, -3, 0] }}
      transition={{
        opacity: { duration: 0.4 },
        y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      {/* Plate */}
      <ellipse cx="40" cy="46" rx="28" ry="12" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <ellipse cx="40" cy="44" rx="28" ry="12" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <ellipse cx="40" cy="44" rx="20" ry="8" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      {/* Fork */}
      <g opacity="0.4">
        <line x1="18" y1="16" x2="18" y2="38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="16" x2="14" y2="26" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="18" y1="16" x2="18" y2="26" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="22" y1="16" x2="22" y2="26" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M14 26 Q18 30 22 26" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </g>
      {/* Knife */}
      <g opacity="0.4">
        <line x1="62" y1="18" x2="62" y2="38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M62 18 Q66 22 66 28 Q66 30 62 30" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </g>
    </motion.svg>
  );
}
