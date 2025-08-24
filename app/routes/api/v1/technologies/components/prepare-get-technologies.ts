import { prepareDb } from "@db/connect-db";
import { technologySchema } from "@db/schema/technology.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { HTTPException } from "hono/http-exception";

export function prepareGetTechnologies(dbUrl: string) {
	return async () => {
		try {
			const db = prepareDb(dbUrl);
			return await db.select().from(technologySchema);
		} catch (error) {
			generateErrorLog("@prepareGetTechnologies:", error);
			throw new HTTPException(400, {
				message: JSON.stringify({
					message: "We were unable to get your technologies",
				}),
			});
		}
	};
}
