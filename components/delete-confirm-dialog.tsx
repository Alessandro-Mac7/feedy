"use client";

import { motion, AnimatePresence } from "motion/react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  loading,
}: DeleteConfirmDialogProps) {
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
            className="relative glass-strong rounded-2xl p-6 w-full max-w-sm shadow-xl"
          >
            <h3 className="font-semibold text-foreground text-lg">{title}</h3>
            <p className="text-sm text-foreground-muted mt-1.5 leading-relaxed">
              {description}
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-xl glass-subtle px-4 py-2.5 text-sm font-semibold text-foreground-muted hover:bg-white/50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white hover:bg-danger/90 transition-colors shadow-md shadow-danger/20 disabled:opacity-50"
              >
                {loading ? "Eliminazione..." : "Elimina"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
