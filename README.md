# Irish Potions

Bluffing card game with hidden roles and a cauldron of ingredients. This monorepo contains a React client, Node/TypeScript server with WebSockets, and shared Zod schemas for type-safe end-to-end development.

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
- assets/ingredients/: ingredient card images (8 copies of each included in the deck)

The server exposes these under /assets/* for the client. Ensure these directories contain your images.

## Gameplay Overview
- Players: 2–10, hidden teams (Good vs Evil)
- Phases per round: Lobby → Night (play one ingredient) → Day (reveal & discuss)
- Deck: 8 copies of each ingredient card; players keep a hand of 3
- Roles: Assigned from hero art; team derived from file names (good_* / evil_*)
- Server-authoritative, per-player state shaping to protect hidden info

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