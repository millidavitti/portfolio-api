import { createId } from "@paralleldrive/cuid2";
import { integer, pgEnum, text } from "drizzle-orm/pg-core";
import { AnyPgColumn, pgTable } from "drizzle-orm/pg-core";
import { userSchema } from "./user.schema";
import { z } from "zod";
import { timestamps } from "app/helpers/timestamp";

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

export const ZodProfile = z.object({
	id: z.string(),
	userId: z.string(),
	availability: z.enum([
		"More than 30 hrs/week",
		"Less than 30 hrs/week",
		"As needed - open to offers",
		"None",
	]), // adjust to match your enum definition
	title: z.string(),
	hourlyRate: z.number().int(),
	overview: z.string().nullable().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type Profile = z.infer<typeof ZodProfile>;
