import { fileURLToPath } from "url";
import { dirname } from "path";
import express from "express";
import http from "http";
import { createAdapter } from "@socket.io/redis-adapter";
import { redisCache } from "./cache/client.mjs";
import { initBoards, SESSIONS } from "./initBoards.mjs";
import { initializeNamespaces } from "./namespaces/initializeNamespaces.mjs";
import { SocketIoServer } from "./socketIoServer.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = SocketIoServer.getServer(server);

const pubClient = redisCache.client;
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


initBoards(pubClient);
initializeNamespaces({ io, sessionId: SESSIONS.SESSION1 });

server.listen(3000, () => {
  console.log("listening on *:3000");
});
