import { useState, useRef, useEffect } from 'react';
import { CARD_EFFECTS, getCardEffect } from '../../lib/cardData';

type Props = {
  playerCount: number;
};

export function HelpButton({ playerCount }: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect if device supports touch
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    // Close help when clicking outside
    if (!showHelp) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setShowHelp(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHelp]);

  const handleClick = () => {
    setShowHelp(!showHelp);
  };

  return (
    <div 
      ref={helpRef}
      className="relative"
      onMouseEnter={() => !isTouchDevice && setShowHelp(true)}
      onMouseLeave={() => !isTouchDevice && setShowHelp(false)}
    >
      <button
        onClick={handleClick}
        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-600 bg-slate-800 text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-700 hover:text-slate-200"
        aria-label="Help"
      >
        <span className="text-lg font-bold">?</span>
      </button>
      
      {showHelp && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[90vw] max-w-2xl rounded-lg border border-slate-700 bg-slate-900 p-4 shadow-2xl md:w-96">
          <h3 className="mb-3 text-lg font-bold text-slate-200">Game Help</h3>
          
          {/* Win Condition */}
          <div className="mb-4 rounded-md border border-green-800 bg-green-900/20 p-3">
            <h4 className="mb-2 font-semibold text-green-400">Win Condition</h4>
            <p className="text-sm text-slate-300">
              Game ends when <strong>center deck = 5 cards remaining</strong>.
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Count remaining cards:
            </p>
            <ul className="mt-1 space-y-1 text-sm text-slate-300">
              <li>• More <span className="font-semibold text-green-400">Milk</span> = Good team wins</li>
              <li>• More <span className="font-semibold text-red-400">Blood</span> = Evil team wins</li>
              <li>• Tie = Draw (both teams tie)</li>
            </ul>
          </div>
          
          {/* Ingredients */}
          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            <h4 className="font-semibold text-slate-200">Ingredient Effects</h4>
            {Object.keys(CARD_EFFECTS).map((key) => {
              const effect = getCardEffect(key, playerCount);
              if (!effect) return null;
              return (
                <div key={effect.name} className="rounded-md border border-slate-700 bg-slate-800/50 p-3">
                  <div className="mb-2 font-semibold text-slate-200">{effect.name}</div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div>
                      <span className="font-semibold text-blue-400">Primary:</span>{' '}
                      {effect.primary}
                    </div>
                    <div>
                      <span className="font-semibold text-purple-400">Secondary:</span>{' '}
                      {effect.secondary}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Arrow pointer */}
          <div className="absolute right-3 bottom-full h-0 w-0 border-8 border-transparent border-b-slate-900"></div>
        </div>
      )}
    </div>
  );
}
