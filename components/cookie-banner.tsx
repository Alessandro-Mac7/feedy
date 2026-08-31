"use client";

import { useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

const STORAGE_KEY = "cookie-consent-accepted";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return !localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return false;
}

export function CookieBanner() {
  // Renders hidden during SSR/hydration (deterministic), then shows right
  // after mount if consent hasn't been recorded yet — no effect needed
  // just to read localStorage once.
  const shouldShow = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);
  const visible = shouldShow && !dismissed;

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-20 left-4 right-4 z-50 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm"
        >
          <div className="glass-strong rounded-2xl p-4 shadow-xl">
            <p className="text-sm text-foreground leading-relaxed">
              Questo sito usa cookie tecnici e localStorage per funzionare.{" "}
              <Link
                href="/privacy"
                className="font-semibold text-primary hover:text-primary-light transition-colors underline underline-offset-2"
              >
                Privacy Policy
              </Link>
            </p>
            <button
              onClick={handleAccept}
              className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-light transition-all"
            >
              Ho capito
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
