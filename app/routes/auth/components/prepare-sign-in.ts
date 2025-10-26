import { signInTemplate } from "@db/email/templates/magic-link.template";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { HTTPException } from "hono/http-exception";

export function prepareSignIn(apikey: string, from: string, origin: string) {
	return async (email: string, token: string) => {
		try {
			const magicLink = `${origin}/auth/api/sign-in?token=${token}`;
			await fetch("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${apikey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					from,
					to: email,
					subject: "Sign In",
					html: signInTemplate(magicLink),
				}),
			});
		} catch (error) {
			generateErrorLog("@prepareMagicLink", error);
			throw new HTTPException(400, {
				message: JSON.stringify({
					message: "Sign in again. Something went wrong",
				}),
			});
		}
	};
}
