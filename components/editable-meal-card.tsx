"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { MacroBadge } from "@/components/macro-badge";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { MEAL_EMOJI, type Meal, type MealType } from "@/types";

interface EditableMealCardProps {
  meal: Meal;
  index: number;
  onUpdated: () => void;
  onDeleted: () => void;
}

export function EditableMealCard({
  meal,
  index,
  onUpdated,
  onDeleted,
}: EditableMealCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [foods, setFoods] = useState(meal.foods);
  const [carbs, setCarbs] = useState(meal.carbs?.toString() ?? "");
  const [fats, setFats] = useState(meal.fats?.toString() ?? "");
  const [proteins, setProteins] = useState(meal.proteins?.toString() ?? "");
  const [notes, setNotes] = useState(meal.notes ?? "");

  const emoji = MEAL_EMOJI[meal.mealType as MealType] || "\uD83C\uDF7D\uFE0F";
  const hasMacros =
    meal.carbs !== null || meal.fats !== null || meal.proteins !== null;

  function handleStartEdit() {
    setFoods(meal.foods);
    setCarbs(meal.carbs?.toString() ?? "");
    setFats(meal.fats?.toString() ?? "");
    setProteins(meal.proteins?.toString() ?? "");
    setNotes(meal.notes ?? "");
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
  }

  async function handleSave() {
    if (!foods.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/meals/${meal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foods: foods.trim(),
          carbs: carbs ? parseInt(carbs) : null,
          fats: fats ? parseInt(fats) : null,
          proteins: proteins ? parseInt(proteins) : null,
          notes: notes.trim() || null,
        }),
      });
      if (res.ok) {
        setEditing(false);
        onUpdated();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/meals/${meal.id}`, { method: "DELETE" });
      if (res.ok) {
        setShowDeleteDialog(false);
        onDeleted();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div
        className="rounded-2xl p-4 glass hover:shadow-lg transition-shadow"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/40 text-xl">
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-foreground">
                {meal.mealType}
              </h3>
              {meal.isAiEstimated && (
                <span className="rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-bold text-violet-600 tracking-wide">
                  AI
                </span>
              )}
            </div>

            {!editing && (
              <div>
                <p className="text-[13px] text-foreground-muted mt-1 leading-relaxed">
                  {meal.foods}
                </p>

                {meal.notes && (
                  <p className="text-xs text-foreground-muted/60 mt-1.5 italic">
                    {meal.notes}
                  </p>
                )}

                {hasMacros && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    <MacroBadge
                      label="C"
                      value={meal.carbs}
                      color="carbs"
                      isEstimated={meal.isAiEstimated}
                    />
                    <MacroBadge
                      label="G"
                      value={meal.fats}
                      color="fats"
                      isEstimated={meal.isAiEstimated}
                    />
                    <MacroBadge
                      label="P"
                      value={meal.proteins}
                      color="proteins"
                      isEstimated={meal.isAiEstimated}
                    />
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleStartEdit}
                    className="rounded-xl bg-primary/12 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="rounded-xl bg-danger/8 px-3.5 py-2 text-xs font-semibold text-danger hover:bg-danger/15 transition-colors"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            )}

            <AnimatePresence>
              {editing && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                        Alimenti
                      </label>
                      <textarea
                        value={foods}
                        onChange={(e) => setFoods(e.target.value)}
                        rows={2}
                        className="w-full rounded-xl glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-macro-carbs uppercase tracking-wider mb-1.5">
                          Carb (g)
                        </label>
                        <input
                          type="number"
                          value={carbs}
                          onChange={(e) => setCarbs(e.target.value)}
                          placeholder="—"
                          className="w-full rounded-xl glass-input px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-macro-fats uppercase tracking-wider mb-1.5">
                          Grassi (g)
                        </label>
                        <input
                          type="number"
                          value={fats}
                          onChange={(e) => setFats(e.target.value)}
                          placeholder="—"
                          className="w-full rounded-xl glass-input px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-macro-proteins uppercase tracking-wider mb-1.5">
                          Proteine (g)
                        </label>
                        <input
                          type="number"
                          value={proteins}
                          onChange={(e) => setProteins(e.target.value)}
                          placeholder="—"
                          className="w-full rounded-xl glass-input px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                        Note
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Note opzionali..."
                        className="w-full rounded-xl glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={saving || !foods.trim()}
                        className={cn(
                          "flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all",
                          "bg-primary hover:bg-primary-light shadow-md shadow-primary/15",
                          "disabled:bg-white/30 disabled:text-foreground-muted disabled:shadow-none disabled:cursor-not-allowed"
                        )}
                      >
                        {saving ? "Salvataggio..." : "Salva"}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="flex-1 rounded-xl glass-subtle py-2.5 text-sm font-semibold text-foreground-muted hover:bg-white/50 transition-colors"
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Eliminare questo pasto?"
        description={`Stai per eliminare "${meal.mealType}" con "${meal.foods}". Questa azione non può essere annullata.`}
        loading={deleting}
      />
    </>
  );
}
