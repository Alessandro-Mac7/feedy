"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { DietUpload } from "@/components/diet-upload";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { cn } from "@/lib/utils";
import type { Diet } from "@/types";
import { useToast } from "@/components/toast";
import { EmptyDiets } from "@/components/illustrations/empty-diets";

export default function DietePage() {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Diet | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const loadDiets = useCallback(async () => {
    try {
      const res = await fetch("/api/diets");
      if (res.ok) {
        const data = await res.json();
        setDiets(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDiets();
  }, [loadDiets]);

  async function handleActivate(id: string) {
    try {
      const res = await fetch(`/api/diets/${id}/activate`, { method: "POST" });
      if (res.ok) {
        toast("Dieta attivata", "success");
      } else {
        toast("Errore nell'attivazione", "error");
      }
    } catch {
      toast("Errore di connessione", "error");
    }
    loadDiets();
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/diets/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Dieta eliminata", "success");
        setDeleteTarget(null);
      } else {
        toast("Errore nell'eliminazione", "error");
      }
    } catch {
      toast("Errore di connessione", "error");
    } finally {
      setDeleting(false);
    }
    loadDiets();
  }

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl text-foreground"
      >
        Le tue diete
      </motion.h1>

      <DietUpload onUploaded={loadDiets} />

      <Link
        href="/diete/nuova"
        className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm font-semibold text-primary hover:bg-white/20 transition-colors"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Crea manualmente
      </Link>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : diets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl py-14 text-center"
        >
          <div className="mx-auto mb-3 text-foreground-muted">
            <EmptyDiets />
          </div>
          <p className="text-foreground-muted font-medium mb-0.5">Nessuna dieta</p>
          <p className="text-foreground-muted/60 text-sm">
            Carica la tua prima dieta usando il modulo sopra.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {diets.map((diet, i) => (
              <motion.div
                key={diet.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "rounded-2xl p-4 transition-all",
                  diet.isActive
                    ? "glass-strong ring-1 ring-primary/20 shadow-lg shadow-primary/8"
                    : "glass"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {diet.dietName}
                      </h3>
                      {diet.isActive && (
                        <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          Attiva
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground-muted mt-0.5">
                      {diet.startDate} → {diet.endDate}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/diete/${diet.id}/modifica`}
                      className="rounded-xl bg-primary/12 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors min-h-[36px] flex items-center"
                    >
                      Modifica
                    </Link>
                    {!diet.isActive && (
                      <button
                        onClick={() => handleActivate(diet.id)}
                        className="rounded-xl bg-primary/12 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors min-h-[36px]"
                      >
                        Attiva
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget(diet)}
                      className="rounded-xl bg-danger/8 px-3.5 py-2 text-xs font-semibold text-danger hover:bg-danger/15 transition-colors min-h-[36px]"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminare questa dieta?"
        description={deleteTarget ? `Stai per eliminare "${deleteTarget.dietName}" e tutti i pasti associati. Questa azione non può essere annullata.` : ""}
        loading={deleting}
      />
    </div>
  );
}
