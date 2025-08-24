import { prepareDb } from "@db/connect-db";
import { profileSchema } from "@db/schema/profile.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { eq, desc } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareGetProfiles(dbUrl: string) {
	return async (userId: string) => {
		try {
			const db = prepareDb(dbUrl);
			const results = await db
				.select({
					id: profileSchema.id,
					availability: profileSchema.availability,
					title: profileSchema.title,
					hourlyRate: profileSchema.hourlyRate,
					overview: profileSchema.overview,
				})
				.from(profileSchema)
				.where(eq(profileSchema.userId, userId))
				.orderBy(desc(profileSchema.updatedAt));

			return results;
		} catch (error) {
			generateErrorLog("@prepareGetProfiles", error);
			throw new HTTPException(400, {
				message: "We were unable to load your profiles",
			});
		}
	};
}
