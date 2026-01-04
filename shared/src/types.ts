import { z } from 'zod';
import {
  Player as PlayerZ,
  Role as RoleZ,
  Card as CardZ,
  Deck as DeckZ,
  Room as RoomZ,
  GameState as GameStateZ,
  Phase as PhaseZ,
  Vote as VoteZ,
  PolicyTrack as PolicyTrackZ,
  ActionPayloads as ActionPayloadsZ,
} from './schema';

export type Player = z.infer<typeof PlayerZ>;
export type Role = z.infer<typeof RoleZ>;
export type Card = z.infer<typeof CardZ>;
export type Deck = z.infer<typeof DeckZ>;
export type Room = z.infer<typeof RoomZ>;
export type GameState = z.infer<typeof GameStateZ>;
export type Phase = z.infer<typeof PhaseZ>;
export type Vote = z.infer<typeof VoteZ>;
export type PolicyTrack = z.infer<typeof PolicyTrackZ>;
export type ActionPayloads = z.infer<typeof ActionPayloadsZ>;

export type ClientVisibleCard = Card & { image?: string };
export interface ShapedState extends Omit<GameState, 'hands' | 'table'> {
  hands: Record<string, ClientVisibleCard[]>;
  table: Array<{ playerId: string; revealed: boolean; image?: string; cardId?: string }>;
}
