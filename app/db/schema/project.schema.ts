import { createId } from "@paralleldrive/cuid2";
import { AnyPgColumn, text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { profileSchema } from "./profile.schema";

export const projectSchema = pgTable("projects", {
	id: text()
		.primaryKey()
		.$defaultFn(() => createId()),
	profileId: text("profile_id")
		.notNull()
		.references((): AnyPgColumn => profileSchema.id, { onDelete: "cascade" }),
	title: text().notNull(),
	description: text().notNull(),
	thumbnail: text().notNull(),
});
