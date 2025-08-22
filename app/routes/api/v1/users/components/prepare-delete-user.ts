import { prepareDb } from "@db/connect-db";
import { userSchema } from "@db/schema/user.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { eq } from "drizzle-orm";

export function prepareDeleteUser(dbUrl: string) {
	return async (userId: string) => {
		try {
			const db = prepareDb(dbUrl);
			const [user] = await db
				.delete(userSchema)
				.where(eq(userSchema.id, userId))
				.returning();
			return user;
		} catch (error) {
			generateErrorLog("@prepareDeleteUser", error);
			throw new Error(getErrorMessage(error));
		}
	};
}
