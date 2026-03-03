"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { authClient } from "@/lib/auth/client";
import { useToast } from "@/components/toast";
import { ThemeToggle } from "@/components/theme-toggle";

interface NutritionistInfo {
  id: string;
  displayName: string;
  email: string;
}

export default function NutritionistImpostazioniPage() {
  const session = authClient.useSession();
  const [info, setInfo] = useState<NutritionistInfo | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/nutritionist/me");
        if (res.ok) {
          const data = await res.json();
          if (data.isNutritionist && data.nutritionist) {
            setInfo(data.nutritionist);
          }
        }
      } catch {
        // ignore
      }
    }
    load();
  }, []);

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
        <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">
          Account nutrizionista
        </h2>
        {session.isPending ? (
          <div className="space-y-2">
            <div className="h-5 w-40 rounded-lg skeleton-shimmer" />
            <div className="h-4 w-56 rounded-lg skeleton-shimmer" />
          </div>
        ) : session.data?.user ? (
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-lg font-bold text-primary">
              {(info?.displayName?.[0] || session.data.user.name?.[0] || session.data.user.email?.[0] || "N").toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {info?.displayName || session.data.user.name || "Nutrizionista"}
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

      {/* Theme */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="glass rounded-2xl p-5"
      >
        <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">
          Tema
        </h2>
        <ThemeToggle />
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
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
