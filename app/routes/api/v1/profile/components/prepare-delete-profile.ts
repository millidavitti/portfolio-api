import { prepareDb } from "@db/connect-db";
import { profileSchema } from "@db/schema/profile.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareDeleteProfile(dbUrl: string) {
	return async (profileId: string) => {
		try {
			const db = prepareDb(dbUrl);
			const [result] = await db
				.delete(profileSchema)
				.where(eq(profileSchema.id, profileId))
				.returning();

			return result;
		} catch (error) {
			generateErrorLog("@prepareDeleteProfile", error);
			throw new HTTPException(400, {
				message: "We were unable to delete your profile",
			});
		}
	};
}
