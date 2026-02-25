import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface ShoppingItem {
  name: string;
  quantity: string;
  category: string;
}

export interface SmartShoppingList {
  categories: {
    name: string;
    emoji: string;
    items: ShoppingItem[];
  }[];
}

// In-memory cache keyed by sorted food hash
const cache = new Map<string, SmartShoppingList>();

export async function generateShoppingList(
  mealFoods: string[]
): Promise<SmartShoppingList> {
  const cacheKey = mealFoods
    .map((f) => f.toLowerCase().trim())
    .sort()
    .join("|");
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const allFoods = mealFoods.join("\n");

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Sei un assistente per la spesa. Ricevi l'elenco degli alimenti di tutti i pasti settimanali di una dieta.
Il tuo compito è creare una lista della spesa INTELLIGENTE:

1. RAGGRUPPA gli ingredienti uguali o simili (es. "pollo" che appare in 3 pasti → un solo elemento)
2. SOMMA le quantità quando sono indicate (es. "100g riso" + "80g riso" → "180g riso")
3. Se non ci sono grammi espliciti, STIMA una quantità ragionevole per la settimana (es. "pollo" in 4 pasti → "~600g")
4. CATEGORIZZA in modo logico per i reparti del supermercato
5. NON ripetere mai lo stesso ingrediente

Rispondi SOLO con un JSON con questa struttura:
{
  "categories": [
    {
      "name": "Nome Categoria",
      "emoji": "🛒",
      "items": [
        { "name": "Nome ingrediente", "quantity": "quantità", "category": "Nome Categoria" }
      ]
    }
  ]
}

Usa queste categorie (in ordine):
- Frutta e Verdura (🥬)
- Carne e Pesce (🥩)
- Latticini e Uova (🥛)
- Cereali e Pane (🌾)
- Legumi e Semi (🫘)
- Condimenti e Spezie (🧂)
- Bevande (🥤)
- Altro (📦)

Ometti le categorie vuote. Arrotonda le quantità. Scrivi in italiano.`,
      },
      {
        role: "user",
        content: `Ecco tutti i pasti della settimana:\n\n${allFoods}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Risposta vuota da Groq");
  }

  let parsed: SmartShoppingList;
  try {
    parsed = JSON.parse(content) as SmartShoppingList;
  } catch {
    throw new Error("Risposta JSON non valida da Groq");
  }

  if (!Array.isArray(parsed.categories)) {
    throw new Error("Formato risposta non valido");
  }

  cache.set(cacheKey, parsed);
  return parsed;
}
