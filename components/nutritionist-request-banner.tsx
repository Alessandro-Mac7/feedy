"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/components/toast";

interface NutritionistAssociation {
  id: string;
  nutritionistName: string;
  nutritionistEmail: string;
  confirmed: boolean;
  addedAt: string;
}

export function NutritionistRequestBanner() {
  const [requests, setRequests] = useState<NutritionistAssociation[]>([]);
  const [responding, setResponding] = useState<string | null>(null);
  const { toast } = useToast();

  const loadRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/patient/nutritionist");
      if (res.ok) {
        const data: NutritionistAssociation[] = await res.json();
        setRequests(data.filter((a) => !a.confirmed));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  async function handleResponse(id: string, action: "confirm" | "reject") {
    setResponding(id);
    try {
      const res = await fetch(
        `/api/patient/nutritionist?id=${id}&action=${action}`,
        { method: "PATCH" }
      );
      if (res.ok) {
        toast(
          action === "confirm"
            ? "Nutrizionista confermato!"
            : "Richiesta rifiutata.",
          action === "confirm" ? "success" : "info"
        );
        setRequests((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast("Errore nella risposta.", "error");
      }
    } catch {
      toast("Errore di connessione.", "error");
    } finally {
      setResponding(null);
    }
  }

  if (requests.length === 0) return null;

  return (
    <div className="px-5 pt-3 space-y-2">
      <AnimatePresence mode="popLayout">
        {requests.map((req) => (
          <motion.div
            key={req.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="glass-strong rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 shrink-0">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {req.nutritionistName} vuole gestire le tue diete
                  </p>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {req.nutritionistEmail}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleResponse(req.id, "confirm")}
                      disabled={responding === req.id}
                      className="flex-1 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-light transition-colors disabled:opacity-60"
                    >
                      {responding === req.id ? "..." : "Accetta"}
                    </button>
                    <button
                      onClick={() => handleResponse(req.id, "reject")}
                      disabled={responding === req.id}
                      className="flex-1 rounded-xl glass px-4 py-2 text-xs font-semibold text-danger hover:bg-danger/8 transition-colors disabled:opacity-60"
                    >
                      Rifiuta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
