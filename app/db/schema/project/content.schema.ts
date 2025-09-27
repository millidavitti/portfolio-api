import { createId } from "@paralleldrive/cuid2";
import { check, text } from "drizzle-orm/pg-core";
import { pgTable, integer } from "drizzle-orm/pg-core";
import z from "zod";
import { projectSchema } from "../project.schema";
import { sql } from "drizzle-orm";

export const projectContentSchema = pgTable(
	"project_content",
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => createId()),
		projectId: text()
			.notNull()
			.references(() => projectSchema.id, { onDelete: "cascade" }),
		type: text().notNull(),
		position: integer().notNull(),
		url: text(),
		caption: text(),
		markdown: text(),
	},
	(table) => [
		check(
			"project_content_type",
			sql`${table.type} in ('image','video','markdown') `,
		),
	],
);

export const ZodProjectContent = z.object({
	id: z.string().cuid2().optional(),
	type: z.enum(["image", "video", "markdown"]),
	position: z.number(),
	url: z.string().url().nullable().optional(),
	caption: z.string().optional().nullable().optional(),
	markdown: z.string().optional().nullable().optional(),
});

export type ProjectContent = z.infer<typeof ZodProjectContent>;
