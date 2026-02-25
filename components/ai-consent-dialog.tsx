"use client";

import { motion, AnimatePresence } from "motion/react";

interface AiConsentDialogProps {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export function AiConsentDialog({
  open,
  onAccept,
  onCancel,
}: AiConsentDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="relative glass-strong rounded-2xl p-6 w-full max-w-sm shadow-xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-3">
              <span className="text-xl">🤖</span>
            </div>
            <h3 className="font-semibold text-foreground text-lg">
              Stima AI dei macro
            </h3>
            <p className="text-sm text-foreground-muted mt-1.5 leading-relaxed">
              Per stimare i macronutrienti, le descrizioni dei tuoi alimenti
              verranno inviate a <strong>Groq</strong>, un servizio esterno con
              sede negli USA. I dati sono usati solo per la stima e non vengono
              conservati.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={onCancel}
                className="flex-1 rounded-xl glass-subtle px-4 py-2.5 text-sm font-semibold text-foreground-muted hover:bg-white/50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={onAccept}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors shadow-md shadow-primary/20"
              >
                Accetto
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
