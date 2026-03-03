"use client";

import { useState, useEffect, useCallback, use } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { DayTabs } from "@/components/day-tabs";
import { EditableMealCard } from "@/components/editable-meal-card";
import { AddMealForm } from "@/components/add-meal-form";
import { getTodayDay, cn } from "@/lib/utils";
import { PageLoader } from "@/components/page-loader";
import { useToast } from "@/components/toast";
import { MEAL_TYPES, type Day, type Meal, type Diet, type MealType } from "@/types";

interface DietWithMeals extends Diet {
  meals: Meal[];
}

export default function NutritionistModificaDietaPage({
  params,
}: {
  params: Promise<{ patientId: string; dietId: string }>;
}) {
  const { patientId, dietId } = use(params);
  const [diet, setDiet] = useState<DietWithMeals | null>(null);
  const [selectedDay, setSelectedDay] = useState<Day>(getTodayDay());
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  // Editable metadata
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaName, setMetaName] = useState("");
  const [metaStart, setMetaStart] = useState("");
  const [metaEnd, setMetaEnd] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);

  const apiBase = `/api/nutritionist/patients/${patientId}/diets/${dietId}`;

  const loadDiet = useCallback(async () => {
    try {
      const res = await fetch(apiBase);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      setDiet(data);
      setMetaName(data.dietName);
      setMetaStart(data.startDate);
      setMetaEnd(data.endDate);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    loadDiet();
  }, [loadDiet]);

  function handleStartEditMeta() {
    if (!diet) return;
    setMetaName(diet.dietName);
    setMetaStart(diet.startDate);
    setMetaEnd(diet.endDate);
    setEditingMeta(true);
  }

  async function handleSaveMeta() {
    if (!metaName.trim()) return;
    setSavingMeta(true);
    try {
      const res = await fetch(apiBase, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dietName: metaName.trim(),
          startDate: metaStart,
          endDate: metaEnd,
        }),
      });
      if (res.ok) {
        toast("Dieta aggiornata", "success");
        setEditingMeta(false);
        loadDiet();
      } else {
        const data = await res.json();
        toast(data.error || "Errore nel salvataggio", "error");
      }
    } catch {
      toast("Errore di connessione", "error");
    } finally {
      setSavingMeta(false);
    }
  }

  async function handleToggleActive() {
    if (!diet) return;
    setTogglingActive(true);
    try {
      const res = await fetch(apiBase, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !diet.isActive }),
      });
      if (res.ok) {
        toast(diet.isActive ? "Dieta disattivata" : "Dieta attivata", "success");
        loadDiet();
      } else {
        const data = await res.json();
        toast(data.error || "Errore", "error");
      }
    } catch {
      toast("Errore di connessione", "error");
    } finally {
      setTogglingActive(false);
    }
  }

  const dayMeals =
    diet?.meals
      .filter((m) => m.day === selectedDay)
      .sort(
        (a, b) =>
          MEAL_TYPES.indexOf(a.mealType as MealType) -
          MEAL_TYPES.indexOf(b.mealType as MealType)
      ) ?? [];

  if (loading) {
    return <PageLoader />;
  }

  if (notFound || !diet) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl glass">
          <span className="text-4xl">🔍</span>
        </div>
        <h2 className="font-display text-2xl text-foreground mb-2">
          Dieta non trovata
        </h2>
        <p className="text-foreground-muted mb-8 max-w-[280px] leading-relaxed">
          La dieta che stai cercando non esiste o non hai i permessi per
          modificarla.
        </p>
        <Link
          href={`/nutrizionista/${patientId}`}
          className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-light transition-all"
        >
          Torna al paziente
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header with back button */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Link
          href={`/nutrizionista/${patientId}`}
          className="flex h-11 w-11 items-center justify-center rounded-xl glass-subtle hover:bg-white/50 transition-colors shrink-0"
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
            className="text-foreground-muted"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-foreground-muted">Modifica</p>
          <h1 className="font-display text-2xl text-foreground -mt-0.5 truncate">
            {diet.dietName}
          </h1>
        </div>
      </motion.div>

      {/* Editable diet info card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass rounded-2xl p-4"
      >
        {!editingMeta ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                  Dettagli dieta
                </p>
                <p className="font-semibold text-foreground truncate">{diet.dietName}</p>
                <p className="text-sm text-foreground-muted mt-0.5">
                  {diet.startDate} &rarr; {diet.endDate}
                </p>
              </div>
              <button
                onClick={handleStartEditMeta}
                className="flex items-center gap-1.5 rounded-xl bg-primary/12 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Modifica
              </button>
            </div>
            {/* Active toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10">
              <div>
                <p className="text-sm font-semibold text-foreground">Stato dieta</p>
                <p className="text-xs text-foreground-muted">
                  {diet.isActive ? "Questa dieta è attiva per il paziente" : "Dieta non attiva"}
                </p>
              </div>
              <button
                onClick={handleToggleActive}
                disabled={togglingActive}
                className={cn(
                  "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50",
                  diet.isActive ? "bg-primary" : "bg-foreground-muted/20"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                    diet.isActive ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Modifica dettagli
            </p>
            <div>
              <label className="block text-xs font-semibold text-foreground-muted mb-1">
                Nome dieta
              </label>
              <input
                type="text"
                value={metaName}
                onChange={(e) => setMetaName(e.target.value)}
                className="w-full rounded-xl glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
                placeholder="Nome della dieta..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                  Inizio
                </label>
                <input
                  type="date"
                  value={metaStart}
                  onChange={(e) => setMetaStart(e.target.value)}
                  className="w-full rounded-xl glass-input px-3 py-2.5 text-sm text-foreground focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1">
                  Fine
                </label>
                <input
                  type="date"
                  value={metaEnd}
                  onChange={(e) => setMetaEnd(e.target.value)}
                  className="w-full rounded-xl glass-input px-3 py-2.5 text-sm text-foreground focus:outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveMeta}
                disabled={savingMeta || !metaName.trim()}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all",
                  "bg-primary hover:bg-primary-light shadow-md shadow-primary/15",
                  "disabled:bg-white/30 disabled:text-foreground-muted disabled:shadow-none disabled:cursor-not-allowed"
                )}
              >
                {savingMeta ? "Salvataggio..." : "Salva"}
              </button>
              <button
                onClick={() => setEditingMeta(false)}
                disabled={savingMeta}
                className="flex-1 rounded-xl glass-subtle py-2.5 text-sm font-semibold text-foreground-muted hover:bg-white/50 transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <DayTabs selectedDay={selectedDay} onSelectDay={setSelectedDay} />

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="space-y-3"
        >
          <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider px-1">
            Pasti di {selectedDay}
          </h2>

          {dayMeals.length === 0 ? (
            <div className="glass rounded-2xl py-10 text-center">
              <p className="text-foreground-muted">
                Nessun pasto per {selectedDay}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayMeals.map((meal, i) => (
                <EditableMealCard
                  key={meal.id}
                  meal={meal}
                  index={i}
                  onUpdated={loadDiet}
                  onDeleted={loadDiet}
                  mealApiBase="/api/nutritionist/meals"
                />
              ))}
            </div>
          )}

          <AddMealForm
            dietId={diet.id}
            selectedDay={selectedDay}
            onAdded={loadDiet}
            mealsApiEndpoint={`${apiBase}/meals`}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
