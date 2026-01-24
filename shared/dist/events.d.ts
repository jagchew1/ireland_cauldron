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
}, "strip", z.ZodTypeAny, {
    name: string;
    roomCode: string;
    spectator?: boolean | undefined;
}, {
    name: string;
    roomCode: string;
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
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        isReady: boolean;
        connected: boolean;
        endedDiscussion: boolean;
        roleId?: string | undefined;
    }, {
        id: string;
        name: string;
        roleId?: string | undefined;
        isReady?: boolean | undefined;
        connected?: boolean | undefined;
        endedDiscussion?: boolean | undefined;
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
    config: z.ZodObject<{
        nightSeconds: z.ZodDefault<z.ZodNumber>;
        daySeconds: z.ZodDefault<z.ZodNumber>;
        handSize: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        nightSeconds: number;
        daySeconds: number;
        handSize: number;
    }, {
        nightSeconds?: number | undefined;
        daySeconds?: number | undefined;
        handSize?: number | undefined;
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
        roleId?: string | undefined;
    }[];
    spectators: string[];
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
        nightSeconds: number;
        daySeconds: number;
        handSize: number;
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
        actionType: "wolfbane_primary";
    } | {
        playerId: string;
        actionType: "ceol_primary";
        newRoleId: string;
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
    };
    expiresAt: number | null;
    round?: number | undefined;
    spectators?: string[] | undefined;
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
        actionType: "wolfbane_primary";
    } | {
        playerId: string;
        actionType: "ceol_primary";
        newRoleId: string;
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