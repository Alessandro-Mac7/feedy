"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

const STORAGE_KEY = "cookie-consent-accepted";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
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
