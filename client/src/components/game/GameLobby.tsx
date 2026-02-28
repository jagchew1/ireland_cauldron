import { useState } from 'react';
import type { ShapedState } from '@irish-potions/shared';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

type Props = {
  state: ShapedState;
  onStart: () => void;
  onReady: (ready: boolean) => void;
  onUpdateConfig: (config: any) => void;
};

const INGREDIENT_NAMES = {
  'brigids_blessing': "Brigid's Blessing",
  'cailleachs_gaze': "Cailleach's Gaze",
  'ceol_of_the_midnight_cairn': 'Ceol of the Midnight Cairn',
  'faerie_thistle': 'Faerie Thistle',
  'wolfbane_root': 'Wolfbane Root',
  'yews_quiet_draught': "Yew's Quiet Draught",
  'innkeepers_lots': "Innkeepers' Lots",
} as const;

export function GameLobby({ state, onStart, onReady, onUpdateConfig }: Props) {
  const [showSettings, setShowSettings] = useState(false);
  const isHost = state.currentPlayerId === state.players[0]?.id;
  const config = state.config;

  const handleTimerToggle = (enabled: boolean) => {
    onUpdateConfig({ timersEnabled: enabled });
  };

  const handleTimerChange = (phase: 'night' | 'day', value: number) => {
    const key = phase === 'night' ? 'nightSeconds' : 'daySeconds';
    onUpdateConfig({ [key]: value });
  };

  const handleIngredientToggle = (ingredientId: string) => {
    const current = config.enabledIngredients || Object.keys(INGREDIENT_NAMES);
    const updated = current.includes(ingredientId)
      ? current.filter(id => id !== ingredientId)
      : [...current, ingredientId];
    onUpdateConfig({ enabledIngredients: updated });
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 p-4">
      <div className="text-lg">Room {state.room.code}</div>
      
      <div className="rounded-md border border-slate-800">
        <div className="border-b border-slate-800 p-2 text-sm text-slate-400">Players</div>
        <ul>
          {state.players.map((p, idx) => (
            <li key={p.id} className="flex items-center justify-between p-2">
              <span>
                {p.name} {idx === 0 && <span className="text-xs text-slate-500">(host)</span>}
              </span>
              <span className={p.isReady ? 'text-emerald-400' : 'text-slate-500'}>
                {p.connected ? '●' : '○'} {p.isReady ? 'ready' : 'not ready'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {isHost && (
        <div className="rounded-md border border-slate-800">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full border-b border-slate-800 p-2 text-left text-sm text-slate-400 hover:bg-slate-800/50"
          >
            ⚙️ Game Settings {showSettings ? '▼' : '▶'}
          </button>
          
          {showSettings && (
            <div className="space-y-4 p-4">
              {/* Timer Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Turn Timers</span>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.timersEnabled}
                      onChange={(e) => handleTimerToggle(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-2 focus:ring-emerald-600"
                    />
                    <span className="text-sm text-slate-400">Enabled</span>
                  </label>
                </div>

                {config.timersEnabled && (
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm text-slate-400">Night Phase:</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="10"
                          max="300"
                          value={config.nightSeconds}
                          onChange={(e) => handleTimerChange('night', parseInt(e.target.value) || 30)}
                          className="w-20 text-sm"
                        />
                        <span className="text-xs text-slate-500">seconds</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm text-slate-400">Day Phase:</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="10"
                          max="300"
                          value={config.daySeconds}
                          onChange={(e) => handleTimerChange('day', parseInt(e.target.value) || 45)}
                          className="w-20 text-sm"
                        />
                        <span className="text-xs text-slate-500">seconds</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ingredient Selection */}
              <div className="space-y-2 border-t border-slate-700 pt-3">
                <div className="text-sm font-medium text-slate-300">Enabled Ingredients</div>
                <div className="space-y-1.5">
                  {Object.entries(INGREDIENT_NAMES).map(([id, name]) => {
                    const enabledIngredients = config.enabledIngredients || Object.keys(INGREDIENT_NAMES);
                    const isEnabled = enabledIngredients.includes(id);
                    return (
                      <label key={id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleIngredientToggle(id)}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-2 focus:ring-emerald-600"
                        />
                        <span className={isEnabled ? 'text-slate-300' : 'text-slate-500'}>{name}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="text-xs text-slate-500 italic">
                  {config.enabledIngredients?.length || 7} of 7 ingredients enabled
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={() => onReady(true)}>Ready</Button>
        <Button onClick={onStart}>Start</Button>
      </div>
    </div>
  );
}
