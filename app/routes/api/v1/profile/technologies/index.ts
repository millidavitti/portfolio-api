import { WorkerBindings } from "app/cloudflare/bindings.worker";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { prepareGetProfileTechnologies } from "./components/prepare-get-profile-technologies";
import { generateErrorLog } from "app/helpers/generate-error-log";
import { getErrorMessage } from "app/helpers/get-error-message";
import { parseCookies } from "app/helpers/parse-cookies";
import { verfiyToken } from "app/helpers/verify-token";
import { prepareUpdateProfileTechnologies } from "./components/prepare-update-profile-technologies";
import { zValidator } from "@hono/zod-validator";
import { ZodTechnology } from "@db/schema/technology.schema";

const profileTechnologies = new Hono<{ Bindings: WorkerBindings }>();

profileTechnologies.get("/:profileId", async (c) => {
	try {
		const { PORTFOLIO_HYPERDRIVE } = env(c);
		const getProfileTechnologies = prepareGetProfileTechnologies(
			PORTFOLIO_HYPERDRIVE.connectionString,
		);
		const profileId = c.req.param("profileId");
		const profileTechnologies = await getProfileTechnologies(profileId);
		return c.json({ data: profileTechnologies });
	} catch (error) {
		generateErrorLog("profileTechnologies.get@/profileId", error);
		const message = getErrorMessage(error);
		if (error instanceof HTTPException)
			throw new HTTPException(400, {
				message: JSON.parse(message).message,
			});
	}
});

profileTechnologies.patch(
	"/:profileId",
	zValidator("json", ZodTechnology.array()),
	async (c) => {
		try {
			const { AUTH_SECRET, PORTFOLIO_HYPERDRIVE } = env(c);
			const Cookie = c.req.header("Cookie") || "";
			const parsedCookies = parseCookies(Cookie);
			const token = parsedCookies["portfolio.authenticated"];
			await verfiyToken(token, AUTH_SECRET);
			const updateProfile = prepareUpdateProfileTechnologies(
				PORTFOLIO_HYPERDRIVE.connectionString,
			);
			const profileId = c.req.param("profileId");
			const json = c.req.valid("json");
			await updateProfile(profileId, json);
			return c.json({ message: "Your update has been applied" });
		} catch (error) {
			generateErrorLog("profileTechnologies.patch@/", error);
			const message = getErrorMessage(error);
			if (error instanceof HTTPException)
				throw new HTTPException(400, {
					message: JSON.parse(message).message,
				});
		}
	},
);

profileTechnologies.onError((error, c) => {
	if (error instanceof HTTPException) {
		return error.getResponse();
	}
	c.status(500);
	return c.json({
		error: { message: "Internal Server Error: Profile Technologies" },
	});
});
export default profileTechnologies;
