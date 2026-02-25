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

function getCurrentMonth(): string {
  const months = [
    "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
  ];
  return months[new Date().getMonth()];
}

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "primavera";
  if (month >= 5 && month <= 7) return "estate";
  if (month >= 8 && month <= 10) return "autunno";
  return "inverno";
}

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
  const month = getCurrentMonth();
  const season = getCurrentSeason();

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Sei un nutrizionista e assistente per la spesa italiano esperto. Ricevi l'elenco degli alimenti di tutti i pasti settimanali di una dieta.
Siamo a ${month} (${season}). Il tuo compito è creare una lista della spesa INTELLIGENTE e CONCRETA:

REGOLE FONDAMENTALI:
1. RAGGRUPPA gli ingredienti uguali o simili (es. "pollo" che appare in 3 pasti → un solo elemento)
2. SOMMA le quantità quando sono indicate (es. "100g riso" + "80g riso" → "180g riso")
3. Se non ci sono grammi espliciti, STIMA una quantità ragionevole per la settimana (es. "pollo" in 4 pasti → "~600g")
4. CATEGORIZZA in modo logico per i reparti del supermercato
5. NON ripetere mai lo stesso ingrediente

REGOLA CHIAVE — MAI SCRIVERE INGREDIENTI GENERICI:
NON scrivere MAI parole generiche come "verdura", "frutta", "carne", "pesce", "insalata", "formaggio" ecc.
ELIMINA il termine generico e SOSTITUISCILO con PRODOTTI CONCRETI che puoi comprare al supermercato.
Siamo a ${month} (${season}), quindi proponi prodotti di stagione.

ESEMPI DI SOSTITUZIONE OBBLIGATORIA:
- La dieta dice "verdura" o "verdure" → tu scrivi IN LISTA 2-3 verdure separate, ognuna come elemento a sé: "Broccoli (di stagione)", "Finocchi (di stagione)", "Carciofi (di stagione)"
- La dieta dice "frutta" o "frutta di stagione" → tu scrivi 2-3 frutti separati: "Arance (di stagione)", "Kiwi (di stagione)", "Mandarini (di stagione)"
- La dieta dice "carni bianche" → tu scrivi: "Petto di pollo" o "Fesa di tacchino"
- La dieta dice "carni rosse" → tu scrivi: "Controfiletto di manzo" o "Fettine di vitello"
- La dieta dice "pesce" → tu scrivi: "Orata" o "Merluzzo"
- La dieta dice "insalata" → tu scrivi: "Lattuga romana" o "Misticanza"
- La dieta dice "formaggio" → tu scrivi: "Parmigiano Reggiano" o "Ricotta fresca"
- La dieta dice "affettati" → tu scrivi: "Bresaola" o "Prosciutto crudo"
- La dieta dice "cereali" → tu scrivi: "Fiocchi d'avena" o "Muesli integrale"
- La dieta dice "legumi" → tu scrivi: "Lenticchie" o "Ceci"

Ogni sostituzione diventa un ELEMENTO SEPARATO nella lista, con la sua quantità stimata.
Per frutta e verdura di stagione aggiungi "(di stagione)" nel nome.

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
