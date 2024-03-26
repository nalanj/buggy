export const desc = "A test command";

export const route = "/";

export default async function command(name, email) {
  return JSON.stringify({ name, email });
}
