import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "drizzle-seed";
import * as schema from "./schema/index";

export async function rolesSeeder() {
  const db = drizzle(process.env.DATABASE_URL!);
  await seed(db, schema).refine((f) => ({
    roles: {},
  }));
}
