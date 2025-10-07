import { WorkerBindings } from "app/cloudflare/bindings.worker";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { prepareGetProfiles } from "./components/prepare-get-profiles";
import { verfiyToken } from "app/helpers/verify-token";
import { prepareCreateProfile } from "./components/prepare-create-profile";
import { zValidator } from "@hono/zod-validator";
import { ZodProfile } from "@db/schema/profile.schema";
import { prepareUpdateProfile } from "./components/prepare-update-profile";
import { prepareDeleteProfile } from "./components/prepare-delete-profile";
import { getCookie } from "hono/cookie";

const profiles = new Hono<{ Bindings: WorkerBindings }>();

profiles.get("/me", async (c) => {
	try {
		const { AUTH_SECRET, PORTFOLIO_HYPERDRIVE } = env(c);
		const cookie = getCookie(c, "portfolio.authenticated", "secure") || "";
		const payload = await verfiyToken(cookie, AUTH_SECRET);

		const getProfiles = prepareGetProfiles(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		const userId = payload?.sub as string;
		const profiles = await getProfiles(userId);
		return c.json({ data: profiles });
	} catch (error) {
		generateErrorLog("profiles.get@/me", error);
		const message = getErrorMessage(error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.parse(message).message,
			});
	}
});

profiles.post("/me", zValidator("json", ZodProfile.partial()), async (c) => {
	try {
		const { AUTH_SECRET, PORTFOLIO_HYPERDRIVE } = env(c);
		const cookie = getCookie(c, "portfolio.authenticated", "secure") || "";
		const payload = await verfiyToken(cookie, AUTH_SECRET);

		const createProfile = prepareCreateProfile(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		const userId = payload?.sub as string;
		const json = c.req.valid("json");
		await createProfile(userId, json);
		return c.json({ message: "Your profile has been created" });
	} catch (error) {
		generateErrorLog("profiles.post@/me", error);
		const message = getErrorMessage(error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.parse(message).message,
			});
	}
});

profiles.patch("/me", zValidator("json", ZodProfile.partial()), async (c) => {
	try {
		const { AUTH_SECRET, PORTFOLIO_HYPERDRIVE } = env(c);
		const cookie = getCookie(c, "portfolio.authenticated", "secure") || "";
		await verfiyToken(cookie, AUTH_SECRET);

		const updateProfile = prepareUpdateProfile(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);

		const json = c.req.valid("json");
		await updateProfile(json);
		return c.json({ message: "Your profile has been updated" });
	} catch (error) {
		generateErrorLog("profiles.patch@/me", error);
		const message = getErrorMessage(error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.parse(message).message,
			});
	}
});

profiles.delete("/me", zValidator("json", ZodProfile.partial()), async (c) => {
	try {
		const { AUTH_SECRET, PORTFOLIO_HYPERDRIVE } = env(c);
		const cookie = getCookie(c, "portfolio.authenticated", "secure") || "";
		await verfiyToken(cookie, AUTH_SECRET);

		const deleteProfile = prepareDeleteProfile(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		const json = c.req.valid("json");
		await deleteProfile(json);
		return c.json({ message: "Your profile has been deleted" });
	} catch (error) {
		generateErrorLog("profiles.delete@/me", error);
		const message = getErrorMessage(error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.parse(message).message,
			});
	}
});

profiles.onError((error, c) => {
	if (error instanceof HTTPException) {
		return error.getResponse();
	}
	c.status(500);
	return c.json({
		error: { message: "Internal Server Error: Profiles" },
	});
});
export default profiles;
