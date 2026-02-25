"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { categorizeFood } from "@/lib/food-categories";
import { useToast } from "@/components/toast";
import type { Meal } from "@/types";

const STORAGE_KEY = "feedy-shopping-checked";

const CATEGORY_EMOJI: Record<string, string> = {
  Frutta: "\uD83C\uDF4E",
  Verdura: "\uD83E\uDD66",
  Proteine: "\uD83E\uDD69",
  Cereali: "\uD83C\uDF5E",
  Condimenti: "\uD83E\uDED2",
  Altro: "\uD83D\uDCE6",
};

const CATEGORY_ORDER = ["Frutta", "Verdura", "Proteine", "Cereali", "Condimenti", "Altro"];

interface ShoppingListProps {
  meals: Meal[];
  open: boolean;
  onClose: () => void;
}

interface FoodItem {
  id: string;
  display: string;
  category: string;
}

function parseMealsToFoodItems(meals: Meal[]): FoodItem[] {
  const seen = new Set<string>();
  const items: FoodItem[] = [];

  for (const meal of meals) {
    if (!meal.foods) continue;
    const foods = meal.foods.split(",");
    for (const raw of foods) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({
        id: key,
        display: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
        category: categorizeFood(trimmed),
      });
    }
  }

  return items;
}

function loadChecked(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    // Ignore parse errors
  }
  return new Set();
}

function saveChecked(checked: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked]));
}

export function ShoppingList({ meals, open, onClose }: ShoppingListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load checked state from localStorage on mount
  useEffect(() => {
    setChecked(loadChecked());
  }, []);

  const foodItems = useMemo(() => parseMealsToFoodItems(meals), [meals]);

  const grouped = useMemo(() => {
    const map = new Map<string, FoodItem[]>();
    for (const item of foodItems) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    // Sort by predefined order
    const sorted: [string, FoodItem[]][] = [];
    for (const cat of CATEGORY_ORDER) {
      const items = map.get(cat);
      if (items && items.length > 0) {
        sorted.push([cat, items]);
      }
    }
    return sorted;
  }, [foodItems]);

  const toggleItem = useCallback((id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveChecked(next);
      return next;
    });
  }, []);

  const handleCopy = useCallback(() => {
    const unchecked = foodItems.filter((item) => !checked.has(item.id));
    if (unchecked.length === 0) {
      toast("Tutti gli ingredienti sono spuntati!", "info");
      return;
    }
    // Group unchecked by category for the copied text
    const lines: string[] = [];
    for (const cat of CATEGORY_ORDER) {
      const catItems = unchecked.filter((item) => item.category === cat);
      if (catItems.length === 0) continue;
      lines.push(`${CATEGORY_EMOJI[cat] ?? ""} ${cat}`);
      for (const item of catItems) {
        lines.push(`  - ${item.display}`);
      }
      lines.push("");
    }
    const text = lines.join("\n").trim();
    navigator.clipboard.writeText(text).then(() => {
      toast("Lista copiata!", "success");
    }).catch(() => {
      toast("Errore nella copia", "error");
    });
  }, [foodItems, checked, toast]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[150] flex flex-col bg-background/95 backdrop-blur"
        >
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="px-4 py-6 pb-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl text-foreground">Lista della spesa</h2>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {foodItems.length} ingredienti &middot; {foodItems.filter((i) => checked.has(i.id)).length} completati
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl glass-subtle text-foreground-muted hover:text-foreground transition-colors"
                  aria-label="Chiudi"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Food items grouped by category */}
              {grouped.length === 0 ? (
                <div className="glass rounded-2xl py-12 flex flex-col items-center text-center">
                  <p className="text-foreground-muted">Nessun ingrediente trovato</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {grouped.map(([category, items], catIdx) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: catIdx * 0.05 }}
                    >
                      <h3 className="flex items-center gap-2 text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2 px-1">
                        <span>{CATEGORY_EMOJI[category] ?? ""}</span>
                        <span>{category}</span>
                        <span className="ml-auto text-[10px] font-normal normal-case tracking-normal opacity-60">
                          {items.length}
                        </span>
                      </h3>
                      <div className="glass rounded-2xl divide-y divide-border/50 overflow-hidden">
                        {items.map((item) => {
                          const isChecked = checked.has(item.id);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleItem(item.id)}
                              className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-surface-hover active:bg-surface-hover"
                            >
                              <motion.div
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                  isChecked
                                    ? "border-primary bg-primary"
                                    : "border-foreground-muted/30"
                                }`}
                                whileTap={{ scale: 0.85 }}
                              >
                                {isChecked && (
                                  <motion.svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </motion.svg>
                                )}
                              </motion.div>
                              <span
                                className={`text-sm transition-all ${
                                  isChecked
                                    ? "text-foreground-muted line-through opacity-50"
                                    : "text-foreground"
                                }`}
                              >
                                {item.display}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Fixed bottom bar */}
          <div className="shrink-0 glass-strong border-t border-glass-border px-4 py-3 safe-area-bottom">
            <div className="flex items-center gap-3">
              <motion.button
                type="button"
                onClick={handleCopy}
                whileTap={{ scale: 0.96 }}
                className="flex-1 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-light transition-all flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copia lista
              </motion.button>
              <motion.button
                type="button"
                onClick={onClose}
                whileTap={{ scale: 0.96 }}
                className="rounded-2xl glass px-5 py-3 text-sm font-semibold text-foreground-muted hover:text-foreground transition-colors"
              >
                Chiudi
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
