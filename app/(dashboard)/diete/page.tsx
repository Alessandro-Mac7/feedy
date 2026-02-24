"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { DietUpload } from "@/components/diet-upload";
import { cn } from "@/lib/utils";
import type { Diet } from "@/types";

export default function DietePage() {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);

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
    await fetch(`/api/diets/${id}/activate`, { method: "POST" });
    loadDiets();
  }

  async function handleDelete(id: string) {
    if (!confirm("Sei sicuro di voler eliminare questa dieta?")) return;
    await fetch(`/api/diets/${id}`, { method: "DELETE" });
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
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/40">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-muted">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
              <path d="M14 2v6h6" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
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
                      onClick={() => handleDelete(diet.id)}
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
    </div>
  );
}
