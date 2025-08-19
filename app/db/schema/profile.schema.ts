import { createId } from "@paralleldrive/cuid2";
import { integer, pgEnum, text } from "drizzle-orm/pg-core";
import { AnyPgColumn, pgTable } from "drizzle-orm/pg-core";
import { userSchema } from "./user.schema";
import { timestamps } from "@db/helpers/timestamp";

export const availabilityEnum = pgEnum("availability_enum", [
	"More than 30 hrs/week",
	"Less than 30 hrs/week",
	"As needed - open to offers",
	"None",
]);

export const profileSchema = pgTable("profiles", {
	id: text()
		.primaryKey()
		.$defaultFn(() => createId()),
	userId: text("user_id")
		.notNull()
		.references((): AnyPgColumn => userSchema.id, { onDelete: "cascade" }),
	availability: availabilityEnum().$defaultFn(() => "None"),
	title: text()
		.notNull()
		.$defaultFn(() => "Replace With Your Job Title"),
	hourlyRate: integer("hourly_rate").default(0),
	overview: text(),
	...timestamps,
});
