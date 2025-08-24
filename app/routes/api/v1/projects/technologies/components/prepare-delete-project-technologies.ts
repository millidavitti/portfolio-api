import { prepareDb } from "@db/connect-db";
import { projectTechnologySchema } from "@db/schema/project-technology.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareDeleteProjectTechnology(dbUrl: string) {
	return async (projectId: string, technologyId: string) => {
		try {
			const db = prepareDb(dbUrl);
			const results = await db
				.delete(projectTechnologySchema)
				.where(
					and(
						eq(projectTechnologySchema.projectId, projectId),
						eq(projectTechnologySchema.technologyId, technologyId),
					),
				);
			return results;
		} catch (error) {
			generateErrorLog("@prepareDeleteProjectTechnology:", error);
			throw new HTTPException(400, {
				message: "You were unable to delete your project technologies",
			});
		}
	};
}
