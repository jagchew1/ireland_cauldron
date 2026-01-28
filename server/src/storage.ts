import { Room, Player, GameState, GameConfig, Role } from '@irish-potions/shared';

type RoomCode = string;

export interface RoomData {
  state: GameState;
  socketsByPlayer: Map<string, string>; // playerId -> socketId
  roomBySocket: Map<string, string>; // socketId -> playerId
}

const rooms = new Map<RoomCode, RoomData>();

export function createRoom(code: string, maxPlayers: number, config: Partial<GameConfig>): RoomData {
  const state: GameState = {
    room: { code, createdAt: Date.now(), maxPlayers },
    phase: 'LOBBY',
    round: 0,
    players: [],
    spectators: [],
    roles: {},
    heroDeck: [],
    deck: { drawPile: [], discardPile: [] },
    centerDeck: { cards: [], revealed: [], discarded: [] },
    hands: {},
    table: [],
    config: { nightSeconds: 30, daySeconds: 60, handSize: 3, ...config },
    expiresAt: null,
    pendingActions: [],
    resolutionLog: [],
    playerKnowledge: [],
    cardClaims: {},
    winner: null,
  };
  const data: RoomData = { state, socketsByPlayer: new Map(), roomBySocket: new Map() };
  rooms.set(code, data);
  return data;
}

export function getRoom(code: string) {
  return rooms.get(code);
}

export function ensureRoom(code: string, maxPlayers = 10, config: Partial<GameConfig> = {}) {
  return rooms.get(code) ?? createRoom(code, maxPlayers, config);
}

export function deleteRoom(code: string) {
  rooms.delete(code);
}

export function getRoomsSummary() {
  return Array.from(rooms.values()).map((r) => ({
    code: r.state.room.code,
    players: r.state.players.length,
    maxPlayers: r.state.room.maxPlayers,
  }));
}

export function getAllRooms() {
  return Array.from(rooms.values());
}
