"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { authClient } from "@/lib/auth/client";
import { useToast } from "@/components/toast";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { ThemeToggle } from "@/components/theme-toggle";

interface Goals {
  dailyKcal: number;
  dailyCarbs: number;
  dailyFats: number;
  dailyProteins: number;
  dailyWater: number;
}

const DEFAULT_GOALS: Goals = {
  dailyKcal: 2000,
  dailyCarbs: 250,
  dailyFats: 65,
  dailyProteins: 75,
  dailyWater: 8,
};

export default function ImpostazioniPage() {
  const session = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);
  const [savingGoals, setSavingGoals] = useState(false);
  const { toast } = useToast();

  const loadGoals = useCallback(async () => {
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals({
          dailyKcal: data.dailyKcal ?? DEFAULT_GOALS.dailyKcal,
          dailyCarbs: data.dailyCarbs ?? DEFAULT_GOALS.dailyCarbs,
          dailyFats: data.dailyFats ?? DEFAULT_GOALS.dailyFats,
          dailyProteins: data.dailyProteins ?? DEFAULT_GOALS.dailyProteins,
          dailyWater: data.dailyWater ?? DEFAULT_GOALS.dailyWater,
        });
      }
    } catch { /* use defaults */ }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  async function handleSaveGoals() {
    setSavingGoals(true);
    try {
      const res = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goals),
      });
      if (res.ok) {
        toast("Obiettivi salvati", "success");
      } else {
        toast("Errore nel salvataggio", "error");
      }
    } catch {
      toast("Errore di connessione", "error");
    } finally {
      setSavingGoals(false);
    }
  }

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

  async function handleExportData() {
    setExporting(true);
    try {
      const res = await fetch("/api/account");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `feedy-dati-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Dati esportati con successo.", "success");
    } catch {
      toast("Errore nell'esportazione dei dati.", "error");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) throw new Error();
      await authClient.signOut();
      window.location.href = "/auth/sign-in";
    } catch {
      toast("Errore nell'eliminazione dell'account.", "error");
      setDeleting(false);
      setShowDeleteDialog(false);
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

      {/* Theme */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="glass rounded-2xl p-5"
      >
        <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">Tema</h2>
        <ThemeToggle />
      </motion.div>

      {/* Goals */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.09 }}
        className="glass rounded-2xl p-5"
      >
        <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">Obiettivi giornalieri</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "dailyKcal" as const, label: "Kcal", unit: "kcal" },
            { key: "dailyCarbs" as const, label: "Carboidrati", unit: "g" },
            { key: "dailyFats" as const, label: "Grassi", unit: "g" },
            { key: "dailyProteins" as const, label: "Proteine", unit: "g" },
            { key: "dailyWater" as const, label: "Bicchieri acqua", unit: "" },
          ].map((field) => (
            <div key={field.key} className={field.key === "dailyWater" ? "col-span-2" : ""}>
              <label className="text-[11px] font-medium text-foreground-muted mb-1 block">
                {field.label} {field.unit && <span className="text-foreground-muted/50">({field.unit})</span>}
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={goals[field.key]}
                onChange={(e) => setGoals({ ...goals, [field.key]: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl glass-input px-3 py-2.5 text-sm font-medium text-foreground tabular-nums"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleSaveGoals}
          disabled={savingGoals}
          className="mt-4 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors disabled:opacity-60"
        >
          {savingGoals ? "Salvataggio..." : "Salva obiettivi"}
        </button>
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
          onClick={handleExportData}
          disabled={exporting}
          className="flex w-full items-center justify-between glass rounded-2xl px-5 py-3.5 text-sm font-medium text-foreground hover:bg-white/60 transition-colors min-h-[48px] disabled:opacity-60"
        >
          <span className="flex items-center gap-3">
            {exporting ? (
              <svg width="18" height="18" viewBox="0 0 24 24" className="animate-spin text-foreground-muted">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-muted">
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                <polyline points="7 11 12 16 17 11" />
                <line x1="12" y1="4" x2="12" y2="16" />
              </svg>
            )}
            {exporting ? "Esportazione..." : "Esporta i miei dati"}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-muted/40">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

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
          onClick={() => setShowDeleteDialog(true)}
          className="flex w-full items-center gap-3 rounded-2xl border border-danger/20 glass px-5 py-3.5 text-sm font-semibold text-danger hover:bg-danger/5 transition-colors min-h-[48px]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          Elimina account
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

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        loading={deleting}
        title="Elimina account"
        description="Questa azione è irreversibile. Tutti i tuoi dati (diete, pasti, macro) verranno eliminati definitivamente. Sei sicuro di voler procedere?"
      />
    </div>
  );
}
