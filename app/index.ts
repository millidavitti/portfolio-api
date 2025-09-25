import { Hono } from "hono";
import { WorkerBindings } from "./cloudflare/bindings.worker";
import { cors } from "hono/cors";
import routes from "app/routes/index";
import { env } from "hono/adapter";

const app = new Hono<{ Bindings: WorkerBindings }>();

app.use("*", async (c, next) => {
	const { ORIGIN } = env(c);
	const corsMiddlewareHandler = cors({
		origin: ORIGIN,
		maxAge: 600,
		credentials: true,
	});
	return corsMiddlewareHandler(c, next);
});

app.route("/", routes);

export default app;
