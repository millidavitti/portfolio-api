import { WorkerBindings } from "app/cloudflare/bindings.worker";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { prepareGetTechnologies } from "./components/prepare-get-technologies";
import { prepareUpdateTechnologies } from "./components/prepare-update-techologies";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { ZodTechnology } from "@db/schema/technology.schema";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { getCookie } from "hono/cookie";
import { verfiyToken } from "app/helpers/verify-token";

const technologies = new Hono<{ Bindings: WorkerBindings }>();

technologies.get("/", async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE } = env(c);
		const getTechnologies = prepareGetTechnologies(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		const technologies = await getTechnologies();
		return c.json({ data: technologies });
	} catch (error) {
		generateErrorLog("technologies.get@/:", error);
		const errorMessage = getErrorMessage(error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.parse(errorMessage).message,
			});
	}
});

technologies.patch(
	"/",
	zValidator("json", ZodTechnology.array()),
	async (c) => {
		try {
			const { PORTFOLIO_HYPERDRIVE, AUTH_SECRET } = env(c);
			const cookie = getCookie(c, "portfolio.authenticated", "secure") || "";
			await verfiyToken(cookie, AUTH_SECRET);

			const json = c.req.valid("json");
			const updateTechnologies = prepareUpdateTechnologies(
				PORTFOLIO_HYPERDRIVE.connectionString,
			);
			await updateTechnologies(json);
			return c.json({ message: "Your update has been applied" });
		} catch (error) {
			generateErrorLog("technologies.patch@/:", error);
			const errorMessage = getErrorMessage(error);
			if (error instanceof HTTPException)
				throw new HTTPException(400, {
					message: JSON.parse(errorMessage).message,
				});
		}
	},
);

technologies.onError((error, c) => {
	if (error instanceof HTTPException) {
		return error.getResponse();
	}
	c.status(500);
	return c.json({
		error: { message: "Internal Server Error: Technologies" },
	});
});

export default technologies;
