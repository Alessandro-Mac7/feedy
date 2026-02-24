import {
  pgTable,
  uuid,
  text,
  date,
  boolean,
  timestamp,
  integer,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const diets = pgTable(
  "diets",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    dietName: text("name").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    isActive: boolean("is_active").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    check("end_after_start", sql`${table.endDate} >= ${table.startDate}`),
  ]
);

export const meals = pgTable(
  "meals",
  {
    id: uuid().primaryKey().defaultRandom(),
    dietId: uuid("diet_id")
      .notNull()
      .references(() => diets.id, { onDelete: "cascade" }),
    day: text().notNull(),
    mealType: text("meal_type").notNull(),
    foods: text().notNull(),
    carbs: integer(),
    fats: integer(),
    proteins: integer(),
    notes: text(),
    isAiEstimated: boolean("is_ai_estimated").notNull().default(false),
  },
  (table) => [
    check(
      "valid_day",
      sql`${table.day} IN ('Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica')`
    ),
    check(
      "valid_meal_type",
      sql`${table.mealType} IN ('Colazione', 'Spuntino Mattina', 'Pranzo', 'Spuntino Pomeriggio', 'Cena')`
    ),
  ]
);
