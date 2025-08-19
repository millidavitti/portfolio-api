import { Hono } from "hono";

const users = new Hono();

// /get-user/:id, get-users,

users.get("/get-users", (c) => {
	return c.json([{ name: "Donald" }]);
});

users.get("/get-user/:id", (c) => {
	return c.json([{ id: c.req.param("id"), name: "Donald" }]);
});

export default users;
