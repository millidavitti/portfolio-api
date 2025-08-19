import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

export const db = (databaseUrl: string) => drizzle(databaseUrl);
