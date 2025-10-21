import { createId } from "@paralleldrive/cuid2";
import { AnyPgColumn, text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { profileSchema } from "./profile.schema";
import z from "zod";

export const projectSchema = pgTable("projects", {
	id: text()
		.primaryKey()
		.$defaultFn(() => createId()),
	profileId: text("profile_id")
		.notNull()
		.references((): AnyPgColumn => profileSchema.id, { onDelete: "cascade" }),
	title: text().notNull(),
	description: text().notNull(),
	repository: text(),
	deployment: text(),
	thumbnail: text().notNull(),
});

export const ZodProject = z.object({
	id: z.string().cuid2().optional(),
	title: z.string(),
	description: z.string(),
	thumbnail: z.string().url(),
	repository: z.string().url(),
	deployment: z.string().url().nullable(),
});
export type Project = z.infer<typeof ZodProject>;
