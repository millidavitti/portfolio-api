import { Hono } from "hono";
import api from "./api";
import auth from "./auth";
import { WorkerBindings } from "app/cloudflare/bindings.worker";

const routes = new Hono<{ Bindings: WorkerBindings }>();

routes.route("/auth", auth);
routes.route("/api", api);

export default routes;
