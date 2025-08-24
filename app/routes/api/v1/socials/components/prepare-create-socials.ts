import { prepareDb } from "@db/connect-db";
import { Socials, socialsSchema } from "@db/schema/socials.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { HTTPException } from "hono/http-exception";

export function prepareCreateSocials(dbUrl: string) {
	return async (userId: string, socials: Socials) => {
		try {
			const db = prepareDb(dbUrl);
			const [result] = await db
				.insert(socialsSchema)
				.values({
					...socials,
					userId,
				})
				.returning();

			return result;
		} catch (error) {
			generateErrorLog("prepareCreateSocials:", error);
			throw new HTTPException(400, {
				message: "We were unable to add your socials",
			});
		}
	};
}
