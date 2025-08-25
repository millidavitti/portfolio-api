import { Hono } from "hono";
import users from "./users";
import { csrf } from "hono/csrf";
import socials from "./socials";
import technologies from "./technologies";
import projectTechnologies from "./projects/technologies";
import projects from "./projects";
import profiles from "./profile";
import profileTechnologies from "./profile/technologies";

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
v1.route("/profiles", profiles);
v1.route("/profile-technologies", profileTechnologies);

export default v1;
