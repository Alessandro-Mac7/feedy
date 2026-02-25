"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { authClient } from "@/lib/auth/client";
import { useToast } from "@/components/toast";

export default function ImpostazioniPage() {
  const session = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);
  const { toast } = useToast();

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await authClient.signOut();
      window.location.href = "/auth/sign-in";
    } catch {
      toast("Errore durante il logout. Riprova.", "error");
      setSigningOut(false);
    }
  }

  async function handleClearCache() {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      toast("Cache svuotata con successo.", "success");
    }
  }

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl text-foreground"
      >
        Impostazioni
      </motion.h1>

      {/* User info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass rounded-2xl p-5"
      >
        <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">Account</h2>
        {session.isPending ? (
          <div className="space-y-2">
            <div className="h-5 w-40 rounded-lg skeleton-shimmer" />
            <div className="h-4 w-56 rounded-lg skeleton-shimmer" />
          </div>
        ) : session.data?.user ? (
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-lg font-bold text-primary">
              {(session.data.user.name?.[0] || session.data.user.email?.[0] || "U").toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {session.data.user.name || "Utente"}
              </p>
              <p className="text-sm text-foreground-muted">
                {session.data.user.email}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground-muted">Non autenticato</p>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <a
          href="/template.csv"
          download
          className="flex items-center justify-between glass rounded-2xl px-5 py-3.5 text-sm font-medium text-foreground hover:bg-white/60 transition-colors min-h-[48px]"
        >
          <span className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-muted">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Scarica template CSV
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-muted/40">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>

        <button
          onClick={handleClearCache}
          className="flex w-full items-center justify-between glass rounded-2xl px-5 py-3.5 text-sm font-medium text-foreground hover:bg-white/60 transition-colors min-h-[48px]"
        >
          <span className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-muted">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Svuota cache
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-muted/40">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-2xl border border-danger/20 glass px-5 py-3.5 text-sm font-semibold text-danger hover:bg-danger/5 transition-colors min-h-[48px] disabled:opacity-60"
        >
          {signingOut ? (
            <svg width="18" height="18" viewBox="0 0 24 24" className="animate-spin">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          )}
          {signingOut ? "Uscita in corso..." : "Esci"}
        </button>
      </motion.div>

      {/* App info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center pt-4 space-y-1"
      >
        <p className="font-display text-lg text-foreground-muted/40">Feedy</p>
        <p className="text-xs text-foreground-muted/30">v0.1.0</p>
      </motion.div>
    </div>
  );
}
