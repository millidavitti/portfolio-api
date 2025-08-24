import { WorkerBindings } from "app/cloudflare/bindings.worker";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { prepareGetProjects } from "./components/prepare-get-projects";
import {
	prepareCreateProject,
	ZodProjectData,
} from "./components/prepare-create-project";
import { zValidator } from "@hono/zod-validator";
import { parseCookies } from "app/helpers/parse-cookies";
import { verfiyToken } from "app/helpers/verify-token";

const projects = new Hono<{ Bindings: WorkerBindings }>();

projects.get("/:profileId", async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE } = env(c);
		const getProjects = prepareGetProjects(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		const profileId = c.req.param("profileId");
		const projects = await getProjects(profileId);
		return c.json({ data: projects });
	} catch (error) {
		generateErrorLog("projects.get@/", error);
		const message = getErrorMessage(error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.parse(message).message,
			});
	}
});

projects.post("/:profileId", zValidator("json", ZodProjectData), async (c) => {
	try {
		const { AUTH_SECRET, PORTFOLIO_HYPERDRIVE } = env(c);
		const Cookie = c.req.header("Cookie") || "";
		const parsedCookies = parseCookies(Cookie);
		const token = parsedCookies["portfolio.authenticated"];
		await verfiyToken(token, AUTH_SECRET);
		const createProject = prepareCreateProject(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		const profileId = c.req.param("profileId");
		const json = c.req.valid("json");
		await createProject(profileId, json);
		return c.json({ message: "You have created a project" });
	} catch (error) {
		generateErrorLog("projects.post@/profileId", error);
		const message = getErrorMessage(error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.parse(message).message,
			});
	}
});

projects.onError((error, c) => {
	if (error instanceof HTTPException) {
		return error.getResponse();
	}
	c.status(500);
	return c.json({
		error: { message: "Internal Server Error: Projects" },
	});
});
export default projects;
