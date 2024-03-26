import http from "node:http";

export default async function buggy() {
  const routes = await import("./routes/index.js");

  const server = http.createServer((req, res) => handleRequest(req, res, routes));

  await server.listen(2020);
}

buggy();

async function handleRequest(req, res, routes) {
  req.socket.ref();

  const route = routes;

  const url = new URL(req.url, `http://${req.headers.host}`);

  const args = [];
  for (const prep of route.prepare) {
    if (prep.type === "query") {
      args.push(url.searchParams.get(prep.name));
    } else {
      throw new Error("Unknown prep type");
    }
  }

  if (process.env.NODE_ENV === "development" && args.length !== route.default.length) {
    throw new Error("Argument count mismatch");
  }


  const result = await route.default(...args);
  
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write(result ? result : "");
  res.end(() => req.socket.unref());

  req.socket.unref();
}

// response should work with async/await
// dynamic loading of route stuff

export function query(name) {
  return {type: "query", name};
}

// route(name)
// body(name)
// header(name)

