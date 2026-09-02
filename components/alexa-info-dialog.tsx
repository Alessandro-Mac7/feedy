"use client";

import { motion, AnimatePresence } from "motion/react";

interface AlexaInfoDialogProps {
  open: boolean;
  onClose: () => void;
}

const EXAMPLES: { label: string; phrase: string }[] = [
  { label: "Per iniziare", phrase: "Alexa, apri piano pasti" },
  { label: "Collegare l'account", phrase: "Il mio codice è..." },
  { label: "Il pasto di adesso", phrase: "Cosa devo mangiare ora?" },
  { label: "Un giorno preciso", phrase: "Cosa devo mangiare domani?" },
  { label: "Un familiare che condivide la dieta", phrase: "Cosa mangia la mamma a pranzo?" },
  { label: "Insieme a qualcuno", phrase: "Cosa mangiamo io e la mamma?" },
];

export function AlexaInfoDialog({ open, onClose }: AlexaInfoDialogProps) {
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
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="relative glass-strong rounded-2xl p-6 w-full max-w-sm shadow-xl max-h-[80vh] overflow-y-auto"
          >
            <h3 className="font-semibold text-foreground text-lg">
              Cosa chiedere ad Alexa
            </h3>
            <p className="text-sm text-foreground-muted mt-1.5 leading-relaxed">
              Dopo aver collegato l&apos;account, prova con queste domande.
            </p>
            <ul className="mt-4 space-y-2.5">
              {EXAMPLES.map((ex) => (
                <li key={ex.phrase} className="glass-subtle rounded-xl px-3.5 py-2.5">
                  <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wide">
                    {ex.label}
                  </p>
                  <p className="text-sm text-foreground mt-0.5">
                    &ldquo;{ex.phrase}&rdquo;
                  </p>
                </li>
              ))}
            </ul>
            <button
              onClick={onClose}
              className="w-full rounded-xl glass-subtle px-4 py-2.5 text-sm font-semibold text-foreground-muted hover:bg-white/50 transition-colors mt-5"
            >
              Ho capito
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
