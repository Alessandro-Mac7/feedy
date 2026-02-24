"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { MEAL_TYPES, MEAL_EMOJI, type Day, type MealType } from "@/types";

interface AddMealFormProps {
  dietId: string;
  selectedDay: Day;
  onAdded: () => void;
}

export function AddMealForm({ dietId, selectedDay, onAdded }: AddMealFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mealType, setMealType] = useState<MealType>("Colazione");
  const [foods, setFoods] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [proteins, setProteins] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setMealType("Colazione");
    setFoods("");
    setCarbs("");
    setFats("");
    setProteins("");
    setNotes("");
    setError(null);
  }

  async function handleSubmit() {
    if (!foods.trim()) {
      setError("Inserisci almeno un alimento.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/diets/${dietId}/meals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: selectedDay,
          mealType,
          foods: foods.trim(),
          carbs: carbs ? parseInt(carbs) : null,
          fats: fats ? parseInt(fats) : null,
          proteins: proteins ? parseInt(proteins) : null,
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore durante l'aggiunta.");
      }

      reset();
      setIsOpen(false);
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span className="font-semibold text-sm text-foreground">
            Aggiungi pasto
          </span>
        </div>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground-muted"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/20 px-4 pb-4 pt-3 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
                  Tipo di pasto
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {MEAL_TYPES.map((mt) => (
                    <button
                      key={mt}
                      onClick={() => setMealType(mt)}
                      className={cn(
                        "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
                        mealType === mt
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "glass-subtle text-foreground-muted hover:bg-white/50"
                      )}
                    >
                      {MEAL_EMOJI[mt]} {mt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                  Alimenti
                </label>
                <textarea
                  value={foods}
                  onChange={(e) => setFoods(e.target.value)}
                  rows={2}
                  placeholder="Es. Yogurt greco, muesli, frutta fresca..."
                  className="w-full rounded-xl glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-macro-carbs uppercase tracking-wider mb-1.5">
                    Carb (g)
                  </label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="—"
                    className="w-full rounded-xl glass-input px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-macro-fats uppercase tracking-wider mb-1.5">
                    Grassi (g)
                  </label>
                  <input
                    type="number"
                    value={fats}
                    onChange={(e) => setFats(e.target.value)}
                    placeholder="—"
                    className="w-full rounded-xl glass-input px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-macro-proteins uppercase tracking-wider mb-1.5">
                    Proteine (g)
                  </label>
                  <input
                    type="number"
                    value={proteins}
                    onChange={(e) => setProteins(e.target.value)}
                    placeholder="—"
                    className="w-full rounded-xl glass-input px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                  Note
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Note opzionali..."
                  className="w-full rounded-xl glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
                />
              </div>

              {error && (
                <p className="text-sm font-medium text-danger">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || !foods.trim()}
                className={cn(
                  "w-full rounded-xl py-3 text-sm font-semibold text-white transition-all",
                  "bg-primary hover:bg-primary-light shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20",
                  "disabled:bg-white/30 disabled:text-foreground-muted disabled:shadow-none disabled:cursor-not-allowed disabled:backdrop-blur-sm"
                )}
              >
                {submitting ? "Aggiunta in corso..." : "Aggiungi pasto"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
