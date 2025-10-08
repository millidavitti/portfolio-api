import { WorkerBindings } from "app/cloudflare/bindings.worker";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { prepareGetLocation } from "./components/prepare-get-locations";
import { verfiyToken } from "app/helpers/verify-token";
import { prepareUpdateLocation } from "./components/prepare-update-location";
import { zValidator } from "@hono/zod-validator";
import { ZodLocation } from "@db/schema/location.schema";
import { getCookie } from "hono/cookie";

const locations = new Hono<{ Bindings: WorkerBindings }>();

locations.get("/me", async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE, AUTH_SECRET } = env(c);
		const cookie = getCookie(c, "portfolio.authenticated", "secure") || "";
		const payload = await verfiyToken(cookie, AUTH_SECRET);

		const getLocation = prepareGetLocation(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		const userId = payload?.sub as string;
		const location = await getLocation(userId);
		return c.json({ data: location });
	} catch (error) {
		generateErrorLog("locations.get@/me", error);
		const message = getErrorMessage(error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.parse(message).message,
			});
	}
});

locations.patch("/me", zValidator("json", ZodLocation), async (c) => {
	try {
		const { AUTH_SECRET, PORTFOLIO_HYPERDRIVE } = env(c);
		const cookie = getCookie(c, "portfolio.authenticated", "secure") || "";
		const payload = await verfiyToken(cookie, AUTH_SECRET);

		const updateLocation = prepareUpdateLocation(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		const userId = payload?.sub as string;
		const json = c.req.valid("json");
		await updateLocation(userId, json);
		return c.json({ message: "Your update has been applied" });
	} catch (error) {
		generateErrorLog("location.patch@/me", error);
		const message = getErrorMessage(error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.parse(message).message,
			});
	}
});

locations.onError((error, c) => {
	if (error instanceof HTTPException) {
		return error.getResponse();
	}
	c.status(500);
	return c.json({
		error: { message: "Internal Server Error: Locations" },
	});
});
export default locations;
