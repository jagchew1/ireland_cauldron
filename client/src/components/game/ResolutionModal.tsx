import type { ShapedState, PendingAction } from '@irish-potions/shared';
import { Button } from '../ui/button';

type Props = {
  state: ShapedState;
  myPendingAction?: PendingAction;
  onChoice: (choice: 'keep' | 'discard' | 'confirm') => void;
};

export function ResolutionModal({ state, myPendingAction, onChoice }: Props) {
  const hasPendingActions = state.pendingActions && state.pendingActions.length > 0;
  
  if (!hasPendingActions) return null;
  
  if (!myPendingAction) {
    // This player has no action, but others do
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl max-w-md">
          <h2 className="mb-4 text-xl font-bold text-slate-200">Waiting...</h2>
          <p className="text-slate-300">
            Other players are making their choices. Please wait.
          </p>
          <div className="mt-4 text-sm text-slate-400">
            {state.pendingActions.length} action(s) remaining
          </div>
        </div>
      </div>
    );
  }
  
  // Render specific action UI
  if (myPendingAction.actionType === 'cailleach_primary') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl max-w-md">
          <h2 className="mb-4 text-xl font-bold text-purple-400">Cailleach's Gaze</h2>
          <p className="mb-4 text-slate-300">
            You may look at this card from the deck:
          </p>
          
          {/* Show the card */}
          <div className="mb-6 flex justify-center">
            <div className={`h-40 w-28 rounded-md border-2 overflow-hidden ${
              myPendingAction.cardShown.type === 'MILK' ? 'border-green-500' : 'border-red-500'
            }`}>
              <img 
                src={`/assets/center_deck/${myPendingAction.cardShown.type.toLowerCase()}.png`} 
                alt={myPendingAction.cardShown.type}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          
          <p className="mb-4 text-sm text-slate-400">
            Choose what to do with this card:
          </p>
          
          <div className="flex gap-3">
            <Button onClick={() => onChoice('keep')} className="flex-1">
              Keep in Deck
            </Button>
            <Button onClick={() => onChoice('discard')} className="flex-1 bg-red-600 hover:bg-red-700">
              Discard
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (myPendingAction.actionType === 'wolfbane_primary') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl max-w-md">
          <h2 className="mb-4 text-xl font-bold text-orange-400">Wolfbane Root</h2>
          <p className="mb-4 text-slate-300">
            You must discard 1 random card from your hand.
          </p>
          
          <p className="mb-6 text-sm text-slate-400">
            Click to discard a random card:
          </p>
          
          <Button onClick={() => onChoice('confirm')} className="w-full">
            Discard Random Card
          </Button>
        </div>
      </div>
    );
  }
  
  if (myPendingAction.actionType === 'ceol_primary') {
    const newRole = state.roles[myPendingAction.newRoleId];
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl max-w-md">
          <h2 className="mb-4 text-xl font-bold text-blue-400">Ceol of the Midnight Cairn</h2>
          <p className="mb-4 text-slate-300">
            Your role has been swapped!
          </p>
          
          {/* Show new role */}
          {newRole && (
            <div className="mb-6">
              <div className="mb-2 text-center">
                <div className="text-sm text-slate-400">Your new role:</div>
                <div className={`text-lg font-bold ${
                  newRole.team === 'GOOD' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {newRole.name}
                </div>
              </div>
              {newRole.image && (
                <div className="flex justify-center">
                  <img 
                    src={newRole.image} 
                    alt={newRole.name}
                    className="h-40 w-28 rounded-md border-2 border-slate-600 object-cover"
                  />
                </div>
              )}
            </div>
          )}
          
          <Button onClick={() => onChoice('confirm')} className="w-full">
            Acknowledge
          </Button>
        </div>
      </div>
    );
  }
  
  return null;
}
