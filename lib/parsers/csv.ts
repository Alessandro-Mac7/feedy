import { DAYS, MEAL_TYPES, type ParsedMeal, type ParseResult, type Day, type MealType } from "@/types";

const EXPECTED_HEADERS = [
  "giorno",
  "pasto",
  "alimenti",
  "carboidrati",
  "grassi",
  "proteine",
  "note",
];

function parseLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

export function parseCSV(content: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const meals: ParsedMeal[] = [];

  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    errors.push("Il file deve contenere almeno un'intestazione e una riga di dati.");
    return { meals, errors, warnings };
  }

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase());

  // Validate headers
  const missingHeaders = EXPECTED_HEADERS.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    errors.push(
      `Intestazioni mancanti: ${missingHeaders.join(", ")}. Intestazioni richieste: ${EXPECTED_HEADERS.join(", ")}`
    );
    return { meals, errors, warnings };
  }

  const colIndex = Object.fromEntries(
    EXPECTED_HEADERS.map((h) => [h, headers.indexOf(h)])
  );

  for (let i = 1; i < lines.length; i++) {
    const row = parseLine(lines[i]);
    const rowNum = i + 1;

    const day = row[colIndex.giorno]?.trim();
    const mealType = row[colIndex.pasto]?.trim();
    const foods = row[colIndex.alimenti]?.trim();
    const carbsStr = row[colIndex.carboidrati]?.trim();
    const fatsStr = row[colIndex.grassi]?.trim();
    const proteinsStr = row[colIndex.proteine]?.trim();
    const notes = row[colIndex.note]?.trim() || null;

    if (!day) {
      errors.push(`Riga ${rowNum}: il giorno è obbligatorio.`);
      continue;
    }

    if (!DAYS.includes(day as Day)) {
      errors.push(
        `Riga ${rowNum}: giorno "${day}" non valido. Valori accettati: ${DAYS.join(", ")}`
      );
      continue;
    }

    if (!mealType) {
      errors.push(`Riga ${rowNum}: il tipo di pasto è obbligatorio.`);
      continue;
    }

    if (!MEAL_TYPES.includes(mealType as MealType)) {
      errors.push(
        `Riga ${rowNum}: pasto "${mealType}" non valido. Valori accettati: ${MEAL_TYPES.join(", ")}`
      );
      continue;
    }

    if (!foods) {
      errors.push(`Riga ${rowNum}: gli alimenti sono obbligatori.`);
      continue;
    }

    const carbs = carbsStr ? parseInt(carbsStr, 10) : null;
    const fats = fatsStr ? parseInt(fatsStr, 10) : null;
    const proteins = proteinsStr ? parseInt(proteinsStr, 10) : null;

    if (carbsStr && isNaN(carbs!)) {
      errors.push(`Riga ${rowNum}: carboidrati "${carbsStr}" non è un numero valido.`);
      continue;
    }
    if (fatsStr && isNaN(fats!)) {
      errors.push(`Riga ${rowNum}: grassi "${fatsStr}" non è un numero valido.`);
      continue;
    }
    if (proteinsStr && isNaN(proteins!)) {
      errors.push(`Riga ${rowNum}: proteine "${proteinsStr}" non è un numero valido.`);
      continue;
    }

    if (carbs === null || fats === null || proteins === null) {
      warnings.push(
        `Riga ${rowNum}: macro incompleti per "${foods}". Potrai stimarli con l'AI.`
      );
    }

    meals.push({
      day: day as Day,
      mealType: mealType as MealType,
      foods,
      carbs,
      fats,
      proteins,
      notes,
    });
  }

  return { meals, errors, warnings };
}

interface JsonMeal {
  giorno: string;
  pasto: string;
  alimenti: string;
  carboidrati?: number | string;
  grassi?: number | string;
  proteine?: number | string;
  note?: string;
}

export function parseJSON(content: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const meals: ParsedMeal[] = [];

  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    errors.push("JSON non valido. Controlla la sintassi del file.");
    return { meals, errors, warnings };
  }

  const items = Array.isArray(data) ? data : (data as { pasti?: unknown[] })?.pasti;
  if (!Array.isArray(items)) {
    errors.push(
      'Il JSON deve essere un array di pasti o un oggetto con chiave "pasti".'
    );
    return { meals, errors, warnings };
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i] as JsonMeal;
    const rowNum = i + 1;

    const day = item.giorno?.trim();
    const mealType = item.pasto?.trim();
    const foods = item.alimenti?.trim();

    if (!day) {
      errors.push(`Pasto ${rowNum}: il giorno è obbligatorio.`);
      continue;
    }

    if (!DAYS.includes(day as Day)) {
      errors.push(
        `Pasto ${rowNum}: giorno "${day}" non valido. Valori accettati: ${DAYS.join(", ")}`
      );
      continue;
    }

    if (!mealType) {
      errors.push(`Pasto ${rowNum}: il tipo di pasto è obbligatorio.`);
      continue;
    }

    if (!MEAL_TYPES.includes(mealType as MealType)) {
      errors.push(
        `Pasto ${rowNum}: pasto "${mealType}" non valido. Valori accettati: ${MEAL_TYPES.join(", ")}`
      );
      continue;
    }

    if (!foods) {
      errors.push(`Pasto ${rowNum}: gli alimenti sono obbligatori.`);
      continue;
    }

    const carbs =
      item.carboidrati != null ? Number(item.carboidrati) : null;
    const fats = item.grassi != null ? Number(item.grassi) : null;
    const proteins =
      item.proteine != null ? Number(item.proteine) : null;

    if (carbs !== null && isNaN(carbs)) {
      errors.push(
        `Pasto ${rowNum}: carboidrati "${item.carboidrati}" non è un numero valido.`
      );
      continue;
    }
    if (fats !== null && isNaN(fats)) {
      errors.push(
        `Pasto ${rowNum}: grassi "${item.grassi}" non è un numero valido.`
      );
      continue;
    }
    if (proteins !== null && isNaN(proteins)) {
      errors.push(
        `Pasto ${rowNum}: proteine "${item.proteine}" non è un numero valido.`
      );
      continue;
    }

    if (carbs === null || fats === null || proteins === null) {
      warnings.push(
        `Pasto ${rowNum}: macro incompleti per "${foods}". Potrai stimarli con l'AI.`
      );
    }

    meals.push({
      day: day as Day,
      mealType: mealType as MealType,
      foods,
      carbs,
      fats,
      proteins,
      notes: item.note?.trim() || null,
    });
  }

  return { meals, errors, warnings };
}
