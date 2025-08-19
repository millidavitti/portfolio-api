import { createId } from "@paralleldrive/cuid2";
import { AnyPgColumn, pgTable, text } from "drizzle-orm/pg-core";
import { userSchema } from "app/db/schema/user.schema";

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
