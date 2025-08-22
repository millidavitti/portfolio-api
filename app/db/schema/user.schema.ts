import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { timestamps } from "app/helpers/timestamp";
import z from "zod";

export const userSchema = pgTable("users", {
	id: text()
		.primaryKey()
		.notNull()
		.$defaultFn(() => createId()),
	name: text().notNull(),
	email: text("email").unique().notNull(),
	emailVerified: timestamp("email_verified"),
	image: text(),
	video: text(),
	...timestamps,
});
export type User = typeof userSchema.$inferInsert;

export const ZodUser = z.object({
	name: z.string(),
	email: z.string().email(),
	id: z.string().cuid2().optional(),
	emailVerified: z.date().nullable().optional(),
	image: z.string().nullable().optional(),
	video: z.string().nullable().optional(),
	updatedAt: z.date().nullable().optional(),
	createdAt: z.date().optional(),
});
