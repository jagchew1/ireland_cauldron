import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { GameState, ActionPayloads, Card, Role, RoleTeam } from '@shared/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const assetsRoot = path.resolve(projectRoot, 'assets');

const IMAGE_RE = /\.(jpg|jpeg|png|gif|webp)$/i;

export function buildDeckFromAssets(): Card[] {
  const ingredientsDir = path.join(assetsRoot, 'ingredients');
  const images = fs.existsSync(ingredientsDir) ? fs.readdirSync(ingredientsDir).filter((n) => IMAGE_RE.test(n)) : [];
  const cards: Card[] = [];
  for (const img of images) {
    const name = img.replace(IMAGE_RE, '');
    for (let i = 0; i < 8; i++) {
      cards.push({ id: `${name}#${i}`, kind: 'INGREDIENT', name, image: `/assets/ingredients/${img}` });
    }
  }
  return shuffle(cards);
}

export function loadHeroRoles(): Role[] {
  const heroesDir = path.join(assetsRoot, 'heroes');
  const images = fs.existsSync(heroesDir) ? fs.readdirSync(heroesDir).filter((n) => IMAGE_RE.test(n)) : [];
  const roles: Role[] = images.map((img) => {
    const base = img.replace(IMAGE_RE, '');
    const lower = base.toLowerCase();
    const team: RoleTeam = lower.startsWith('evil_') ? 'EVIL' : 'GOOD';
    return { id: base, name: base, team, image: `/assets/heroes/${img}` };
  });
  return roles;
}

export function assignRoles(state: GameState) {
  const roles = loadHeroRoles();
  // basic ratio: floor(n/3) evil, rest good
  const n = state.players.length;
  const evilCount = Math.max(1, Math.floor(n / 3));
  const goodCount = n - evilCount;
  const goodRoles = roles.filter((r) => r.team === 'GOOD');
  const evilRoles = roles.filter((r) => r.team === 'EVIL');
  const chosen: Role[] = [
    ...sample(goodRoles, goodCount),
    ...sample(evilRoles, evilCount),
  ];
  // fallback if not enough assets
  while (chosen.length < n) {
    chosen.push({ id: randomUUID(), name: 'Villager', team: 'GOOD' });
  }
  state.roles = {};
  shuffle(chosen);
  state.players.forEach((p, i) => {
    p.roleId = chosen[i].id;
    state.roles[chosen[i].id] = chosen[i];
  });
}

export function startGame(state: GameState) {
  state.deck.drawPile = buildDeckFromAssets();
  state.deck.discardPile = [];
  state.hands = Object.fromEntries(state.players.map((p) => [p.id, []]));
  assignRoles(state);
  dealToHandSize(state);
  state.phase = 'NIGHT';
  state.round = 1;
  state.table = [];
  state.expiresAt = Date.now() + state.config.nightSeconds * 1000;
}

export function dealToHandSize(state: GameState) {
  for (const p of state.players) {
    const hand = state.hands[p.id] || (state.hands[p.id] = []);
    while (hand.length < state.config.handSize) {
      const c = state.deck.drawPile.pop();
      if (!c) break;
      hand.push(c);
    }
  }
}

export function playCard(state: GameState, playerId: string, cardId: string) {
  if (state.phase !== 'NIGHT') return;
  const hand = state.hands[playerId];
  const idx = hand?.findIndex((c) => c.id === cardId) ?? -1;
  if (idx < 0) return;
  const [card] = hand!.splice(idx, 1);
  state.table.push({ playerId, cardId: card.id, revealed: false });
  // If all players have played, advance early
  const activePlayers = state.players.length;
  if (state.table.length >= activePlayers) {
    revealDay(state);
  }
}

export function revealDay(state: GameState) {
  state.phase = 'DAY';
  // reveal images for table cards
  state.table = state.table.map((t) => {
    const allCards = [...state.deck.discardPile, ...Object.values(state.hands).flat(), ...state.deck.drawPile];
    // Fallback: show by reconstructing from id when possible; for now we do not need lookup
    return { ...t, revealed: true };
  });
  state.expiresAt = Date.now() + state.config.daySeconds * 1000;
}

export function nextRound(state: GameState) {
  // discard revealed
  for (const t of state.table) {
    if (t.cardId) {
      // card object lookup by id is not retained post-play; in a richer model track the card entity separately
      // no-op for now; future: push a Card to discardPile
    }
  }
  state.table = [];
  dealToHandSize(state);
  state.phase = 'NIGHT';
  state.round += 1;
  state.expiresAt = Date.now() + state.config.nightSeconds * 1000;
}

export function shapeStateFor(state: GameState, playerId: string) {
  const hands = Object.fromEntries(
    Object.entries(state.hands).map(([pid, hand]) => [
      pid,
      pid === playerId ? hand : hand.map((_c) => ({ id: 'hidden', kind: 'INGREDIENT', name: 'Hidden', image: undefined } as Card)),
    ])
  );
  const table = state.table.map((t) => ({
    playerId: t.playerId,
    revealed: t.revealed,
    image: t.revealed ? findCardImage(state, t.cardId) : undefined,
    cardId: t.revealed ? t.cardId : undefined,
  }));
  return { ...state, hands, table };
}

function findCardImage(_state: GameState, cardId?: string) {
  if (!cardId) return undefined;
  const [name] = cardId.split('#');
  const files = fs.existsSync(path.join(assetsRoot, 'ingredients')) ? fs.readdirSync(path.join(assetsRoot, 'ingredients')) : [];
  const match = files.find((f) => f.startsWith(name));
  return match ? `/assets/ingredients/${match}` : undefined;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sample<T>(arr: T[], count: number): T[] {
  return shuffle([...arr]).slice(0, Math.max(0, Math.min(count, arr.length)));
}
