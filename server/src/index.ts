import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as IOServer } from 'socket.io';
import { registerRoutes } from './routes.js';
import { initSockets } from './websocket.js';
import { maybeAttachVite } from './vite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const app = express();
  const server = http.createServer(app);
  const io = new IOServer(server, { cors: { origin: true, credentials: true } });

  // JSON parsing
  app.use(express.json());

  // REST routes and static assets
  registerRoutes(app);

  // WebSockets
  initSockets(io, app);

  // Dev: Vite middlewares for client
  if (process.env.NODE_ENV !== 'production') {
    await maybeAttachVite(app);
  } else {
    // Serve built client from /client/dist
    const clientDist = path.resolve(__dirname, '../../client/dist');
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }

  const port = Number(process.env.PORT || 5173);
  server.listen(port, () => console.log(`[server] listening on http://localhost:${port}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
