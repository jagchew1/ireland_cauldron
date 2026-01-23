import { z } from 'zod';
import { ActionPayloads, GameState, Health, AssetList } from './schema.js';

// WebSocket event names
export const WS = {
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_LIST: 'room:list',
  GAME_START: 'game:start',
  GAME_STATE: 'game:state',
  GAME_ACTION: 'game:action',
  CHAT_SEND: 'chat:send',
  CHAT_RECEIVE: 'chat:receive',
} as const;

export type WSEvent = (typeof WS)[keyof typeof WS];

// Payload schemas
export const RoomCreatePayload = z.object({ name: z.string().min(1) });
export const RoomJoinPayload = z.object({ roomCode: z.string().min(3), name: z.string().min(1), spectator: z.boolean().optional() });
export const RoomLeavePayload = z.object({ roomCode: z.string().min(3) });
export const RoomListResponse = z.object({ rooms: z.array(z.object({ code: z.string(), players: z.number(), maxPlayers: z.number() })) });

export const GameStatePayload = GameState; // server -> client
export const GameActionPayload = ActionPayloads; // client -> server

export const ChatSendPayload = z.object({ roomCode: z.string(), message: z.string().min(1).max(500) });
export const ChatReceivePayload = z.object({ playerId: z.string(), name: z.string(), message: z.string(), ts: z.number() });

// REST schemas
export const HealthResponse = Health;
export const AssetListResponse = AssetList;
