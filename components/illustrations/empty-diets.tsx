"use client";

import { motion } from "motion/react";

export function EmptyDiets({ className }: { className?: string }) {
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
      {/* Document */}
      <path
        d="M38 8H16a4 4 0 0 0-4 4v40a4 4 0 0 0 4 4h32a4 4 0 0 0 4-4V22L38 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.35"
      />
      <path d="M38 8v14h14" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      {/* Upload arrow */}
      <g opacity="0.3">
        <line x1="32" y1="44" x2="32" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <polyline points="26,37 32,32 38,37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </motion.svg>
  );
}
