import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGameRoom } from '../hooks/useGameRoom';
import { GameBoard } from '../components/game/GameBoard';

export default function Game() {
  const { roomCode = '' } = useParams();
  const { state, joinRoom, playCard, unplayCard, claimCard, resolutionChoice, yewTarget, endDiscussion, sendRune, acknowledgeBio } = useGameRoom(roomCode);

  useEffect(() => {
    const name = sessionStorage.getItem('name') || 'Player';
    joinRoom(roomCode, name);
  }, [roomCode, joinRoom]);

  if (!state) return <div className="p-4">Connecting...</div>;
  
  // Different background based on phase
  const bgClass = state.phase === 'NIGHT' 
    ? 'bg-slate-950' // Darker for night
    : state.phase === 'DAY' 
    ? 'bg-slate-900' // Lighter for day
    : 'bg-slate-925'; // Default for other phases
  
  return (
    <div className={`min-h-screen transition-colors duration-1000 ${bgClass}`}>
      <GameBoard state={state} onPlayCard={playCard} onUnplayCard={unplayCard} onClaimCard={claimCard} onResolutionChoice={resolutionChoice} onYewTarget={yewTarget} onEndDiscussion={endDiscussion} onSendRune={sendRune} onAcknowledgeBio={acknowledgeBio} />
    </div>
  );
}
