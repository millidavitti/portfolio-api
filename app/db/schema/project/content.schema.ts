import { createId } from "@paralleldrive/cuid2";
import { text } from "drizzle-orm/pg-core";
import { pgTable, integer } from "drizzle-orm/pg-core";
import z from "zod";
import { projectSchema } from "../project.schema";

export const projectContentSchema = pgTable("project_content", {
	id: text()
		.primaryKey()
		.$defaultFn(() => createId()),
	projectId: text()
		.notNull()
		.references(() => projectSchema.id, { onDelete: "cascade" }),
	type: text()
		.notNull()
		.$defaultFn(() => "image"),
	position: integer().notNull(),
	url: text(),
	caption: text(),
	markdown: text(),
});

export const ZodProjectContent = z.object({
	id: z.string().cuid2().optional(),
	type: z.enum(["image"]),
	position: z.number(),
	url: z.string().url().nullable(),
	caption: z.string().optional().nullable(),
	markdown: z.string().optional().nullable(),
});

export type ProjectImage = z.infer<typeof ZodProjectContent>;
