"use client";

import { motion } from "motion/react";

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        {/* Outer ring */}
        <div className="h-14 w-14 rounded-full border-[3px] border-primary/15" />
        {/* Spinning arc */}
        <motion.div
          className="absolute inset-0 h-14 w-14 rounded-full border-[3px] border-transparent border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
        />
        {/* Inner pulse */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
        >
          <div className="h-3 w-3 rounded-full bg-primary/40" />
        </motion.div>
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-sm font-medium text-foreground-muted"
      >
        Caricamento...
      </motion.span>
    </div>
  );
}

export function OverlayLoader({ message }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative glass-strong rounded-3xl px-8 py-7 flex flex-col items-center shadow-xl"
      >
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-[3px] border-primary/15" />
          <motion.div
            className="absolute inset-0 h-12 w-12 rounded-full border-[3px] border-transparent border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
          />
        </div>
        {message && (
          <span className="mt-3.5 text-sm font-medium text-foreground-muted">
            {message}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
