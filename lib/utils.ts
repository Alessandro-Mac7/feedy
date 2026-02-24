import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Day, MealType } from "@/types";
import { DAYS } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DAY_SHORT: Record<Day, string> = {
  Lunedì: "Lun",
  Martedì: "Mar",
  Mercoledì: "Mer",
  Giovedì: "Gio",
  Venerdì: "Ven",
  Sabato: "Sab",
  Domenica: "Dom",
};

export function getTodayDay(): Day {
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon, ...
  // Map JS day (0=Sun) to our Italian days (0=Mon)
  const index = jsDay === 0 ? 6 : jsDay - 1;
  return DAYS[index];
}

export function getDayShort(day: Day): string {
  return DAY_SHORT[day];
}

export function getCurrentMealType(): MealType {
  const hour = new Date().getHours();
  if (hour < 10) return "Colazione";
  if (hour < 12) return "Spuntino Mattina";
  if (hour < 15) return "Pranzo";
  if (hour < 18) return "Spuntino Pomeriggio";
  return "Cena";
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buongiorno";
  if (hour < 18) return "Buon pomeriggio";
  return "Buonasera";
}
