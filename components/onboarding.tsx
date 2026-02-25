"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EmptyDiets } from "@/components/illustrations/empty-diets";
import { EmptyDay } from "@/components/illustrations/empty-day";
import { EmptyPlate } from "@/components/illustrations/empty-plate";

const STORAGE_KEY = "feedy-onboarding-done";

const SLIDES = [
  {
    title: "Importa la tua dieta",
    description: "Carica il piano del nutrizionista da CSV e inizia subito a seguirlo.",
    illustration: <EmptyDiets className="text-primary" />,
  },
  {
    title: "Controlla i pasti di oggi",
    description: "Vedi cosa mangiare giorno per giorno, con il pasto corrente in evidenza.",
    illustration: <EmptyDay className="text-primary" />,
  },
  {
    title: "Traccia i macro con AI",
    description: "L'intelligenza artificiale stima carboidrati, grassi e proteine per te.",
    illustration: <EmptyPlate className="text-primary" />,
  },
];

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setShow(true);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (current < SLIDES.length - 1) {
      setDirection(1);
      setCurrent((c) => c + 1);
    }
  }, [current]);

  const handleDone = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShow(false);
  }, []);

  const handleSwipe = useCallback(
    (_: never, info: { offset: { x: number } }) => {
      if (info.offset.x < -50 && current < SLIDES.length - 1) {
        setDirection(1);
        setCurrent((c) => c + 1);
      } else if (info.offset.x > 50 && current > 0) {
        setDirection(-1);
        setCurrent((c) => c - 1);
      }
    },
    [current]
  );

  if (!show) return null;

  const isLast = current === SLIDES.length - 1;
  const slide = SLIDES[current];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md px-8"
    >
      <div className="flex flex-col items-center max-w-sm w-full">
        {/* Slide content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction * 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 80 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleSwipe as never}
            className="flex flex-col items-center text-center cursor-grab active:cursor-grabbing"
          >
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl glass">
              {slide.illustration}
            </div>
            <h2 className="font-display text-2xl text-foreground mb-3">
              {slide.title}
            </h2>
            <p className="text-foreground-muted text-sm leading-relaxed max-w-[280px]">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex gap-2 mt-10">
          {SLIDES.map((_, i) => (
            <motion.div
              key={i}
              className="h-2 rounded-full bg-primary"
              animate={{
                width: i === current ? 24 : 8,
                opacity: i === current ? 1 : 0.25,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Button */}
        <motion.button
          type="button"
          onClick={isLast ? handleDone : handleNext}
          whileTap={{ scale: 0.97 }}
          className="mt-8 rounded-2xl bg-primary px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-light transition-colors"
        >
          {isLast ? "Inizia" : "Avanti"}
        </motion.button>

        {/* Skip */}
        {!isLast && (
          <button
            type="button"
            onClick={handleDone}
            className="mt-3 text-xs text-foreground-muted/50 hover:text-foreground-muted transition-colors"
          >
            Salta
          </button>
        )}
      </div>
    </motion.div>
  );
}
