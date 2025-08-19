import { createId } from "@paralleldrive/cuid2";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { projectSchema } from "../project.schema";

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
