import { prepareDb } from "@db/connect-db";
import { projectContentSchema } from "@db/schema/project/content.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareGetProjectContent(dbUrl: string) {
	return async (projectId: string) => {
		try {
			const db = prepareDb(dbUrl);

			const content = await db
				.select()
				.from(projectContentSchema)
				.where(eq(projectContentSchema.projectId, projectId));

			return content;
		} catch (error) {
			generateErrorLog("@prepareGetProjectContent:", error);
			throw new HTTPException(400, {
				message: "You were unable to get your project content",
			});
		}
	};
}
