import Groq from "groq-sdk";
import type { MacroEstimate } from "@/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Simple in-memory cache
const cache = new Map<string, MacroEstimate>();

export async function estimateMacros(foods: string): Promise<MacroEstimate> {
  const cacheKey = foods.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Sei un nutrizionista esperto. Dato un elenco di alimenti per un pasto, stima i macronutrienti totali in grammi.
Rispondi SOLO con un oggetto JSON con questa struttura: {"carbs": number, "fats": number, "proteins": number}
Stima valori ragionevoli per una porzione standard. Arrotonda all'intero.`,
      },
      {
        role: "user",
        content: `Stima i macronutrienti per questo pasto: ${foods}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Risposta vuota da Groq");
  }

  let parsed: MacroEstimate;
  try {
    parsed = JSON.parse(content) as MacroEstimate;
  } catch {
    throw new Error("Risposta JSON non valida da Groq");
  }

  if (
    typeof parsed.carbs !== "number" ||
    typeof parsed.fats !== "number" ||
    typeof parsed.proteins !== "number"
  ) {
    throw new Error("Formato risposta non valido");
  }

  const clamp = (v: number) => Math.min(2000, Math.max(0, Math.round(v)));

  const result: MacroEstimate = {
    carbs: clamp(parsed.carbs),
    fats: clamp(parsed.fats),
    proteins: clamp(parsed.proteins),
  };

  cache.set(cacheKey, result);
  return result;
}
