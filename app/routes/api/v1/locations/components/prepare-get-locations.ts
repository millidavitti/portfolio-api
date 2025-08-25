import { prepareDb } from "@db/connect-db";
import { locationSchema } from "@db/schema/location.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareGetLocation(dbUrl: string) {
	return async (userId: string) => {
		try {
			const db = prepareDb(dbUrl);
			const [result] = await db
				.select()
				.from(locationSchema)
				.where(eq(locationSchema.userId, userId));

			return result;
		} catch (error) {
			generateErrorLog("@prepareGetLocation", error);
			throw new HTTPException(400, {
				message: "We were unable to get your location",
			});
		}
	};
}
