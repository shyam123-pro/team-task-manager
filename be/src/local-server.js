import http from "http";
import { app, prepareApp } from "./app.js";
import { env } from "./config/env.js";

async function main() {
  await prepareApp();

  const server = http.createServer(app);
  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
