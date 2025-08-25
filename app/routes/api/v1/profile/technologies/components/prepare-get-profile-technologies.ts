import { prepareDb } from "@db/connect-db";
import { profileTechnologySchema } from "@db/schema/profile-technology.schema";
import { technologySchema } from "@db/schema/technology.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { groupByField } from "app/helpers/group-by-fields";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareGetProfileTechnologies(dbUrl: string) {
	return async (profileId: string) => {
		try {
			const db = prepareDb(dbUrl);
			const results = await db
				.select()
				.from(profileTechnologySchema)
				.where(eq(profileTechnologySchema.profileId, profileId))
				.leftJoin(
					technologySchema,
					eq(technologySchema.id, profileTechnologySchema.technologyId),
				);
			if (results.length) {
				const [{ technologies }] = groupByField({
					data: results,
					aggregateFields: {
						technologies: "technologies",
					},
					primaryKey: "profile_technologies",
				});

				return technologies;
			} else return results;
		} catch (error) {
			generateErrorLog("@prepareGetProfileTechnologies", error);
			throw new HTTPException(400, {
				message: "We were unable to get your profile technologies",
			});
		}
	};
}
