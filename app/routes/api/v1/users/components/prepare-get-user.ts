import { prepareDb } from "@db/connect-db";
import { userSchema } from "@db/schema/user.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareGetUser(dbUrl: string) {
	return async (userId: string) => {
		try {
			const db = prepareDb(dbUrl);
			const [user] = await db
				.select()
				.from(userSchema)
				.where(eq(userSchema.id, userId));

			return user;
		} catch (error) {
			generateErrorLog("@prepareGetUser", error);
			throw new HTTPException(400, {
				message: JSON.stringify({
					message: "We were unable to retrieve your data",
				}),
			});
		}
	};
}
