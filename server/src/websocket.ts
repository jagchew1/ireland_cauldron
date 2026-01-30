import type { Server as IOServer, Socket } from 'socket.io';
import type { Express } from 'express';
import { z } from 'zod';
import { WS, RoomCreatePayload, RoomJoinPayload, GameActionPayload, ChatSendPayload } from '@irish-potions/shared';
import { ensureRoom, getRoom, getAllRooms } from './storage.js';
import { startGame, playCard, unplayCard, claimCard, revealDay, nextRound, shapeStateFor, processResolutionAction, processYewTarget, hasPendingActions, endDiscussion, forceNightPhaseEnd, sendRune } from './gameLogic.js';

// Helper function to check and handle expired timers
function checkTimerExpiry(io: IOServer, roomCode: string, state: any) {
  if (state.expiresAt && Date.now() > state.expiresAt) {
    if (state.phase === 'NIGHT') {
      // Force all non-submitted players to play a random card, then start resolution
      forceNightPhaseEnd(state);
      broadcastState(io, roomCode);
      return true;
    }
    else if (state.phase === 'RESOLUTION') {
      // Only advance if no pending actions
      if (!hasPendingActions(state)) {
        nextRound(state);
        broadcastState(io, roomCode);
        return true;
      }
    }
    else if (state.phase === 'DAY') {
      // When day timer expires, force advance to night regardless of player readiness
      nextRound(state);
      broadcastState(io, roomCode);
      return true;
    }
  }
  return false;
}

export function initSockets(io: IOServer, _app: Express) {
  // Set up interval to check for expired timers every second
  setInterval(() => {
    const rooms = getAllRooms();
    for (const room of rooms) {
      checkTimerExpiry(io, room.state.room.code, room.state);
    }
  }, 1000); // Check every second

  io.on('connection', (socket) => {
    let currentRoom: string | null = null;
    let playerId: string | null = null;
    let playerName: string | null = null;

    socket.on(WS.ROOM_CREATE, (raw) => {
      const payload = RoomCreatePayload.safeParse(raw);
      if (!payload.success) return;
      const code = makeRoomCode();
      const room = ensureRoom(code, 10, {});
      socket.emit(WS.ROOM_CREATE, { code });
    });

    socket.on(WS.ROOM_JOIN, (raw) => {
      const res = RoomJoinPayload.safeParse(raw);
      if (!res.success) return;
      const { roomCode, name, spectator, playerId: clientPlayerId } = res.data;
      const room = ensureRoom(roomCode, 10, {});
      currentRoom = roomCode;
      playerName = name;
      if (!spectator) {
        // Try to reconnect as existing player if clientPlayerId provided and exists
        const existingPlayer = clientPlayerId ? room.state.players.find((p) => p.id === clientPlayerId) : null;
        const id = existingPlayer ? clientPlayerId! : (playerId ?? socket.id);
        playerId = id;
        
        if (!room.state.players.find((p) => p.id === id)) {
          // New player
          room.state.players.push({ id, name, connected: true, isReady: false, endedDiscussion: false, poisoned: false });
        } else {
          // Reconnecting player - update connection status
          const player = room.state.players.find((p) => p.id === id);
          if (player) {
            player.connected = true;
            player.name = name; // Update name in case it changed
          }
        }
      } else {
        room.state.spectators.push(socket.id);
      }
      socket.join(roomCode);
      if (playerId) socket.join(playerId);
      broadcastState(io, roomCode);
    });

    socket.on(WS.GAME_ACTION, (raw) => {
      if (!currentRoom || !playerId) return;
      const res = GameActionPayload.safeParse(raw);
      if (!res.success) return;
      const room = getRoom(currentRoom);
      if (!room) return;
      const s = room.state;
      switch (res.data.type) {
        case 'start':
          if (s.phase === 'LOBBY') {
            startGame(s);
          }
          break;
        case 'ready': {
          const p = s.players.find((p) => p.id === playerId);
          if (p) p.isReady = res.data.ready;
          break;
        }
        case 'play_card':
          playCard(s, playerId, res.data.cardId);
          break;
        case 'unplay_card':
          unplayCard(s, playerId);
          break;
        case 'claim_card':
          claimCard(s, playerId, res.data.cardId);
          break;
        case 'yew_target':
          processYewTarget(s, playerId, res.data.targetPlayerId);
          break;
        case 'resolution_action':
          if (s.phase === 'DAY' && res.data.choice) {
            processResolutionAction(s, playerId, res.data.choice);
          }
          break;
        case 'end_discussion':
          endDiscussion(s, playerId);
          break;
        case 'send_rune': {
          const runeData = res.data;
          if (runeData.type === 'send_rune') {
            if (sendRune(s, playerId, runeData.toPlayerId, runeData.message)) {
              // Broadcast public notification that rune was sent (not the message content)
              const fromPlayer = s.players.find(p => p.id === playerId);
              const toPlayer = s.players.find(p => p.id === runeData.toPlayerId);
              if (fromPlayer && toPlayer) {
                // Add to resolution log for public visibility
                s.resolutionLog.push({
                  type: 'info',
                  message: `${fromPlayer.name} sent a rune to ${toPlayer.name}`,
                  round: s.round,
                });
              }
            }
          }
          break;
        }
      }
      broadcastState(io, currentRoom);
    });

    socket.on(WS.CHAT_SEND, (raw) => {
      if (!currentRoom || !playerId || !playerName) return;
      const res = ChatSendPayload.safeParse(raw);
      if (!res.success) return;
      io.to(currentRoom).emit(WS.CHAT_RECEIVE, {
        playerId,
        name: playerName,
        message: res.data.message,
        ts: Date.now(),
      });
    });

    socket.on('disconnect', () => {
      if (!currentRoom) return;
      const room = getRoom(currentRoom);
      if (!room) return;
      if (playerId) {
        const p = room.state.players.find((p) => p.id === playerId);
        if (p) p.connected = false;
      }
      broadcastState(io, currentRoom);
    });
  });
}

function broadcastState(io: IOServer, roomCode: string) {
  const room = getRoom(roomCode);
  if (!room) return;
  for (const p of room.state.players) {
    const shaped = shapeStateFor(room.state, p.id);
    io.to(p.id).emit(WS.GAME_STATE, shaped);
  }
  // Spectators: send fully revealed table but hide hands
  const spectatorState = shapeStateFor(room.state, '');
  for (const spectatorId of room.state.spectators) {
    io.to(spectatorId).emit(WS.GAME_STATE, spectatorState);
  }
}

function makeRoomCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += letters[Math.floor(Math.random() * letters.length)];
  return s;
}
