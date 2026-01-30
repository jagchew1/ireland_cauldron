import { z } from 'zod';
export const RoleTeam = z.enum(['GOOD', 'EVIL']);
export const Role = z.object({
    id: z.string(),
    name: z.string(),
    team: RoleTeam,
    image: z.string().optional(),
});
export const IngredientCard = z.object({
    id: z.string(),
    kind: z.literal('INGREDIENT'),
    name: z.string(),
    image: z.string(),
});
export const CenterCard = z.object({
    id: z.string(),
    kind: z.literal('CENTER'),
    type: z.enum(['MILK', 'BLOOD']),
});
export const Card = z.discriminatedUnion('kind', [IngredientCard, CenterCard]);
export const Deck = z.object({
    drawPile: z.array(Card),
    discardPile: z.array(Card),
});
export const CenterDeck = z.object({
    cards: z.array(CenterCard),
    revealed: z.array(CenterCard),
    discarded: z.array(CenterCard),
});
export const Phase = z.enum(['LOBBY', 'NIGHT', 'RESOLUTION', 'DAY', 'ENDED']);
export const Player = z.object({
    id: z.string(),
    name: z.string(),
    roleId: z.string().optional(), // hidden from others
    isReady: z.boolean().default(false),
    connected: z.boolean().default(true),
    endedDiscussion: z.boolean().default(false), // for day phase voting
    poisoned: z.boolean().default(false), // cannot play cards next round if true
});
export const Room = z.object({
    code: z.string(),
    createdAt: z.number(),
    maxPlayers: z.number().min(2).max(10),
});
export const PlayedCard = z.object({
    playerId: z.string(),
    cardId: z.string(),
    card: Card,
    revealed: z.boolean(),
    image: z.string().optional(),
});
export const GameConfig = z.object({
    nightSeconds: z.number().default(30),
    daySeconds: z.number().default(45),
    handSize: z.number().default(3),
});
export const ResolutionLogEntry = z.object({
    type: z.enum(['primary', 'secondary', 'info']),
    ingredient: z.string().optional(),
    message: z.string(),
    cardsShown: z.array(CenterCard).optional(), // For Brigid/Faerie showing cards
    round: z.number(), // Which round this event occurred in
});
export const PlayerKnowledge = z.object({
    playerId: z.string(),
    cardId: z.string(),
    type: z.enum(['MILK', 'BLOOD']),
    location: z.enum(['deck', 'discard', 'revealed']),
    isPublic: z.boolean().default(false), // true if all players know this information
});
export const RuneMessage = z.object({
    fromPlayerId: z.string(),
    toPlayerId: z.string(),
    message: z.string(),
    round: z.number(),
    timestamp: z.number(),
});
export const PendingAction = z.discriminatedUnion('actionType', [
    z.object({
        actionType: z.literal('cailleach_primary'),
        playerId: z.string(),
        cardShown: CenterCard,
        cardIndex: z.number(), // original position in deck
    }),
    z.object({
        actionType: z.literal('cailleach_secondary'),
        playerId: z.string(),
        cardShown: CenterCard, // Top card of deck (just shown, no choice)
    }),
    z.object({
        actionType: z.literal('wolfbane_primary'),
        playerId: z.string(),
    }),
    z.object({
        actionType: z.literal('ceol_primary'),
        playerId: z.string(),
        newRoleId: z.string(), // The role they swapped to
    }),
    z.object({
        actionType: z.literal('ceol_secondary'),
        playerId: z.string(),
        revealedRoleId: z.string(), // Role of another Ceol player (identity unknown)
    }),
    z.object({
        actionType: z.literal('yew_primary'),
        playerId: z.string(),
        availableIngredients: z.array(z.string()), // Ingredient names that can be poisoned
    }),
    z.object({
        actionType: z.literal('yew_secondary'),
        playerId: z.string(), // Player who poisoned themselves
    }),
    z.object({
        actionType: z.literal('forced_play_notification'),
        playerId: z.string(), // Player who had a card auto-played
        cardName: z.string(), // Name of the card that was auto-played
    }),
]);
export const GameState = z.object({
    room: Room,
    phase: Phase,
    round: z.number().default(0),
    players: z.array(Player),
    spectators: z.array(z.string()).default([]),
    roles: z.record(z.string(), Role),
    heroDeck: z.array(Role).default([]), // Undealt hero roles available for Ceol swaps
    deck: Deck,
    centerDeck: CenterDeck,
    hands: z.record(z.string(), z.array(Card)),
    table: z.array(PlayedCard),
    cardClaims: z.record(z.string(), z.array(z.string())).default({}), // cardId -> array of playerIds (multiple players can claim same card)
    config: GameConfig,
    expiresAt: z.number().nullable(),
    pendingActions: z.array(PendingAction).default([]), // for storing pending player actions during resolution
    resolutionLog: z.array(ResolutionLogEntry).default([]), // Log of what happened this round
    playerKnowledge: z.array(PlayerKnowledge).default([]), // Track what each player knows about center deck
    yewVotes: z.record(z.string(), z.string()).optional(), // playerId -> ingredientName for Yew's poison voting
    poisonedIngredient: z.string().nullable().default(null), // The ingredient that is currently poisoned (players who play it get poisoned)
    winner: z.enum(['GOOD', 'EVIL', 'TIE']).nullable().default(null), // Winner when game ends
    runes: z.array(RuneMessage).default([]), // Runic communications between players
    runesSentThisRound: z.record(z.string(), z.boolean()).default({}), // playerId -> has sent rune this day phase
});
// REST schemas
export const Health = z.object({ ok: z.boolean(), ts: z.number() });
export const AssetList = z.object({
    heroes: z.array(z.string()),
    ingredients: z.array(z.string()),
});
// Action payloads
export const ActionPlayCard = z.object({ type: z.literal('play_card'), cardId: z.string() });
export const ActionUnplayCard = z.object({ type: z.literal('unplay_card') });
export const ActionClaimCard = z.object({ type: z.literal('claim_card'), cardId: z.string() });
export const ActionYewTarget = z.object({ type: z.literal('yew_target'), targetPlayerId: z.string() });
export const ActionReady = z.object({ type: z.literal('ready'), ready: z.boolean() });
export const ActionStart = z.object({ type: z.literal('start') });
export const ActionResolution = z.object({
    type: z.literal('resolution_action'),
    choice: z.enum(['keep', 'discard', 'confirm'])
});
export const ActionEndDiscussion = z.object({ type: z.literal('end_discussion') });
export const ActionSendRune = z.object({
    type: z.literal('send_rune'),
    toPlayerId: z.string(),
    message: z.string()
});
export const ActionPayloads = z.discriminatedUnion('type', [
    ActionPlayCard,
    ActionUnplayCard,
    ActionClaimCard,
    ActionYewTarget,
    ActionReady,
    ActionStart,
    ActionResolution,
    ActionEndDiscussion,
    ActionSendRune,
]);
