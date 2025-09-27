import { prepareDb } from "@db/connect-db";
import { Profile, profileSchema } from "@db/schema/profile.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { HTTPException } from "hono/http-exception";

export function prepareCreateProfile(dbUrl: string) {
	return async (userId: string, profile: Partial<Profile>) => {
		try {
			const db = prepareDb(dbUrl);
			const [result] = await db

				.insert(profileSchema)
				.values({
					...profile,
					userId,
				})
				.returning();

			return result;
		} catch (error) {
			generateErrorLog("@prepareCreateProfile", error);
			throw new HTTPException(400, {
				message: "We were unable to create your profile",
			});
		}
	};
}
