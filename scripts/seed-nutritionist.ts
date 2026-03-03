/**
 * Script per promuovere un utente registrato a nutrizionista.
 *
 * Uso:
 *   npx tsx scripts/seed-nutritionist.ts <email> <nome-visualizzato>
 *
 * Esempio:
 *   npx tsx scripts/seed-nutritionist.ts nutrizionista@demo.com "Dr.ssa Bianchi"
 *
 * Prerequisiti:
 *   - L'utente deve essersi già registrato tramite la UI (/auth/sign-up)
 *   - Il file .env.local deve contenere DATABASE_URL
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { nutritionists } from "../lib/db/schema";
import { eq } from "drizzle-orm";

const email = process.argv[2];
const displayName = process.argv[3];

if (!email || !displayName) {
  console.error(
    "\nUso: npx tsx scripts/seed-nutritionist.ts <email> <nome>\n" +
      'Esempio: npx tsx scripts/seed-nutritionist.ts nutrizionista@demo.com "Dr.ssa Bianchi"\n'
  );
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("Manca DATABASE_URL nel .env o .env.local");
  process.exit(1);
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  // Cerca l'utente nella tabella auth di Neon (schema "auth")
  const users = await sql(
    `SELECT id, email, name FROM "auth"."users" WHERE email = $1 LIMIT 1`,
    [email]
  );

  if (users.length === 0) {
    console.error(`\nUtente con email "${email}" non trovato.`);
    console.error(
      "Assicurati di aver prima registrato l'account dalla UI (/auth/sign-up)\n"
    );
    process.exit(1);
  }

  const user = users[0];
  console.log(`\nUtente trovato: ${user.name || user.email} (${user.id})`);

  // Controlla se è già nutrizionista
  const existing = await db
    .select()
    .from(nutritionists)
    .where(eq(nutritionists.userId, user.id as string))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Già nutrizionista con display name: "${existing[0].displayName}"`);
    console.log("Nessuna modifica effettuata.\n");
    process.exit(0);
  }

  // Inserisci come nutrizionista
  const [inserted] = await db
    .insert(nutritionists)
    .values({
      userId: user.id as string,
      displayName,
    })
    .returning();

  console.log(`Promosso a nutrizionista!`);
  console.log(`  ID: ${inserted.id}`);
  console.log(`  Display name: ${inserted.displayName}`);
  console.log(`\nOra puoi fare login con "${email}" e verrai rediretto a /nutrizionista\n`);
}

main().catch((err) => {
  console.error("Errore:", err);
  process.exit(1);
});
