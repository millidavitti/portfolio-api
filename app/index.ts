import { Hono } from "hono";
import { env } from "hono/adapter";
import { WorkerBindings } from "./cloudflare/bindings.worker";
import { cors } from "hono/cors";
import routes from "app/routes/index";

const app = new Hono<{ Bindings: WorkerBindings }>();

app.use(
	cors({
		origin: ["http://localhost:3000"],
		maxAge: 600,
		credentials: true,
	}),
);

app.route("/", routes);

app.get("/", async (c) => {
	const { PORTFOLIO_HYPERDRIVE } = env(c);

	return c.json(PORTFOLIO_HYPERDRIVE);
});

export default app;
