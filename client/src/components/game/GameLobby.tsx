import type { ShapedState } from '@shared/types';
import { Button } from '../ui/button';

type Props = {
  state: ShapedState;
  onStart: () => void;
  onReady: (ready: boolean) => void;
};

export function GameLobby({ state, onStart, onReady }: Props) {
  return (
    <div className="mx-auto max-w-xl space-y-4 p-4">
      <div className="text-lg">Room {state.room.code}</div>
      <div className="rounded-md border border-slate-800">
        <div className="border-b border-slate-800 p-2 text-sm text-slate-400">Players</div>
        <ul>
          {state.players.map((p) => (
            <li key={p.id} className="flex items-center justify-between p-2">
              <span>{p.name}</span>
              <span className={p.isReady ? 'text-emerald-400' : 'text-slate-500'}>
                {p.connected ? '●' : '○'} {p.isReady ? 'ready' : 'not ready'}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => onReady(true)}>Ready</Button>
        <Button onClick={onStart}>Start</Button>
      </div>
    </div>
  );
}
