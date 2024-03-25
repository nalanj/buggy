import http from "node:http";

export default async function buggy() {
  const server = http.createServer((req, res) => handleRequest(req, res));

  await server.listen(2020);
}


async function handleRequest(req, res) {
  req.socket.ref();

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write("Hello World\n");
  res.end(() => req.socket.unref());

  req.socket.unref();
}

// response should work with async/await
// dynamic loading of route stuff

export function param(name) {
  return {type: "param", name};
}
