import { createId } from "@paralleldrive/cuid2";
import { AnyPgColumn, pgEnum, text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { userSchema } from "./user.schema";
import { timestamps } from "@db/helpers/timestamp";

export const socialMediaPlatformEnum = pgEnum("social_media_platform_enum", [
	"Facebook",
	"Instagram",
	"X / Twitter",
	"TikTok",
	"LinkedIn",
	"Snapchat",
	"Pinterest",
	"Reddit",
	"YouTube",
	"WhatsApp",
	"Telegram",
	"Discord",
	"WeChat",
	"Threads",
	"Tumblr",
]);
export const socialsSchema = pgTable("socials", {
	id: text()
		.primaryKey()
		.$defaultFn(() => createId()),
	userId: text()
		.notNull()
		.references((): AnyPgColumn => userSchema.id, { onDelete: "cascade" }),
	platform: socialMediaPlatformEnum().notNull(),
	profile: text().notNull(),
	...timestamps,
});
