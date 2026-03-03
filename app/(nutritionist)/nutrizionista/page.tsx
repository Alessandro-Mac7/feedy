"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { useToast } from "@/components/toast";
import type { NutritionistPatient } from "@/types";

export default function NutrizionistaPazientiPage() {
  const [patients, setPatients] = useState<NutritionistPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NutritionistPatient | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const loadPatients = useCallback(async () => {
    try {
      const res = await fetch("/api/nutritionist/patients");
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setAdding(true);
    setError(null);

    try {
      const res = await fetch("/api/nutritionist/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore sconosciuto");
      }

      setEmail("");
      setName("");
      toast("Paziente aggiunto!", "success");
      loadPatients();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Errore sconosciuto.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/nutritionist/patients/${deleteTarget.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast("Paziente rimosso", "success");
        setDeleteTarget(null);
      } else {
        toast("Errore nella rimozione", "error");
      }
    } catch {
      toast("Errore di connessione", "error");
    } finally {
      setDeleting(false);
    }
    loadPatients();
  }

  function getInitial(patient: NutritionistPatient) {
    return (patient.patientName || patient.patientEmail)[0].toUpperCase();
  }

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl text-foreground"
      >
        I tuoi pazienti
      </motion.h1>

      {/* Add patient form */}
      <div className="glass rounded-2xl p-5">
        <h2 className="font-semibold text-foreground mb-3">
          Aggiungi paziente
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
              Email del paziente
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="paziente@email.com"
              required
              className="w-full rounded-xl glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
              Nome (opzionale)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Mario Rossi"
              className="w-full rounded-xl glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
            />
          </div>

          {error && <p className="text-sm font-medium text-danger">{error}</p>}

          <button
            type="submit"
            disabled={adding || !email.trim()}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all bg-primary hover:bg-primary-light shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20 disabled:bg-white/30 disabled:text-foreground-muted disabled:shadow-none disabled:cursor-not-allowed disabled:backdrop-blur-sm"
          >
            {adding ? "Aggiunta in corso..." : "Aggiungi paziente"}
          </button>
        </form>
      </div>

      {/* Patient list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl py-14 text-center"
        >
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/12">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-foreground-muted font-medium mb-0.5">
            Nessun paziente
          </p>
          <p className="text-foreground-muted/60 text-sm">
            Aggiungi il tuo primo paziente usando il modulo sopra.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {patients.map((patient, i) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-sm font-bold text-primary shrink-0">
                    {getInitial(patient)}
                  </div>
                  <Link
                    href={`/nutrizionista/${patient.id}`}
                    className="flex-1 min-w-0"
                  >
                    <p className="font-semibold text-foreground truncate">
                      {patient.patientName || patient.patientEmail}
                    </p>
                    {patient.patientName && (
                      <p className="text-xs text-foreground-muted truncate">
                        {patient.patientEmail}
                      </p>
                    )}
                    <p className="text-[10px] text-foreground-muted/60 mt-0.5">
                      Aggiunto il{" "}
                      {new Date(patient.addedAt).toLocaleDateString("it-IT")}
                    </p>
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(patient)}
                    className="rounded-xl bg-danger/8 px-3 py-1.5 text-[11px] font-semibold text-danger hover:bg-danger/15 transition-colors shrink-0"
                  >
                    Rimuovi
                  </button>
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
        title="Rimuovere questo paziente?"
        description={
          deleteTarget
            ? `Stai per rimuovere "${deleteTarget.patientName || deleteTarget.patientEmail}" dalla tua lista pazienti. Le diete già caricate non verranno eliminate.`
            : ""
        }
        loading={deleting}
      />
    </div>
  );
}
