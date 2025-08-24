import { createId } from "@paralleldrive/cuid2";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { projectSchema } from "../project.schema";
import z from "zod";

export const projectImageSchema = pgTable("project_images", {
	id: text()
		.primaryKey()
		.$defaultFn(() => createId()),
	projectId: text()
		.notNull()
		.references(() => projectSchema.id, { onDelete: "cascade" }),
	type: text()
		.notNull()
		.$defaultFn(() => "image"),
	url: text().notNull(),
	caption: text(),
	position: integer().notNull(),
});

export const ZodProjectImage = z.object({
	id: z.string().cuid2().optional(),
	type: z.enum(["image"]),
	url: z.string().url(),
	position: z.number(),
	caption: z.string().optional().nullable(),
});

export type ProjectImage = z.infer<typeof ZodProjectImage>;
