import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/*
  Lazily-initialized database client.

  In this template's dev environment the health endpoint needs
  DATABASE_URL, but the app itself is local-first and should build
  and run without any env configured. Deferring the connection
  (and its error) to first use — rather than module import — keeps
  builds green everywhere.
*/
const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsPostgresqlDb?: ReturnType<typeof drizzle>;
};

type Db = ReturnType<typeof drizzle>;

function createDb(): Db {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for the health endpoint");
  }

  globalForDb.__arenaNextJsPostgresqlPool ??= new Pool({
    connectionString: databaseUrl,
  });
  return drizzle(globalForDb.__arenaNextJsPostgresqlPool);
}

/** Returns the database client, creating it on first use. */
export function getDb(): Db {
  globalForDb.__arenaNextJsPostgresqlDb ??= createDb();
  return globalForDb.__arenaNextJsPostgresqlDb;
}
