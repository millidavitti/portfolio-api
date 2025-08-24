import { prepareDb } from "@db/connect-db";
import { Technology, technologySchema } from "@db/schema/technology.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { notInArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareUpdateTechnologies(dbUrl: string) {
	return async (technologies: Technology[]) => {
		try {
			const db = prepareDb(dbUrl);
			return await db.transaction(async (tx) => {
				await tx.delete(technologySchema).where(
					notInArray(
						technologySchema.id,
						technologies.map(({ id }) => id),
					),
				);
				if (technologies.length)
					return await tx
						.insert(technologySchema)
						.values(technologies)
						.onConflictDoNothing()
						.returning();
			});
		} catch (error) {
			generateErrorLog("@prepareUpdateTechnologies:", error);
			throw new HTTPException(400, {
				message: "We were unable to update your technologies",
			});
		}
	};
}
