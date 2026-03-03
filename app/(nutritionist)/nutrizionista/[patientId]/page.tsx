"use client";

import { useState, useEffect, useCallback, use } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { DietUpload } from "@/components/diet-upload";
import { cn } from "@/lib/utils";
import type { NutritionistPatient } from "@/types";
import { useToast } from "@/components/toast";

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
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      const [patientsRes, dietsRes] = await Promise.all([
        fetch("/api/nutritionist/patients"),
        fetch(`/api/nutritionist/patients/${patientId}/diets`),
      ]);

      if (patientsRes.ok) {
        const patients = await patientsRes.json();
        const found = patients.find(
          (p: NutritionistPatient) => p.id === patientId
        );
        setPatient(found ?? null);
      }

      if (dietsRes.ok) {
        const data = await dietsRes.json();
        setDiets(data);
      }
    } catch {
      toast("Errore nel caricamento dati", "error");
    } finally {
      setLoading(false);
    }
  }, [patientId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          >
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

      {/* Diet upload */}
      <DietUpload
        onUploaded={loadData}
        apiEndpoint={`/api/nutritionist/patients/${patientId}/diets`}
      />

      {/* Manual diet builder link */}
      <Link
        href={`/nutrizionista/${patientId}/nuova`}
        className="flex items-center justify-center gap-2 glass rounded-2xl px-5 py-3.5 text-sm font-semibold text-primary hover:bg-white/60 transition-colors"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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
                  <div className="flex flex-col gap-1.5">
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
                    <p className="text-xs text-foreground-muted">
                      {diet.startDate} → {diet.endDate}
                    </p>
                    <p className="text-xs text-foreground-muted/60">
                      {diet.mealCount} pasti
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
