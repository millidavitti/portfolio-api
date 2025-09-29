import { WorkerBindings } from "app/cloudflare/bindings.worker";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { prepareGetSocials } from "./components/prepare-get-socials";
import { prepareCreateSocials } from "./components/prepare-create-socials";
import { zValidator } from "@hono/zod-validator";

import { ZodSocials } from "@db/schema/socials.schema";
import { prepareUpdateSocials } from "./components/prepare-update-socials";
import { prepareDeleteSocials } from "./components/prepare-delete-socials";
import { getCookie } from "hono/cookie";
import { verfiyToken } from "app/helpers/verify-token";

const socials = new Hono<{ Bindings: WorkerBindings }>();

socials.get("/me", async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE, AUTH_SECRET } = env(c);
		const cookie = getCookie(c, "portfolio.authenticated", "host") || "";
		const payload = await verfiyToken(cookie, AUTH_SECRET);

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
		const cookie = getCookie(c, "portfolio.authenticated", "host") || "";
		const payload = await verfiyToken(cookie, AUTH_SECRET);

		const userId = payload?.sub as string;
		const json = c.req.valid("json");
		const createSocials = prepareCreateSocials(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		await createSocials(userId, json);

		return c.json({ message: "Your social have been added" });
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
	const cookie = getCookie(c, "portfolio.authenticated", "host") || "";
	await verfiyToken(cookie, AUTH_SECRET);

	const json = c.req.valid("json");
	const updateSocials = prepareUpdateSocials(
		PORTFOLIO_HYPERDRIVE.connectionString,
	);
	await updateSocials(json);
	return c.json({ message: "Your social has been updated" });
});

socials.delete("/:socialId", async (c) => {
	const { PORTFOLIO_HYPERDRIVE, AUTH_SECRET } = env(c);
	const cookie = getCookie(c, "portfolio.authenticated", "host") || "";
	await verfiyToken(cookie, AUTH_SECRET);

	const socialId = c.req.param("socialId");
	const deleteSocials = prepareDeleteSocials(
		PORTFOLIO_HYPERDRIVE.connectionString,
	);
	await deleteSocials(socialId);
	return c.json({ message: "Your social has been deleted" });
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
