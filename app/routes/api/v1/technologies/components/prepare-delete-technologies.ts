import { prepareDb } from "@db/connect-db";
import { technologySchema } from "@db/schema/technology.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareDeleteTechnologies(dbUrl: string) {
	return async (technologyId: string) => {
		try {
			const db = prepareDb(dbUrl);
			const [result] = await db
				.delete(technologySchema)
				.where(eq(technologySchema.id, technologyId))
				.returning();
			return result;
		} catch (error) {
			generateErrorLog("@prepareDeleteTechnologies:", error);
			throw new HTTPException(400, {
				message: "You were unable to delete your technologies",
			});
		}
	};
}
