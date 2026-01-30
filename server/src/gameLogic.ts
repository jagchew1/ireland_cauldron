import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { GameState, ActionPayloads, Card, Role, RoleTeam, CenterCard, IngredientCard, PendingAction, PlayerKnowledge, ResolutionLogEntry } from '@irish-potions/shared';

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
  YEW: "yews_quiet_draught",
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
  if (lower === INGREDIENTS.YEW || lower.includes('yew') || lower.includes('quiet') || lower.includes('draught')) return INGREDIENTS.YEW;
  
  return lower; // fallback to normalized version
}

function formatIngredientName(name: string): string {
  // Convert "brigids_blessing" to "Brigid's Blessing"
  const formatted = name
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Add apostrophes where needed
  return formatted
    .replace(/Brigids/g, "Brigid's")
    .replace(/Cailleachs/g, "Cailleach's")
    .replace(/Yews/g, "Yew's");
}

// Helper to add log entry with current round number
function addLogEntry(state: GameState, entry: Omit<ResolutionLogEntry, 'round'>) {
  state.resolutionLog.push({
    ...entry,
    round: state.round,
  });
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
  // but always at least 2 evil players for 5+ player games
  const n = state.players.length;
  let evilCount = Math.max(1, Math.floor(n / 3));
  if (n >= 5) {
    evilCount = Math.max(2, evilCount);
  }
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
  // Store all available roles in heroDeck (the ones not dealt to players)
  const allRoles = [...goodRoles, ...evilRoles];
  state.heroDeck = allRoles.filter(role => !chosen.some(c => c.id === role.id));
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
  const remainingCount = state.centerDeck.cards.length;
  // Game ends when deck has 5 or fewer cards
  return remainingCount <= 5;
}

