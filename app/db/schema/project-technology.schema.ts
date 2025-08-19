import { primaryKey, text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { projectSchema } from "./project.schema";
import { technologySchema } from "./technology.schema";

export const projectTechnologySchema = pgTable(
	"project_technologies",
	{
		projectId: text("project_id")
			.notNull()
			.references(() => projectSchema.id, { onDelete: "cascade" }),
		technologyId: text("technology_id")
			.notNull()
			.references(() => technologySchema.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({
			name: "project_technology",
			columns: [table.projectId, table.technologyId],
		}),
	],
);
