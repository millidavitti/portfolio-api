import { createId } from "@paralleldrive/cuid2";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { projectSchema } from "../project.schema";
import z from "zod";

export const projectMarkdownSchema = pgTable("project_markdowns", {
	id: text()
		.primaryKey()
		.$defaultFn(() => createId()),
	projectId: text()
		.notNull()
		.references(() => projectSchema.id, { onDelete: "cascade" }),
	type: text()
		.notNull()
		.$defaultFn(() => "markdown"),
	markdown: text().notNull(),
	position: integer().notNull(),
});

export const ZodProjectMarkdown = z.object({
	id: z.string().cuid2().default(createId()),
	type: z.enum(["markdown"]),
	markdown: z.string(),
	position: z.number(),
});

export type ProjectMarkdown = z.infer<typeof ZodProjectMarkdown>;
