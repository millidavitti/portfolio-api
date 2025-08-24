import { prepareDb } from "@db/connect-db";
import { projectSchema } from "@db/schema/project.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareDeleteProject(dbUrl: string) {
	return async (projectId: string) => {
		try {
			const db = prepareDb(dbUrl);
			const [result] = await db
				.delete(projectSchema)
				.where(eq(projectSchema.id, projectId))
				.returning();

			return result;
		} catch (error) {
			generateErrorLog("@prepareDeleteProject", error);
			throw new HTTPException(400, {
				message: "You were unable to delete your project",
			});
		}
	};
}
