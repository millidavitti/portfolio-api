import { createId } from "@paralleldrive/cuid2";
import { text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import z from "zod";

export const technologySchema = pgTable("technologies", {
	id: text()
		.notNull()
		.primaryKey()
		.$defaultFn(() => createId()),
	name: text().notNull().unique(),
});

export const ZodTechnology = z.object({
	id: z.string().cuid2(),
	name: z.string(),
});
export type Technology = z.infer<typeof ZodTechnology>;
