import type { ShapedState } from '@irish-potions/shared';
import { CardImage } from './CardImage';

type Props = {
  state: ShapedState;
  onPlayCard: (cardId: string) => void;
};

export function GameBoard({ state, onPlayCard }: Props) {
  const myId = state.currentPlayerId;
  const myHand = myId ? state.hands[myId] || [] : [];
  const hasPlayedCard = state.table.some(t => t.playerId === myId);
  
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>Room {state.room.code}</div>
        <div>Phase: {state.phase} | Round {state.round}</div>
      </div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
        <div className="col-span-2 md:col-span-3">
          <h2 className="mb-2 text-sm text-slate-400">Table</h2>
          <div className="flex flex-wrap gap-2">
            {state.table.map((t, i) => (
              <CardImage key={i} src={t.image} />
            ))}
          </div>
        </div>
        <div className="col-span-2 md:col-span-3">
          <h2 className="mb-2 text-sm text-slate-400">Your Hand</h2>
          {hasPlayedCard && state.phase === 'NIGHT' && (
            <div className="mb-2 text-sm text-green-400">✓ Card played - waiting for other players...</div>
          )}
          <div className="flex gap-2">
            {myHand.map((c) => (
              <CardImage 
                key={c.id} 
                src={(c as any).image} 
                onClick={() => !hasPlayedCard && state.phase === 'NIGHT' && onPlayCard(c.id)}
                className={hasPlayedCard || state.phase !== 'NIGHT' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 transition-transform'}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
