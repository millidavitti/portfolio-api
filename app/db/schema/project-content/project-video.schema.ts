import { createId } from "@paralleldrive/cuid2";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { projectSchema } from "../project.schema";
import z from "zod";

export const projectVideoSchema = pgTable("project_videos", {
	id: text()
		.primaryKey()
		.$defaultFn(() => createId()),
	projectId: text()
		.notNull()
		.references(() => projectSchema.id, { onDelete: "cascade" }),
	type: text()
		.notNull()
		.$defaultFn(() => "video"),
	url: text().notNull(),
	caption: text(),
	position: integer().notNull(),
});

export const ZodProjectVideo = z.object({
	id: z.string().cuid2().default(createId()),
	type: z.enum(["video"]),
	url: z.string().url(),
	position: z.number(),
	caption: z.string().optional().nullable(),
});

export type ProjectVideo = z.infer<typeof ZodProjectVideo>;
