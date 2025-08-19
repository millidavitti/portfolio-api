import { createId } from "@paralleldrive/cuid2";
import { text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const technologySchema = pgTable("technologies", {
	id: text()
		.notNull()
		.primaryKey()
		.$defaultFn(() => createId()),
	name: text().notNull().unique(),
});
