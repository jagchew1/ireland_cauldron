import type { Express, Request, Response } from 'express';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HealthResponse, AssetListResponse } from '@irish-potions/shared';
import { getRoomsSummary } from './storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../..');
const assetsRoot = path.resolve(projectRoot, 'assets');

export function registerRoutes(app: Express) {
  app.get('/health', (_req: Request, res: Response) => {
    const payload = HealthResponse.parse({ ok: true, ts: Date.now() });
    res.json(payload);
  });

  app.get('/assets/list', (_req: Request, res: Response) => {
    const heroesDir = path.join(assetsRoot, 'heroes');
    const ingredientsDir = path.join(assetsRoot, 'ingredients');
    const heroes = fs.existsSync(heroesDir) ? fs.readdirSync(heroesDir).filter(isImage) : [];
    const ingredients = fs.existsSync(ingredientsDir)
      ? fs.readdirSync(ingredientsDir).filter(isImage)
      : [];
    const payload = AssetListResponse.parse({ heroes, ingredients });
    res.json(payload);
  });

  app.get('/rooms', (_req: Request, res: Response) => {
    res.json({ rooms: getRoomsSummary() });
  });

  // Serve images statically
  app.use('/assets', express.static(assetsRoot));
}

function isImage(name: string) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
}
