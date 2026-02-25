"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DayTabs } from "@/components/day-tabs";
import { MealCard } from "@/components/meal-card";
import { DailySummaryCard } from "@/components/daily-summary-card";
import { MacroDonutCard } from "@/components/macro-donut-card";
import { WaterTrackerCard } from "@/components/water-tracker-card";
import { SkeletonMealCard } from "@/components/skeleton-meal-card";
import { getTodayDay, getCurrentMealType } from "@/lib/utils";
import { MEAL_TYPES, type Day, type Meal, type Diet, type MealType } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/toast";
import { OverlayLoader } from "@/components/page-loader";
import { AiConsentDialog } from "@/components/ai-consent-dialog";
import { EmptyPlate } from "@/components/illustrations/empty-plate";
import { EmptyDay } from "@/components/illustrations/empty-day";
import { Confetti } from "@/components/confetti";
import { WeeklyStatsCard } from "@/components/weekly-stats-card";
import { WeeklyBarChart } from "@/components/weekly-bar-chart";
import { ShoppingList } from "@/components/shopping-list";

interface DietWithMeals extends Diet {
  meals: Meal[];
}

export default function OggiPage() {
  const [selectedDay, setSelectedDay] = useState<Day>(getTodayDay());
  const [diet, setDiet] = useState<DietWithMeals | null>(null);
  const [loading, setLoading] = useState(true);
  const [estimating, setEstimating] = useState<string | null>(null);
  const [pendingMealId, setPendingMealId] = useState<string | null>(null);
  const [goals, setGoals] = useState<{ dailyKcal?: number; dailyCarbs?: number; dailyFats?: number; dailyProteins?: number; dailyWater?: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [showShoppingList, setShowShoppingList] = useState(false);
  const { toast } = useToast();

  const loadActiveDiet = useCallback(async () => {
    try {
      const res = await fetch("/api/diets");
      if (!res.ok) return;

      const diets: Diet[] = await res.json();
      const active = diets.find((d) => d.isActive);
      if (!active) {
        setDiet(null);
        return;
      }

      const detailRes = await fetch(`/api/diets/${active.id}`);
      if (detailRes.ok) {
        setDiet(await detailRes.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActiveDiet();
    fetch("/api/goals")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setGoals(data); })
      .catch(() => {});
  }, [loadActiveDiet]);

  function handleEstimateMacros(mealId: string) {
    if (localStorage.getItem("ai-consent-accepted")) {
      doEstimate(mealId);
    } else {
      setPendingMealId(mealId);
    }
  }

  function handleAiConsentAccept() {
    localStorage.setItem("ai-consent-accepted", "true");
    const mealId = pendingMealId;
    setPendingMealId(null);
    if (mealId) doEstimate(mealId);
  }

  function handleAiConsentCancel() {
    setPendingMealId(null);
    toast("Stima annullata", "info");
  }

  async function handleToggleComplete(mealId: string) {
    if (!diet) return;
    const updatedMeals = diet.meals.map((m) =>
      m.id === mealId ? { ...m, isCompleted: !m.isCompleted } : m
    );
    // Optimistic update
    setDiet({ ...diet, meals: updatedMeals });
    // Check if all day meals are now completed
    const updatedDayMeals = updatedMeals.filter((m) => m.day === selectedDay);
    if (updatedDayMeals.length > 0 && updatedDayMeals.every((m) => m.isCompleted)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
    }
    try {
      const res = await fetch(`/api/meals/${mealId}/complete`, { method: "POST" });
      if (!res.ok) {
        setDiet({ ...diet, meals: diet.meals });
        toast("Errore nell'aggiornamento", "error");
      }
    } catch {
      setDiet({ ...diet, meals: diet.meals });
      toast("Errore di connessione", "error");
    }
  }

  function handleWaterGoalReached() {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 100);
  }

  async function doEstimate(mealId: string) {
    setEstimating(mealId);
    try {
      const res = await fetch("/api/estimate-macros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId }),
      });
      if (res.ok) {
        toast("Macro stimati con AI", "success");
        loadActiveDiet();
      } else {
        toast("Errore nella stima dei macro", "error");
      }
    } catch {
      toast("Errore di connessione", "error");
    } finally {
      setEstimating(null);
    }
  }

  const today = getTodayDay();
  const currentMealType = getCurrentMealType();
  const isToday = selectedDay === today;

  const dayMeals = diet?.meals
    .filter((m) => m.day === selectedDay)
    .sort((a, b) => {
      if (isToday) {
        const aIsCurrent = a.mealType === currentMealType;
        const bIsCurrent = b.mealType === currentMealType;
        if (aIsCurrent !== bIsCurrent) return aIsCurrent ? -1 : 1;
      }
      return (
        MEAL_TYPES.indexOf(a.mealType as MealType) -
        MEAL_TYPES.indexOf(b.mealType as MealType)
      );
    }) ?? [];
  const isDietCompleted = diet
    ? new Date() > new Date(diet.endDate + "T23:59:59")
    : false;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-10 w-48 rounded-xl skeleton-shimmer" />
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-12 w-14 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
        <div className="h-36 rounded-3xl skeleton-shimmer" />
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonMealCard key={i} />
        ))}
      </div>
    );
  }

  if (!diet) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl glass text-foreground-muted">
          <EmptyPlate />
        </div>
        <h2 className="font-display text-2xl text-foreground mb-2">
          Nessuna dieta attiva
        </h2>
        <p className="text-foreground-muted mb-8 max-w-[280px] leading-relaxed">
          Carica un piano pasti e attivalo per vedere i tuoi pasti di oggi.
        </p>
        <Link
          href="/diete"
          className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-light transition-all hover:shadow-lg hover:shadow-primary/25"
        >
          Vai alle Diete
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <Confetti trigger={showConfetti} />
      <ShoppingList meals={diet.meals} open={showShoppingList} onClose={() => setShowShoppingList(false)} />
      <AiConsentDialog
        open={pendingMealId !== null}
        onAccept={handleAiConsentAccept}
        onCancel={handleAiConsentCancel}
      />
      <AnimatePresence>
        {estimating && <OverlayLoader message="Stima macro con AI..." />}
      </AnimatePresence>
      {/* Header with logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center pt-2 pb-3"
      >
        <Image
          src="/logo.png"
          alt="Feedy"
          width={140}
          height={35}
        />
        {isDietCompleted && (
          <span className="absolute right-5 flex items-center gap-1.5 rounded-xl glass-subtle px-3 py-1.5 text-xs font-semibold text-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Completata
          </span>
        )}
      </motion.div>

      {/* View mode toggle */}
      <div className="flex gap-1 p-1 rounded-xl glass-subtle self-center mx-auto w-fit">
        {(["day", "week"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setViewMode(mode)}
            className={`relative rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
              viewMode === mode ? "text-primary" : "text-foreground-muted"
            }`}
          >
            {viewMode === mode && (
              <motion.div
                layoutId="view-pill"
                className="absolute inset-0 rounded-lg glass"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{mode === "day" ? "Giorno" : "Settimana"}</span>
          </button>
        ))}
      </div>

      {viewMode === "day" ? (
        <>
          {/* Day selector */}
          <DayTabs selectedDay={selectedDay} onSelectDay={setSelectedDay} />

          {/* Day content — crossfades on day switch */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="space-y-5"
            >
              <DailySummaryCard
                meals={dayMeals}
                dayLabel={selectedDay}
                dietName={diet.dietName}
              />

              <div className="grid grid-cols-2 gap-3">
                <MacroDonutCard meals={dayMeals} goals={goals ?? undefined} />
                <WaterTrackerCard dayLabel={selectedDay} goalGlasses={goals?.dailyWater} onGoalReached={handleWaterGoalReached} />
              </div>

              {dayMeals.length === 0 ? (
                <div className="glass rounded-2xl py-12 flex flex-col items-center text-center">
                  <EmptyDay className="text-foreground-muted mb-3" />
                  <p className="text-foreground-muted">Nessun pasto per {selectedDay}</p>
                </div>
              ) : (
                <>
                  <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3 px-1">
                    Pasti del giorno
                  </h2>
                  <div className="space-y-3">
                    {dayMeals.map((meal, i) => (
                      <MealCard
                        key={meal.id}
                        meal={meal}
                        index={i}
                        isHighlighted={isToday && meal.mealType === currentMealType}
                        onEstimateMacros={
                          estimating === meal.id ? undefined : handleEstimateMacros
                        }
                        onToggleComplete={handleToggleComplete}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Shopping list button */}
              <motion.button
                type="button"
                onClick={() => setShowShoppingList(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="mt-2 w-full rounded-2xl glass-subtle px-4 py-3 text-sm font-semibold text-foreground-muted hover:text-foreground transition-colors flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Lista spesa
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </>
      ) : (
        <motion.div
          key="week"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <WeeklyStatsCard meals={diet.meals} />
          <WeeklyBarChart meals={diet.meals} goalKcal={goals?.dailyKcal} />
        </motion.div>
      )}
    </div>
  );
}
