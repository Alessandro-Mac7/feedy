"use client";

import { motion } from "motion/react";
import { DAYS, type Meal } from "@/types";

const KCAL_PER_G = { carbs: 4, fats: 9, proteins: 4 } as const;
const SHORT_DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

interface WeeklyBarChartProps {
  meals: Meal[];
  goalKcal?: number;
}

export function WeeklyBarChart({ meals, goalKcal }: WeeklyBarChartProps) {
  const dayData = DAYS.map((day) => {
    const dayMeals = meals.filter((m) => m.day === day);
    const carbs = dayMeals.reduce((s, m) => s + (m.carbs ?? 0), 0);
    const fats = dayMeals.reduce((s, m) => s + (m.fats ?? 0), 0);
    const proteins = dayMeals.reduce((s, m) => s + (m.proteins ?? 0), 0);
    const kcal = carbs * KCAL_PER_G.carbs + fats * KCAL_PER_G.fats + proteins * KCAL_PER_G.proteins;
    return { day, carbs, fats, proteins, kcal };
  });

  const maxKcal = Math.max(...dayData.map((d) => d.kcal), goalKcal ?? 0, 1);
  const chartH = 120;
  const barW = 24;
  const gap = 12;
  const chartW = 7 * barW + 6 * gap;

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">Kcal settimanali</h3>
      <svg width="100%" viewBox={`0 0 ${chartW + 8} ${chartH + 24}`} className="overflow-visible">
        {/* Goal line */}
        {goalKcal && goalKcal > 0 && (
          <>
            <line
              x1="0"
              y1={chartH - (goalKcal / maxKcal) * chartH}
              x2={chartW + 8}
              y2={chartH - (goalKcal / maxKcal) * chartH}
              stroke="var(--primary)"
              strokeWidth="1"
              strokeDasharray="4 3"
              opacity="0.4"
            />
            <text
              x={chartW + 6}
              y={chartH - (goalKcal / maxKcal) * chartH - 3}
              fontSize="7"
              fill="var(--primary)"
              textAnchor="end"
              opacity="0.5"
            >
              {goalKcal}
            </text>
          </>
        )}

        {/* Bars */}
        {dayData.map((d, i) => {
          const x = i * (barW + gap) + 4;
          const total = d.kcal;
          const h = (total / maxKcal) * chartH;
          const carbsH = total > 0 ? (d.carbs * KCAL_PER_G.carbs / total) * h : 0;
          const fatsH = total > 0 ? (d.fats * KCAL_PER_G.fats / total) * h : 0;
          const proteinsH = total > 0 ? (d.proteins * KCAL_PER_G.proteins / total) * h : 0;

          return (
            <g key={d.day}>
              {/* Proteins (bottom) */}
              <motion.rect
                x={x}
                width={barW}
                rx="4"
                fill="var(--macro-proteins)"
                initial={{ height: 0, y: chartH }}
                animate={{ height: proteinsH, y: chartH - proteinsH }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
              />
              {/* Fats (middle) */}
              <motion.rect
                x={x}
                width={barW}
                rx="4"
                fill="var(--macro-fats)"
                initial={{ height: 0, y: chartH }}
                animate={{ height: fatsH, y: chartH - proteinsH - fatsH }}
                transition={{ duration: 0.5, delay: i * 0.06 + 0.05, ease: "easeOut" }}
              />
              {/* Carbs (top) */}
              <motion.rect
                x={x}
                width={barW}
                rx="4"
                fill="var(--macro-carbs)"
                initial={{ height: 0, y: chartH }}
                animate={{ height: carbsH, y: chartH - proteinsH - fatsH - carbsH }}
                transition={{ duration: 0.5, delay: i * 0.06 + 0.1, ease: "easeOut" }}
              />
              {/* Empty state placeholder */}
              {total === 0 && (
                <rect
                  x={x}
                  y={chartH - 3}
                  width={barW}
                  height="3"
                  rx="1.5"
                  fill="var(--foreground-muted)"
                  opacity="0.1"
                />
              )}
              {/* Day label */}
              <text
                x={x + barW / 2}
                y={chartH + 14}
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill="var(--foreground-muted)"
                opacity="0.6"
              >
                {SHORT_DAYS[i]}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-3">
        {[
          { label: "Carb", color: "var(--macro-carbs)" },
          { label: "Grassi", color: "var(--macro-fats)" },
          { label: "Prot", color: "var(--macro-proteins)" },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
            <span className="text-[10px] font-medium text-foreground-muted">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
