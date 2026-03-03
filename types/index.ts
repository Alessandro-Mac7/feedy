import type { InferSelectModel } from "drizzle-orm";
import type {
  diets,
  meals,
  nutritionists,
  nutritionistPatients,
} from "@/lib/db/schema";

export type Diet = InferSelectModel<typeof diets>;
export type Meal = InferSelectModel<typeof meals>;
export type Nutritionist = InferSelectModel<typeof nutritionists>;
export type NutritionistPatient = InferSelectModel<
  typeof nutritionistPatients
>;

export const DAYS = [
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
  "Domenica",
] as const;

export type Day = (typeof DAYS)[number];

export const MEAL_TYPES = [
  "Colazione",
  "Spuntino Mattina",
  "Pranzo",
  "Spuntino Pomeriggio",
  "Cena",
] as const;

export type MealType = (typeof MEAL_TYPES)[number];

export const MEAL_EMOJI: Record<MealType, string> = {
  Colazione: "🌅",
  "Spuntino Mattina": "🍎",
  Pranzo: "🍝",
  "Spuntino Pomeriggio": "🥤",
  Cena: "🌙",
};

export interface ParsedMeal {
  day: Day;
  mealType: MealType;
  foods: string;
  carbs: number | null;
  fats: number | null;
  proteins: number | null;
  notes: string | null;
}

export interface ParseResult {
  meals: ParsedMeal[];
  errors: string[];
  warnings: string[];
}

export interface MacroEstimate {
  carbs: number;
  fats: number;
  proteins: number;
}
