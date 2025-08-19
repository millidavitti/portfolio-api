import { Hono } from "hono";
import api from "./api";
import auth from "./auth";
import { Bindings } from "app/cloudflare/bindings.worker";
import { csrf } from "hono/csrf";

const routes = new Hono<{ Bindings: Bindings }>();

routes.route("/auth", auth);
routes.use(
	csrf({
		origin: ["http://localhost:3000"],
	}),
);
routes.route("/api", api);

export default routes;
