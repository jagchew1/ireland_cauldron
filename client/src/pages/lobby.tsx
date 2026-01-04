import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameRoom } from '../hooks/useGameRoom';
import { GameLobby } from '../components/game/GameLobby';

export default function Lobby() {
  const { roomCode = '' } = useParams();
  const nav = useNavigate();
  const name = sessionStorage.getItem('name') || 'Player';
  const { state, joinRoom, start, ready } = useGameRoom(roomCode);

  useEffect(() => {
    sessionStorage.setItem('name', name);
    joinRoom(roomCode, name);
  }, [roomCode, name, joinRoom]);

  useEffect(() => {
    if (state?.phase === 'NIGHT' || state?.phase === 'DAY') nav(`/game/${roomCode}`);
  }, [state?.phase, nav, roomCode]);

  if (!state) return <div className="p-4">Connecting...</div>;
  return <GameLobby state={state} onStart={start} onReady={ready} />;
}
