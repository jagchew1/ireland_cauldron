import { z } from 'zod';
import { RoleTeam as RoleTeamZ, Player as PlayerZ, Role as RoleZ, Card as CardZ, CenterCard as CenterCardZ, IngredientCard as IngredientCardZ, Deck as DeckZ, CenterDeck as CenterDeckZ, Room as RoomZ, PlayedCard as PlayedCardZ, GameConfig as GameConfigZ, GameState as GameStateZ, Phase as PhaseZ, ActionPayloads as ActionPayloadsZ, ResolutionLogEntry as ResolutionLogEntryZ, PlayerKnowledge as PlayerKnowledgeZ, PendingAction as PendingActionZ } from './schema.js';
export type RoleTeam = z.infer<typeof RoleTeamZ>;
export type Player = z.infer<typeof PlayerZ>;
export type Role = z.infer<typeof RoleZ>;
export type Card = z.infer<typeof CardZ>;
export type CenterCard = z.infer<typeof CenterCardZ>;
export type IngredientCard = z.infer<typeof IngredientCardZ>;
export type Deck = z.infer<typeof DeckZ>;
export type CenterDeck = z.infer<typeof CenterDeckZ>;
export type Room = z.infer<typeof RoomZ>;
export type PlayedCard = z.infer<typeof PlayedCardZ>;
export type GameConfig = z.infer<typeof GameConfigZ>;
export type GameState = z.infer<typeof GameStateZ>;
export type ResolutionLogEntry = z.infer<typeof ResolutionLogEntryZ>;
export type PlayerKnowledge = z.infer<typeof PlayerKnowledgeZ>;
export type PendingAction = z.infer<typeof PendingActionZ>;
export type Phase = z.infer<typeof PhaseZ>;
export type ActionPayloads = z.infer<typeof ActionPayloadsZ>;
export type ClientVisibleCard = Card & {
    image?: string;
};
export interface ShapedState extends Omit<GameState, 'hands' | 'table'> {
    currentPlayerId?: string;
    hands: Record<string, ClientVisibleCard[]>;
    table: Array<{
        playerId: string;
        revealed: boolean;
        image?: string;
        cardId?: string;
    }>;
}
//# sourceMappingURL=types.d.ts.map