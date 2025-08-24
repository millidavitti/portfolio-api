import { prepareDb } from "@db/connect-db";
import { socialsSchema } from "@db/schema/socials.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { eq, desc } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareGetSocials(dbUrl: string) {
	return async (userId: string) => {
		try {
			const db = prepareDb(dbUrl);
			const socials = await db
				.select()
				.from(socialsSchema)
				.where(eq(socialsSchema.userId, userId))
				.orderBy(desc(socialsSchema.updatedAt));

			return socials;
		} catch (error) {
			generateErrorLog("prepareGetSocials:", error);
			throw new HTTPException(400, {
				message: "We were unable to get your socials",
			});
		}
	};
}
