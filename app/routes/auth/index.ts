import { Hono } from "hono";
import { prepareSignUp } from "./components/prepare-sign-up";
import { createId } from "@paralleldrive/cuid2";
import { env } from "hono/adapter";
import { WorkerBindings } from "app/cloudflare/bindings.worker";
import { sign } from "hono/jwt";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { getErrorMessage } from "app/helpers/get-error-message";
import { toSeconds } from "app/helpers/to-seconds";
import { prepareCreateUser } from "./components/prepare-create-user";
import { prepareSignIn } from "./components/prepare-sign-in";
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
			const { RESEND_APIKEY, RESEND_FROM, ORIGIN, AUTH_SECRET, COOKIE_DOMAIN } =
				env(c);
			const { email, name } = c.req.valid("json");
			const token = await sign(
				{
					email,
					name,
					token: createId(),
					iss: "Ronin Ubermensch",
					iat: Math.floor(Date.now() / 1000),
					exp: toSeconds(5, "minute"),
				},
				AUTH_SECRET,
			);

			const signUp = prepareSignUp(RESEND_APIKEY, RESEND_FROM, ORIGIN);
			setCookie(c, "authenticating", token, {
				...secure,
				domain: COOKIE_DOMAIN,
			});

			await signUp(email, token);

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

auth.get("/sign-up/:token", async (c) => {
	try {
		const { AUTH_SECRET, PORTFOLIO_HYPERDRIVE, COOKIE_DOMAIN } = env(c);
		const verificationToken = c.req.param("token");
		const cookie = getCookie(c, "authenticating", "secure");

		if (verificationToken !== cookie)
			throw new HTTPException(401, {
				message: JSON.stringify({
					message: "Sign up again. Something went wrong",
				}),
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
		const token = async () => {
			try {
				return await sign(
					{
						email: payload?.email,
						name: payload?.email,
						sub: user?.id,
						iss: "Ronin Ubermensch",
						iat: Math.floor(Date.now() / 1000),
						exp: toSeconds(7, "day"),
					},
					AUTH_SECRET,
				);
			} catch (error) {
				generateErrorLog("auth.get@/sign-up/:token@cookie:", error);
				throw new HTTPException(401, {
					message: JSON.stringify({
						message: "Sign up again. Your email was not verified",
					}),
				});
			}
		};

		setCookie(c, "authenticated", await token(), {
			...secure,
			domain: COOKIE_DOMAIN,
		});

		return c.json({
			message: "You are now signed in",
		});
	} catch (error) {
		generateErrorLog("auth.get@/sign-up/:token", error);
		const message = JSON.parse(getErrorMessage(error)).message;
		if (error instanceof HTTPException)
			throw new HTTPException(401, {
				message: JSON.stringify({
					message,
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
	"/sign-in",
	zValidator("json", z.object({ email: z.string().email() })),
	async (c) => {
		try {
			const { AUTH_SECRET, ORIGIN, RESEND_APIKEY, RESEND_FROM, COOKIE_DOMAIN } =
				env(c);
			const { email } = c.req.valid("json");
			const token = await sign(
				{
					email,
					iss: "Ronin Ubermensch",
					iat: Math.floor(Date.now() / 1000),
					exp: toSeconds(5, "minute"),
				},
				AUTH_SECRET,
			);

			const signIn = prepareSignIn(RESEND_APIKEY, RESEND_FROM, ORIGIN);
			await signIn(email, token);

			setCookie(c, "authenticating", token, {
				...secure,
				domain: COOKIE_DOMAIN,
			});

			return c.json({ message: "A magic link has been sent to " + email });
		} catch (error) {
			generateErrorLog("auth.post@/sign-in", error);
			const message = JSON.parse(getErrorMessage(error)).message;
			if (error instanceof HTTPException)
				throw new HTTPException(401, {
					message: JSON.stringify({
						message,
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

auth.get("/sign-in/authenticated", async (c) => {
	try {
		const { AUTH_SECRET, PORTFOLIO_HYPERDRIVE, COOKIE_DOMAIN } = env(c);
		const cookie = getCookie(c, "authenticating", "secure") || "";
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
		const cookieOptions = {
			...secure,
			domain: COOKIE_DOMAIN,
		};
		deleteCookie(c, "authenticating", cookieOptions);
		setCookie(c, "authenticated", token, cookieOptions);

		return c.json({
			message: "You are signed in",
		});
	} catch (error) {
		generateErrorLog("auth.get@/sign-in/authenticated", error);
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

const secure = {
	prefix: "secure",
	httpOnly: true,
	secure: true,
	sameSite: "none",
	maxAge: toSeconds(7, "day", "duration"),
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
