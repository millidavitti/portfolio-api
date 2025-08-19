import { db } from "@db/connect-db";
import { userSchema } from "@db/schema/user.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { HTTPException } from "hono/http-exception";

export function prepareCreateUser(email: string, name: string) {
	return async (dbUrl: string) => {
		try {
			const [result] = await db(dbUrl)
				.insert(userSchema)
				.values({ email, name })
				.returning();

			return result;
		} catch (error) {
			generateErrorLog("@prepareCreateUser", error);
			throw new HTTPException(400, {
				message: JSON.stringify({
					message: "Sign in to continue. You have an account",
				}),
			});
		}
	};
}
