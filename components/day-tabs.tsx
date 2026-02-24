"use client";

import { useRef, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DAYS, type Day } from "@/types";
import { getDayShort, getTodayDay } from "@/lib/utils";

interface DayTabsProps {
  selectedDay: Day;
  onSelectDay: (day: Day) => void;
}

export function DayTabs({ selectedDay, onSelectDay }: DayTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = getTodayDay();

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const activeTab = container.querySelector("[data-active=true]");
    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedDay]);

  return (
    <div
      ref={scrollRef}
      role="tablist"
      className="flex gap-1.5 pb-1 justify-center"
    >
      {DAYS.map((day) => {
        const isSelected = day === selectedDay;
        const isToday = day === today;

        return (
          <button
            key={day}
            role="tab"
            aria-selected={isSelected}
            data-active={isSelected}
            onClick={() => onSelectDay(day)}
            className={cn(
              "relative flex flex-1 flex-col items-center rounded-2xl py-2.5 text-xs font-semibold transition-all min-h-[48px]",
              isSelected
                ? "text-white"
                : isToday
                  ? "text-primary glass-subtle"
                  : "text-foreground-muted glass-subtle hover:bg-white/50"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="day-tab-bg"
                className="absolute inset-0 rounded-2xl bg-primary shadow-md shadow-primary/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
              />
            )}
            <span className="relative z-10 text-[10px] uppercase tracking-widest">
              {getDayShort(day)}
            </span>
            {isToday && (
              <motion.span
                layoutId="today-dot"
                className={cn(
                  "relative z-10 mt-1 h-1 w-1 rounded-full",
                  isSelected ? "bg-white" : "bg-primary"
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
