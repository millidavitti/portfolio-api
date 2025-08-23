import { Hono } from "hono";
import { prepareGetUsers } from "./components/prepare-get-users";
import { env } from "hono/adapter";
import { WorkerBindings } from "app/cloudflare/bindings.worker";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { HTTPException } from "hono/http-exception";
import { getErrorMessage } from "app/helpers/get-error-message";
import { prepareGetUser } from "./components/prepare-get-user";
import { parseCookies } from "app/helpers/parse-cookies";
import { decode } from "hono/jwt";
import { prepareUpdateUser } from "./components/prepare-update-user";
import { prepareDeleteUser } from "./components/prepare-delete-user";
import { zValidator } from "@hono/zod-validator";
import { ZodUser } from "@db/schema/user.schema";

const users = new Hono<{ Bindings: WorkerBindings }>();

users.get("/", async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE } = env(c);
		const getUsers = prepareGetUsers(PORTFOLIO_HYPERDRIVE.connectionString);
		const users = await getUsers();
		return c.json({ data: users });
	} catch (error) {
		generateErrorLog("users.get@/", error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.stringify({
					message: JSON.parse(getErrorMessage(error)).message,
				}),
			});

		throw new HTTPException(500, {
			message: JSON.stringify({
				message: "Internal server error: users.get@/",
			}),
		});
	}
});

users.get("/me", async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE } = env(c);
		const Cookies = c.req.header("Cookie") || "";
		const cookie = parseCookies(Cookies);
		const token = cookie["portfolio.authenticated"];
		const { payload } = decode(token);
		const userId = payload.sub as string;
		const getUser = prepareGetUser(PORTFOLIO_HYPERDRIVE.connectionString);
		const user = await getUser(userId);
		return c.json({ data: user });
	} catch (error) {
		generateErrorLog("users.get@/me", error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.stringify({
					message: JSON.parse(getErrorMessage(error)).message,
				}),
			});

		throw new HTTPException(500, {
			message: JSON.stringify({
				message: "Internal server error: users.get@/me",
			}),
		});
	}
});

users.patch("/me", zValidator("json", ZodUser), async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE } = env(c);
		const Cookies = c.req.header("Cookie") || "";
		const cookie = parseCookies(Cookies);
		const token = cookie["portfolio.authenticated"];
		const { payload } = decode(token);
		const userId = payload.sub as string;
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

		throw new HTTPException(500, {
			message: JSON.stringify({
				message: "Internal server error: users.patch@/me",
			}),
		});
	}
});

users.delete("/me", async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE } = env(c);
		const Cookies = c.req.header("Cookie") || "";
		const cookie = parseCookies(Cookies);
		const token = cookie["portfolio.authenticated"];
		const { payload } = decode(token);
		const userId = payload.sub as string;
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

		throw new HTTPException(500, {
			message: JSON.stringify({
				message: "Internal server error: users.delete@/me",
			}),
		});
	}
});

export default users;
