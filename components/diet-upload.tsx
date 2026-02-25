"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { parseCSV, parseJSON } from "@/lib/parsers/csv";
import type { ParseResult, ParsedMeal } from "@/types";
import { MEAL_EMOJI } from "@/types";
import { useToast } from "@/components/toast";

interface DietUploadProps {
  onUploaded: () => void;
}

export function DietUpload({ onUploaded }: DietUploadProps) {
  const [dietName, setDietName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const content = await file.text();
    const isJSON = file.name.endsWith(".json");

    const result = isJSON ? parseJSON(content) : parseCSV(content);
    setParseResult(result);
  }

  async function handleUpload() {
    if (!parseResult || parseResult.errors.length > 0) return;
    if (!dietName.trim()) {
      setError("Inserisci un nome per la dieta.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Inserisci le date di inizio e fine.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const res = await fetch("/api/diets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dietName.trim(),
          startDate,
          endDate,
          parsedMeals: parseResult.meals,
        }),
      });

      if (!res.ok) {
        let errorMsg = "Errore sconosciuto";
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      setDietName("");
      setStartDate("");
      setEndDate("");
      setParseResult(null);
      setIsOpen(false);
      if (fileRef.current) fileRef.current.value = "";
      toast("Dieta caricata con successo!", "success");
      onUploaded();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Errore sconosciuto.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setUploading(false);
    }
  }

  const mealsWithoutMacros = parseResult?.meals.filter(
    (m) => m.carbs === null || m.fats === null || m.proteins === null
  ).length;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Nuova dieta</h2>
            <p className="text-xs text-foreground-muted">Carica da file CSV o JSON</p>
          </div>
        </div>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-muted"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/20 px-5 pb-5 pt-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                    Nome della dieta
                  </label>
                  <input
                    type="text"
                    value={dietName}
                    onChange={(e) => setDietName(e.target.value)}
                    placeholder="Es. Dieta Mediterranea Settimana 1"
                    className="w-full rounded-xl glass-input px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/40 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                      Data inizio
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl glass-input px-4 py-2.5 text-sm text-foreground focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                      Data fine
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl glass-input px-4 py-2.5 text-sm text-foreground focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5">
                    File CSV o JSON
                  </label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFile}
                    className="w-full text-sm text-foreground-muted file:mr-3 file:rounded-xl file:border-0 file:bg-primary/12 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20 file:transition-colors"
                  />
                  <p className="mt-1.5 text-xs text-foreground-muted/60">
                    <a href="/template.csv" download className="text-primary hover:underline">
                      Scarica il template CSV
                    </a>
                  </p>
                </div>
              </div>

              {parseResult && parseResult.errors.length > 0 && (
                <div className="rounded-xl bg-danger/8 border border-danger/15 p-3.5">
                  <p className="text-sm font-semibold text-danger mb-1">Errori:</p>
                  <ul className="list-disc pl-5 text-xs text-danger/80 space-y-0.5">
                    {parseResult.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              {parseResult && parseResult.warnings.length > 0 && parseResult.errors.length === 0 && (
                <div className="rounded-xl glass-subtle border-amber-500/20 p-3.5">
                  <p className="text-sm font-semibold text-amber-700 mb-1">Avvisi:</p>
                  <ul className="list-disc pl-5 text-xs text-amber-600 space-y-0.5">
                    {parseResult.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                  {(mealsWithoutMacros ?? 0) > 0 && (
                    <p className="mt-2 text-xs text-amber-700 font-semibold">
                      {mealsWithoutMacros} pasti senza macro — potrai stimarli con l&apos;AI dopo il caricamento.
                    </p>
                  )}
                </div>
              )}

              {parseResult && parseResult.errors.length === 0 && parseResult.meals.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    Anteprima: {parseResult.meals.length} pasti
                  </p>
                  <div className="max-h-56 overflow-y-auto rounded-xl glass-subtle">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-white/50 backdrop-blur-sm">
                        <tr>
                          <th className="px-2.5 py-2 text-left text-foreground-muted font-semibold">Giorno</th>
                          <th className="px-2.5 py-2 text-left text-foreground-muted font-semibold">Pasto</th>
                          <th className="px-2.5 py-2 text-left text-foreground-muted font-semibold">Alimenti</th>
                          <th className="px-2.5 py-2 text-right text-macro-carbs font-semibold">C</th>
                          <th className="px-2.5 py-2 text-right text-macro-fats font-semibold">G</th>
                          <th className="px-2.5 py-2 text-right text-macro-proteins font-semibold">P</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseResult.meals.map((m: ParsedMeal, i: number) => (
                          <tr key={i} className="border-t border-white/20">
                            <td className="px-2.5 py-1.5 text-foreground">{m.day}</td>
                            <td className="px-2.5 py-1.5 text-foreground">
                              {MEAL_EMOJI[m.mealType]} {m.mealType}
                            </td>
                            <td className="px-2.5 py-1.5 text-foreground-muted max-w-[120px] truncate">
                              {m.foods}
                            </td>
                            <td className="px-2.5 py-1.5 text-right text-macro-carbs">{m.carbs ?? "—"}</td>
                            <td className="px-2.5 py-1.5 text-right text-macro-fats">{m.fats ?? "—"}</td>
                            <td className="px-2.5 py-1.5 text-right text-macro-proteins">{m.proteins ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {error && <p className="text-sm font-medium text-danger">{error}</p>}

              <button
                onClick={handleUpload}
                disabled={
                  uploading ||
                  !parseResult ||
                  parseResult.errors.length > 0 ||
                  parseResult.meals.length === 0
                }
                className={cn(
                  "w-full rounded-xl py-3 text-sm font-semibold text-white transition-all",
                  "bg-primary hover:bg-primary-light shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20",
                  "disabled:bg-white/30 disabled:text-foreground-muted disabled:shadow-none disabled:cursor-not-allowed disabled:backdrop-blur-sm"
                )}
              >
                {uploading ? "Caricamento..." : "Carica dieta"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
