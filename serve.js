import http from "node:http";
import { parse } from "regexparam";

export async function serve(commands) {
  const port = 8080;

  const routes = commands
    .filter((command) => command.http?.route)
    .map((command) => {
      return {
        ...command,
        router: parse(command.http.route),
      };
    });

  const server = http.createServer((req, res) =>
    handleRequest(req, res, routes),
  );

  console.log(`Listening on port ${port}`);
  await server.listen(port);
}

function matchRoute(url, routes) {
  for (const route of routes) {
    const match = route.router.pattern.exec(url.pathname);

    if (match) {
      const params = {};
      for (const [i, key] of route.router.keys.entries()) {
        params[key.name] = match[i + 1];
      }

      return [route, params];
    }
  }
}

async function handleRequest(req, res, routes) {
  req.socket.ref();

  const url = new URL(req.url, `http://${req.headers.host}`);

  const [route, routeParams] = matchRoute(url, routes);

  const args = [];
  for (const prep of route.http?.args || []) {
    if (prep.type === "query") {
      args.push(url.searchParams.get(prep.name));
    } else if (prep.type === "route") {
      args.push(routeParams[prep.name]);
    } else {
      throw new Error("Unknown prep type");
    }
  }

  if (
    process.env.NODE_ENV === "development" &&
    args.length !== route.default.length
  ) {
    throw new Error("Argument count mismatch");
  }

  const result = await route.default(...args);

  res.writeHead(200, { "Content-Type": "text/plain" });
  if (typeof result === "string" || result instanceof String) {
    res.write(result);
  } else {
    res.write(JSON.stringify(result));
  }

  res.end(() => req.socket.unref());

  req.socket.unref();
}
