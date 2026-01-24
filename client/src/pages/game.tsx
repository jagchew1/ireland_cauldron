import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGameRoom } from '../hooks/useGameRoom';
import { GameBoard } from '../components/game/GameBoard';

export default function Game() {
  const { roomCode = '' } = useParams();
  const { state, joinRoom, playCard, resolutionChoice, endDiscussion } = useGameRoom(roomCode);

  useEffect(() => {
    const name = sessionStorage.getItem('name') || 'Player';
    joinRoom(roomCode, name);
  }, [roomCode, joinRoom]);

  if (!state) return <div className="p-4">Connecting...</div>;
  return <GameBoard state={state} onPlayCard={playCard} onResolutionChoice={resolutionChoice} onEndDiscussion={endDiscussion} />;
}
