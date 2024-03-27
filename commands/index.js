import { notFound, ok } from "../buggy.js";

export const desc = "A test command";

export const route = "/";

export default async function command(name, email) {
  //return ok({ name, email });
  return notFound();
}
