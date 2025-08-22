import { prepareDb } from "@db/connect-db";
import { userSchema } from "@db/schema/user.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { HTTPException } from "hono/http-exception";

export function prepareGetUsers(dbUrl: string) {
	return async () => {
		try {
			const db = prepareDb(dbUrl);
			const users = await db.select().from(userSchema);
			return users;
		} catch (error) {
			generateErrorLog("@prepareGetUsers", error);
			throw new HTTPException(400, {
				message: JSON.stringify({
					message: "We were unable to get users",
				}),
			});
		}
	};
}
