"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DAYS, MEAL_TYPES, MEAL_EMOJI } from "@/types";
import type { Day, MealType, ParsedMeal } from "@/types";
import { useToast } from "@/components/toast";

const STEP_LABELS = ["Info", "Pasti", "Riepilogo"];

interface LocalMeal {
  id: string;
  day: Day;
  mealType: MealType;
  foods: string;
  notes: string;
}

export default function NuovaDietaPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Wizard step
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Step 1: Info
  const [dietName, setDietName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Step 2: Meals
  const [selectedDay, setSelectedDay] = useState<Day>(DAYS[0]);
  const [mealType, setMealType] = useState<MealType>(MEAL_TYPES[0]);
  const [foods, setFoods] = useState("");
  const [notes, setNotes] = useState("");
  const [meals, setMeals] = useState<LocalMeal[]>([]);

  // Step 3: Submit
  const [submitting, setSubmitting] = useState(false);

  function goNext() {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  function validateStep1(): boolean {
    if (!dietName.trim()) {
      toast("Inserisci un nome per la dieta", "error");
      return false;
    }
    if (!startDate || !endDate) {
      toast("Inserisci le date di inizio e fine", "error");
      return false;
    }
    if (startDate > endDate) {
      toast("La data di inizio deve precedere la data di fine", "error");
      return false;
    }
    return true;
  }

  function validateStep2(): boolean {
    if (meals.length === 0) {
      toast("Aggiungi almeno un pasto prima di continuare", "error");
      return false;
    }
    return true;
  }

  function handleAddMeal() {
    if (!foods.trim()) {
      toast("Inserisci almeno un alimento", "error");
      return;
    }

    const newMeal: LocalMeal = {
      id: crypto.randomUUID(),
      day: selectedDay,
      mealType,
      foods: foods.trim(),
      notes: notes.trim(),
    };

    setMeals((prev) => [...prev, newMeal]);
    setFoods("");
    setNotes("");
    toast(`${MEAL_EMOJI[mealType]} Pasto aggiunto per ${selectedDay}`, "success");
  }

  function handleRemoveMeal(id: string) {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const parsedMeals: ParsedMeal[] = meals.map((m) => ({
        day: m.day,
        mealType: m.mealType,
        foods: m.foods,
        carbs: null,
        fats: null,
        proteins: null,
        notes: m.notes || null,
      }));

      const res = await fetch("/api/diets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dietName.trim(),
          startDate,
          endDate,
          parsedMeals,
        }),
      });

      if (!res.ok) {
        let errorMsg = "Errore nella creazione della dieta";
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      toast("Dieta creata con successo!", "success");
      router.push("/diete");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Errore sconosciuto";
      toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  const mealsForDay = meals.filter((m) => m.day === selectedDay);

  // Count meals per day for review
  const mealsPerDay = DAYS.reduce(
    (acc, day) => {
      const count = meals.filter((m) => m.day === day).length;
      if (count > 0) acc[day] = count;
      return acc;
    },
    {} as Record<string, number>
  );

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/diete"
          className="flex h-9 w-9 items-center justify-center rounded-xl glass hover:bg-white/20 transition-colors"
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
            className="text-foreground"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl text-foreground"
        >
          Nuova dieta
        </motion.h1>
      </div>

      {/* Step indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-2"
      >
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shrink-0",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : isCompleted
                      ? "bg-primary/15 text-primary"
                      : "glass-subtle text-foreground-muted"
                )}
              >
                {isCompleted ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold transition-colors",
                  isActive ? "text-foreground" : "text-foreground-muted"
                )}
              >
                {label}
              </span>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 transition-colors",
                    isCompleted ? "bg-primary/30" : "bg-white/20"
                  )}
                />
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Step content */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="glass rounded-2xl p-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                  Nome della dieta
                </label>
                <input
                  type="text"
                  value={dietName}
                  onChange={(e) => setDietName(e.target.value)}
                  placeholder="Es. Dieta Mediterranea Settimana 1"
                  className="w-full rounded-xl glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                    Data inizio
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl glass-input px-3 py-2.5 text-sm text-foreground focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                    Data fine
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl glass-input px-3 py-2.5 text-sm text-foreground focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                onClick={() => validateStep1() && goNext()}
                className={cn(
                  "w-full rounded-xl py-3 text-sm font-semibold text-white transition-all",
                  "bg-primary hover:bg-primary-light shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20"
                )}
              >
                Avanti
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              {/* Day selector tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {DAYS.map((day) => {
                  const count = meals.filter((m) => m.day === day).length;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        "relative shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
                        selectedDay === day
                          ? "bg-primary text-white shadow-md shadow-primary/25"
                          : "glass text-foreground-muted hover:text-foreground"
                      )}
                    >
                      {day.slice(0, 3)}
                      {count > 0 && (
                        <span
                          className={cn(
                            "absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                            selectedDay === day
                              ? "bg-white text-primary"
                              : "bg-primary/15 text-primary"
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Add meal form */}
              <div className="glass rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Aggiungi pasto - {selectedDay}
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                    Tipo di pasto
                  </label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as MealType)}
                    className="w-full rounded-xl glass-input px-4 py-2.5 text-sm text-foreground focus:outline-none transition-all"
                  >
                    {MEAL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {MEAL_EMOJI[type]} {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                    Alimenti
                  </label>
                  <textarea
                    value={foods}
                    onChange={(e) => setFoods(e.target.value)}
                    placeholder="Es. Yogurt greco 150g, muesli 40g, frutta fresca"
                    rows={3}
                    className="w-full rounded-xl glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                    Note (opzionale)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Es. Senza lattosio, preferibilmente biologico"
                    className="w-full rounded-xl glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
                  />
                </div>

                <button
                  onClick={handleAddMeal}
                  className={cn(
                    "w-full rounded-xl py-2.5 text-sm font-semibold transition-all",
                    "bg-primary/12 text-primary hover:bg-primary/20"
                  )}
                >
                  + Aggiungi pasto
                </button>
              </div>

              {/* Meals list for selected day */}
              {mealsForDay.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    Pasti per {selectedDay} ({mealsForDay.length})
                  </p>
                  <AnimatePresence mode="popLayout">
                    {mealsForDay.map((meal) => (
                      <motion.div
                        key={meal.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-subtle rounded-xl p-3 flex items-start justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">
                              {MEAL_EMOJI[meal.mealType]}
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              {meal.mealType}
                            </span>
                          </div>
                          <p className="text-xs text-foreground-muted mt-0.5 line-clamp-2">
                            {meal.foods}
                          </p>
                          {meal.notes && (
                            <p className="text-[10px] text-foreground-muted/60 mt-0.5 italic">
                              {meal.notes}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveMeal(meal.id)}
                          className="shrink-0 rounded-lg bg-danger/8 p-1.5 text-danger hover:bg-danger/15 transition-colors"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Total meals count */}
              {meals.length > 0 && (
                <div className="glass-subtle rounded-xl p-3 text-center">
                  <p className="text-xs text-foreground-muted">
                    Totale pasti inseriti:{" "}
                    <span className="font-bold text-foreground">
                      {meals.length}
                    </span>
                  </p>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-3">
                <button
                  onClick={goBack}
                  className="flex-1 rounded-xl glass py-3 text-sm font-semibold text-foreground-muted hover:text-foreground transition-colors"
                >
                  Indietro
                </button>
                <button
                  onClick={() => validateStep2() && goNext()}
                  className={cn(
                    "flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-all",
                    "bg-primary hover:bg-primary-light shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20"
                  )}
                >
                  Avanti
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              {/* Diet info summary */}
              <div className="glass rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider">
                  Riepilogo dieta
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground-muted">Nome</span>
                    <span className="text-sm font-semibold text-foreground">
                      {dietName}
                    </span>
                  </div>
                  <div className="h-px bg-white/15" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground-muted">
                      Periodo
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {startDate} &rarr; {endDate}
                    </span>
                  </div>
                  <div className="h-px bg-white/15" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground-muted">
                      Pasti totali
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {meals.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Meals per day breakdown */}
              <div className="glass rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider">
                  Pasti per giorno
                </h3>

                <div className="space-y-2">
                  {DAYS.map((day) => {
                    const dayMeals = meals.filter((m) => m.day === day);
                    if (dayMeals.length === 0) return null;
                    return (
                      <div key={day} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">
                            {day}
                          </span>
                          <span className="text-xs text-foreground-muted">
                            {dayMeals.length}{" "}
                            {dayMeals.length === 1 ? "pasto" : "pasti"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {dayMeals.map((meal) => (
                            <span
                              key={meal.id}
                              className="inline-flex items-center gap-1 rounded-lg bg-primary/8 px-2 py-0.5 text-[10px] font-medium text-foreground-muted"
                            >
                              {MEAL_EMOJI[meal.mealType]} {meal.mealType}
                            </span>
                          ))}
                        </div>
                        {day !==
                          DAYS.filter((d) => mealsPerDay[d]).slice(-1)[0] && (
                          <div className="h-px bg-white/10 mt-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info about AI estimation */}
              <div className="glass-subtle rounded-xl p-3.5 flex items-start gap-2.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  I macronutrienti verranno stimati automaticamente dall&apos;AI
                  dopo la creazione della dieta.
                </p>
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-3">
                <button
                  onClick={goBack}
                  className="flex-1 rounded-xl glass py-3 text-sm font-semibold text-foreground-muted hover:text-foreground transition-colors"
                >
                  Indietro
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={cn(
                    "flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-all",
                    "bg-primary hover:bg-primary-light shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20",
                    "disabled:bg-white/30 disabled:text-foreground-muted disabled:shadow-none disabled:cursor-not-allowed disabled:backdrop-blur-sm"
                  )}
                >
                  {submitting ? "Creazione..." : "Crea dieta"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
