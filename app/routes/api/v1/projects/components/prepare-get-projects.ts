import { prepareDb } from "@db/connect-db";
import { projectSchema } from "@db/schema/project.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareGetProjects(dbUrl: string) {
	return async (profileId: string) => {
		try {
			const db = prepareDb(dbUrl);
			const results = await db
				.select()
				.from(projectSchema)
				.where(eq(projectSchema.profileId, profileId));

			return results;
		} catch (error) {
			generateErrorLog("@prepareGetProjects:", error);
			throw new HTTPException(400, {
				message: "You were unable to get your projects",
			});
		}
	};
}
