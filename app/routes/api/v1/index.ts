import { Hono } from "hono";
import users from "./users";
import { csrf } from "hono/csrf";
import socials from "./socials";

const v1 = new Hono();
v1.use(
	csrf({
		origin: ["http://localhost:3000"],
	}),
);
v1.route("/users", users);
v1.route("/socials", socials);

export default v1;
