import { Pool as NeonPool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool as PgPool } from "pg";
import * as relations from "./relations";
import * as schema from "./schema";

const schemaConfig = { ...schema, ...relations };
const url = process.env.DATABASE_URL ?? "";

export const db =
  process.env.NODE_ENV === "production"
    ? drizzleNeon({
        client: new NeonPool({ connectionString: url }),
        schema: schemaConfig,
      })
    : drizzlePg({
        client: new PgPool({ connectionString: url }),
        schema: schemaConfig,
      });
