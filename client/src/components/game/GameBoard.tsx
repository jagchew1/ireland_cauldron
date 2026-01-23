import type { ShapedState } from '@irish-potions/shared';
import { CardImage } from './CardImage';
import { ResolutionModal } from './ResolutionModal';

type Props = {
  state: ShapedState;
  onPlayCard: (cardId: string) => void;
  onResolutionChoice: (choice: 'keep' | 'discard' | 'confirm') => void;
};

export function GameBoard({ state, onPlayCard, onResolutionChoice }: Props) {
  const myId = state.currentPlayerId;
  const myHand = myId ? state.hands[myId] || [] : [];
  const hasPlayedCard = state.table.some(t => t.playerId === myId);
  
  // Check for pending action for this player
  const myPendingAction = myId && state.pendingActions 
    ? state.pendingActions.find(a => a.playerId === myId)
    : undefined;
  
  // Get cards this player knows about
  const myKnowledge = myId && state.playerKnowledge
    ? state.playerKnowledge.filter(k => k.playerId === myId)
    : [];
  
  const deckKnowledge = myKnowledge.filter(k => k.location === 'deck');
  const discardKnowledge = myKnowledge.filter(k => k.location === 'discard');
  
  // Debug info
  console.log('GameBoard render:', { 
    myId, 
    handCount: myHand.length, 
    hands: Object.keys(state.hands),
    firstCard: myHand[0]
  });
  
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      {/* Resolution Modal */}
      <ResolutionModal 
        state={state} 
        myPendingAction={myPendingAction}
        onChoice={onResolutionChoice}
      />
      
      <div className="flex items-center justify-between">
        <div>Room {state.room.code}</div>
        <div>Phase: {state.phase} | Round {state.round}</div>
      </div>
      
      {/* Resolution Log */}
      {state.resolutionLog && state.resolutionLog.length > 0 && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-200">Resolution</h2>
          <div className="space-y-2">
            {state.resolutionLog.map((entry, i) => (
              <div key={i} className="text-sm">
                <div className={`${
                  entry.type === 'primary' ? 'text-blue-400 font-semibold' :
                  entry.type === 'secondary' ? 'text-purple-400 font-semibold' :
                  'text-slate-300'
                }`}>
                  {entry.message}
                </div>
                {/* Show cards if any */}
                {entry.cardsShown && entry.cardsShown.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {entry.cardsShown.map((card, j) => (
                      <div key={j} className={`h-24 w-16 rounded border-2 overflow-hidden ${
                        card.type === 'MILK' ? 'border-green-500' : 'border-red-500'
                      }`}>
                        <img 
                          src={`/assets/center_deck/${card.type.toLowerCase()}.png`} 
                          alt={card.type}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
        <div className="col-span-2 md:col-span-3">
          <h2 className="mb-2 text-sm text-slate-400">Center Deck</h2>
          <div className="flex flex-wrap gap-4 items-start">
            {/* Deck */}
            <div className="flex flex-col items-center gap-1 relative group">
              <div className="h-40 w-28 rounded-md border-2 border-blue-600 bg-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{state.centerDeck.cards.length}</div>
                  <div className="text-xs text-slate-400">Cards</div>
                </div>
              </div>
              <div className="text-xs text-slate-400">Deck</div>
              
              {/* Deck Knowledge Tooltip */}
              {deckKnowledge.length > 0 && (
                <div className="absolute bottom-full left-1/2 mb-2 hidden group-hover:block z-10 w-48 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl">
                  <div className="mb-1 text-xs font-semibold text-slate-300">Cards you know in deck:</div>
                  <div className="space-y-1">
                    {deckKnowledge.map((k, i) => (
                      <div key={i} className={`text-xs ${k.type === 'MILK' ? 'text-green-400' : 'text-red-400'}`}>
                        • {k.type}
                      </div>
                    ))}
                  </div>
                  <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                </div>
              )}
            </div>
            
            {/* Revealed Cards */}
            {state.centerDeck.revealed.map((card, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`h-40 w-28 rounded-md border-2 overflow-hidden ${
                  card.type === 'MILK' ? 'border-green-500' : 'border-red-500'
                }`}>
                  <img 
                    src={`/assets/center_deck/${card.type.toLowerCase()}.png`} 
                    alt={card.type}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-xs text-slate-400">Revealed</div>
              </div>
            ))}
            
            {/* Discard Pile */}
            {state.centerDeck.discarded.length > 0 && (
              <div className="flex flex-col items-center gap-1 relative group">
                <div className="h-40 w-28 rounded-md border-2 border-slate-600 bg-slate-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-400">{state.centerDeck.discarded.length}</div>
                    <div className="text-xs text-slate-500">Discarded</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">Discard</div>
                
                {/* Discard Knowledge Tooltip */}
                {discardKnowledge.length > 0 && (
                  <div className="absolute bottom-full left-1/2 mb-2 hidden group-hover:block z-10 w-48 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl">
                    <div className="mb-1 text-xs font-semibold text-slate-300">Cards you know were discarded:</div>
                    <div className="space-y-1">
                      {discardKnowledge.map((k, i) => (
                        <div key={i} className={`text-xs ${k.type === 'MILK' ? 'text-green-400' : 'text-red-400'}`}>
                          • {k.type}
                        </div>
                      ))}
                    </div>
                    <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
          {myHand.length === 0 ? (
            <div className="text-sm text-slate-400">No cards in hand (Player ID: {myId || 'unknown'})</div>
          ) : (
            <div className="flex gap-2">
              {myHand.map((c) => (
                <CardImage 
                  key={c.id} 
                  src={(c as any).image}
                  cardName={c.name}
                  onClick={() => !hasPlayedCard && state.phase === 'NIGHT' && onPlayCard(c.id)}
                  className={hasPlayedCard || state.phase !== 'NIGHT' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 transition-transform'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
