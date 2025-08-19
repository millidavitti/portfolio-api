import { createId } from "@paralleldrive/cuid2";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { projectSchema } from "../project.schema";

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
