import { WorkerBindings } from "app/cloudflare/bindings.worker";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { verfiyToken } from "app/helpers/verify-token";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { prepareGetProjectContent } from "./components/prepare-get-project-content";
import { getCookie } from "hono/cookie";

export const projectContent = new Hono<{ Bindings: WorkerBindings }>();

projectContent.get("/:projectId", async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE, AUTH_SECRET } = env(c);
		const cookie = getCookie(c, "portfolio.authenticated", "host") || "";
		await verfiyToken(cookie, AUTH_SECRET);

		const getProjectContent = prepareGetProjectContent(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		const projectId = c.req.param("projectId");
		const projectContent = await getProjectContent(projectId);
		return c.json({ data: projectContent });
	} catch (error) {
		generateErrorLog("projectContent.get@/:", error);
		const message = getErrorMessage(error);

		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.parse(message).message,
			});
	}
});

projectContent.onError((error, c) => {
	if (error instanceof HTTPException) {
		return error.getResponse();
	}
	c.status(500);
	return c.json({
		error: { message: "Internal Server Error: Project Content" },
	});
});
export default projectContent;
