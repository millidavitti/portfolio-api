import { db } from "@db/connect-db";
import { userSchema } from "@db/schema/user.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export function prepareGetUser(email: string) {
	return async (dbUrl: string) => {
		try {
			const [result] = await db(dbUrl)
				.select({
					id: userSchema.id,
					name: userSchema.name,
					image: userSchema.image,
					video: userSchema.video,
				})
				.from(userSchema)
				.where(eq(userSchema.email, email));

			if (!result)
				throw new HTTPException(400, {
					message: JSON.stringify({
						message: "Sign up to continue. You do not have an account",
					}),
				});

			return result;
		} catch (error) {
			generateErrorLog("@prepareGetUser", error);
			if (error instanceof HTTPException)
				throw new HTTPException(400, {
					message: JSON.stringify({
						message: JSON.parse(getErrorMessage(error)).message,
					}),
				});
			throw new HTTPException(400, {
				message: JSON.stringify({
					message: "We can not retrieve your data at the moment",
				}),
			});
		}
	};
}
