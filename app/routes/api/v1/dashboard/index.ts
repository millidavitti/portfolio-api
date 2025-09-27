import { WorkerBindings } from "app/cloudflare/bindings.worker";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { parseCookies } from "app/helpers/parse-cookies";
import { verfiyToken } from "app/helpers/verify-token";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { prepareGetUser } from "../users/components/prepare-get-user";
import { prepareGetLocation } from "../locations/components/prepare-get-locations";
import { prepareGetSocials } from "../socials/components/prepare-get-socials";
import { prepareGetProfiles } from "../profile/components/prepare-get-profiles";
import { prepareGetTechnologies } from "../technologies/components/prepare-get-technologies";

const dashboard = new Hono<{ Bindings: WorkerBindings }>();

dashboard.get("/", async (c) => {
	try {
		const { AUTH_SECRET, PORTFOLIO_HYPERDRIVE } = env(c);
		const Cookie = c.req.header("Cookie") as string;
		const parsedCookies = parseCookies(Cookie);
		const token = parsedCookies["portfolio.authenticated"];
		const payload = await verfiyToken(token, AUTH_SECRET);

		const getUser = prepareGetUser(PORTFOLIO_HYPERDRIVE.connectionString);
		const userId = payload?.sub as string;
		const user = await getUser(userId);

		const getLocation = prepareGetLocation(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		const location = await getLocation(userId);

		const getSocials = prepareGetSocials(PORTFOLIO_HYPERDRIVE.connectionString);
		const socials = await getSocials(userId);

		const getProfiles = prepareGetProfiles(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		const profiles = await getProfiles(userId);

		const getTechnologies = prepareGetTechnologies(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		const technologies = await getTechnologies();

		return c.json({
			data: {
				user,
				location,
				socials,
				profiles,
				technologies,
			},
		});
	} catch (error) {
		generateErrorLog("dashboard.get@/", error);
		const message = getErrorMessage(error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.parse(message).message,
			});
	}
});

dashboard.onError((error, c) => {
	if (error instanceof HTTPException) {
		return error.getResponse();
	}
	c.status(500);
	return c.json({
		error: { message: "Internal Server Error: Dashboard" },
	});
});

export default dashboard;
