"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

const GLASSES = 8;
const ML_PER_GLASS = 250;
const TARGET_ML = GLASSES * ML_PER_GLASS;

function getStorageKey(day: string): string {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  const weekKey = weekStart.toISOString().slice(0, 10);
  return `water-${weekKey}-${day}`;
}

interface WaterTrackerCardProps {
  dayLabel: string;
  goalGlasses?: number;
  onGoalReached?: () => void;
}

export function WaterTrackerCard({ dayLabel, goalGlasses, onGoalReached }: WaterTrackerCardProps) {
  const totalGlasses = goalGlasses ?? GLASSES;
  const [filled, setFilled] = useState(0);
  const [animDir, setAnimDir] = useState<"up" | "down" | null>(null);
  const storageKey = getStorageKey(dayLabel);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      const val = parseInt(saved, 10);
      if (!isNaN(val) && val >= 0 && val <= totalGlasses) {
        setFilled(val);
      }
    } else {
      setFilled(0);
    }
  }, [storageKey]);

  const handleAdd = useCallback(() => {
    if (filled >= totalGlasses) return;
    setAnimDir("up");
    const next = filled + 1;
    setFilled(next);
    localStorage.setItem(storageKey, String(next));
    if (next >= totalGlasses) onGoalReached?.();
    setTimeout(() => setAnimDir(null), 600);
  }, [filled, storageKey, totalGlasses, onGoalReached]);

  const handleRemove = useCallback(() => {
    if (filled <= 0) return;
    setAnimDir("down");
    const next = filled - 1;
    setFilled(next);
    localStorage.setItem(storageKey, String(next));
    setTimeout(() => setAnimDir(null), 600);
  }, [filled, storageKey, totalGlasses]);

  const targetMl = totalGlasses * ML_PER_GLASS;
  const ml = filled * ML_PER_GLASS;
  const pct = (ml / targetMl) * 100;
  const isComplete = filled >= totalGlasses;

  const mlText =
    ml >= 1000
      ? `${(ml / 1000).toFixed(ml % 1000 === 0 ? 0 : 1)}L`
      : `${ml}ml`;

  // Glass geometry
  const gW = 64;
  const gH = 88;
  const topY = 4;
  const botY = 82;
  const tL = 4;
  const tR = gW - 4;
  const bL = 12;
  const bR = gW - 12;
  const innerH = botY - topY;
  const fillH = (pct / 100) * innerH;
  const fillY = botY - fillH;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass rounded-2xl p-4 flex flex-col items-center gap-2.5"
    >
      {/* Title */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm">💧</span>
        <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
          Drink Tracker
        </span>
      </div>

      {/* Glass + buttons */}
      <div className="flex items-center gap-2.5">
        {/* Minus */}
        <motion.button
          type="button"
          onClick={handleRemove}
          disabled={filled <= 0}
          whileTap={{ scale: 0.85 }}
          className="flex h-9 w-9 items-center justify-center rounded-full glass-subtle text-foreground-muted disabled:opacity-20 transition-opacity"
          aria-label="Rimuovi bicchiere"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.button>

        {/* Glass SVG */}
        <div className="relative">
          <svg width={gW} height={gH} viewBox={`0 0 ${gW} ${gH}`}>
            <defs>
              <clipPath id="wglass-clip">
                <polygon points={`${tL},${topY} ${tR},${topY} ${bR},${botY} ${bL},${botY}`} />
              </clipPath>
              <linearGradient id="wglass-grad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#3B8DD4" />
                <stop offset="100%" stopColor="#7BC4E8" />
              </linearGradient>
            </defs>

            {/* Glass outline */}
            <polygon
              points={`${tL},${topY} ${tR},${topY} ${bR},${botY} ${bL},${botY}`}
              fill="rgba(74,155,217,0.04)"
              stroke="rgba(74,155,217,0.2)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Graduation marks */}
            {[2, 4, 6].map((level) => {
              const markY = botY - (level / totalGlasses) * innerH;
              const xInsetL = tL + ((bL - tL) * (botY - markY)) / innerH;
              const xInsetR = tR - ((tR - bR) * (botY - markY)) / innerH;
              return (
                <line
                  key={level}
                  x1={xInsetL + 4}
                  y1={markY}
                  x2={xInsetR - 4}
                  y2={markY}
                  stroke="rgba(74,155,217,0.08)"
                  strokeWidth="0.75"
                />
              );
            })}

            {/* Water fill */}
            <g clipPath="url(#wglass-clip)">
              <motion.rect
                x="0"
                width={gW}
                animate={{ height: fillH, y: fillY }}
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                fill="url(#wglass-grad)"
                opacity={0.8}
              />

              {/* Wave at surface */}
              {pct > 0 && pct < 100 && (
                <motion.path
                  animate={{ y: fillY - 2.5 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  d={`M0,3 Q${gW * 0.25},0 ${gW * 0.5},3 Q${gW * 0.75},6 ${gW},3 L${gW},8 L0,8 Z`}
                  fill="url(#wglass-grad)"
                  opacity={0.85}
                >
                  <animate
                    attributeName="d"
                    dur="2.5s"
                    repeatCount="indefinite"
                    values={`
                      M0,3 Q${gW * 0.25},0 ${gW * 0.5},3 Q${gW * 0.75},6 ${gW},3 L${gW},8 L0,8 Z;
                      M0,3 Q${gW * 0.25},6 ${gW * 0.5},3 Q${gW * 0.75},0 ${gW},3 L${gW},8 L0,8 Z;
                      M0,3 Q${gW * 0.25},0 ${gW * 0.5},3 Q${gW * 0.75},6 ${gW},3 L${gW},8 L0,8 Z
                    `}
                  />
                </motion.path>
              )}

              {/* Shine on glass */}
              <rect
                x={tL + 3}
                y={topY}
                width="4"
                height={innerH}
                rx="2"
                fill="rgba(255,255,255,0.1)"
              />

              {/* Bubbles rising */}
              {pct > 0 && pct < 100 && (
                <>
                  {[0, 1, 2].map((b) => (
                    <motion.circle
                      key={b}
                      cx={gW * 0.28 + b * 11}
                      r={1.2 + b * 0.3}
                      fill="rgba(255,255,255,0.3)"
                      animate={{
                        cy: [botY - 5, fillY + 8],
                        opacity: [0, 0.5, 0],
                      }}
                      transition={{
                        duration: 2.5,
                        delay: b * 0.8,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </>
              )}
            </g>

            {/* Check when complete */}
            {isComplete && (
              <motion.g
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
              >
                <circle cx={gW / 2} cy={gH / 2} r="14" fill="rgba(45,159,143,0.9)" />
                <polyline
                  points={`${gW / 2 - 6},${gH / 2} ${gW / 2 - 1},${gH / 2 + 5} ${gW / 2 + 6},${gH / 2 - 4}`}
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.g>
            )}
          </svg>

          {/* Splash effect on add */}
          <AnimatePresence>
            {animDir === "up" && (
              <>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={`splash-${i}`}
                    className="absolute rounded-full bg-[#4A9BD9]"
                    style={{
                      width: 4 + Math.random() * 3,
                      height: 4 + Math.random() * 3,
                      left: 10 + Math.random() * (gW - 20),
                      top: "40%",
                    }}
                    initial={{ y: 0, opacity: 0.7, scale: 1 }}
                    animate={{
                      y: -(15 + Math.random() * 25),
                      x: (Math.random() - 0.5) * 20,
                      opacity: 0,
                      scale: 0.3,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Plus */}
        <motion.button
          type="button"
          onClick={handleAdd}
          disabled={filled >= totalGlasses}
          whileTap={{ scale: 0.85 }}
          className="flex h-9 w-9 items-center justify-center rounded-full glass-subtle text-foreground-muted disabled:opacity-20 transition-opacity"
          aria-label="Aggiungi bicchiere"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.button>
      </div>

      {/* Counter */}
      <div className="flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={filled}
            initial={{
              opacity: 0,
              y: animDir === "up" ? 8 : animDir === "down" ? -8 : 0,
            }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: animDir === "up" ? -8 : animDir === "down" ? 8 : 0,
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="text-base font-bold tabular-nums leading-none"
            style={{ color: isComplete ? "#2D9F8F" : "#4A9BD9" }}
          >
            {filled}/{totalGlasses}
          </motion.span>
        </AnimatePresence>
        <span className="text-[10px] text-foreground-muted/60 mt-1">
          bicchieri · {mlText}
        </span>
      </div>
    </motion.div>
  );
}
