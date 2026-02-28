import type { ShapedState, PendingAction } from '@irish-potions/shared';
import { Button } from '../ui/button';
import { useState } from 'react';
import { CardImage } from './CardImage';

type Props = {
  state: ShapedState;
  myPendingAction?: PendingAction;
  onChoice: (choice: 'keep' | 'discard' | 'confirm') => void;
  onYewTarget: (targetPlayerId: string) => void;
  onInnkeeperGuess: (ingredientName: string) => void;
};

function formatRoleName(name: string): string {
  // Convert "evil_fair_dohrik" to "Fair Dohrik"
  // Remove team prefix (case insensitive)
  const withoutTeam = name.replace(/^(evil_|good_)/i, '');
  // Replace underscores with spaces and capitalize each word
  return withoutTeam
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function ResolutionModal({ state, myPendingAction, onChoice, onYewTarget, onInnkeeperGuess }: Props) {
  const [isMinimized, setIsMinimized] = useState(false);
  const hasPendingActions = state.pendingActions && state.pendingActions.length > 0;
  
  if (!hasPendingActions) return null;
  
  if (!myPendingAction) {
    // This player has no action, but others do - show minimizable waiting indicator
    if (isMinimized) {
      return (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setIsMinimized(false)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 shadow-xl hover:bg-slate-750 transition-colors flex items-center gap-2"
          >
            <div className="animate-pulse h-2 w-2 rounded-full bg-yellow-400"></div>
            <div className="text-sm text-slate-200">
              Waiting ({state.pendingActions.length})
            </div>
          </button>
        </div>
      );
    }
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-200">Waiting...</h2>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              title="Minimize"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
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
          <h2 className="mb-4 text-xl font-bold text-purple-400">Cailleach's Gaze (Primary)</h2>
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
  
  if (myPendingAction.actionType === 'cailleach_secondary') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl max-w-md">
          <h2 className="mb-4 text-xl font-bold text-purple-400">Cailleach's Gaze (Secondary)</h2>
          <p className="mb-4 text-slate-300">
            You can see the top card of the deck:
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
            This card will remain on top of the deck.
          </p>
          
          <Button onClick={() => onChoice('confirm')} className="w-full">
            Acknowledge
          </Button>
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
                  {formatRoleName(newRole.name)}
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
  
  if (myPendingAction.actionType === 'ceol_secondary') {
    const revealedRole = state.roles[myPendingAction.revealedRoleId];
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl max-w-md">
          <h2 className="mb-4 text-xl font-bold text-blue-400">Ceol of the Midnight Cairn (Secondary)</h2>
          <p className="mb-4 text-slate-300">
            You can see the role of one other player who played Ceol:
          </p>
          
          {/* Show revealed role */}
          {revealedRole && (
            <div className="mb-6">
              <div className="mb-2 text-center">
                <div className="text-sm text-slate-400">Another Ceol player's role:</div>
                <div className={`text-lg font-bold ${
                  revealedRole.team === 'GOOD' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatRoleName(revealedRole.name)}
                </div>
                <div className={`text-sm ${
                  revealedRole.team === 'GOOD' ? 'text-green-500' : 'text-red-500'
                }`}>
                  Team: {revealedRole.team}
                </div>
              </div>
              {revealedRole.image && (
                <div className="flex justify-center">
                  <img 
                    src={revealedRole.image} 
                    alt={revealedRole.name}
                    className="h-40 w-28 rounded-md border-2 border-slate-600 object-cover"
                  />
                </div>
              )}
            </div>
          )}
          
          <p className="mb-4 text-xs text-slate-400 italic">
            Note: You don't know which specific player has this role.
          </p>
          
          <Button onClick={() => onChoice('confirm')} className="w-full">
            Acknowledge
          </Button>
        </div>
      </div>
    );
  }
  
  if (myPendingAction.actionType === 'yew_primary') {
    // Create a helper to get the correct image path
    const getIngredientImage = (ingredient: string) => {
      // Try .JPG first (most files), fallback to .jpg (yew's file)
      return `/assets/ingredients/${ingredient}.JPG`;
    };
    
    // Format ingredient names for display
    const ingredientOptions = myPendingAction.availableIngredients.map(ingredient => ({
      value: ingredient,
      label: formatRoleName(ingredient),
      image: getIngredientImage(ingredient),
    }));
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl max-w-2xl">
          <h2 className="mb-4 text-xl font-bold text-green-600">Yew's Quiet Draught (Primary)</h2>
          <p className="mb-4 text-slate-300">
            Choose an ingredient to poison. If a majority of Yew players choose the same ingredient, any player who casts it next round will be poisoned and unable to act the following round.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {ingredientOptions.map(option => (
              <div 
                key={option.value}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => onYewTarget(option.value)}
              >
                <CardImage
                  src={option.image}
                  cardName={option.label}
                  playerCount={state.players.length}
                  className="transition-all group-hover:scale-105 group-hover:ring-2 group-hover:ring-green-500 group-hover:shadow-lg group-hover:shadow-green-500/50"
                />
                <span className="mt-2 text-sm text-slate-300 text-center group-hover:text-green-400 transition-colors">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
          
          <p className="mt-4 text-xs text-slate-400 italic">
            Your vote is secret. Results depend on majority consensus.
          </p>
        </div>
      </div>
    );
  }
  
  if (myPendingAction.actionType === 'yew_secondary') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl max-w-md">
          <h2 className="mb-4 text-xl font-bold text-green-600">Yew's Quiet Draught (Secondary)</h2>
          <p className="mb-4 text-slate-300">
            The top card of the deck was revealed and it was <strong>Blood</strong>! You are now poisoned and will not be able to cast an ingredient in the next round.
          </p>
          
          <div className="mb-4 rounded-lg bg-red-900/30 border border-red-700 p-4 text-center">
            <div className="text-2xl mb-2">☠️</div>
            <div className="text-red-400 font-semibold">You are poisoned!</div>
            <div className="text-sm text-red-300 mt-1">Skip next round</div>
          </div>
          
          <Button onClick={() => onChoice('confirm')} className="w-full">
            Acknowledge
          </Button>
        </div>
      </div>
    );
  }
  
  if (myPendingAction.actionType === 'innkeeper_primary') {
    // Create a helper to get the correct image path
    const getIngredientImage = (ingredient: string) => {
      return `/assets/ingredients/${ingredient}.JPG`;
    };
    
    // Format ingredient names for display
    const ingredientOptions = myPendingAction.availableIngredients.map(ingredient => ({
      value: ingredient,
      label: formatRoleName(ingredient),
      image: getIngredientImage(ingredient),
    }));
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl max-w-2xl">
          <h2 className="mb-4 text-xl font-bold text-amber-400">Innkeepers' Lots (Primary)</h2>
          <p className="mb-4 text-slate-300">
            Guess which ingredient card is most common across all players' hands. If you guess correctly, you'll be able to view a card from the deck and decide whether to discard it.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {ingredientOptions.map(option => (
              <div 
                key={option.value}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => onInnkeeperGuess(option.value)}
              >
                <CardImage
                  src={option.image}
                  cardName={option.label}
                  playerCount={state.players.length}
                  className="transition-all group-hover:scale-105 group-hover:ring-2 group-hover:ring-amber-400 group-hover:shadow-lg group-hover:shadow-amber-400/50"
                />
                <span className="mt-2 text-sm text-slate-300 text-center group-hover:text-amber-400 transition-colors">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
          
          <p className="mt-4 text-xs text-slate-400 italic">
            Your guess is secret. If there's a tie for most common, any tied ingredient counts as correct.
          </p>
        </div>
      </div>
    );
  }
  
  if (myPendingAction.actionType === 'innkeeper_guess') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl max-w-md">
          <h2 className="mb-4 text-xl font-bold text-amber-400">Innkeepers' Lots - Correct Guess!</h2>
          <p className="mb-4 text-slate-300">
            You guessed correctly! You may look at this card from the deck:
          </p>
          
          {/* Show the card */}
          <div className="mb-6 flex justify-center">
            <div className={`h-40 w-28 rounded-md border-2 overflow-hidden ${
              myPendingAction.cardToView.type === 'MILK' ? 'border-green-500' : 'border-red-500'
            }`}>
              <img 
                src={`/assets/center_deck/${myPendingAction.cardToView.type.toLowerCase()}.png`} 
                alt={myPendingAction.cardToView.type}
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
              Discard Secretly
            </Button>
          </div>
          
          <p className="mt-4 text-xs text-slate-400 italic">
            Note: Other players won't know what card you saw or whether you discarded it.
          </p>
        </div>
      </div>
    );
  }
  
  if (myPendingAction.actionType === 'forced_play_notification') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl max-w-md">
          <h2 className="mb-4 text-xl font-bold text-orange-400">⏰ Time's Up!</h2>
          <p className="mb-4 text-slate-300">
            The night phase timer expired before you selected a card.
          </p>
          
          <div className="mb-4 rounded-lg bg-orange-900/30 border border-orange-700 p-4 text-center">
            <div className="text-2xl mb-2">🎲</div>
            <div className="text-orange-300 font-semibold mb-2">Random Card Played</div>
            <div className="text-sm text-slate-400">
              Card: <span className="text-orange-200 font-medium">{myPendingAction.cardName}</span>
            </div>
          </div>
          
          <p className="mb-4 text-sm text-slate-400">
            A random card from your hand was automatically played for you.
          </p>
          
          <Button onClick={() => onChoice('confirm')} className="w-full bg-orange-600 hover:bg-orange-700">
            Acknowledge
          </Button>
        </div>
      </div>
    );
  }
  
  return null;
}
