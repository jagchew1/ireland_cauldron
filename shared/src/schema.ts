import { z } from 'zod';

export const RoleTeam = z.enum(['GOOD', 'EVIL']);
export type RoleTeam = z.infer<typeof RoleTeam>;

export const Role = z.object({
  id: z.string(),
  name: z.string(),
  team: RoleTeam,
  image: z.string().optional(),
});
export type Role = z.infer<typeof Role>;

export const IngredientCard = z.object({
  id: z.string(),
  kind: z.literal('INGREDIENT'),
  name: z.string(),
  image: z.string(),
});
export type IngredientCard = z.infer<typeof IngredientCard>;

export const CenterCard = z.object({
  id: z.string(),
  kind: z.literal('CENTER'),
  type: z.enum(['MILK', 'BLOOD']),
});
export type CenterCard = z.infer<typeof CenterCard>;

export const Card = z.discriminatedUnion('kind', [IngredientCard, CenterCard]);
export type Card = z.infer<typeof Card>;

export const Deck = z.object({
  drawPile: z.array(Card),
  discardPile: z.array(Card),
});
export type Deck = z.infer<typeof Deck>;

export const CenterDeck = z.object({
  cards: z.array(CenterCard),
  revealed: z.array(CenterCard),
  discarded: z.array(CenterCard),
});
export type CenterDeck = z.infer<typeof CenterDeck>;

export const Phase = z.enum(['LOBBY', 'NIGHT', 'RESOLUTION', 'DAY', 'ENDED']);
export type Phase = z.infer<typeof Phase>;

export const Player = z.object({
  id: z.string(),
  name: z.string(),
  roleId: z.string().optional(), // hidden from others
  isReady: z.boolean().default(false),
  connected: z.boolean().default(true),
});
export type Player = z.infer<typeof Player>;

export const Room = z.object({
  code: z.string(),
  createdAt: z.number(),
  maxPlayers: z.number().min(2).max(10),
});
export type Room = z.infer<typeof Room>;

export const PlayedCard = z.object({
  playerId: z.string(),
  cardId: z.string(),
  revealed: z.boolean(),
  image: z.string().optional(),
});
export type PlayedCard = z.infer<typeof PlayedCard>;

export const GameConfig = z.object({
  nightSeconds: z.number().default(30),
  daySeconds: z.number().default(15),
  handSize: z.number().default(3),
});
export type GameConfig = z.infer<typeof GameConfig>;

export const GameState = z.object({
  room: Room,
  phase: Phase,
  round: z.number().default(0),
  players: z.array(Player),
  spectators: z.array(z.string()).default([]),
  roles: z.record(z.string(), Role),
  deck: Deck,
  centerDeck: CenterDeck,
  hands: z.record(z.string(), z.array(Card)),
  table: z.array(PlayedCard),
  config: GameConfig,
  expiresAt: z.number().nullable(),
  pendingActions: z.array(z.any()).default([]), // for storing pending player actions during resolution
});
export type GameState = z.infer<typeof GameState>;

// REST schemas
export const Health = z.object({ ok: z.boolean(), ts: z.number() });
export const AssetList = z.object({
  heroes: z.array(z.string()),
  ingredients: z.array(z.string()),
});

// Action payloads
export const ActionPlayCard = z.object({ type: z.literal('play_card'), cardId: z.string() });
export const ActionReady = z.object({ type: z.literal('ready'), ready: z.boolean() });
export const ActionStart = z.object({ type: z.literal('start') });
export const ActionPayloads = z.discriminatedUnion('type', [ActionPlayCard, ActionReady, ActionStart]);
export type ActionPayloads = z.infer<typeof ActionPayloads>;
