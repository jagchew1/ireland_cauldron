# Ireland Cauldron

A secret identity bluffing card game where players vie to influence the contents of a mystical cauldron. This monorepo contains a React client, Node/TypeScript server with WebSockets, and shared Zod schemas for type-safe end-to-end development.

## Tech Stack
- Client: React 18, Vite, TypeScript, Tailwind CSS, shadcn-style UI primitives, TanStack Query
- Server: Node.js, TypeScript, Express, Socket.IO, server-authoritative logic
- Shared: Zod schemas/types
- Tooling: ESLint, Prettier, Vitest (unit), optional Playwright/Cypress

## Workspace
- client/: Vite React app
- server/: Express + Socket.IO server, Vite middleware in dev
- shared/: Zod schemas and event/type definitions
- assets/: Game art (heroes, ingredients) already present
- script/: Build orchestrator

## Assets
This project uses artwork located under assets/:
- assets/heroes/: hero role images
- assets/ingredients/: ingredient card images (10 copies of each in the deck)

The server exposes these under /assets/* for the client. Ensure these directories contain your images.

## Gameplay Overview
- **Players:** 5–10, hidden teams (Good vs Evil)
- **Center Deck:** 16 cards (8 Milk, 8 Blood) - game ends when 6 are revealed or 6 remain
- **Ingredient Deck:** 10 copies each of 5 ingredients (Brigid's Blessing, Cailleach's Gaze, Ceol of the Midnight Cairn, Faerie Thistle, Wolfbane Root)
- **Phases per round:** 
  - **Night:** Each player plays 1 ingredient card face-down
  - **Resolution:** Cards revealed, effects resolve based on primary/secondary ingredients
  - **Day:** Discussion phase before next round
- **Hand:** Players maintain 3 ingredient cards, draw from deck (reshuffled when empty)
- **Roles:** Assigned from hero art; team derived from file names (good_* / evil_*)
- **Server-authoritative:** Per-player state shaping to protect hidden info

For detailed game rules, see [GAME_RULES.md](./GAME_RULES.md)

## Scripts
At repo root:

```bash
# Start server with Vite middleware (dev client served by server)
npm run dev

# Build both client and server
npm run build

# Serve built client from server
npm run serve

# Lint and format
npm run lint
npm run format

# Tests
npm test
```

## Setup
```bash
# from repo root
npm install
npm run dev
```
Then open http://localhost:5173.

## Architecture
- Shared Zod schemas define `Player`, `Role`, `Card`, `Deck`, `Room`, `GameState`, `Phase`, `Vote`, `ActionPayloads` and event payloads.
- Server shapes per-player game state, validates all inbound events, and broadcasts updates.
- Client uses WebSocket for live updates and TanStack Query for REST endpoints (health/assets/rooms).

## Development Notes
- In dev, the server mounts Vite’s middleware for fast HMR.
- For persistence, a storage interface is provided with an in-memory impl; add a Drizzle adapter to switch to SQLite/Postgres.

## E2E (Optional)
- You can add Playwright/Cypress for lobby join and basic multi-client happy path.