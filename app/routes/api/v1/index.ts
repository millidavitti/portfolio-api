import { Hono } from "hono";
import users from "./users";
import { csrf } from "hono/csrf";
import socials from "./socials";
import technologies from "./technologies";
import projectTechnologies from "./projects/technologies";
import projects from "./projects";

const v1 = new Hono();
v1.use(
	csrf({
		origin: ["http://localhost:3000"],
	}),
);
v1.route("/users", users);
v1.route("/socials", socials);
v1.route("/technologies", technologies);
v1.route("/projects", projects);
v1.route("/project-technologies", projectTechnologies);

export default v1;
