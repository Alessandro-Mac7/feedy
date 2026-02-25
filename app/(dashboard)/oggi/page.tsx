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

interface DietWithMeals extends Diet {
  meals: Meal[];
}

export default function OggiPage() {
  const [selectedDay, setSelectedDay] = useState<Day>(getTodayDay());
  const [diet, setDiet] = useState<DietWithMeals | null>(null);
  const [loading, setLoading] = useState(true);
  const [estimating, setEstimating] = useState<string | null>(null);
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
  }, [loadActiveDiet]);

  async function handleEstimateMacros(mealId: string) {
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
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl glass">
          <span className="text-4xl">🍽️</span>
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
      <AnimatePresence>
        {estimating && <OverlayLoader message="Stima macro con AI..." />}
      </AnimatePresence>
      {/* Header with logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center py-3"
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
            <MacroDonutCard meals={dayMeals} />
            <WaterTrackerCard dayLabel={selectedDay} />
          </div>

          {dayMeals.length === 0 ? (
            <div className="glass rounded-2xl py-12 text-center">
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
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
