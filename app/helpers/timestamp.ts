import { timestamp } from "drizzle-orm/pg-core";

// columns.helpers.ts
export const timestamps = {
	updatedAt: timestamp("updated_at").$onUpdateFn(() => new Date()),
	createdAt: timestamp("created_at").defaultNow().notNull(),
};
