import { z } from 'zod';
export declare const WS: {
    readonly ROOM_CREATE: "room:create";
    readonly ROOM_JOIN: "room:join";
    readonly ROOM_LEAVE: "room:leave";
    readonly ROOM_LIST: "room:list";
    readonly GAME_START: "game:start";
    readonly GAME_STATE: "game:state";
    readonly GAME_ACTION: "game:action";
    readonly CHAT_SEND: "chat:send";
    readonly CHAT_RECEIVE: "chat:receive";
};
export type WSEvent = (typeof WS)[keyof typeof WS];
export declare const RoomCreatePayload: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export declare const RoomJoinPayload: z.ZodObject<{
    roomCode: z.ZodString;
    name: z.ZodString;
    spectator: z.ZodOptional<z.ZodBoolean>;
    playerId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    roomCode: string;
    playerId?: string | undefined;
    spectator?: boolean | undefined;
}, {
    name: string;
    roomCode: string;
    playerId?: string | undefined;
    spectator?: boolean | undefined;
}>;
export declare const RoomLeavePayload: z.ZodObject<{
    roomCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    roomCode: string;
}, {
    roomCode: string;
}>;
export declare const RoomListResponse: z.ZodObject<{
    rooms: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        players: z.ZodNumber;
        maxPlayers: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        code: string;
        maxPlayers: number;
        players: number;
    }, {
        code: string;
        maxPlayers: number;
        players: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    rooms: {
        code: string;
        maxPlayers: number;
        players: number;
    }[];
}, {
    rooms: {
        code: string;
        maxPlayers: number;
        players: number;
    }[];
}>;
export declare const GameStatePayload: z.ZodObject<{
    room: z.ZodObject<{
        code: z.ZodString;
        createdAt: z.ZodNumber;
        maxPlayers: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        code: string;
        createdAt: number;
        maxPlayers: number;
    }, {
        code: string;
        createdAt: number;
        maxPlayers: number;
    }>;
    phase: z.ZodEnum<["LOBBY", "NIGHT", "RESOLUTION", "DAY", "ENDED"]>;
    round: z.ZodDefault<z.ZodNumber>;
    players: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        roleId: z.ZodOptional<z.ZodString>;
        isReady: z.ZodDefault<z.ZodBoolean>;
        connected: z.ZodDefault<z.ZodBoolean>;
        endedDiscussion: z.ZodDefault<z.ZodBoolean>;
        poisoned: z.ZodDefault<z.ZodBoolean>;
        acknowledgedBio: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        isReady: boolean;
        connected: boolean;
        endedDiscussion: boolean;
        poisoned: boolean;
        acknowledgedBio: boolean;
        roleId?: string | undefined;
    }, {
        id: string;
        name: string;
        roleId?: string | undefined;
        isReady?: boolean | undefined;
        connected?: boolean | undefined;
        endedDiscussion?: boolean | undefined;
        poisoned?: boolean | undefined;
        acknowledgedBio?: boolean | undefined;
    }>, "many">;
    spectators: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    roles: z.ZodRecord<z.ZodString, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        team: z.ZodEnum<["GOOD", "EVIL"]>;
        image: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        team: "GOOD" | "EVIL";
        image?: string | undefined;
    }, {
        id: string;
        name: string;
        team: "GOOD" | "EVIL";
        image?: string | undefined;
    }>>;
    heroDeck: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        team: z.ZodEnum<["GOOD", "EVIL"]>;
        image: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        team: "GOOD" | "EVIL";
        image?: string | undefined;
    }, {
        id: string;
        name: string;
        team: "GOOD" | "EVIL";
        image?: string | undefined;
    }>, "many">>;
    deck: z.ZodObject<{
        drawPile: z.ZodArray<z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodLiteral<"INGREDIENT">;
            name: z.ZodString;
            image: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        }, {
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        }>, z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodLiteral<"CENTER">;
            type: z.ZodEnum<["MILK", "BLOOD"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }>]>, "many">;
        discardPile: z.ZodArray<z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodLiteral<"INGREDIENT">;
            name: z.ZodString;
            image: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        }, {
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        }>, z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodLiteral<"CENTER">;
            type: z.ZodEnum<["MILK", "BLOOD"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }>]>, "many">;
    }, "strip", z.ZodTypeAny, {
        drawPile: ({
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        } | {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        })[];
        discardPile: ({
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        } | {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        })[];
    }, {
        drawPile: ({
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        } | {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        })[];
        discardPile: ({
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        } | {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        })[];
    }>;
    centerDeck: z.ZodObject<{
        cards: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodLiteral<"CENTER">;
            type: z.ZodEnum<["MILK", "BLOOD"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }>, "many">;
        revealed: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodLiteral<"CENTER">;
            type: z.ZodEnum<["MILK", "BLOOD"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }>, "many">;
        discarded: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodLiteral<"CENTER">;
            type: z.ZodEnum<["MILK", "BLOOD"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        cards: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }[];
        revealed: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }[];
        discarded: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }[];
    }, {
        cards: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }[];
        revealed: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }[];
        discarded: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }[];
    }>;
    hands: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
        id: z.ZodString;
        kind: z.ZodLiteral<"INGREDIENT">;
        name: z.ZodString;
        image: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        image: string;
        kind: "INGREDIENT";
    }, {
        id: string;
        name: string;
        image: string;
        kind: "INGREDIENT";
    }>, z.ZodObject<{
        id: z.ZodString;
        kind: z.ZodLiteral<"CENTER">;
        type: z.ZodEnum<["MILK", "BLOOD"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "MILK" | "BLOOD";
        kind: "CENTER";
    }, {
        id: string;
        type: "MILK" | "BLOOD";
        kind: "CENTER";
    }>]>, "many">>;
    table: z.ZodArray<z.ZodObject<{
        playerId: z.ZodString;
        cardId: z.ZodString;
        card: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodLiteral<"INGREDIENT">;
            name: z.ZodString;
            image: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        }, {
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        }>, z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodLiteral<"CENTER">;
            type: z.ZodEnum<["MILK", "BLOOD"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }>]>;
        revealed: z.ZodBoolean;
        image: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        revealed: boolean;
        playerId: string;
        cardId: string;
        card: {
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        } | {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        };
        image?: string | undefined;
    }, {
        revealed: boolean;
        playerId: string;
        cardId: string;
        card: {
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        } | {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        };
        image?: string | undefined;
    }>, "many">;
    cardClaims: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>>;
    config: z.ZodObject<{
        nightSeconds: z.ZodDefault<z.ZodNumber>;
        daySeconds: z.ZodDefault<z.ZodNumber>;
        handSize: z.ZodDefault<z.ZodNumber>;
        timersEnabled: z.ZodDefault<z.ZodBoolean>;
        enabledIngredients: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        nightSeconds: number;
        daySeconds: number;
        handSize: number;
        timersEnabled: boolean;
        enabledIngredients: string[];
    }, {
        nightSeconds?: number | undefined;
        daySeconds?: number | undefined;
        handSize?: number | undefined;
        timersEnabled?: boolean | undefined;
        enabledIngredients?: string[] | undefined;
    }>;
    expiresAt: z.ZodNullable<z.ZodNumber>;
    pendingActions: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<"actionType", [z.ZodObject<{
        actionType: z.ZodLiteral<"cailleach_primary">;
        playerId: z.ZodString;
        cardShown: z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodLiteral<"CENTER">;
            type: z.ZodEnum<["MILK", "BLOOD"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }>;
        cardIndex: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        playerId: string;
        actionType: "cailleach_primary";
        cardShown: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        };
        cardIndex: number;
    }, {
        playerId: string;
        actionType: "cailleach_primary";
        cardShown: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        };
        cardIndex: number;
    }>, z.ZodObject<{
        actionType: z.ZodLiteral<"cailleach_secondary">;
        playerId: z.ZodString;
        cardShown: z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodLiteral<"CENTER">;
            type: z.ZodEnum<["MILK", "BLOOD"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }>;
    }, "strip", z.ZodTypeAny, {
        playerId: string;
        actionType: "cailleach_secondary";
        cardShown: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        };
    }, {
        playerId: string;
        actionType: "cailleach_secondary";
        cardShown: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        };
    }>, z.ZodObject<{
        actionType: z.ZodLiteral<"wolfbane_primary">;
        playerId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        playerId: string;
        actionType: "wolfbane_primary";
    }, {
        playerId: string;
        actionType: "wolfbane_primary";
    }>, z.ZodObject<{
        actionType: z.ZodLiteral<"ceol_primary">;
        playerId: z.ZodString;
        newRoleId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        playerId: string;
        actionType: "ceol_primary";
        newRoleId: string;
    }, {
        playerId: string;
        actionType: "ceol_primary";
        newRoleId: string;
    }>, z.ZodObject<{
        actionType: z.ZodLiteral<"ceol_secondary">;
        playerId: z.ZodString;
        revealedRoleId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        playerId: string;
        actionType: "ceol_secondary";
        revealedRoleId: string;
    }, {
        playerId: string;
        actionType: "ceol_secondary";
        revealedRoleId: string;
    }>, z.ZodObject<{
        actionType: z.ZodLiteral<"yew_primary">;
        playerId: z.ZodString;
        availableIngredients: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        playerId: string;
        actionType: "yew_primary";
        availableIngredients: string[];
    }, {
        playerId: string;
        actionType: "yew_primary";
        availableIngredients: string[];
    }>, z.ZodObject<{
        actionType: z.ZodLiteral<"yew_secondary">;
        playerId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        playerId: string;
        actionType: "yew_secondary";
    }, {
        playerId: string;
        actionType: "yew_secondary";
    }>, z.ZodObject<{
        actionType: z.ZodLiteral<"forced_play_notification">;
        playerId: z.ZodString;
        cardName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        playerId: string;
        actionType: "forced_play_notification";
        cardName: string;
    }, {
        playerId: string;
        actionType: "forced_play_notification";
        cardName: string;
    }>]>, "many">>;
    resolutionLog: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["primary", "secondary", "info"]>;
        ingredient: z.ZodOptional<z.ZodString>;
        message: z.ZodString;
        cardsShown: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodLiteral<"CENTER">;
            type: z.ZodEnum<["MILK", "BLOOD"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }, {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }>, "many">>;
        round: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        message: string;
        type: "primary" | "secondary" | "info";
        round: number;
        ingredient?: string | undefined;
        cardsShown?: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }[] | undefined;
    }, {
        message: string;
        type: "primary" | "secondary" | "info";
        round: number;
        ingredient?: string | undefined;
        cardsShown?: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }[] | undefined;
    }>, "many">>;
    playerKnowledge: z.ZodDefault<z.ZodArray<z.ZodObject<{
        playerId: z.ZodString;
        cardId: z.ZodString;
        type: z.ZodEnum<["MILK", "BLOOD"]>;
        location: z.ZodEnum<["deck", "discard", "revealed"]>;
        isPublic: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: "MILK" | "BLOOD";
        playerId: string;
        cardId: string;
        location: "revealed" | "deck" | "discard";
        isPublic: boolean;
    }, {
        type: "MILK" | "BLOOD";
        playerId: string;
        cardId: string;
        location: "revealed" | "deck" | "discard";
        isPublic?: boolean | undefined;
    }>, "many">>;
    yewVotes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    poisonedIngredient: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    winner: z.ZodDefault<z.ZodNullable<z.ZodEnum<["GOOD", "EVIL", "TIE"]>>>;
    runes: z.ZodDefault<z.ZodArray<z.ZodObject<{
        fromPlayerId: z.ZodString;
        toPlayerId: z.ZodString;
        message: z.ZodString;
        round: z.ZodNumber;
        timestamp: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        message: string;
        round: number;
        fromPlayerId: string;
        toPlayerId: string;
        timestamp: number;
    }, {
        message: string;
        round: number;
        fromPlayerId: string;
        toPlayerId: string;
        timestamp: number;
    }>, "many">>;
    runesSentThisRound: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    round: number;
    deck: {
        drawPile: ({
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        } | {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        })[];
        discardPile: ({
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        } | {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        })[];
    };
    room: {
        code: string;
        createdAt: number;
        maxPlayers: number;
    };
    phase: "LOBBY" | "NIGHT" | "RESOLUTION" | "DAY" | "ENDED";
    players: {
        id: string;
        name: string;
        isReady: boolean;
        connected: boolean;
        endedDiscussion: boolean;
        poisoned: boolean;
        acknowledgedBio: boolean;
        roleId?: string | undefined;
    }[];
    spectators: string[];
    roles: Record<string, {
        id: string;
        name: string;
        team: "GOOD" | "EVIL";
        image?: string | undefined;
    }>;
    heroDeck: {
        id: string;
        name: string;
        team: "GOOD" | "EVIL";
        image?: string | undefined;
    }[];
    centerDeck: {
        cards: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }[];
        revealed: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }[];
        discarded: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }[];
    };
    hands: Record<string, ({
        id: string;
        name: string;
        image: string;
        kind: "INGREDIENT";
    } | {
        id: string;
        type: "MILK" | "BLOOD";
        kind: "CENTER";
    })[]>;
    table: {
        revealed: boolean;
        playerId: string;
        cardId: string;
        card: {
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        } | {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        };
        image?: string | undefined;
    }[];
    cardClaims: Record<string, string[]>;
    config: {
        nightSeconds: number;
        daySeconds: number;
        handSize: number;
        timersEnabled: boolean;
        enabledIngredients: string[];
    };
    expiresAt: number | null;
    pendingActions: ({
        playerId: string;
        actionType: "cailleach_primary";
        cardShown: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        };
        cardIndex: number;
    } | {
        playerId: string;
        actionType: "cailleach_secondary";
        cardShown: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        };
    } | {
        playerId: string;
        actionType: "wolfbane_primary";
    } | {
        playerId: string;
        actionType: "ceol_primary";
        newRoleId: string;
    } | {
        playerId: string;
        actionType: "ceol_secondary";
        revealedRoleId: string;
    } | {
        playerId: string;
        actionType: "yew_primary";
        availableIngredients: string[];
    } | {
        playerId: string;
        actionType: "yew_secondary";
    } | {
        playerId: string;
        actionType: "forced_play_notification";
        cardName: string;
    })[];
    resolutionLog: {
        message: string;
        type: "primary" | "secondary" | "info";
        round: number;
        ingredient?: string | undefined;
        cardsShown?: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }[] | undefined;
    }[];
    playerKnowledge: {
        type: "MILK" | "BLOOD";
        playerId: string;
        cardId: string;
        location: "revealed" | "deck" | "discard";
        isPublic: boolean;
    }[];
    poisonedIngredient: string | null;
    winner: "GOOD" | "EVIL" | "TIE" | null;
    runes: {
        message: string;
        round: number;
        fromPlayerId: string;
        toPlayerId: string;
        timestamp: number;
    }[];
    runesSentThisRound: Record<string, boolean>;
    yewVotes?: Record<string, string> | undefined;
}, {
    deck: {
        drawPile: ({
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        } | {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        })[];
        discardPile: ({
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        } | {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        })[];
    };
    room: {
        code: string;
        createdAt: number;
        maxPlayers: number;
    };
    phase: "LOBBY" | "NIGHT" | "RESOLUTION" | "DAY" | "ENDED";
    players: {
        id: string;
        name: string;
        roleId?: string | undefined;
        isReady?: boolean | undefined;
        connected?: boolean | undefined;
        endedDiscussion?: boolean | undefined;
        poisoned?: boolean | undefined;
        acknowledgedBio?: boolean | undefined;
    }[];
    roles: Record<string, {
        id: string;
        name: string;
        team: "GOOD" | "EVIL";
        image?: string | undefined;
    }>;
    centerDeck: {
        cards: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }[];
        revealed: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }[];
        discarded: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }[];
    };
    hands: Record<string, ({
        id: string;
        name: string;
        image: string;
        kind: "INGREDIENT";
    } | {
        id: string;
        type: "MILK" | "BLOOD";
        kind: "CENTER";
    })[]>;
    table: {
        revealed: boolean;
        playerId: string;
        cardId: string;
        card: {
            id: string;
            name: string;
            image: string;
            kind: "INGREDIENT";
        } | {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        };
        image?: string | undefined;
    }[];
    config: {
        nightSeconds?: number | undefined;
        daySeconds?: number | undefined;
        handSize?: number | undefined;
        timersEnabled?: boolean | undefined;
        enabledIngredients?: string[] | undefined;
    };
    expiresAt: number | null;
    round?: number | undefined;
    spectators?: string[] | undefined;
    heroDeck?: {
        id: string;
        name: string;
        team: "GOOD" | "EVIL";
        image?: string | undefined;
    }[] | undefined;
    cardClaims?: Record<string, string[]> | undefined;
    pendingActions?: ({
        playerId: string;
        actionType: "cailleach_primary";
        cardShown: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        };
        cardIndex: number;
    } | {
        playerId: string;
        actionType: "cailleach_secondary";
        cardShown: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        };
    } | {
        playerId: string;
        actionType: "wolfbane_primary";
    } | {
        playerId: string;
        actionType: "ceol_primary";
        newRoleId: string;
    } | {
        playerId: string;
        actionType: "ceol_secondary";
        revealedRoleId: string;
    } | {
        playerId: string;
        actionType: "yew_primary";
        availableIngredients: string[];
    } | {
        playerId: string;
        actionType: "yew_secondary";
    } | {
        playerId: string;
        actionType: "forced_play_notification";
        cardName: string;
    })[] | undefined;
    resolutionLog?: {
        message: string;
        type: "primary" | "secondary" | "info";
        round: number;
        ingredient?: string | undefined;
        cardsShown?: {
            id: string;
            type: "MILK" | "BLOOD";
            kind: "CENTER";
        }[] | undefined;
    }[] | undefined;
    playerKnowledge?: {
        type: "MILK" | "BLOOD";
        playerId: string;
        cardId: string;
        location: "revealed" | "deck" | "discard";
        isPublic?: boolean | undefined;
    }[] | undefined;
    yewVotes?: Record<string, string> | undefined;
    poisonedIngredient?: string | null | undefined;
    winner?: "GOOD" | "EVIL" | "TIE" | null | undefined;
    runes?: {
        message: string;
        round: number;
        fromPlayerId: string;
        toPlayerId: string;
        timestamp: number;
    }[] | undefined;
    runesSentThisRound?: Record<string, boolean> | undefined;
}>;
export declare const GameActionPayload: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"play_card">;
    cardId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "play_card";
    cardId: string;
}, {
    type: "play_card";
    cardId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"unplay_card">;
}, "strip", z.ZodTypeAny, {
    type: "unplay_card";
}, {
    type: "unplay_card";
}>, z.ZodObject<{
    type: z.ZodLiteral<"claim_card">;
    cardId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "claim_card";
    cardId: string;
}, {
    type: "claim_card";
    cardId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"yew_target">;
    targetPlayerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "yew_target";
    targetPlayerId: string;
}, {
    type: "yew_target";
    targetPlayerId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"ready">;
    ready: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "ready";
    ready: boolean;
}, {
    type: "ready";
    ready: boolean;
}>, z.ZodObject<{
    type: z.ZodLiteral<"start">;
}, "strip", z.ZodTypeAny, {
    type: "start";
}, {
    type: "start";
}>, z.ZodObject<{
    type: z.ZodLiteral<"resolution_action">;
    choice: z.ZodEnum<["keep", "discard", "confirm"]>;
}, "strip", z.ZodTypeAny, {
    type: "resolution_action";
    choice: "discard" | "keep" | "confirm";
}, {
    type: "resolution_action";
    choice: "discard" | "keep" | "confirm";
}>, z.ZodObject<{
    type: z.ZodLiteral<"end_discussion">;
}, "strip", z.ZodTypeAny, {
    type: "end_discussion";
}, {
    type: "end_discussion";
}>, z.ZodObject<{
    type: z.ZodLiteral<"send_rune">;
    toPlayerId: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    type: "send_rune";
    toPlayerId: string;
}, {
    message: string;
    type: "send_rune";
    toPlayerId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"acknowledge_bio">;
}, "strip", z.ZodTypeAny, {
    type: "acknowledge_bio";
}, {
    type: "acknowledge_bio";
}>, z.ZodObject<{
    type: z.ZodLiteral<"update_config">;
    config: z.ZodObject<{
        nightSeconds: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        daySeconds: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        handSize: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        timersEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        enabledIngredients: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        nightSeconds?: number | undefined;
        daySeconds?: number | undefined;
        handSize?: number | undefined;
        timersEnabled?: boolean | undefined;
        enabledIngredients?: string[] | undefined;
    }, {
        nightSeconds?: number | undefined;
        daySeconds?: number | undefined;
        handSize?: number | undefined;
        timersEnabled?: boolean | undefined;
        enabledIngredients?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "update_config";
    config: {
        nightSeconds?: number | undefined;
        daySeconds?: number | undefined;
        handSize?: number | undefined;
        timersEnabled?: boolean | undefined;
        enabledIngredients?: string[] | undefined;
    };
}, {
    type: "update_config";
    config: {
        nightSeconds?: number | undefined;
        daySeconds?: number | undefined;
        handSize?: number | undefined;
        timersEnabled?: boolean | undefined;
        enabledIngredients?: string[] | undefined;
    };
}>]>;
export declare const ChatSendPayload: z.ZodObject<{
    roomCode: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    roomCode: string;
}, {
    message: string;
    roomCode: string;
}>;
export declare const ChatReceivePayload: z.ZodObject<{
    playerId: z.ZodString;
    name: z.ZodString;
    message: z.ZodString;
    ts: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    message: string;
    playerId: string;
    ts: number;
}, {
    name: string;
    message: string;
    playerId: string;
    ts: number;
}>;
export declare const HealthResponse: z.ZodObject<{
    ok: z.ZodBoolean;
    ts: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    ts: number;
}, {
    ok: boolean;
    ts: number;
}>;
export declare const AssetListResponse: z.ZodObject<{
    heroes: z.ZodArray<z.ZodString, "many">;
    ingredients: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    heroes: string[];
    ingredients: string[];
}, {
    heroes: string[];
    ingredients: string[];
}>;
//# sourceMappingURL=events.d.ts.map