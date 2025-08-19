import { primaryKey, text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { technologySchema } from "./technology.schema";
import { profileSchema } from "./profile.schema";

export const profileTechnologySchema = pgTable(
	"profile_technologies",
	{
		profileId: text("profile_id")
			.notNull()
			.references(() => profileSchema.id, { onDelete: "cascade" }),
		technologyId: text("technology_id")
			.notNull()
			.references(() => technologySchema.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({
			name: "profile_technology",
			columns: [table.profileId, table.technologyId],
		}),
	],
);
