import { prepareDb } from "@db/connect-db";
import { socialsSchema } from "@db/schema/socials.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareDeleteSocials(dbUrl: string) {
	return async (socialsId: string) => {
		try {
			const db = prepareDb(dbUrl);
			const [result] = await db
				.delete(socialsSchema)
				.where(eq(socialsSchema.id, socialsId))
				.returning();

			return result;
		} catch (error) {
			generateErrorLog("@prepareDeleteSocials:", error);
			throw new HTTPException(400, {
				message: "We were unable to delete your socials",
			});
		}
	};
}
