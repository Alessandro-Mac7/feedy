"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/components/toast";

const STORAGE_KEY = "feedy-shopping-checked";
const CACHE_KEY = "feedy-shopping-cache";

interface ShoppingItem {
  name: string;
  quantity: string;
  category: string;
}

interface ShoppingCategory {
  name: string;
  emoji: string;
  items: ShoppingItem[];
}

interface SmartShoppingList {
  categories: ShoppingCategory[];
}

interface ShoppingListProps {
  open: boolean;
  onClose: () => void;
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

function loadCache(): SmartShoppingList | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Cache valid for 1 hour
      if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
        return parsed.data as SmartShoppingList;
      }
    }
  } catch {
    // Ignore
  }
  return null;
}

function saveCache(data: SmartShoppingList) {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ data, timestamp: Date.now() })
  );
}

export function ShoppingList({ open, onClose }: ShoppingListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [shoppingList, setShoppingList] = useState<SmartShoppingList | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);
  const { toast } = useToast();

  // Load checked state from localStorage on mount
  useEffect(() => {
    setChecked(loadChecked());
  }, []);

  // Fetch AI shopping list when opened
  useEffect(() => {
    if (!open) return;
    if (fetchedRef.current && shoppingList) return;

    // Try cache first
    const cached = loadCache();
    if (cached) {
      setShoppingList(cached);
      fetchedRef.current = true;
      return;
    }

    async function fetchList() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/shopping-list", { method: "POST" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Errore nel caricamento");
        }
        const data: SmartShoppingList = await res.json();
        setShoppingList(data);
        saveCache(data);
        fetchedRef.current = true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Errore nel caricamento"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchList();
  }, [open, shoppingList]);

  const handleRefresh = useCallback(async () => {
    localStorage.removeItem(CACHE_KEY);
    fetchedRef.current = false;
    setShoppingList(null);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/shopping-list", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Errore nel caricamento");
      }
      const data: SmartShoppingList = await res.json();
      setShoppingList(data);
      saveCache(data);
      fetchedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nel caricamento");
    } finally {
      setLoading(false);
    }
  }, []);

  const totalItems =
    shoppingList?.categories.reduce((s, c) => s + c.items.length, 0) ?? 0;
  const checkedCount =
    shoppingList?.categories.reduce(
      (s, c) =>
        s + c.items.filter((item) => checked.has(itemKey(item))).length,
      0
    ) ?? 0;

  const toggleItem = useCallback((key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      saveChecked(next);
      return next;
    });
  }, []);

  const handleCopy = useCallback(() => {
    if (!shoppingList) return;

    const uncheckedCategories = shoppingList.categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => !checked.has(itemKey(item))),
      }))
      .filter((cat) => cat.items.length > 0);

    if (uncheckedCategories.length === 0) {
      toast("Tutti gli ingredienti sono spuntati!", "info");
      return;
    }

    const lines: string[] = [];
    for (const cat of uncheckedCategories) {
      lines.push(`${cat.emoji} ${cat.name}`);
      for (const item of cat.items) {
        lines.push(`  - ${item.name} — ${item.quantity}`);
      }
      lines.push("");
    }
    const text = lines.join("\n").trim();
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast("Lista copiata!", "success");
      })
      .catch(() => {
        toast("Errore nella copia", "error");
      });
  }, [shoppingList, checked, toast]);

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
                  <h2 className="font-display text-xl text-foreground">
                    Lista della spesa
                  </h2>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {loading ? (
                      <span className="inline-flex items-center gap-1.5">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="inline-block"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                        </motion.span>
                        Generazione con AI...
                      </span>
                    ) : shoppingList ? (
                      <>
                        {totalItems} ingredienti &middot; {checkedCount}{" "}
                        completati
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {shoppingList && !loading && (
                    <button
                      type="button"
                      onClick={handleRefresh}
                      className="flex h-9 w-9 items-center justify-center rounded-xl glass-subtle text-foreground-muted hover:text-foreground transition-colors"
                      aria-label="Rigenera"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-xl glass-subtle text-foreground-muted hover:text-foreground transition-colors"
                    aria-label="Chiudi"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Loading state */}
              {loading && (
                <div className="space-y-4">
                  <div className="glass rounded-2xl p-5 flex flex-col items-center text-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="text-primary"
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    </motion.div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Analizzo i tuoi pasti...
                      </p>
                      <p className="text-xs text-foreground-muted mt-1">
                        L&apos;AI sta raggruppando gli ingredienti e calcolando
                        le quantità
                      </p>
                    </div>
                  </div>
                  {/* Skeleton placeholders */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-24 rounded-lg skeleton-shimmer" />
                      <div className="glass rounded-2xl overflow-hidden divide-y divide-border/50">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="px-4 py-3 flex gap-3">
                            <div className="h-5 w-5 rounded-full skeleton-shimmer shrink-0" />
                            <div className="flex-1 flex justify-between">
                              <div className="h-4 w-28 rounded skeleton-shimmer" />
                              <div className="h-4 w-16 rounded skeleton-shimmer" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error state */}
              {error && !loading && (
                <div className="glass rounded-2xl py-12 flex flex-col items-center text-center gap-3">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-danger"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <p className="text-foreground-muted text-sm">{error}</p>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="rounded-xl bg-primary/12 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                  >
                    Riprova
                  </button>
                </div>
              )}

              {/* AI-generated shopping list */}
              {shoppingList && !loading && (
                <div className="space-y-5">
                  {/* AI badge */}
                  <div className="flex items-center gap-2 px-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                      Generata con AI
                    </span>
                    <span className="text-[10px] text-foreground-muted">
                      Quantità stimate per la settimana
                    </span>
                  </div>

                  {shoppingList.categories.map((cat, catIdx) => (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: catIdx * 0.05 }}
                    >
                      <h3 className="flex items-center gap-2 text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2 px-1">
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                        <span className="ml-auto text-[10px] font-normal normal-case tracking-normal opacity-60">
                          {cat.items.length}
                        </span>
                      </h3>
                      <div className="glass rounded-2xl divide-y divide-border/50 overflow-hidden">
                        {cat.items.map((item) => {
                          const key = itemKey(item);
                          const isChecked = checked.has(key);
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => toggleItem(key)}
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
                                className={`text-sm flex-1 transition-all ${
                                  isChecked
                                    ? "text-foreground-muted line-through opacity-50"
                                    : "text-foreground"
                                }`}
                              >
                                {item.name}
                              </span>
                              <span
                                className={`text-xs tabular-nums transition-all ${
                                  isChecked
                                    ? "text-foreground-muted/40"
                                    : "text-foreground-muted"
                                }`}
                              >
                                {item.quantity}
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
                disabled={loading || !shoppingList}
                className="flex-1 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-light transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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

/** Stable key for a shopping item */
function itemKey(item: ShoppingItem): string {
  return item.name.toLowerCase().trim();
}
