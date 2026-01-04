import type { ShapedState } from '@shared/types';
import { CardImage } from './CardImage';

type Props = {
  state: ShapedState;
  onPlayCard: (cardId: string) => void;
};

export function GameBoard({ state, onPlayCard }: Props) {
  const me = state.players[0];
  const myId = me?.id;
  const myHand = myId ? state.hands[myId] || [] : [];
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
          <div className="flex gap-2">
            {myHand.map((c) => (
              <CardImage key={c.id} src={(c as any).image} onClick={() => onPlayCard(c.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
