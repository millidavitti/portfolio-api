import { Hono } from "hono";
import { prepareVerificationEmail } from "./components/prepare-verification-email";
import { createId } from "@paralleldrive/cuid2";
import { env } from "hono/adapter";
import { Bindings } from "app/cloudflare/bindings.worker";
import { sign, verify } from "hono/jwt";
import { setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { getErrorMessage } from "app/helpers/get-error-message";
import { toSeconds } from "app/helpers/to-seconds";
import { prepareCreateUser } from "./components/prepare-create-user";
import { prepareMagicLink } from "./components/prepare-magic-link.model";
import { parseCookies } from "app/helpers/parse-cookies";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { prepareGetUser } from "./components/prepare-get-user";
const auth = new Hono<{ Bindings: Bindings }>();

auth.post("/sign-up", async (c) => {
	try {
		const { RESEND_APIKEY, RESEND_FROM, ORIGIN, AUTH_SECRET } = env(c);
		const { email, name } = await c.req.json();
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

		const sendVerificationEmail = prepareVerificationEmail(email, cookie);
		await sendVerificationEmail(RESEND_APIKEY, RESEND_FROM, ORIGIN);

		setCookie(c, "portfolio.authenticating", cookie);

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
});

auth.get("/verify-email/:token", async (c) => {
	try {
		const { AUTH_SECRET, PORTFOLIO_HYPERDRIVE } = env(c);
		const token = c.req.param("token");
		const payload = await (async () => {
			try {
				const payload = await verify(token, AUTH_SECRET);
				return payload;
			} catch (error) {
				generateErrorLog("@payload", error);
				throw new HTTPException(401, {
					message: JSON.stringify({
						message: "Sign up again",
					}),
				});
			}
		})();

		const cookie = await (async () => {
			try {
				const createUser = prepareCreateUser(
					payload.email as string,
					payload.name as string,
				);
				const user = await createUser(PORTFOLIO_HYPERDRIVE.connectionString);
				return await sign(
					{
						email: payload.email,
						name: payload.email,
						sub: user?.id,
						iss: "portfolio",
						iat: Math.floor(Date.now() / 1000),
						exp: Math.floor(Date.now() / 1000) + toSeconds(7, "day"),
					},
					AUTH_SECRET,
				);
			} catch (error) {
				throw new HTTPException(401, {
					message: JSON.stringify({
						message: JSON.parse(getErrorMessage(error)).message,
					}),
				});
			}
		})();

		setCookie(c, "portfolio.authenticated", cookie);

		return c.json({
			message: "You can now sign in",
		});
	} catch (error) {
		throw new HTTPException(401, {
			message: JSON.stringify({
				message: JSON.parse(getErrorMessage(error)).message,
			}),
		});
	}
});

auth.post("/send-magic-link", async (c) => {
	try {
		const { AUTH_SECRET, ORIGIN, RESEND_APIKEY, RESEND_FROM } = env(c);
		const { email } = await c.req.json();
		const token = await sign(
			{
				email,
				iss: "portfolio",
				iat: Math.floor(Date.now() / 1000),
				exp: Math.floor(Date.now() / 1000) + toSeconds(5, "minute"),
			},
			AUTH_SECRET,
		);

		const sendMagicLink = prepareMagicLink(email, token);
		await sendMagicLink(RESEND_APIKEY, RESEND_FROM, ORIGIN);

		setCookie(c, "portfolio.authenticating", token);

		return c.json({ message: "A magic link has been sent to " + email });
	} catch (error) {
		throw new HTTPException(400, {
			message: JSON.stringify({
				message: JSON.parse(getErrorMessage(error)).message,
			}),
		});
	}
});

auth.post("/sign-in", async (c) => {
	try {
		const { AUTH_SECRET, PORTFOLIO_HYPERDRIVE } = env(c);
		const Cookies = c.req.header("Cookie") || "";
		const parsedCookies = parseCookies(Cookies);
		const token = parsedCookies["portfolio.authenticating"];
		const payload = await (async () => {
			try {
				const payload = await verify(token, AUTH_SECRET);
				return payload;
			} catch (error) {
				generateErrorLog("@payload:", error);
				throw new HTTPException(401, {
					message: JSON.stringify({
						message: "Try Signing in again",
					}),
				});
			}
		})();
		const getUser = prepareGetUser(payload.email as string);
		const user = await getUser(PORTFOLIO_HYPERDRIVE.connectionString);
		const cookie = await sign(
			{
				...payload,
				sub: user.id,
				exp: toSeconds(7, "day"),
			},
			AUTH_SECRET,
		);
		setCookie(c, "portfolio.authenticated", cookie);

		return c.json({
			message: "You are signed in",
		});
	} catch (error) {
		console.error(error);
		throw new HTTPException(401, {
			message: JSON.stringify({
				message: JSON.parse(getErrorMessage(error)).message,
			}),
		});
	}
});

auth.onError(async (error, c) => {
	console.error("Auth Error: ", error);
	if (error instanceof HTTPException) {
		return error.getResponse();
	}
	c.status(500);
	return c.json({
		error: { message: "Internal Server Error: Authentication" },
	});
});
export default auth;
