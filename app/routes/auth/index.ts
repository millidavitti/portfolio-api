import { Hono } from "hono";
import { prepareVerificationEmail } from "./components/prepare-verification-email";
import { createId } from "@paralleldrive/cuid2";
import { env } from "hono/adapter";
import { WorkerBindings } from "app/cloudflare/bindings.worker";
import { sign } from "hono/jwt";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { getErrorMessage } from "app/helpers/get-error-message";
import { toSeconds } from "app/helpers/to-seconds";
import { prepareCreateUser } from "./components/prepare-create-user";
import { prepareSendMagicLink } from "./components/prepare-magic-link.model";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { prepareGetUser } from "./components/prepare-get-user";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { CookieOptions } from "hono/utils/cookie";
import { verfiyToken } from "app/helpers/verify-token";
const auth = new Hono<{ Bindings: WorkerBindings }>();

auth.post(
	"/sign-up",
	zValidator(
		"json",
		z.object({
			email: z.string().email(),
			name: z.string(),
		}),
	),
	async (c) => {
		try {
			const { RESEND_APIKEY, RESEND_FROM, ORIGIN, AUTH_SECRET } = env(c);
			const { email, name } = c.req.valid("json");
			const cookie = await sign(
				{
					email,
					name,
					token: createId(),
					iss: "portfolio",
					iat: Math.floor(Date.now() / 1000),
					exp: Math.floor(Date.now() / 1000) + toSeconds(5, "minute"),
				},
				AUTH_SECRET,
			);

			const sendVerificationEmail = prepareVerificationEmail(
				RESEND_APIKEY,
				RESEND_FROM,
				ORIGIN,
			);
			await sendVerificationEmail(email, cookie);

			setCookie(c, "portfolio.authenticating", cookie, host);

			return c.json({
				message: `An email has been sent to ${email}`,
			});
		} catch (error) {
			generateErrorLog("auth/sign-up", error);
			if (error instanceof HTTPException)
				throw new HTTPException(400, {
					message: JSON.stringify({
						message: JSON.parse(getErrorMessage(error)).message,
					}),
				});

			throw new HTTPException(400, {
				message: JSON.stringify({
					message: "Sign up again. Something went wrong",
				}),
			});
		}
	},
);

auth.get("/verify-email/:token", async (c) => {
	try {
		const { AUTH_SECRET, PORTFOLIO_HYPERDRIVE } = env(c);
		const verificationToken = c.req.param("token");
		const cookie = getCookie(c, "portfolio.authenticating", "host");

		if (verificationToken !== cookie)
			throw new HTTPException(401, {
				message: "Sign up again. Something aint right",
			});
		const payload = await verfiyToken(
			verificationToken,
			AUTH_SECRET,
			"Sign up again",
		);

		const createUser = prepareCreateUser(PORTFOLIO_HYPERDRIVE.connectionString);
		const user = await createUser(
			payload?.email as string,
			payload?.name as string,
		);
		const token = await (async () => {
			try {
				return await sign(
					{
						email: payload?.email,
						name: payload?.email,
						sub: user?.id,
						iss: "portfolio",
						iat: Math.floor(Date.now() / 1000),
						exp: toSeconds(7, "day"),
					},
					AUTH_SECRET,
				);
			} catch (error) {
				generateErrorLog("@cookie:", error);
				throw new HTTPException(401, {
					message: JSON.stringify({
						message: "Sign up again. Your email was not verified",
					}),
				});
			}
		})();

		setCookie(c, "portfolio.authenticated", token, host);

		return c.json({
			message: "You are now signed in",
		});
	} catch (error) {
		generateErrorLog("auth.get@/verify-email", error);
		if (error instanceof HTTPException)
			throw new HTTPException(401, {
				message: JSON.stringify({
					message: JSON.parse(getErrorMessage(error)).message,
				}),
			});
		throw new HTTPException(401, {
			message: JSON.stringify({
				message: "Sign up again. Your email was not verified",
			}),
		});
	}
});

auth.post(
	"/send-magic-link",
	zValidator("json", z.object({ email: z.string().email() })),
	async (c) => {
		try {
			const { AUTH_SECRET, ORIGIN, RESEND_APIKEY, RESEND_FROM } = env(c);
			const { email } = c.req.valid("json");
			const token = await sign(
				{
					email,
					iss: "portfolio",
					iat: Math.floor(Date.now() / 1000),
					exp: Math.floor(Date.now() / 1000) + toSeconds(5, "minute"),
				},
				AUTH_SECRET,
			);

			const sendMagicLink = prepareSendMagicLink(
				RESEND_APIKEY,
				RESEND_FROM,
				ORIGIN,
			);
			await sendMagicLink(email, token);

			setCookie(c, "portfolio.authenticating", token, host);

			return c.json({ message: "A magic link has been sent to " + email });
		} catch (error) {
			generateErrorLog("auth.post@/send-magic-link", error);
			if (error instanceof HTTPException)
				throw new HTTPException(401, {
					message: JSON.stringify({
						message: JSON.parse(getErrorMessage(error)).message,
					}),
				});

			throw new HTTPException(401, {
				message: JSON.stringify({
					message: "Sign up again. Your email has not been verified",
				}),
			});
		}
	},
);

auth.get("/sign-in", async (c) => {
	try {
		const { AUTH_SECRET, PORTFOLIO_HYPERDRIVE } = env(c);
		const cookie = getCookie(c, "portfolio.authenticating", "host") || "";
		const payload = await verfiyToken(cookie, AUTH_SECRET);

		const getUser = prepareGetUser(payload?.email as string);
		const user = await getUser(PORTFOLIO_HYPERDRIVE.connectionString);
		const token = await sign(
			{
				...payload,
				sub: user.id,
				exp: toSeconds(7, "day"),
			},
			AUTH_SECRET,
		);
		deleteCookie(c, "portfolio.authenticating", host);
		setCookie(c, "portfolio.authenticated", token, host);

		return c.json({
			message: "You are signed in",
		});
	} catch (error) {
		generateErrorLog("auth.get@/sign-in", error);
		if (error instanceof HTTPException)
			throw new HTTPException(401, {
				message: JSON.stringify({
					message: JSON.parse(getErrorMessage(error)).message,
				}),
			});

		throw new HTTPException(401, {
			message: JSON.stringify({
				message: "Try Signing in again",
			}),
		});
	}
});

const host = {
	prefix: "host",
	httpOnly: true,
	secure: true,
	sameSite: "none",
	maxAge: toSeconds(7, "day"),
} as CookieOptions;

auth.onError(async (error, c) => {
	if (error instanceof HTTPException) {
		return error.getResponse();
	}
	c.status(500);
	return c.json({
		error: { message: "Internal Server Error: Authentication" },
	});
});
export default auth;
