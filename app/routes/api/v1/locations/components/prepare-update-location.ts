import { prepareDb } from "@db/connect-db";
import { Location, locationSchema } from "@db/schema/location.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { HTTPException } from "hono/http-exception";

export function prepareUpdateLocation(dbUrl: string) {
	return async (userId: string, update: Location) => {
		try {
			const db = prepareDb(dbUrl);
			const [result] = await db
				.insert(locationSchema)
				.values({
					...update,
					userId,
				})
				.onConflictDoUpdate({
					target: locationSchema.userId,
					set: { ...update },
				})
				.returning();
			return result;
		} catch (error) {
			generateErrorLog("@prepareUpdateLocation", error);
			throw new HTTPException(400, {
				message: "We were unable to update your location",
			});
		}
	};
}
