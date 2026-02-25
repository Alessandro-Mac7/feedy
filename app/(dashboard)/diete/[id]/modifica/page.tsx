"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { DayTabs } from "@/components/day-tabs";
import { EditableMealCard } from "@/components/editable-meal-card";
import { AddMealForm } from "@/components/add-meal-form";
import { getTodayDay } from "@/lib/utils";
import { PageLoader } from "@/components/page-loader";
import { MEAL_TYPES, type Day, type Meal, type Diet, type MealType } from "@/types";

interface DietWithMeals extends Diet {
  meals: Meal[];
}

export default function ModificaDietaPage() {
  const { id } = useParams<{ id: string }>();
  const [diet, setDiet] = useState<DietWithMeals | null>(null);
  const [selectedDay, setSelectedDay] = useState<Day>(getTodayDay());
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadDiet = useCallback(async () => {
    try {
      const res = await fetch(`/api/diets/${id}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      setDiet(await res.json());
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDiet();
  }, [loadDiet]);

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
          href="/diete"
          className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-light transition-all"
        >
          Torna alle Diete
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Link
          href="/diete"
          className="flex h-11 w-11 items-center justify-center rounded-xl glass-subtle hover:bg-white/50 transition-colors"
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
        <div>
          <p className="text-xs text-foreground-muted">Modifica</p>
          <h1 className="font-display text-2xl text-foreground -mt-0.5">
            {diet.dietName}
          </h1>
        </div>
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
                />
              ))}
            </div>
          )}

          <AddMealForm
            dietId={diet.id}
            selectedDay={selectedDay}
            onAdded={loadDiet}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
