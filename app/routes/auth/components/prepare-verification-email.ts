import { emailVerificationTemplate } from "./email/email-verification";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { HTTPException } from "hono/http-exception";

export function prepareVerificationEmail(email: string, token: string) {
	return async (apikey: string, from: string, origin: string) => {
		try {
			const emailVerificationLink = `${origin}/auth/sign-up/verify-email/?token=${token}`;
			console.log("emailVerificationLink:", emailVerificationLink);

			await fetch("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${apikey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					from,
					to: email,
					subject: "Verify your email address",
					html: emailVerificationTemplate(emailVerificationLink),
				}),
			});
		} catch (error) {
			generateErrorLog("@prepareVerificationEmail", error);
			throw new HTTPException(400, {
				message: JSON.stringify({
					message: "We were unable to send a verification email to " + email,
				}),
			});
		}
	};
}
