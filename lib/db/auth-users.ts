import { db } from "@/lib/db";
import { sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

// Neon Auth stores users in its own Postgres schema ("neon_auth"), outside
// Drizzle's managed schema. This module centralizes every raw-SQL access
// point to that table so the cross-schema query lives in exactly one place.

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const normalized = email.trim().toLowerCase();
  const { rows } = await db.execute(
    sql`SELECT id, email, name FROM "neon_auth"."user" WHERE email = ${normalized}`
  );
  if (!rows.length) return null;
  const [row] = rows;
  return { id: row.id as string, email: row.email as string, name: (row.name as string) ?? null };
}

export async function searchUsers(
  query: string,
  excludeUserId?: string
): Promise<AuthUser[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const excludeClause = excludeUserId
    ? sql`AND id::text != ${excludeUserId}`
    : sql``;

  const { rows } = await db.execute(
    sql`SELECT id, email, name FROM "neon_auth"."user"
        WHERE (LOWER(email) LIKE ${"%" + q + "%"} OR LOWER(name) LIKE ${"%" + q + "%"})
        ${excludeClause}
        ORDER BY name ASC LIMIT 10`
  );

  return rows.map((r) => ({
    id: r.id as string,
    email: r.email as string,
    name: (r.name as string) ?? null,
  }));
}

// SQL fragments for enriching a query with the Neon Auth user's name/email,
// joined by a text user-id column (e.g. diets.createdBy, nutritionistPatients.patientUserId).
export function authUserNameSql(userIdColumn: AnyPgColumn): SQL<string | null> {
  return sql<string | null>`(SELECT name FROM "neon_auth"."user" WHERE id::text = ${userIdColumn})`;
}

export function authUserEmailSql(userIdColumn: AnyPgColumn): SQL<string | null> {
  return sql<string | null>`(SELECT email FROM "neon_auth"."user" WHERE id::text = ${userIdColumn})`;
}
