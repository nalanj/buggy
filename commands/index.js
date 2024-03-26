export const cli = {
  command: ["test"],
};

export default async function command(name, email) {
  return JSON.stringify({ name, email });
}
