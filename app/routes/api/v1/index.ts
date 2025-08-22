import { Hono } from "hono";
import users from "./users";
import { csrf } from "hono/csrf";

const v1 = new Hono();
v1.use(
	csrf({
		origin: ["http://localhost:3000"],
	}),
);
v1.route("/users", users);

export default v1;
