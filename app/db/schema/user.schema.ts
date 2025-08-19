import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { timestamps } from "app/helpers/timestamp";

export const userSchema = pgTable("users", {
	id: text()
		.primaryKey()
		.notNull()
		.$defaultFn(() => createId()),
	name: text().notNull(),
	email: text("email").unique().notNull(),
	emailVerified: timestamp("email_verified"),
	image: text(),
	video: text(),
	...timestamps,
});
