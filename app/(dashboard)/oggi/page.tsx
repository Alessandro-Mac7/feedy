"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DayTabs } from "@/components/day-tabs";
import { MealCard } from "@/components/meal-card";
import { DailySummaryCard } from "@/components/daily-summary-card";
import { MacroDonutCard } from "@/components/macro-donut-card";
import { WaterTrackerCard } from "@/components/water-tracker-card";
import { SkeletonMealCard } from "@/components/skeleton-meal-card";
import { cn, getTodayDay, getCurrentMealType } from "@/lib/utils";
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
import { ScrollToTop } from "@/components/scroll-to-top";

interface DietWithMeals extends Diet {
  meals: Meal[];
}

interface FamilyOwner {
  ownerUserId: string;
  ownerName: string | null;
  ownerEmail: string | null;
}

export default function OggiPage() {
  const [selectedDay, setSelectedDay] = useState<Day>(getTodayDay());
  const [diet, setDiet] = useState<DietWithMeals | null>(null);
  const [loading, setLoading] = useState(true);
  const [estimating, setEstimating] = useState<string | null>(null);
  const [pendingMealId, setPendingMealId] = useState<string | null>(null);
  const [goals, setGoals] = useState<{ dailyKcal?: number; dailyCarbs?: number; dailyFats?: number; dailyProteins?: number; dailyWater?: number } | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [familyOwners, setFamilyOwners] = useState<FamilyOwner[]>([]);
  const [viewingOwnerId, setViewingOwnerId] = useState<string | null>(null);
  const { toast } = useToast();

  const readOnly = viewingOwnerId !== null;
  const viewingOwner = familyOwners.find((o) => o.ownerUserId === viewingOwnerId);

  const loadDiet = useCallback(async (ownerId: string | null) => {
    try {
      if (ownerId) {
        const res = await fetch(`/api/family/${ownerId}/diet`);
        if (!res.ok) {
          setDiet(null);
          return;
        }
        const data: { diet: Diet | null; meals: Meal[] } = await res.json();
        setDiet(data.diet ? { ...data.diet, meals: data.meals } : null);
        return;
      }

      const res = await fetch("/api/diets?active=true");
      if (!res.ok) return;

      const data: { diet: Diet | null; meals: Meal[] } = await res.json();
      setDiet(data.diet ? { ...data.diet, meals: data.meals } : null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadDiet(viewingOwnerId);
  }, [viewingOwnerId, loadDiet]);

  useEffect(() => {
    fetch("/api/goals")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setGoals(data); })
      .catch(() => {});
    fetch("/api/family/shared-with-me")
      .then((r) => r.ok ? r.json() : [])
      .then((data: (FamilyOwner & { confirmed: boolean })[]) =>
        setFamilyOwners(data.filter((d) => d.confirmed))
      )
      .catch(() => {});
  }, []);

  function handleSwitchOwner(ownerId: string | null) {
    if (ownerId === viewingOwnerId) return;
    setViewingOwnerId(ownerId);
    setShowShoppingList(false);
    setPendingMealId(null);
    setEstimating(null);
  }

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
      setConfettiTrigger((n) => n + 1);
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
    setConfettiTrigger((n) => n + 1);
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
        loadDiet(viewingOwnerId);
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

  const familySwitcher = familyOwners.length > 0 && (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide justify-center px-1">
      {[{ id: null, label: "Io" }, ...familyOwners.map((o) => ({
        id: o.ownerUserId,
        label: (o.ownerName || o.ownerEmail || "?").split(" ")[0],
      }))].map((opt) => {
        const isActive = viewingOwnerId === opt.id;
        return (
          <button
            key={opt.id ?? "me"}
            type="button"
            onClick={() => handleSwitchOwner(opt.id)}
            className={cn(
              "relative shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-colors min-h-[36px]",
              isActive ? "text-white" : "text-foreground-muted glass-subtle hover:bg-white/50"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="family-switcher-pill"
                className="absolute inset-0 rounded-xl bg-primary shadow-md shadow-primary/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );

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
      <div className="space-y-5">
        {familySwitcher}
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
            {readOnly
              ? `${viewingOwner?.ownerName || viewingOwner?.ownerEmail || "Questa persona"} non ha ancora una dieta attiva.`
              : "Carica un piano pasti e attivalo per vedere i tuoi pasti di oggi."}
          </p>
          {!readOnly && (
            <Link
              href="/diete"
              className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-light transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Vai alle Diete
            </Link>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Confetti trigger={confettiTrigger} />
      <ShoppingList open={showShoppingList} onClose={() => setShowShoppingList(false)} />
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
        className="flex items-center justify-center pt-2 md:pt-4 pb-2"
      >
        <Image
          src="/logo.png"
          alt="Feedy"
          width={140}
          height={35}
        />
      </motion.div>

      {isDietCompleted && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center pb-1"
        >
          <span className="flex items-center gap-1.5 rounded-xl glass-subtle px-3 py-1.5 text-xs font-semibold text-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Dieta completata
          </span>
        </motion.div>
      )}

      {familySwitcher}

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

              <div className={cn("grid gap-3", readOnly ? "grid-cols-1" : "grid-cols-2")}>
                <MacroDonutCard meals={dayMeals} goals={goals ?? undefined} />
                {!readOnly && (
                  <WaterTrackerCard dayLabel={selectedDay} goalGlasses={goals?.dailyWater} onGoalReached={handleWaterGoalReached} />
                )}
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
                        readOnly={readOnly}
                        onEstimateMacros={
                          readOnly || estimating === meal.id ? undefined : handleEstimateMacros
                        }
                        onToggleComplete={readOnly ? undefined : handleToggleComplete}
                      />
                    ))}
                  </div>
                </>
              )}

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

          {/* Shopping list button — generates a list from your own diet only */}
          {!readOnly && (
          <motion.button
            type="button"
            onClick={() => setShowShoppingList(true)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="w-full rounded-2xl glass-strong px-4 py-4 text-sm font-semibold text-foreground hover:text-primary transition-colors flex items-center justify-center gap-2.5 shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Genera lista della spesa
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              AI
            </span>
          </motion.button>
          )}
        </motion.div>
      )}

      <ScrollToTop />
    </div>
  );
}
