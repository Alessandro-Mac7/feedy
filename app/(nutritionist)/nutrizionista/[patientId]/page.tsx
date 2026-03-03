"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { DietUpload } from "@/components/diet-upload";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { cn } from "@/lib/utils";
import type { NutritionistPatient } from "@/types";
import { useToast } from "@/components/toast";
import { CreatorBadge } from "@/components/creator-badge";

interface PatientDiet {
  id: string;
  userId: string;
  dietName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  mealCount: number;
  creatorName?: string | null;
  creatorEmail?: string | null;
}

export default function NutrizionistaPazientePage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const [patient, setPatient] = useState<NutritionistPatient | null>(null);
  const [diets, setDiets] = useState<PatientDiet[]>([]);
  const [loading, setLoading] = useState(true);
  const [nutritionistUserId, setNutritionistUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PatientDiet | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const observerRef = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 10;

  const loadDiets = useCallback(async (reset = true) => {
    try {
      const offset = reset ? 0 : diets.length;
      if (!reset) setLoadingMore(true);
      const res = await fetch(
        `/api/nutritionist/patients/${patientId}/diets?limit=${PAGE_SIZE}&offset=${offset}`
      );
      if (res.ok) {
        const data: PatientDiet[] = await res.json();
        if (reset) {
          setDiets(data);
        } else {
          setDiets((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === PAGE_SIZE);
      }
    } finally {
      setLoadingMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const loadData = useCallback(async () => {
    try {
      const [patientsRes, meRes] = await Promise.all([
        fetch("/api/nutritionist/patients"),
        fetch("/api/nutritionist/me"),
      ]);

      if (patientsRes.ok) {
        const patients = await patientsRes.json();
        const found = patients.find(
          (p: NutritionistPatient) => p.id === patientId
        );
        setPatient(found ?? null);
      }

      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.nutritionist) {
          setNutritionistUserId(meData.nutritionist.userId);
        }
      }

      await loadDiets();
    } catch {
      toast("Errore nel caricamento dati", "error");
    } finally {
      setLoading(false);
    }
  }, [patientId, toast, loadDiets]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerRef.current || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          loadDiets(false);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadDiets]);

  function isOwnDiet(diet: PatientDiet) {
    return nutritionistUserId && diet.createdBy === nutritionistUserId;
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/nutritionist/patients/${patientId}/diets?dietId=${deleteTarget.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast("Dieta eliminata", "success");
        setDeleteTarget(null);
        loadDiets();
      } else {
        const data = await res.json();
        toast(data.error || "Errore nell'eliminazione", "error");
      }
    } catch {
      toast("Errore di connessione", "error");
    } finally {
      setDeleting(false);
    }
  }

  async function handleDuplicate(dietId: string) {
    setDuplicating(dietId);
    try {
      const res = await fetch(
        `/api/nutritionist/patients/${patientId}/diets`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dietId, action: "duplicate" }),
        }
      );
      if (res.ok) {
        toast("Dieta duplicata!", "success");
        loadDiets();
      } else {
        const data = await res.json();
        toast(data.error || "Errore nella duplicazione", "error");
      }
    } catch {
      toast("Errore di connessione", "error");
    } finally {
      setDuplicating(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-xl skeleton-shimmer" />
        <div className="h-24 rounded-2xl skeleton-shimmer" />
        <div className="h-24 rounded-2xl skeleton-shimmer" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4">
        <Link
          href="/nutrizionista"
          className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Torna ai pazienti
        </Link>
        <div className="glass rounded-2xl py-14 text-center">
          <p className="text-foreground-muted font-medium">
            Paziente non trovato
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/nutrizionista"
          className="flex h-10 w-10 items-center justify-center rounded-xl glass hover:bg-white/20 transition-colors shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl text-foreground">
            {patient.patientName || patient.patientEmail}
          </h1>
          {patient.patientName && (
            <p className="text-sm text-foreground-muted">
              {patient.patientEmail}
            </p>
          )}
        </motion.div>
      </div>

      {/* Pending confirmation block */}
      {!patient.confirmed ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-6 text-center"
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent/12">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <p className="font-semibold text-foreground mb-1">
            In attesa di conferma
          </p>
          <p className="text-sm text-foreground-muted">
            Il paziente deve confermare l&apos;associazione prima di poter gestire le sue diete.
          </p>
        </motion.div>
      ) : (
      <>
      {/* Diet upload */}
      <DietUpload
        onUploaded={() => loadDiets()}
        apiEndpoint={`/api/nutritionist/patients/${patientId}/diets`}
      />

      {/* Manual diet builder link */}
      <Link
        href={`/nutrizionista/${patientId}/nuova`}
        className="flex items-center justify-center gap-2 glass rounded-2xl px-5 py-3.5 text-sm font-semibold text-primary hover:bg-white/60 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Crea manualmente
      </Link>

      {/* Patient diets */}
      {diets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl py-14 text-center"
        >
          <p className="text-foreground-muted font-medium mb-0.5">
            Nessuna dieta
          </p>
          <p className="text-foreground-muted/60 text-sm">
            Carica la prima dieta per questo paziente.
          </p>
        </motion.div>
      ) : (
        <div>
          <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">
            Diete ({diets.length})
          </p>
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {diets.map((diet, i) => {
                const owned = isOwnDiet(diet);
                return (
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
                    <div className="flex flex-col gap-2">
                      {/* Title + badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">
                              {diet.dietName}
                            </h3>
                            {diet.isActive && (
                              <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Attiva
                              </span>
                            )}
                            {owned ? (
                              <CreatorBadge
                                label="Verificata"
                                creatorName={diet.creatorName}
                                creatorEmail={diet.creatorEmail}
                              />
                            ) : (
                              <span className="rounded-full bg-foreground-muted/8 px-2.5 py-0.5 text-[10px] font-semibold text-foreground-muted/70 uppercase tracking-wider backdrop-blur-sm">
                                Paziente
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-foreground-muted mt-1">
                            {diet.startDate} &rarr; {diet.endDate}
                          </p>
                          <p className="text-xs text-foreground-muted/60">
                            {diet.mealCount} pasti
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-0.5">
                        {/* Edit - only for nutritionist-created diets */}
                        {owned && (
                          <Link
                            href={`/nutrizionista/${patientId}/${diet.id}/modifica`}
                            className="flex items-center gap-1.5 rounded-lg bg-primary/8 px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/15 transition-colors"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Modifica
                          </Link>
                        )}

                        {/* Duplicate - available for all diets */}
                        <button
                          onClick={() => handleDuplicate(diet.id)}
                          disabled={duplicating === diet.id}
                          className="flex items-center gap-1.5 rounded-lg bg-primary/8 px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/15 transition-colors disabled:opacity-50"
                        >
                          {duplicating === diet.id ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" className="animate-spin">
                              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                              <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          )}
                          Duplica
                        </button>

                        {/* Delete - only for nutritionist-created diets */}
                        {owned && (
                          <button
                            onClick={() => setDeleteTarget(diet)}
                            className="flex items-center gap-1.5 rounded-lg bg-danger/8 px-3 py-1.5 text-[11px] font-semibold text-danger hover:bg-danger/15 transition-colors"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Elimina
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {/* Infinite scroll sentinel */}
              {hasMore && (
                <div ref={observerRef} className="flex justify-center py-4">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-sm text-foreground-muted">
                      <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                        <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Caricamento...
                    </div>
                  )}
                </div>
              )}
            </div>
          </AnimatePresence>
        </div>
      )}
      </>
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminare questa dieta?"
        description={
          deleteTarget
            ? `Stai per eliminare "${deleteTarget.dietName}". Questa azione è irreversibile.`
            : ""
        }
        loading={deleting}
      />
    </div>
  );
}
