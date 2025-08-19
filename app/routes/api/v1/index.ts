import { Hono } from "hono";
import users from "./users";

const v1 = new Hono();

v1.route("/users", users);

export default v1;
