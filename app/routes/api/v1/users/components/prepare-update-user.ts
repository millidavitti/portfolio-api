import { prepareDb } from "@db/connect-db";
import { User, userSchema } from "@db/schema/user.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareUpdateUser(dbUrl: string) {
	return async (userId: string, update: Partial<User>) => {
		try {
			const db = prepareDb(dbUrl);
			const [result] = await db
				.update(userSchema)
				.set(update)
				.where(eq(userSchema.id, userId))
				.returning();
			return result;
		} catch (error) {
			generateErrorLog("@prepareUpdateUser:", error);
			throw new HTTPException(400, {
				message: JSON.stringify({
					message: "Your update was not applied",
				}),
			});
		}
	};
}
