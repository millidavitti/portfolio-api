import { prepareDb } from "@db/connect-db";
import { Profile, profileSchema } from "@db/schema/profile.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareUpdateProfile(dbUrl: string) {
	return async (update: Partial<Profile>) => {
		try {
			const db = prepareDb(dbUrl);

			const [result] = await db
				.update(profileSchema)
				.set(update)
				.where(eq(profileSchema.id, update.id!))
				.returning();

			return result;
		} catch (error) {
			generateErrorLog("@prepareUpdateProfile", error);
			throw new HTTPException(400, {
				message: "We were unable to update your profile",
			});
		}
	};
}
