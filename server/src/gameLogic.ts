import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { GameState, ActionPayloads, Card, Role, RoleTeam, CenterCard, IngredientCard } from '@irish-potions/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const assetsRoot = path.resolve(projectRoot, 'assets');

const IMAGE_RE = /\.(jpg|jpeg|png|gif|webp)$/i;

// Ingredient names (normalized to match asset filenames)
const INGREDIENTS = {
  BRIGID: "brigids_blessing",
  CAILLEACH: "cailleachs_gaze",
  CEOL: "ceol_of_the_midnight_cairn",
  FAERIE: "faerie_thistle",
  WOLFBANE: "wolfbane_root",
} as const;

function normalizeIngredientName(name: string): string {
  // Normalize ingredient names to lowercase with underscores to match asset filenames
  const lower = name.toLowerCase().trim().replace(/\s+/g, '_').replace(/'/g, '');
  
  // Direct match first
  if (lower === INGREDIENTS.BRIGID || lower.includes('brigid')) return INGREDIENTS.BRIGID;
  if (lower === INGREDIENTS.CAILLEACH || lower.includes('cailleach')) return INGREDIENTS.CAILLEACH;
  if (lower === INGREDIENTS.CEOL || lower.includes('ceol')) return INGREDIENTS.CEOL;
  if (lower === INGREDIENTS.FAERIE || lower.includes('faerie') || lower.includes('thistle')) return INGREDIENTS.FAERIE;
  if (lower === INGREDIENTS.WOLFBANE || lower.includes('wolfbane') || lower.includes('wolf')) return INGREDIENTS.WOLFBANE;
  
  return lower; // fallback to normalized version
}

export function buildDeckFromAssets(): Card[] {
  const ingredientsDir = path.join(assetsRoot, 'ingredients');
  const images = fs.existsSync(ingredientsDir) ? fs.readdirSync(ingredientsDir).filter((n) => IMAGE_RE.test(n)) : [];
  const cards: Card[] = [];
  for (const img of images) {
    const name = img.replace(IMAGE_RE, '');
    for (let i = 0; i < 10; i++) {
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

export function createCenterDeck(): { cards: CenterCard[]; revealed: CenterCard[]; discarded: CenterCard[] } {
  const cards: CenterCard[] = [];
  for (let i = 0; i < 8; i++) {
    cards.push({ id: `milk#${i}`, kind: 'CENTER', type: 'MILK' });
    cards.push({ id: `blood#${i}`, kind: 'CENTER', type: 'BLOOD' });
  }
  return {
    cards: shuffle(cards),
    revealed: [],
    discarded: [],
  };
}

export function checkWinCondition(state: GameState): boolean {
  const revealedCount = state.centerDeck.revealed.length;
  const remainingCount = state.centerDeck.cards.length;
  // Game ends when 6 cards are revealed OR only 6 cards remain
  return revealedCount >= 6 || remainingCount <= 6;
}

export function startGame(state: GameState) {
  state.deck.drawPile = buildDeckFromAssets();
  state.deck.discardPile = [];
  state.centerDeck = createCenterDeck();
  state.hands = Object.fromEntries(state.players.map((p) => [p.id, []]));
  assignRoles(state);
  dealToHandSize(state);
  state.phase = 'NIGHT';
  state.round = 1;
  state.table = [];
  state.pendingActions = [];
  state.expiresAt = Date.now() + state.config.nightSeconds * 1000;
}

export function dealToHandSize(state: GameState) {
  for (const p of state.players) {
    const hand = state.hands[p.id] || (state.hands[p.id] = []);
    while (hand.length < state.config.handSize) {
      if (state.deck.drawPile.length === 0) {
        // Shuffle discard pile back into draw pile
        state.deck.drawPile = shuffle([...state.deck.discardPile]);
        state.deck.discardPile = [];
      }
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
  // If all players have played, advance to resolution
  const activePlayers = state.players.length;
  if (state.table.length >= activePlayers) {
    startResolution(state);
  }
}

function getPlayedIngredients(state: GameState): Map<string, { count: number; playerIds: string[] }> {
  const counts = new Map<string, { count: number; playerIds: string[] }>();
  
  for (const played of state.table) {
    // Find the card in all possible locations
    let card: Card | undefined;
    const allCards = [
      ...state.deck.drawPile,
      ...state.deck.discardPile,
      ...Object.values(state.hands).flat(),
    ];
    card = allCards.find((c) => c.id === played.cardId);
    
    if (card && card.kind === 'INGREDIENT') {
      const normalized = normalizeIngredientName(card.name);
      const existing = counts.get(normalized) || { count: 0, playerIds: [] };
      existing.count++;
      existing.playerIds.push(played.playerId);
      counts.set(normalized, existing);
    }
  }
  
  return counts;
}

function determinePrimaryAndSecondary(
  counts: Map<string, { count: number; playerIds: string[] }>
): { primary: string[]; secondary: string[] } {
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1].count - a[1].count);
  
  if (sorted.length === 0) return { primary: [], secondary: [] };
  
  const maxCount = sorted[0][1].count;
  const primary = sorted.filter((e) => e[1].count === maxCount).map((e) => e[0]);
  
  // If there's a tie for primary, both are treated as secondary
  if (primary.length > 1) {
    return { primary: [], secondary: primary };
  }
  
  // Find secondary (second highest count)
  const remaining = sorted.filter((e) => e[1].count < maxCount);
  if (remaining.length === 0) return { primary, secondary: [] };
  
  const secondCount = remaining[0][1].count;
  const secondary = remaining.filter((e) => e[1].count === secondCount).map((e) => e[0]);
  
  // If there's a tie for secondary, ignore those
  if (secondary.length > 1) {
    return { primary, secondary: [] };
  }
  
  return { primary, secondary };
}

function startResolution(state: GameState) {
  state.phase = 'RESOLUTION';
  
  // Reveal all cards on the table
  state.table = state.table.map((t) => ({ ...t, revealed: true }));
  
  // Determine primary and secondary ingredients
  const counts = getPlayedIngredients(state);
  const { primary, secondary } = determinePrimaryAndSecondary(counts);
  
  // Check if Faerie Thistle is secondary (blocks primary)
  const faerieBlocks = secondary.includes(INGREDIENTS.FAERIE);
  
  // Apply secondary effects first (Wolfbane Root discards from center deck)
  for (const ingredient of secondary) {
    applySecondaryEffect(state, ingredient, counts);
  }
  
  // Apply primary effect (unless blocked)
  if (!faerieBlocks && primary.length > 0) {
    applyPrimaryEffect(state, primary[0], counts);
  }
  
  // Move to day phase immediately
  revealDay(state);
}

function applyPrimaryEffect(
  state: GameState,
  ingredient: string,
  counts: Map<string, { count: number; playerIds: string[] }>
) {
  const data = counts.get(ingredient);
  if (!data) return;
  
  switch (ingredient) {
    case INGREDIENTS.BRIGID:
      applyBrigidPrimary(state);
      break;
    case INGREDIENTS.CAILLEACH:
      applyCailleachPrimary(state, data.playerIds);
      break;
    case INGREDIENTS.CEOL:
      applyCeolPrimary(state, data.playerIds);
      break;
    case INGREDIENTS.FAERIE:
      applyFaeriePrimary(state, data.count);
      break;
    case INGREDIENTS.WOLFBANE:
      applyWolfbanePrimary(state);
      break;
  }
}

function applySecondaryEffect(
  state: GameState,
  ingredient: string,
  counts: Map<string, { count: number; playerIds: string[] }>
) {
  const data = counts.get(ingredient);
  if (!data) return;
  
  switch (ingredient) {
    case INGREDIENTS.BRIGID:
      // Repeat primary effect (if not Ceol)
      const primary = determinePrimaryAndSecondary(counts).primary;
      if (primary.length > 0 && primary[0] !== INGREDIENTS.CEOL) {
        applyPrimaryEffect(state, primary[0], counts);
      }
      break;
    case INGREDIENTS.CAILLEACH:
      applyCailleachSecondary(state, data.playerIds);
      break;
    case INGREDIENTS.CEOL:
      // Nothing happens
      break;
    case INGREDIENTS.FAERIE:
      // Blocks primary (handled in startResolution)
      break;
    case INGREDIENTS.WOLFBANE:
      applyWolfbaneSecondary(state);
      break;
  }
}

// Primary Effects
function applyBrigidPrimary(state: GameState) {
  if (state.centerDeck.cards.length < 2) return;
  
  const card1 = state.centerDeck.cards[state.centerDeck.cards.length - 1];
  const card2 = state.centerDeck.cards[state.centerDeck.cards.length - 2];
  
  if (card1.type === 'MILK' && card2.type === 'MILK') {
    // Play one face up, return other to bottom
    const revealed = state.centerDeck.cards.pop()!;
    state.centerDeck.revealed.push(revealed);
    // The other stays at top, move to bottom
    const bottom = state.centerDeck.cards.pop()!;
    state.centerDeck.cards.unshift(bottom);
  }
  // Otherwise, both stay on top (no action needed)
}

function applyCailleachPrimary(state: GameState, playerIds: string[]) {
  // Each player who played this card may look at 1 random card from deck
  // and decide to place at bottom or discard
  // This requires player interaction - for now, simulate randomly
  for (const playerId of playerIds) {
    if (state.centerDeck.cards.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * state.centerDeck.cards.length);
    const card = state.centerDeck.cards[randomIndex];
    
    // Randomly decide: 50% discard, 50% to bottom
    const shouldDiscard = Math.random() < 0.5;
    state.centerDeck.cards.splice(randomIndex, 1);
    
    if (shouldDiscard) {
      state.centerDeck.discarded.push(card);
    } else {
      state.centerDeck.cards.unshift(card);
    }
  }
}

function applyCeolPrimary(state: GameState, playerIds: string[]) {
  // Take one random hero card and shuffle with Ceol players' hero cards
  // Give random card to each Ceol player, discard the remaining one
  
  // Get all hero role IDs
  const allRoleIds = Object.keys(state.roles);
  if (allRoleIds.length === 0) return;
  
  // Pick a random unused role (or from any role)
  const usedRoleIds = state.players.map((p) => p.roleId).filter((r): r is string => !!r);
  const unusedRoles = allRoleIds.filter((r) => !usedRoleIds.includes(r));
  
  let extraRole: string;
  if (unusedRoles.length > 0) {
    extraRole = unusedRoles[Math.floor(Math.random() * unusedRoles.length)];
  } else {
    extraRole = allRoleIds[Math.floor(Math.random() * allRoleIds.length)];
  }
  
  // Collect all roles (Ceol players' + extra)
  const rolePool = [
    ...playerIds.map((pid) => state.players.find((p) => p.id === pid)?.roleId).filter((r): r is string => !!r),
    extraRole,
  ];
  
  shuffle(rolePool);
  
  // Redistribute to Ceol players
  playerIds.forEach((pid, idx) => {
    const player = state.players.find((p) => p.id === pid);
    if (player && rolePool[idx]) {
      player.roleId = rolePool[idx];
    }
  });
}

function applyFaeriePrimary(state: GameState, count: number) {
  if (state.centerDeck.cards.length < 2) return;
  
  const card1 = state.centerDeck.cards.pop()!;
  const card2 = state.centerDeck.cards.pop()!;
  
  if (count > 3) {
    // Discard milk, shuffle blood back
    if (card1.type === 'MILK') state.centerDeck.discarded.push(card1);
    else state.centerDeck.cards.push(card1);
    
    if (card2.type === 'MILK') state.centerDeck.discarded.push(card2);
    else state.centerDeck.cards.push(card2);
  } else {
    // Discard blood, shuffle milk back
    if (card1.type === 'BLOOD') state.centerDeck.discarded.push(card1);
    else state.centerDeck.cards.push(card1);
    
    if (card2.type === 'BLOOD') state.centerDeck.discarded.push(card2);
    else state.centerDeck.cards.push(card2);
  }
  
  state.centerDeck.cards = shuffle(state.centerDeck.cards);
}

function applyWolfbanePrimary(state: GameState) {
  // Each player discards one card at random from their hand
  for (const player of state.players) {
    const hand = state.hands[player.id];
    if (hand && hand.length > 0) {
      const randomIndex = Math.floor(Math.random() * hand.length);
      const [discarded] = hand.splice(randomIndex, 1);
      if (discarded.kind === 'INGREDIENT') {
        state.deck.discardPile.push(discarded);
      }
    }
  }
}

// Secondary Effects
function applyCailleachSecondary(state: GameState, playerIds: string[]) {
  // Each player who played Cailleach may look at top card of center deck
  // Card is returned to top without changing position
  // This is information-only, so no state change needed in this simple implementation
}

function applyWolfbaneSecondary(state: GameState) {
  // Discard top card from center deck without revealing
  if (state.centerDeck.cards.length > 0) {
    const card = state.centerDeck.cards.pop()!;
    state.centerDeck.discarded.push(card);
  }
}

export function revealDay(state: GameState) {
  state.phase = 'DAY';
  state.expiresAt = Date.now() + state.config.daySeconds * 1000;
  
  // Check win condition
  if (checkWinCondition(state)) {
    state.phase = 'ENDED';
    state.expiresAt = null;
    return;
  }
}

export function nextRound(state: GameState) {
  // Discard all played cards
  for (const t of state.table) {
    // Cards are already removed from hands during playCard
    // Just move them to discard pile
    const allCards = [...state.deck.drawPile, ...state.deck.discardPile, ...Object.values(state.hands).flat()];
    const card = allCards.find((c) => c.id === t.cardId);
    if (card && card.kind === 'INGREDIENT' && !state.deck.discardPile.find((c) => c.id === card.id)) {
      state.deck.discardPile.push(card);
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
      pid === playerId
        ? hand
        : hand.map((_c) => ({ id: 'hidden', kind: 'INGREDIENT', name: 'Hidden', image: '' } as Card)),
    ])
  );
  const table = state.table.map((t) => ({
    playerId: t.playerId,
    revealed: t.revealed,
    image: t.revealed ? findCardImage(state, t.cardId) : undefined,
    cardId: t.revealed ? t.cardId : undefined,
  }));
  
  // Show center deck counts but not the actual cards (except revealed ones)
  const centerDeck = {
    cards: state.centerDeck.cards.map(() => ({ id: 'hidden', kind: 'CENTER', type: 'MILK' } as CenterCard)),
    revealed: state.centerDeck.revealed,
    discarded: state.centerDeck.discarded.map(() => ({ id: 'hidden', kind: 'CENTER', type: 'MILK' } as CenterCard)),
  };
  
  return { ...state, currentPlayerId: playerId, hands, table, centerDeck };
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
