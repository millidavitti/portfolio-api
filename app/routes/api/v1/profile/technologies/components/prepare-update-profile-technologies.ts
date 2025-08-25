import { prepareDb } from "@db/connect-db";
import { profileTechnologySchema } from "@db/schema/profile-technology.schema";
import { Technology, ZodTechnology } from "@db/schema/technology.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { and, eq, notInArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareUpdateProfileTechnologies(dbUrl: string) {
	return async (profileId: string, profileTechnologies: Technology[]) => {
		try {
			const db = prepareDb(dbUrl);
			await db.transaction(async (tx) => {
				await tx.delete(profileTechnologySchema).where(
					and(
						eq(profileTechnologySchema.profileId, profileId),
						notInArray(
							profileTechnologySchema.technologyId,
							profileTechnologies.map((technology) => technology.id),
						),
					),
				);
				if (profileTechnologies.length)
					await tx
						.insert(profileTechnologySchema)
						.values(
							profileTechnologies.map((technology) => ({
								profileId,
								technologyId: technology.id,
							})),
						)
						.onConflictDoNothing();
			});
		} catch (error) {
			generateErrorLog("@prepareUpdateProfileTechnologies", error);
			throw new HTTPException(400, {
				message: "We were unable to update your profile technologies",
			});
		}
	};
}
