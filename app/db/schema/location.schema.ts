import { createId } from "@paralleldrive/cuid2";
import { AnyPgColumn, pgTable, text } from "drizzle-orm/pg-core";
import { userSchema } from "app/db/schema/user.schema";
import z from "zod";

export const locationSchema = pgTable("locations", {
	id: text()
		.notNull()
		.primaryKey()
		.$defaultFn(() => createId()),
	userId: text("user_id")
		.unique()
		.notNull()
		.references((): AnyPgColumn => userSchema.id, { onDelete: "cascade" }),
	city: text().notNull(),
	country: text().notNull(),
});

export const ZodLocation = z.object({
	id: z.string().min(1),
	userId: z.string().min(1),
	city: z.string().min(1),
	country: z.string().min(1),
});

export type Location = z.infer<typeof ZodLocation>;
