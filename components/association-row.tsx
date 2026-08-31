"use client";

import { motion } from "motion/react";

interface AssociationRowProps {
  title: string;
  subtitle?: string | null;
  pending: boolean;
  accent?: "primary" | "accent";
  loading?: boolean;
  onConfirm?: () => void;
  onReject: () => void;
  rejectLabel?: string;
}

// One row of a "person you're connected to" list: avatar initial, name/email,
// a pending badge, and either Accetta/Rifiuta (incoming) or a single removal
// action (already confirmed). Shared by the nutritionist and family sections
// of the settings page.
export function AssociationRow({
  title,
  subtitle,
  pending,
  accent = "primary",
  loading = false,
  onConfirm,
  onReject,
  rejectLabel = "Rimuovi",
}: AssociationRowProps) {
  const accentBg = accent === "primary" ? "bg-primary/12" : "bg-accent/12";
  const accentText = accent === "primary" ? "text-primary" : "text-accent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-3"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${accentBg} ${accentText} text-sm font-bold shrink-0`}>
        {title[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">{title}</p>
          {pending && (
            <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider">
              In attesa
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-foreground-muted truncate">{subtitle}</p>}
      </div>
      {pending && onConfirm ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-primary px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-primary-light transition-colors disabled:opacity-60"
          >
            Accetta
          </button>
          <button
            onClick={onReject}
            disabled={loading}
            className="rounded-xl glass px-3 py-1.5 text-[11px] font-semibold text-danger hover:bg-danger/8 transition-colors disabled:opacity-60"
          >
            Rifiuta
          </button>
        </div>
      ) : (
        <button
          onClick={onReject}
          disabled={loading}
          className="shrink-0 rounded-xl bg-danger/8 px-3 py-1.5 text-[11px] font-semibold text-danger hover:bg-danger/15 transition-colors disabled:opacity-60"
        >
          {rejectLabel}
        </button>
      )}
    </motion.div>
  );
}
