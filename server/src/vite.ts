import type { Express } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

export async function maybeAttachVite(app: Express) {
  const vite = await createViteServer({
    root: path.resolve(process.cwd(), 'client'),
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
}
