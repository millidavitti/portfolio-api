import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";
import { generateErrorLog } from "./generate-error-log";

export async function verfiyToken(
	token: string,
	secret: string,
	message: string = "Sign in to continue",
) {
	try {
		return await verify(token, secret);
	} catch (error) {
		generateErrorLog("@verifyToken:", error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.stringify({
					message,
				}),
			});
	}
}
