const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Frutta: [
    "mela", "mele", "banana", "banane", "arancia", "arance", "fragola", "fragole",
    "pera", "pere", "pesca", "pesche", "uva", "kiwi", "ananas", "limone", "limoni",
    "mandarino", "mandarini", "pompelmo", "ciliegia", "ciliegie", "albicocca",
    "albicocche", "fico", "fichi", "melone", "anguria", "mirtilli", "mirtillo",
    "lampone", "lamponi", "frutti di bosco", "frutta", "prugna", "prugne",
    "melagrana", "cocco", "mango", "papaya", "avocado",
  ],
  Verdura: [
    "insalata", "pomodoro", "pomodori", "pomodorini", "zucchine", "zucchina",
    "carota", "carote", "spinaci", "broccoli", "cavolfiore", "peperone",
    "peperoni", "melanzana", "melanzane", "cetriolo", "cetrioli", "lattuga",
    "rucola", "radicchio", "finocchio", "finocchi", "carciofo", "carciofi",
    "asparagi", "asparago", "fagiolini", "verdura", "verdure", "funghi", "fungo",
    "cipolla", "cipolle", "sedano", "patata", "patate", "piselli", "mais",
    "cavolo", "verza", "bietola", "bietole", "rape", "ravanelli", "zucca",
    "scarola", "cicoria", "catalogna", "friarielli",
  ],
  Proteine: [
    "pollo", "manzo", "maiale", "vitello", "tacchino", "uova", "uovo",
    "tonno", "salmone", "pesce", "merluzzo", "sogliola", "orata", "spigola",
    "gamberi", "gamberetto", "calamari", "polpo", "cozze", "vongole",
    "prosciutto", "bresaola", "fesa", "arrosto", "bistecca", "hamburger",
    "polpette", "carne", "petto", "coscia", "filetto", "carpaccio",
    "mozzarella", "ricotta", "parmigiano", "grana", "formaggio", "formaggi",
    "yogurt", "greco", "albume", "albumi", "tofu", "seitan", "tempeh",
    "legumi", "lenticchie", "ceci", "fagioli", "fave", "edamame",
    "affettato", "affettati", "salumi", "speck", "pancetta", "stracchino",
    "crescenza", "scamorza", "provolone", "pecorino", "gorgonzola",
    "fiocchi di latte", "skyr",
  ],
  Cereali: [
    "riso", "pasta", "pane", "fette biscottate", "crackers", "cracker",
    "farro", "orzo", "avena", "cereali", "muesli", "granola", "gallette",
    "quinoa", "cous cous", "couscous", "polenta", "gnocchi", "tortellini",
    "ravioli", "lasagna", "risotto", "spaghetti", "penne", "fusilli",
    "rigatoni", "tagliatelle", "orecchiette", "farfalle", "linguine",
    "fettuccine", "cornetto", "brioche", "biscotti", "biscotto", "grissini",
    "panino", "focaccia", "piadina", "wrap", "tartina", "toast",
    "fiocchi d'avena", "pancake", "waffles", "porridge", "bulgur",
    "miglio", "segale", "kamut",
  ],
  Condimenti: [
    "olio", "sale", "aceto", "burro", "maionese", "ketchup", "senape",
    "salsa", "sugo", "pesto", "origano", "basilico", "rosmarino", "pepe",
    "peperoncino", "aglio", "prezzemolo", "menta", "timo", "curcuma",
    "zenzero", "cannella", "noce moscata", "miele", "zucchero",
    "marmellata", "confettura", "crema", "nutella", "cioccolato",
    "cacao", "sciroppo", "evo",
  ],
};

/**
 * Categorises an Italian food name into one of the predefined categories.
 * Matching is case-insensitive and uses keyword search within the food string.
 * Returns "Altro" when no keyword matches.
 */
export function categorizeFood(food: string): string {
  const normalised = food.toLowerCase().trim();
  if (!normalised) return "Altro";

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalised.includes(keyword)) {
        return category;
      }
    }
  }

  return "Altro";
}
