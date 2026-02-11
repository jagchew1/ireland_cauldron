import type { Role } from '@irish-potions/shared';
import { Button } from '../ui/button';
import { getCharacterBio, getCharacterDisplayName } from '../../lib/characterBios';

type Props = {
  role: Role;
  onContinue: () => void;
};

export function CharacterBioModal({ role, onContinue }: Props) {
  const bio = getCharacterBio(role.id);
  const displayName = getCharacterDisplayName(role.id);
  const isEvil = role.team === 'EVIL';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="rounded-lg border border-slate-700 bg-slate-900 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with character name and team */}
        <div className={`p-6 border-b ${isEvil ? 'border-red-800 bg-red-950/30' : 'border-emerald-800 bg-emerald-950/30'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${isEvil ? 'text-red-400' : 'text-emerald-400'}`}>
                {displayName}
              </h2>
              <div className={`mt-1 text-sm font-semibold ${isEvil ? 'text-red-500' : 'text-emerald-500'}`}>
                {isEvil ? '⚔️ EVIL' : '✨ GOOD'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Character card image */}
        <div className="p-6 flex justify-center bg-slate-950/50">
          {role.image ? (
            <div className="relative">
              <img 
                src={role.image} 
                alt={displayName}
                className="h-64 w-auto rounded-lg shadow-xl border-2 border-slate-700"
              />
              <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                isEvil 
                  ? 'bg-red-600 text-white' 
                  : 'bg-emerald-600 text-white'
              }`}>
                {role.team}
              </div>
            </div>
          ) : (
            <div className="h-64 w-48 rounded-lg border-2 border-slate-700 bg-slate-800 flex items-center justify-center">
              <span className="text-slate-500 text-sm">No Image</span>
            </div>
          )}
        </div>
        
        {/* Character bio */}
        <div className="p-6 border-t border-slate-800">
          <h3 className="text-lg font-semibold text-slate-200 mb-3">Character Lore</h3>
          {bio ? (
            <p className="text-slate-300 leading-relaxed text-sm">
              {bio}
            </p>
          ) : (
            <p className="text-slate-500 italic text-sm">
              No biography available for this character.
            </p>
          )}
        </div>
        
        {/* Footer with continue button */}
        <div className="p-6 border-t border-slate-800 flex justify-center">
          <Button 
            onClick={onContinue}
            className="px-8 py-2 text-lg"
          >
            Continue to Game
          </Button>
        </div>
      </div>
    </div>
  );
}
