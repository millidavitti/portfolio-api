import { prepareDb } from "@db/connect-db";
import { Socials, socialsSchema } from "@db/schema/socials.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareUpdateSocials(dbUrl: string) {
	return async (socials: Socials) => {
		try {
			const db = prepareDb(dbUrl);
			const [result] = await db
				.update(socialsSchema)
				.set(socials)
				.where(eq(socialsSchema.id, socials.id!))
				.returning();

			return result;
		} catch (error) {
			generateErrorLog("@prepareUpdateSocials:", error);
			throw new HTTPException(400, {
				message: "We were unable to update your socials",
			});
		}
	};
}
