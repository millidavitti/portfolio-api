import { WorkerBindings } from "app/cloudflare/bindings.worker";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { parseCookies } from "app/helpers/parse-cookies";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";
import { prepareGetSocials } from "./components/prepare-get-socials";
import { prepareCreateSocials } from "./components/prepare-create-socials";
import { zValidator } from "@hono/zod-validator";

import { ZodSocials } from "@db/schema/socials.schema";
import { prepareUpdateSocials } from "./components/prepare-update-socials";
import { prepareDeleteSocials } from "./components/prepare-delete-socials";

const socials = new Hono<{ Bindings: WorkerBindings }>();

socials.get("/me", async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE, AUTH_SECRET } = env(c);
		const Cookie = c.req.header("Cookie") || "";
		const parsedCookies = parseCookies(Cookie);
		const cookie = parsedCookies["portfolio.authenticated"];

		const payload = await (async () => {
			try {
				return await verify(cookie, AUTH_SECRET);
			} catch (error) {
				throw new HTTPException(400, {
					message: JSON.stringify({
						message: "Sign in to continue",
					}),
				});
			}
		})();

		const userId = payload?.sub as string;
		const getSocials = prepareGetSocials(PORTFOLIO_HYPERDRIVE.connectionString);
		const socials = await getSocials(userId);

		return c.json({ data: socials });
	} catch (error) {
		generateErrorLog("socials.get@/me", error);
		const errorMessage = getErrorMessage(error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.stringify({
					message: JSON.parse(errorMessage).message,
				}),
			});
	}
});

socials.post("/me", zValidator("json", ZodSocials), async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE, AUTH_SECRET } = env(c);
		const Cookie = c.req.header("Cookie") || "";
		const parsedCookies = parseCookies(Cookie);
		const cookie = parsedCookies["portfolio.authenticated"];
		const payload = await (async () => {
			try {
				return await verify(cookie, AUTH_SECRET);
			} catch (error) {
				generateErrorLog("socials.get@/me", error);
				if (error instanceof HTTPException)
					throw new HTTPException(400, {
						message: JSON.stringify({
							message: "Sign in to continue",
						}),
					});
			}
		})();
		const userId = payload?.sub as string;
		const json = c.req.valid("json");
		const createSocials = prepareCreateSocials(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		await createSocials(userId, json);

		return c.json({ message: "Your socials have been added" });
	} catch (error) {
		generateErrorLog("social.post@/me", error);

		if (error instanceof HTTPException) {
			throw new HTTPException(400, {
				message: JSON.parse(getErrorMessage(error)).message,
			});
		}
	}
});

socials.patch("/me", zValidator("json", ZodSocials), async (c) => {
	const { PORTFOLIO_HYPERDRIVE, AUTH_SECRET } = env(c);
	const Cookie = c.req.header("Cookie") || "";
	const parsedCookies = parseCookies(Cookie);
	const cookie = parsedCookies["portfolio.authenticated"];
	await (async () => {
		try {
			return await verify(cookie, AUTH_SECRET);
		} catch (error) {
			generateErrorLog("socials.get@/me", error);
			if (error instanceof HTTPException)
				throw new HTTPException(400, {
					message: JSON.stringify({
						message: "Sign in to continue",
					}),
				});
		}
	})();

	const json = c.req.valid("json");
	console.log(json);
	const updateSocials = prepareUpdateSocials(
		PORTFOLIO_HYPERDRIVE.connectionString,
	);
	await updateSocials(json);
	return c.json({ message: "Your socials has been updated" });
});

socials.delete("/:socialId", async (c) => {
	console.log("first");
	const { PORTFOLIO_HYPERDRIVE, AUTH_SECRET } = env(c);
	const Cookie = c.req.header("Cookie") || "";
	const parsedCookies = parseCookies(Cookie);
	const cookie = parsedCookies["portfolio.authenticated"];
	await (async () => {
		try {
			return await verify(cookie, AUTH_SECRET);
		} catch (error) {
			generateErrorLog("socials.get@/me", error);
			if (error instanceof HTTPException)
				throw new HTTPException(400, {
					message: JSON.stringify({
						message: "Sign in to continue",
					}),
				});
		}
	})();
	const socialId = c.req.param("socialId");

	const deleteSocials = prepareDeleteSocials(
		PORTFOLIO_HYPERDRIVE.connectionString,
	);
	await deleteSocials(socialId);
	return c.json({ message: "Your socials has been deleted" });
});

socials.onError((error, c) => {
	if (error instanceof HTTPException) {
		return error.getResponse();
	}
	c.status(500);
	return c.json({
		error: { message: "Internal Server Error: Socials" },
	});
});

export default socials;
