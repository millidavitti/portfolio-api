import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

export const prepareDb = (databaseUrl: string) => drizzle(databaseUrl);
