import { io, Socket } from 'socket.io-client';
import { WS } from '@shared/events';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io('/', { autoConnect: true });
  }
  return socket;
}

export { WS };
