import { Hono } from "hono";
import { prepareGetUsers } from "./components/prepare-get-users";
import { env } from "hono/adapter";
import { WorkerBindings } from "app/cloudflare/bindings.worker";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { HTTPException } from "hono/http-exception";
import { getErrorMessage } from "app/helpers/get-error-message";
import { prepareGetUser } from "./components/prepare-get-user";
import { prepareUpdateUser } from "./components/prepare-update-user";
import { prepareDeleteUser } from "./components/prepare-delete-user";
import { zValidator } from "@hono/zod-validator";
import { ZodUser } from "@db/schema/user.schema";
import { verfiyToken } from "app/helpers/verify-token";
import { getCookie } from "hono/cookie";

const users = new Hono<{ Bindings: WorkerBindings }>();

users.get("/", async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE } = env(c);
		const getUsers = prepareGetUsers(PORTFOLIO_HYPERDRIVE.connectionString);
		const users = await getUsers();
		return c.json({ data: users });
	} catch (error) {
		generateErrorLog("users.get@/", error);
		const message = JSON.parse(getErrorMessage(error)).message;
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.stringify({
					message,
				}),
			});
	}
});

users.get("/me", async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE, AUTH_SECRET } = env(c);
		const cookie = getCookie(c, "portfolio.authenticated", "secure");
		const payload = await verfiyToken(cookie!, AUTH_SECRET);
		const userId = payload?.sub as string;
		const getUser = prepareGetUser(PORTFOLIO_HYPERDRIVE.connectionString);
		const user = await getUser(userId);
		return c.json({ data: user });
	} catch (error) {
		generateErrorLog("users.get@/me", error);
		const message = JSON.parse(getErrorMessage(error)).message;
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.stringify({
					message,
				}),
			});
	}
});

users.patch("/me", zValidator("json", ZodUser.partial()), async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE, AUTH_SECRET } = env(c);
		const cookie = getCookie(c, "portfolio.authenticated", "secure") || "";
		const payload = await verfiyToken(cookie, AUTH_SECRET);
		const userId = payload?.sub as string;
		const update = c.req.valid("json");
		const updateUser = prepareUpdateUser(PORTFOLIO_HYPERDRIVE.connectionString);
		await updateUser(userId, update);

		return c.json({ message: "Your update has been applied" });
	} catch (error) {
		generateErrorLog("users.patch@/me", error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.stringify({
					message: JSON.parse(getErrorMessage(error)).message,
				}),
			});
	}
});

users.delete("/me", async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE, AUTH_SECRET } = env(c);
		const cookie = getCookie(c, "portfolio.authenticated", "secure") || "";
		const payload = await verfiyToken(cookie, AUTH_SECRET);
		const userId = payload?.sub as string;
		const deleteUser = prepareDeleteUser(PORTFOLIO_HYPERDRIVE.connectionString);
		await deleteUser(userId);

		return c.json({ message: "Your account has been deleted" });
	} catch (error) {
		generateErrorLog("users.delete@/me:", error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.stringify({
					message: JSON.parse(getErrorMessage(error)).message,
				}),
			});
	}
});

users.onError((error, c) => {
	if (error instanceof HTTPException) {
		return error.getResponse();
	}
	c.status(500);
	return c.json({
		error: { message: "Internal Server Error: Users" },
	});
});

export default users;
