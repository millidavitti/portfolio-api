import { WorkerBindings } from "app/cloudflare/bindings.worker";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { prepareGetProjectTechnologies } from "./components/prepare-get-project-technologies";
import { verfiyToken } from "app/helpers/verify-token";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { prepareDeleteProjectTechnology } from "./components/prepare-delete-project-technologies";
import { getCookie } from "hono/cookie";

const projectTechnologies = new Hono<{ Bindings: WorkerBindings }>();

projectTechnologies.get("/:projectId", async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE, AUTH_SECRET } = env(c);
		const cookie = getCookie(c, "portfolio.authenticated", "secure") || "";
		await verfiyToken(cookie, AUTH_SECRET);

		const getProjectTechnologies = prepareGetProjectTechnologies(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		const projectId = c.req.param("projectId");
		const projectTechnologies = await getProjectTechnologies(projectId);
		return c.json({ data: projectTechnologies });
	} catch (error) {
		generateErrorLog("projectTechnologies.get@/:", error);
		const message = getErrorMessage(error);

		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.parse(message).message,
			});
	}
});

projectTechnologies.delete("/:projectId/:technologyId", async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE, AUTH_SECRET } = env(c);
		const cookie = getCookie(c, "portfolio.authenticated", "secure") || "";
		await verfiyToken(cookie, AUTH_SECRET);

		const deleteProjectTechnology = prepareDeleteProjectTechnology(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		const projectId = c.req.param("projectId");
		const technologyId = c.req.param("technologyId");
		await deleteProjectTechnology(projectId, technologyId);

		return c.json({ message: "Your update has been applied" });
	} catch (error) {
		generateErrorLog("projectTechnologies.get@/:", error);
		const message = getErrorMessage(error);

		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.parse(message).message,
			});
	}
});

projectTechnologies.onError((error, c) => {
	if (error instanceof HTTPException) {
		return error.getResponse();
	}
	c.status(500);
	return c.json({
		error: { message: "Internal Server Error: Project Technologies" },
	});
});
export default projectTechnologies;
