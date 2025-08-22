import { Hono } from "hono";
import api from "./api";
import auth from "./auth";
import { Bindings } from "app/cloudflare/bindings.worker";

const routes = new Hono<{ Bindings: Bindings }>();

routes.route("/auth", auth);
routes.route("/api", api);

export default routes;