export function calculateWinner(state: GameState): 'GOOD' | 'EVIL' | 'TIE' {
  // Count milk vs blood in remaining deck + revealed cards
  const allCards = [...state.centerDeck.cards, ...state.centerDeck.revealed];
  const milkCount = allCards.filter(c => c.type === 'MILK').length;
  const bloodCount = allCards.filter(c => c.type === 'BLOOD').length;
  
  if (milkCount > bloodCount) return 'GOOD';
  if (bloodCount > milkCount) return 'EVIL';
  return 'TIE';
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
  state.cardClaims = {};
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

// Force all players who haven't submitted to auto-play a random card
export function forceNightPhaseEnd(state: GameState) {
  if (state.phase !== 'NIGHT') return;
  
  console.log('=== FORCING NIGHT PHASE END (TIMER EXPIRED) ===');
  
  // Find all connected, non-poisoned players who haven't played
  const playersWhoPlayed = new Set(state.table.map(t => t.playerId));
  const activePlayers = state.players.filter(p => p.connected && !p.poisoned);
  const playersWhoNeedToPlay = activePlayers.filter(p => !playersWhoPlayed.has(p.id));
  
  console.log(`Active players: ${activePlayers.length}, Already played: ${playersWhoPlayed.size}, Need to play: ${playersWhoNeedToPlay.length}`);
  
  // Auto-play a random card for each player who hasn't submitted
  for (const player of playersWhoNeedToPlay) {
    const hand = state.hands[player.id];
    if (hand && hand.length > 0) {
      // Pick a random card from their hand
      const randomIndex = Math.floor(Math.random() * hand.length);
      const [card] = hand.splice(randomIndex, 1);
      state.table.push({ playerId: player.id, cardId: card.id, card, revealed: false });
      const cardName = card.kind === 'INGREDIENT' ? card.name : card.type;
      console.log(`Auto-played random card for ${player.name}: ${cardName}`);
      
      // Create a pending action to notify this player
      state.pendingActions.unshift({
        actionType: 'forced_play_notification',
        playerId: player.id,
        cardName,
      });
    }
  }
  
  // Add log entry notifying about auto-plays
  if (playersWhoNeedToPlay.length > 0) {
    const names = playersWhoNeedToPlay.map(p => p.name).join(', ');
    addLogEntry(state, {
      type: 'info',
      message: `⏰ Timer expired! Random cards were played for: ${names}`,
    });
  }
  
  // Now trigger resolution
  startResolution(state);
}

export function playCard(state: GameState, playerId: string, cardId: string) {
  if (state.phase !== 'NIGHT') return;
  
  // Check if player is poisoned
  const player = state.players.find(p => p.id === playerId);
  console.log(`[PLAY CARD] Player ${player?.name || playerId} attempting to play. Poisoned status: ${player?.poisoned || false}`);
  if (player?.poisoned) {
    console.log(`Player ${playerId} is poisoned and cannot play a card`);
    return;
  }
  
  const hand = state.hands[playerId];
  const idx = hand?.findIndex((c) => c.id === cardId) ?? -1;
  if (idx < 0) return;
  const [card] = hand!.splice(idx, 1);
  
  // Count expected players BEFORE marking anyone as newly poisoned
  // (players poisoned from playing poisoned ingredient this round should still count)
  const expectedPlayers = state.players.filter(p => p.connected && !p.poisoned).length;
  
  state.table.push({ playerId, cardId: card.id, card, revealed: false });
  
  // Check if this ingredient is poisoned (mark player as poisoned AFTER counting)
  if (card.kind === 'INGREDIENT' && state.poisonedIngredient && player) {
    const normalizedCardName = normalizeIngredientName(card.name);
    console.log(`[POISON CHECK] Card: "${card.name}" → normalized: "${normalizedCardName}" | Poisoned ingredient: "${state.poisonedIngredient}"`);
    if (normalizedCardName === state.poisonedIngredient) {
      player.poisoned = true;
      console.log(`Player ${player.name} played poisoned ingredient ${card.name} and is now poisoned`);
    } else {
      console.log(`[POISON CHECK] No match - player NOT poisoned`);
    }
  }
  
  console.log(`Cards played: ${state.table.length}/${expectedPlayers} active players`);
  
  if (state.table.length >= expectedPlayers) {
    startResolution(state);
  }
}

export function unplayCard(state: GameState, playerId: string) {
  if (state.phase !== 'NIGHT') return;
  
  // Find the card on the table
  const tableIndex = state.table.findIndex(t => t.playerId === playerId);
  if (tableIndex === -1) return;
  
  // Remove the card from the table and return it to the player's hand
  const [playedCard] = state.table.splice(tableIndex, 1);
  const hand = state.hands[playerId];
  if (hand) {
    hand.push(playedCard.card);
  }
  console.log(`Player ${playerId} took back their card`);
}

export function claimCard(state: GameState, playerId: string, cardId: string) {
  if (state.phase !== 'DAY') return;
  
  // Find the card on the table
  const cardOnTable = state.table.find(t => t.cardId === cardId);
  if (!cardOnTable) return;
  
  // Find if player has claimed any card
  let currentlyClaimedCard: string | undefined;
  for (const [cid, claimers] of Object.entries(state.cardClaims)) {
    if (claimers.includes(playerId)) {
      currentlyClaimedCard = cid;
      break;
    }
  }
  
  // If clicking the same card they already claimed, unclaim it
  if (currentlyClaimedCard === cardId) {
    state.cardClaims[cardId] = state.cardClaims[cardId].filter(pid => pid !== playerId);
    if (state.cardClaims[cardId].length === 0) {
      delete state.cardClaims[cardId];
    }
    console.log(`Player ${playerId} unclaimed card ${cardId}`);
    return;
  }
  
  // Remove previous claim if exists
  if (currentlyClaimedCard) {
    state.cardClaims[currentlyClaimedCard] = state.cardClaims[currentlyClaimedCard].filter(pid => pid !== playerId);
    if (state.cardClaims[currentlyClaimedCard].length === 0) {
      delete state.cardClaims[currentlyClaimedCard];
    }
    console.log(`Player ${playerId} removed previous claim on card ${currentlyClaimedCard}`);
  }
  
  // Claim the new card (multiple players can claim the same card for bluffing)
  if (!state.cardClaims[cardId]) {
    state.cardClaims[cardId] = [];
  }
  state.cardClaims[cardId].push(playerId);
  console.log(`Player ${playerId} claimed card ${cardId}`);
}

function getPlayedIngredients(state: GameState): Map<string, { count: number; playerIds: string[] }> {
  const counts = new Map<string, { count: number; playerIds: string[] }>();
  
  console.log('Getting played ingredients from table...');
  for (const played of state.table) {
    console.log(`Looking at card: ${played.cardId}`);
    const card = played.card;
    
    console.log(`Card:`, card);
    
    if (card && card.kind === 'INGREDIENT') {
      const normalized = normalizeIngredientName(card.name);
      console.log(`Normalized name: ${normalized}`);
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
  const secondaryTied = remaining.filter((e) => e[1].count === secondCount).map((e) => e[0]);
  
  // If there's a tie for secondary and we have a primary, randomly pick one
  if (secondaryTied.length > 1) {
    const randomIndex = Math.floor(Math.random() * secondaryTied.length);
    return { primary, secondary: [secondaryTied[randomIndex]] };
  }
  
  return { primary, secondary: secondaryTied };
}

export function startResolution(state: GameState) {
  console.log('=== RESOLUTION PHASE STARTING ===');
  console.log('Table contents:', JSON.stringify(state.table, null, 2));
  state.phase = 'RESOLUTION';
  
  // Clear poison status from players who were blocked from casting (didn't play a card)
  const playerIdsWhoPlayed = new Set(state.table.map(t => t.playerId));
  for (const player of state.players) {
    if (player.poisoned && !playerIdsWhoPlayed.has(player.id)) {
      console.log(`[CLEAR PLAYER POISON] ${player.name} was blocked from casting - clearing poison`);
      player.poisoned = false;
    }
  }
  
  // Clear poisoned ingredient now that the night phase is over and cards have been played
  if (state.poisonedIngredient) {
    console.log(`[CLEAR POISON] Clearing poisoned ingredient: "${state.poisonedIngredient}"`);
    state.poisonedIngredient = null;
  }
  
  // Keep previous rounds in log - just add to it with current round number
  
  // Reveal all cards on the table
  state.table = state.table.map((t) => ({ ...t, revealed: true }));
  
  // Determine primary and secondary ingredients
  const counts = getPlayedIngredients(state);
  const { primary, secondary } = determinePrimaryAndSecondary(counts);
  
  console.log('Ingredient counts:', Array.from(counts.entries()).map(([name, data]) => `${name}: ${data.count}`));
  console.log('Primary:', primary);
  console.log('Secondary:', secondary);
  
  // Log what was played
  if (primary.length > 0) {
    addLogEntry(state, {
      type: 'primary',
      ingredient: primary[0],
      message: `Primary ingredient: ${formatIngredientName(primary[0])}`,
    });
  } else if (secondary.length > 1) {
    addLogEntry(state, {
      type: 'info',
      message: `Tie for primary - both become secondary effects`,
    });
  }
  
  if (secondary.length > 0) {
    addLogEntry(state, {
      type: 'secondary',
      ingredient: secondary[0],
      message: `Secondary ingredient: ${formatIngredientName(secondary[0])}`,
    });
  }
  
  // Check if Wolfbane Root is secondary (blocks primary)
  const wolfbaneBlocks = secondary.includes(INGREDIENTS.WOLFBANE);
  if (wolfbaneBlocks) {
    console.log('Wolfbane Root blocks primary effect!');
    addLogEntry(state, {
      type: 'info',
      message: 'Wolfbane Root blocks the primary effect!',
    });
  }
  
  // Apply secondary effects first (Wolfbane Root discards from center deck)
  console.log('Applying secondary effects...');
  for (const ingredient of secondary) {
    applySecondaryEffect(state, ingredient, counts);
  }
  
  // Apply primary effect (unless blocked)
  if (!wolfbaneBlocks && primary.length > 0) {
    console.log('Applying primary effect:', primary[0]);
    applyPrimaryEffect(state, primary[0], counts);
  }
  
  console.log('Pending actions created:', state.pendingActions.length);
  console.log('=== MOVING TO DAY PHASE ===');
  
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
    case INGREDIENTS.YEW:
      applyYewPrimary(state, data.playerIds);
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
      applyCeolSecondary(state, data.playerIds);
      break;
    case INGREDIENTS.FAERIE:
      applyFaerieSecondary(state);
      break;
    case INGREDIENTS.WOLFBANE:
      // Blocks primary (handled in startResolution)
      break;
    case INGREDIENTS.YEW:
      applyYewSecondary(state, data.playerIds);
      break;
  }
}

// Primary Effects
function applyBrigidPrimary(state: GameState) {
  if (state.centerDeck.cards.length < 2) return;
  
  const card1 = state.centerDeck.cards.pop()!;
  const card2 = state.centerDeck.cards.pop()!;
  
  // Log cards shown to all players
  addLogEntry(state, {
    type: 'info',
    message: `Brigid's Blessing reveals 2 cards: ${card1.type} and ${card2.type}`,
    cardsShown: [card1, card2],
  });
  
  if (card1.type === 'MILK' && card2.type === 'MILK') {
    // Play one face up, return other to bottom
    state.centerDeck.revealed.push(card1);
    state.centerDeck.cards.unshift(card2);
    
    addLogEntry(state, {
      type: 'info',
      message: `Both milk! One played face up, one returned to bottom.`,
    });
  } else {
    // Return both to bottom
    state.centerDeck.cards.unshift(card2, card1);
    
    addLogEntry(state, {
      type: 'info',
      message: `Not both milk - both cards returned to bottom of deck.`,
    });
  }
}

function applyCailleachPrimary(state: GameState, playerIds: string[]) {
  // Each player who played this card may look at 1 random card from deck
  // and decide to place at bottom or discard
  // Create pending actions for each player
  for (const playerId of playerIds) {
    if (state.centerDeck.cards.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * state.centerDeck.cards.length);
    const card = state.centerDeck.cards[randomIndex];
    
    state.pendingActions.push({
      actionType: 'cailleach_primary',
      playerId,
      cardShown: card,
      cardIndex: randomIndex,
    });
  }
  
  addLogEntry(state, {
    type: 'info',
    message: `${playerIds.length} player(s) viewing cards from the deck...`,
  });
}

function applyCeolPrimary(state: GameState, playerIds: string[]) {
  // Shuffle role cards from Ceol players with one undealt role from hero deck
  // Reassign randomly; put the extra card back in the hero deck
  
  if (state.heroDeck.length === 0) {
    addLogEntry(state, {
      type: 'info',
      message: `No undealt roles available - Ceol effect fizzled.`,
    });
    return;
  }
  
  // Collect roles from Ceol players
  const playerRoles = playerIds
    .map((pid) => state.players.find((p) => p.id === pid))
    .filter((p): p is NonNullable<typeof p> => !!p && !!p.roleId)
    .map((p) => ({ playerId: p.id, roleId: p.roleId!, role: state.roles[p.roleId!] }));
  
  if (playerRoles.length === 0) return;
  
  // Take one random role from hero deck
  const randomIndex = Math.floor(Math.random() * state.heroDeck.length);
  const extraRole = state.heroDeck.splice(randomIndex, 1)[0];
  
  // Create pool of all roles (player roles + extra from deck)
  const rolePool = [...playerRoles.map(pr => pr.role), extraRole];
  shuffle(rolePool);
  
  // Redistribute to Ceol players
  playerRoles.forEach((pr, idx) => {
    const player = state.players.find((p) => p.id === pr.playerId);
    if (player && rolePool[idx]) {
      const newRole = rolePool[idx];
      
      // Remove old role from state.roles if no other player has it
      const oldRoleId = player.roleId!;
      const otherPlayerHasOldRole = state.players.some(p => p.id !== player.id && p.roleId === oldRoleId);
      if (!otherPlayerHasOldRole && state.roles[oldRoleId]) {
        // Put old role back in hero deck (unless it's the one we just drew)
        if (oldRoleId !== extraRole.id) {
          state.heroDeck.push(state.roles[oldRoleId]);
        }
        delete state.roles[oldRoleId];
      }
      
      // Assign new role
      player.roleId = newRole.id;
      state.roles[newRole.id] = newRole;
      
      state.pendingActions.push({
        actionType: 'ceol_primary',
        playerId: pr.playerId,
        newRoleId: newRole.id,
      });
    }
  });
  
  // Put the leftover role back in hero deck
  const leftoverRole = rolePool[playerRoles.length];
  if (leftoverRole && !state.heroDeck.some(r => r.id === leftoverRole.id)) {
    state.heroDeck.push(leftoverRole);
  }
  
  addLogEntry(state, {
    type: 'info',
    message: `${playerRoles.length} player(s) swapped roles. Viewing new roles...`,
  });
}

function applyFaeriePrimary(state: GameState, count: number) {
  if (state.centerDeck.cards.length < 2) return;
  
  // Calculate dynamic threshold: floor((playerCount - 1) / 2), minimum of 2
  const playerCount = state.players.length;
  const threshold = Math.max(2, Math.floor((playerCount - 1) / 2));
  
  const card1 = state.centerDeck.cards.pop()!;
  const card2 = state.centerDeck.cards.pop()!;
  
  // Log cards shown
  addLogEntry(state, {
    type: 'info',
    message: `Faerie Thistle reveals 2 cards: ${card1.type} and ${card2.type}`,
    cardsShown: [card1, card2],
  });
  
  if (count > threshold) {
    // Discard milk, shuffle blood back
    if (card1.type === 'MILK') {
      state.centerDeck.discarded.push(card1);
      // Track public knowledge of discarded milk
      for (const player of state.players) {
        state.playerKnowledge.push({
          playerId: player.id,
          cardId: card1.id,
          type: card1.type,
          location: 'discard',
          isPublic: true,
        });
      }
    } else {
      state.centerDeck.cards.push(card1);
    }
    
    if (card2.type === 'MILK') {
      state.centerDeck.discarded.push(card2);
      // Track public knowledge
      for (const player of state.players) {
        state.playerKnowledge.push({
          playerId: player.id,
          cardId: card2.id,
          type: card2.type,
          location: 'discard',
          isPublic: true,
        });
      }
    } else {
      state.centerDeck.cards.push(card2);
    }
    
    addLogEntry(state, {
      type: 'info',
      message: `>${threshold} Faerie Thistles played - milk discarded, blood shuffled back.`,
    });
  } else {
    // Discard blood, shuffle milk back
    if (card1.type === 'BLOOD') {
      state.centerDeck.discarded.push(card1);
      // Track public knowledge
      for (const player of state.players) {
        state.playerKnowledge.push({
          playerId: player.id,
          cardId: card1.id,
          type: card1.type,
          location: 'discard',
          isPublic: true,
        });
      }
    } else {
      state.centerDeck.cards.push(card1);
    }
    
    if (card2.type === 'BLOOD') {
      state.centerDeck.discarded.push(card2);
      // Track public knowledge
      for (const player of state.players) {
        state.playerKnowledge.push({
          playerId: player.id,
          cardId: card2.id,
          type: card2.type,
          location: 'discard',
          isPublic: true,
        });
      }
    } else {
      state.centerDeck.cards.push(card2);
    }
    
    addLogEntry(state, {
      type: 'info',
      message: `≤${threshold} Faerie Thistles played - blood discarded, milk shuffled back.`,
    });
  }
  
  state.centerDeck.cards = shuffle(state.centerDeck.cards);
}

function applyWolfbanePrimary(state: GameState) {
  // Each player discards one card at random from their hand
  // Create pending actions for each player
  for (const player of state.players) {
    state.pendingActions.push({
      actionType: 'wolfbane_primary',
      playerId: player.id,
    });
  }
  
  addLogEntry(state, {
    type: 'info',
    message: `All players must discard 1 random card from their hand.`,
  });
}

// Secondary Effects
function applyCailleachSecondary(state: GameState, playerIds: string[]) {
  // Each player who played Cailleach may look at top card of center deck
  // Card is returned to top without changing position
  for (const playerId of playerIds) {
    if (state.centerDeck.cards.length === 0) break;
    
    const topCard = state.centerDeck.cards[state.centerDeck.cards.length - 1];
    
    state.pendingActions.push({
      actionType: 'cailleach_secondary',
      playerId,
      cardShown: topCard,
    });
  }
  
  if (playerIds.length > 0) {
    addLogEntry(state, {
      type: 'info',
      message: `${playerIds.length} player(s) viewing top card of deck...`,
    });
  }
}

function applyCeolSecondary(state: GameState, playerIds: string[]) {
  // Each player who played Ceol sees the role of one other random Ceol player
  // Do nothing if only one player played Ceol
  if (playerIds.length <= 1) {
    return;
  }
  
  // For each Ceol player, show them one random OTHER Ceol player's role
  for (const playerId of playerIds) {
    // Get all other Ceol players
    const otherPlayerIds = playerIds.filter(id => id !== playerId);
    
    // Pick a random other player
    const randomOtherPlayerId = otherPlayerIds[Math.floor(Math.random() * otherPlayerIds.length)];
    const otherPlayer = state.players.find(p => p.id === randomOtherPlayerId);
    
    if (otherPlayer && otherPlayer.roleId) {
      state.pendingActions.push({
        actionType: 'ceol_secondary',
        playerId,
        revealedRoleId: otherPlayer.roleId,
      });
    }
  }
  
  addLogEntry(state, {
    type: 'info',
    message: `${playerIds.length} player(s) viewing another player's role...`,
  });
}

function applyFaerieSecondary(state: GameState) {
  // Discard top card from center deck without revealing
  if (state.centerDeck.cards.length > 0) {
    const card = state.centerDeck.cards.pop()!;
    state.centerDeck.discarded.push(card);
  }
}

function applyYewPrimary(state: GameState, playerIds: string[]) {
  // Each player who played Yew chooses an ingredient to poison
  const availableIngredients = [
    INGREDIENTS.BRIGID,
    INGREDIENTS.CAILLEACH,
    INGREDIENTS.CEOL,
    INGREDIENTS.FAERIE,
    INGREDIENTS.WOLFBANE,
    // Note: Yew itself is not in the list
  ];
  
  for (const playerId of playerIds) {
    state.pendingActions.push({
      actionType: 'yew_primary',
      playerId,
      availableIngredients,
    });
  }
  
  addLogEntry(state, {
    type: 'primary',
    message: `Yew's Quiet Draught: ${playerIds.length} player(s) choosing ingredients to poison...`,
  });
}

function applyYewSecondary(state: GameState, playerIds: string[]) {
  // Reveal top card of deck - if blood, poison all Yew players
  if (state.centerDeck.cards.length === 0) {
    addLogEntry(state, {
      type: 'secondary',
      message: `Yew's Quiet Draught (Secondary): No cards in deck to reveal.`,
    });
    return;
  }
  
  const topCard = state.centerDeck.cards[state.centerDeck.cards.length - 1];
  
  addLogEntry(state, {
    type: 'secondary',
    message: `Yew's Quiet Draught (Secondary): Top card revealed: ${topCard.type}`,
    cardsShown: [topCard],
  });
  
  if (topCard.type === 'BLOOD') {
    // Poison all players who played Yew
    for (const playerId of playerIds) {
      const player = state.players.find(p => p.id === playerId);
      if (player) {
        player.poisoned = true;
        
        state.pendingActions.push({
          actionType: 'yew_secondary',
          playerId,
        });
      }
    }
    
    addLogEntry(state, {
      type: 'secondary',
      message: `Blood revealed! ${playerIds.length} player(s) who cast Yew are poisoned for next round.`,
    });
  } else {
    addLogEntry(state, {
      type: 'secondary',
      message: `Milk revealed - Yew players are safe.`,
    });
  }
}

export function revealDay(state: GameState) {
  console.log('=== DAY PHASE STARTING ===');
  state.phase = 'DAY';
  state.expiresAt = Date.now() + state.config.daySeconds * 1000;
  
  // Reset endedDiscussion flags
  state.players.forEach(p => p.endedDiscussion = false);
  console.log('Player states after reset:');
  state.players.forEach(p => {
    console.log(`  - ${p.name} (${p.id}): endedDiscussion=${p.endedDiscussion}, connected=${p.connected}, isReady=${p.isReady}`);
  });
  
  // Move played cards from table to ingredient discard pile
  console.log('Moving played cards to discard...');
  for (const t of state.table) {
    const card = t.card;
    if (card && card.kind === 'INGREDIENT' && !state.deck.discardPile.find((c) => c.id === card.id)) {
      console.log(`Discarding card: ${card.name} (${card.id})`);
      state.deck.discardPile.push(card);
    }
  }
  // Keep cards on table during day phase for visibility
  
  // Players draw up to 3 cards from discard pile
  console.log('Dealing cards from discard to hands...');
  dealToHandSize(state);
  
  // Check win condition
  if (checkWinCondition(state)) {
    state.phase = 'ENDED';
    state.winner = calculateWinner(state);
    state.expiresAt = null;
    console.log(`=== GAME ENDED - Winner: ${state.winner} ===`);
    return;
  }
  
  console.log('=== DAY PHASE - Discussion Open ===');
}

export function nextRound(state: GameState) {
  console.log('=== NEXT ROUND ===');
  // Clear table from previous round (cards already in discard from revealDay)
  state.table = [];
  state.cardClaims = {};
  
  // Clear runes sent tracker for new day phase
  state.runesSentThisRound = {};
  
  // Note: Player poison is NOT cleared here - it's cleared in startResolution
  // after they've been blocked from casting
  // Note: poisonedIngredient is NOT cleared here - it needs to persist through the next night
  // so we can check if players play the poisoned ingredient
  
  // Advance to night phase
  state.phase = 'NIGHT';
  state.round += 1;
  state.expiresAt = Date.now() + state.config.nightSeconds * 1000;
  console.log(`=== STARTING ROUND ${state.round} ===`);
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
    cardId: t.cardId, // Always include cardId for claiming purposes
    cardName: t.revealed && t.card.kind === 'INGREDIENT' ? t.card.name : undefined,
  }));
  
  // Show center deck - if game ended, reveal all cards, otherwise hide them
  const centerDeck = state.phase === 'ENDED' 
    ? state.centerDeck // Show all cards when game ends
    : {
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

export function processResolutionAction(state: GameState, playerId: string, choice: 'keep' | 'discard' | 'confirm') {
  const actionIndex = state.pendingActions.findIndex(a => a.playerId === playerId);
  if (actionIndex === -1) return;
  
  const action = state.pendingActions[actionIndex];
  
  if (action.actionType === 'cailleach_primary') {
    // Remove the card from its original position
    state.centerDeck.cards.splice(action.cardIndex, 1);
    
    if (choice === 'discard') {
      state.centerDeck.discarded.push(action.cardShown);
      // Track player knowledge (private)
      state.playerKnowledge.push({
        playerId,
        cardId: action.cardShown.id,
        type: action.cardShown.type,
        location: 'discard',
        isPublic: false,
      });
    } else {
      // Keep - place at bottom
      state.centerDeck.cards.unshift(action.cardShown);
    }
  } else if (action.actionType === 'cailleach_secondary') {
    // Just viewing the top card - no action needed, just acknowledge
    // No state change required
  } else if (action.actionType === 'wolfbane_primary') {
    // Discard random card from hand
    const hand = state.hands[playerId];
    if (hand && hand.length > 0) {
      const randomIndex = Math.floor(Math.random() * hand.length);
      const [discarded] = hand.splice(randomIndex, 1);
      if (discarded.kind === 'INGREDIENT') {
        state.deck.discardPile.push(discarded);
      }
    }
  } else if (action.actionType === 'ceol_primary') {
    // Just confirmation, role already swapped
    // No additional action needed
  } else if (action.actionType === 'yew_secondary') {
    // Just confirmation of self-poison
    // Poison status already set
  } else if (action.actionType === 'forced_play_notification') {
    // Just confirmation that they saw the notification
    // No state change required
  }
  
  // Remove the action
  state.pendingActions.splice(actionIndex, 1);
}

export function processYewTarget(state: GameState, playerId: string, targetIngredient: string) {
  // Find and remove this player's pending yew action
  const actionIndex = state.pendingActions.findIndex(
    a => a.playerId === playerId && a.actionType === 'yew_primary'
  );
  if (actionIndex === -1) return;
  
  // Store the vote in a temporary map
  if (!state.yewVotes) {
    (state as any).yewVotes = {};
  }
  (state as any).yewVotes[playerId] = targetIngredient;
  
  // Remove this player's pending action
  state.pendingActions.splice(actionIndex, 1);
  
  // Check if all Yew players have voted
  const remainingYewActions = state.pendingActions.filter(a => a.actionType === 'yew_primary');
  if (remainingYewActions.length === 0) {
    // All votes are in - process the results
    resolveYewVotes(state);
  }
}

function resolveYewVotes(state: GameState) {
  const votes = (state as any).yewVotes || {};
  const voteCount: Record<string, number> = {};
  
  // Count votes for each ingredient
  for (const ingredientName of Object.values(votes) as string[]) {
    voteCount[ingredientName] = (voteCount[ingredientName] || 0) + 1;
  }
  
  // Find the maximum vote count
  const maxVotes = Math.max(...Object.values(voteCount), 0);
  const winners = Object.entries(voteCount).filter(([_, count]) => count === maxVotes).map(([name]) => name);
  
  // Calculate majority threshold (more than half of voters)
  const totalVoters = Object.keys(votes).length;
  const majorityThreshold = Math.floor(totalVoters / 2) + 1;
  
  let poisonedIngredient: string;
  
  if (maxVotes >= majorityThreshold && winners.length === 1) {
    // Majority achieved - poison this ingredient
    poisonedIngredient = winners[0];
    addLogEntry(state, {
      type: 'primary',
      message: `Yew's Quiet Draught: ${formatIngredientName(poisonedIngredient)} has been poisoned by majority vote. Players who cast it next round will be poisoned.`,
    });
  } else {
    // Tie - randomly select one of the tied ingredients
    poisonedIngredient = winners[Math.floor(Math.random() * winners.length)];
    addLogEntry(state, {
      type: 'primary',
      message: `Yew's Quiet Draught: Vote tied. ${formatIngredientName(poisonedIngredient)} randomly selected to be poisoned. Players who cast it next round will be poisoned.`,
    });
  }
  
  // Store the poisoned ingredient for the next round
  state.poisonedIngredient = poisonedIngredient;
  console.log(`[YEW VOTES RESOLVED] Poisoned ingredient set to: "${poisonedIngredient}"`);
  
  // Clear the votes
  delete (state as any).yewVotes;
}

export function endDiscussion(state: GameState, playerId: string) {
  if (state.phase !== 'DAY') return;
  
  const player = state.players.find(p => p.id === playerId);
  if (!player) return;
  
  player.endedDiscussion = true;
  console.log(`Player ${player.name} (${player.id}) ended discussion`);
  
  // Check if 66%+ of players have ended discussion
  console.log('Current player states:');
  state.players.forEach(p => {
    console.log(`  - ${p.name} (${p.id}): endedDiscussion=${p.endedDiscussion}, connected=${p.connected}`);
  });
  
  const readyCount = state.players.filter(p => p.endedDiscussion).length;
  const totalPlayers = state.players.length;
  const threshold = Math.ceil(totalPlayers * 0.66); // 66% threshold
  const ready = readyCount >= threshold;
  
  console.log(`Ready check: ${ready} (${readyCount}/${totalPlayers} players, threshold: ${threshold})`);
  
  if (ready) {
    console.log(`${readyCount}/${totalPlayers} players ready (≥66%) - starting next round`);
    nextRound(state);
  }
}

export function hasPendingActions(state: GameState): boolean {
  return state.pendingActions.length > 0;
}

export function getPendingActionFor(state: GameState, playerId: string): PendingAction | undefined {
  return state.pendingActions.find(a => a.playerId === playerId);
}

export function sendRune(state: GameState, fromPlayerId: string, toPlayerId: string, message: string): boolean {
  // Only during day phase
  if (state.phase !== 'DAY') {
    console.log(`[RUNE] Cannot send rune - not in day phase`);
    return false;
  }
  
  // Check if sender already sent a rune this round
  if (state.runesSentThisRound[fromPlayerId]) {
    console.log(`[RUNE] Player ${fromPlayerId} already sent a rune this round`);
    return false;
  }
  
  // Check if target player exists
  const targetPlayer = state.players.find(p => p.id === toPlayerId);
  if (!targetPlayer) {
    console.log(`[RUNE] Target player ${toPlayerId} not found`);
    return false;
  }
  
  // Add rune
  state.runes.push({
    fromPlayerId,
    toPlayerId,
    message,
    round: state.round,
    timestamp: Date.now(),
  });
  
  // Mark as sent
  state.runesSentThisRound[fromPlayerId] = true;
  
  console.log(`[RUNE] Player ${fromPlayerId} sent rune to ${toPlayerId}`);
  return true;
}

