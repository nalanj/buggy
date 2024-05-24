import { ok, query } from "../buggy.js";

export const name = "test";
export const desc = "A test command";

export const http = {
	route: "/",
	args: [query("name"), query("email")],
};

export default async function command(name, email) {
	return { name, email };
}
