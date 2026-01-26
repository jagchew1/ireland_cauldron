import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocket, WS } from '../lib/websocket';
import type { ShapedState } from '@irish-potions/shared';

export function useGameRoom(roomCode: string | null) {
  const socketRef = useRef(getSocket());
  const [state, setState] = useState<ShapedState | null>(null);

  useEffect(() => {
    const s = socketRef.current;
    const onState = (payload: ShapedState) => setState(payload);
    s.on(WS.GAME_STATE, onState);
    return () => {
      s.off(WS.GAME_STATE, onState);
    };
  }, []);

  const createRoom = useCallback((name: string) => {
    socketRef.current.emit(WS.ROOM_CREATE, { name });
  }, []);

  const joinRoom = useCallback((code: string, name: string, spectator?: boolean) => {
    socketRef.current.emit(WS.ROOM_JOIN, { roomCode: code, name, spectator: !!spectator });
  }, []);

  const start = useCallback(() => {
    socketRef.current.emit(WS.GAME_ACTION, { type: 'start' });
  }, []);

  const ready = useCallback((ready: boolean) => {
    socketRef.current.emit(WS.GAME_ACTION, { type: 'ready', ready });
  }, []);

  const playCard = useCallback((cardId: string) => {
    socketRef.current.emit(WS.GAME_ACTION, { type: 'play_card', cardId });
  }, []);

  const unplayCard = useCallback(() => {
    socketRef.current.emit(WS.GAME_ACTION, { type: 'unplay_card' });
  }, []);

  const claimCard = useCallback((cardId: string) => {
    socketRef.current.emit(WS.GAME_ACTION, { type: 'claim_card', cardId });
  }, []);

  const resolutionChoice = useCallback((choice: 'keep' | 'discard' | 'confirm') => {
    socketRef.current.emit(WS.GAME_ACTION, { type: 'resolution_action', choice });
  }, []);

  const endDiscussion = useCallback(() => {
    socketRef.current.emit(WS.GAME_ACTION, { type: 'end_discussion' });
  }, []);

  const sendChat = useCallback((room: string, message: string) => {
    socketRef.current.emit(WS.CHAT_SEND, { roomCode: room, message });
  }, []);

  return { state, createRoom, joinRoom, start, ready, playCard, unplayCard, claimCard, resolutionChoice, endDiscussion, sendChat };
}
