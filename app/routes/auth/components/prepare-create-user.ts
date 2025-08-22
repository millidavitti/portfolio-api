import { prepareDb } from "@db/connect-db";
import { userSchema } from "@db/schema/user.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { HTTPException } from "hono/http-exception";

export function prepareCreateUser(dbUrl: string) {
	return async (email: string, name: string) => {
		try {
			const [result] = await prepareDb(dbUrl)
				.insert(userSchema)
				.values({ email, name, emailVerified: new Date() })
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
