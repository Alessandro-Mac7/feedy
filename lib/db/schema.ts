import {
  pgTable,
  uuid,
  text,
  date,
  boolean,
  timestamp,
  integer,
  check,
  unique,
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
    createdBy: text("created_by"),
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
    isCompleted: boolean("is_completed").notNull().default(false),
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

export const userGoals = pgTable(
  "user_goals",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    dailyKcal: integer("daily_kcal"),
    dailyCarbs: integer("daily_carbs"),
    dailyFats: integer("daily_fats"),
    dailyProteins: integer("daily_proteins"),
    dailyWater: integer("daily_water").notNull().default(8),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique("user_goals_user_id_unique").on(table.userId)]
);

export const nutritionists = pgTable("nutritionists", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nutritionistPatients = pgTable(
  "nutritionist_patients",
  {
    id: uuid().primaryKey().defaultRandom(),
    nutritionistId: uuid("nutritionist_id")
      .notNull()
      .references(() => nutritionists.id, { onDelete: "cascade" }),
    patientUserId: text("patient_user_id").notNull(),
    patientEmail: text("patient_email").notNull(),
    patientName: text("patient_name"),
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (table) => [
    unique("nutritionist_patient_unique").on(
      table.nutritionistId,
      table.patientUserId
    ),
  ]
);
