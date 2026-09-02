"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/components/toast";
import { AlexaInfoDialog } from "@/components/alexa-info-dialog";

function useCountdown(expiresAt: string | null): number {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt).getTime();
    const tick = () => setRemaining(Math.max(0, Math.round((target - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

export function AlexaLinkCard() {
  const [linked, setLinked] = useState<boolean | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const { toast } = useToast();
  const remaining = useCountdown(code ? expiresAt : null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/alexa/link-code");
      if (res.ok) setLinked((await res.json()).linked);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (code && remaining === 0) setCode(null);
  }, [code, remaining]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/alexa/link-code", { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCode(data.code);
      setExpiresAt(data.expiresAt);
    } catch {
      toast("Errore nella generazione del codice", "error");
    } finally {
      setGenerating(false);
    }
  }

  async function handleUnlink() {
    setUnlinking(true);
    try {
      const res = await fetch("/api/alexa/link-code", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setLinked(false);
      toast("Alexa scollegata", "success");
    } catch {
      toast("Errore nello scollegamento", "error");
    } finally {
      setUnlinking(false);
    }
  }

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.085 }}
        className="glass rounded-2xl p-5"
      >
        <div className="flex items-center gap-1.5 mb-3">
          <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
            Assistente vocale (Alexa)
          </h2>
          <button
            onClick={() => setInfoOpen(true)}
            aria-label="Cosa chiedere ad Alexa"
            className="flex h-4 w-4 items-center justify-center rounded-full text-foreground-muted/70 hover:text-foreground-muted transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </button>
        </div>

        {linked === null ? (
          <div className="h-5 w-40 rounded-lg skeleton-shimmer" />
        ) : linked ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-foreground-muted">
              Il tuo account Feedy è collegato ad Alexa. Prova a chiedere &ldquo;Alexa, chiedi a piano pasti cosa devo mangiare oggi&rdquo;.
            </p>
            <button
              onClick={handleUnlink}
              disabled={unlinking}
              className="shrink-0 rounded-xl bg-danger/8 px-3 py-1.5 text-[11px] font-semibold text-danger hover:bg-danger/15 transition-colors disabled:opacity-60"
            >
              Scollega
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-foreground-muted">
              Genera un codice e dillo ad Alexa per collegare il tuo account: &ldquo;Alexa, apri piano pasti e collega il codice ...&rdquo;.
            </p>

            <AnimatePresence mode="wait">
              {code ? (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="glass-subtle rounded-xl p-4 flex flex-col items-center gap-1"
                >
                  <span className="text-2xl font-bold tabular-nums tracking-widest text-primary">
                    {code}
                  </span>
                  <span className="text-[11px] text-foreground-muted">
                    Scade tra {minutes}:{seconds}
                  </span>
                </motion.div>
              ) : (
                <motion.button
                  key="generate"
                  onClick={handleGenerate}
                  disabled={generating}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors disabled:opacity-60"
                >
                  {generating ? "Generazione..." : "Genera codice"}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
      <AlexaInfoDialog open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}
