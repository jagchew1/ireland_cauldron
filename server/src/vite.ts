import type { Express } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

export async function maybeAttachVite(app: Express) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  
  const clientRoot = path.resolve(process.cwd(), '..', 'client');
  
  try {
    const vite = await createViteServer({
      root: clientRoot,
      server: { 
        middlewareMode: true,
        watch: {
          usePolling: true,
        },
      },
      appType: 'custom',
    });
    
    app.use(vite.middlewares);
    
    // SPA fallback - serve index.html for all other routes
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;

      try {
        // Read and transform index.html
        let template = fs.readFileSync(
          path.resolve(clientRoot, 'index.html'),
          'utf-8'
        );
        template = await vite.transformIndexHtml(url, template);
        
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } catch (error) {
    console.error('Failed to start Vite dev server:', error);
    throw error;
  }
}

