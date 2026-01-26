import type { ShapedState } from '@irish-potions/shared';
import { CardImage } from './CardImage';
import { ResolutionModal } from './ResolutionModal';
import { HelpButton } from './HelpButton';
import { CountdownTimer } from './CountdownTimer';
import React from 'react';

type Props = {
  state: ShapedState;
  onPlayCard: (cardId: string) => void;
  onUnplayCard: () => void;
  onClaimCard: (cardId: string) => void;
  onResolutionChoice: (choice: 'keep' | 'discard' | 'confirm') => void;
  onEndDiscussion: () => void;
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

function formatIngredientName(name: string): string {
  // Convert "brigids_blessing" to "Brigid's Blessing"
  // Convert "cailleachs_gaze" to "Cailleach's Gaze"
  const formatted = name
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Add apostrophes where needed
  return formatted
    .replace(/Brigids/g, "Brigid's")
    .replace(/Cailleachs/g, "Cailleach's");
}

export function GameBoard({ state, onPlayCard, onUnplayCard, onClaimCard, onResolutionChoice, onEndDiscussion }: Props) {
  const myId = state.currentPlayerId;
  const myHand = myId ? state.hands[myId] || [] : [];
  const hasPlayedCard = state.table.some(t => t.playerId === myId);
  
  // Get player's current role
  const myPlayer = state.players.find(p => p.id === myId);
  const myRole = myPlayer?.roleId ? state.roles[myPlayer.roleId] : undefined;
  
  // Filter for event log
  const [logFilter, setLogFilter] = React.useState<'current' | 'all'>('current');
  
  // Track timer expiration for flashing effects
  const [isTimeExpired, setIsTimeExpired] = React.useState(false);
  
  React.useEffect(() => {
    if (!state.expiresAt) {
      setIsTimeExpired(false);
      return;
    }
    
    const checkExpiration = () => {
      const now = Date.now();
      if (now > state.expiresAt!) {
        setIsTimeExpired(true);
      } else {
        setIsTimeExpired(false);
      }
    };
    
    checkExpiration();
    const interval = setInterval(checkExpiration, 500);
    return () => clearInterval(interval);
  }, [state.expiresAt]);
  
  // Shuffle table cards for display (but keep original order in state)
  const shuffledTable = React.useMemo(() => {
    const shuffled = [...state.table];
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [state.table.length, state.round]); // Re-shuffle when table changes or round changes
  
  // Check for pending action for this player
  const myPendingAction = myId && state.pendingActions 
    ? state.pendingActions.find(a => a.playerId === myId)
    : undefined;
  
  // Get cards this player knows about (private + public knowledge)
  const myKnowledge = myId && state.playerKnowledge
    ? state.playerKnowledge.filter(k => k.playerId === myId || k.isPublic)
    : [];
  
  // Aggregate knowledge by location and type
  const aggregateKnowledge = (knowledge: typeof myKnowledge) => {
    const counts: Record<'MILK' | 'BLOOD', number> = { MILK: 0, BLOOD: 0 };
    const seen = new Set<string>(); // Track unique cardIds to avoid double counting
    
    for (const k of knowledge) {
      if (!seen.has(k.cardId)) {
        counts[k.type]++;
        seen.add(k.cardId);
      }
    }
    
    return counts;
  };
  
  const deckKnowledge = myKnowledge.filter(k => k.location === 'deck');
  const discardKnowledge = myKnowledge.filter(k => k.location === 'discard');
  
  const deckCounts = aggregateKnowledge(deckKnowledge);
  const discardCounts = aggregateKnowledge(discardKnowledge);
  
  // Debug info
  console.log('GameBoard render:', { 
    myId, 
    handCount: myHand.length, 
    hands: Object.keys(state.hands),
    firstCard: myHand[0]
  });
  
  // End game screen
  if (state.phase === 'ENDED') {
    const allFinalCards = [...state.centerDeck.cards, ...state.centerDeck.revealed];
    const milkCount = allFinalCards.filter(c => c.type === 'MILK').length;
    const bloodCount = allFinalCards.filter(c => c.type === 'BLOOD').length;
    
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>Room {state.room.code}</div>
          <div>Game Over</div>
        </div>
        
        {/* Winner Banner */}
        <div className={`rounded-lg border-4 p-8 text-center ${
          state.winner === 'GOOD' 
            ? 'border-green-500 bg-green-900/30' 
            : state.winner === 'EVIL'
            ? 'border-red-500 bg-red-900/30'
            : 'border-yellow-500 bg-yellow-900/30'
        }`}>
          <h1 className={`mb-4 text-4xl font-bold ${
            state.winner === 'GOOD' 
              ? 'text-green-400' 
              : state.winner === 'EVIL'
              ? 'text-red-400'
              : 'text-yellow-400'
          }`}>
            {state.winner === 'GOOD' ? 'Good Wins!' : state.winner === 'EVIL' ? 'Evil Wins!' : "It's a Tie!"}
          </h1>
          <div className="text-xl text-slate-300">
            Final Count: {milkCount} Milk vs {bloodCount} Blood
          </div>
        </div>
        
        {/* Final Cards */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-200">Final Cards (Deck + Revealed)</h2>
          <div className="flex flex-wrap gap-2">
            {allFinalCards.map((card, i) => (
              <div key={i} className={`h-32 w-24 rounded-md border-2 overflow-hidden ${
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
        </div>
        
        {/* All Players and Roles */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-200">Players & Roles</h2>
          <div className="space-y-4">
            {state.players.map(player => {
              const role = player.roleId ? state.roles[player.roleId] : undefined;
              return (
                <div key={player.id} className="flex items-center gap-4 rounded-lg border border-slate-700 bg-slate-900 p-3">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-200">{player.name}</div>
                    {role && (
                      <div className={`text-sm font-medium ${
                        role.team === 'GOOD' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatRoleName(role.name)} ({role.team})
                      </div>
                    )}
                  </div>
                  {role?.image && (
                    <div className="h-24 w-20 rounded-md border-2 border-slate-600 overflow-hidden">
                      <img 
                        src={role.image} 
                        alt={role.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  
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
        <div className="flex items-center gap-4">
          <CountdownTimer expiresAt={state.expiresAt} phase={state.phase} />
          <div>Phase: {state.phase} | Round {state.round}</div>
          <HelpButton playerCount={state.players.length} />
        </div>
      </div>
      
      {/* Game Progress Indicator */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-slate-300">Game Progress</div>
          <div className={`text-sm font-bold ${
            state.centerDeck.cards.length <= 3 ? 'text-red-400 animate-pulse' :
            state.centerDeck.cards.length <= 7 ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {state.centerDeck.cards.length} / 16 cards remaining
          </div>
        </div>
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              state.centerDeck.cards.length <= 3 ? 'bg-red-500' :
              state.centerDeck.cards.length <= 7 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${(state.centerDeck.cards.length / 16) * 100}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-slate-400 text-center">
          {state.centerDeck.cards.length === 0 ? 'Game Over!' :
           state.centerDeck.cards.length <= 3 ? 'Final rounds approaching!' :
           state.centerDeck.cards.length <= 7 ? 'Approaching endgame...' :
           'Game in progress'}
        </div>
      </div>
      
      {/* Player's Current Role */}
      {myRole && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-200">Your Role</h2>
          <div className="flex items-center gap-4">
            {myRole.image && (
              <div className="h-32 w-24 rounded-md border-2 border-slate-600 overflow-hidden">
                <img 
                  src={myRole.image} 
                  alt={myRole.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div>
              <div className="text-xl font-semibold text-slate-200">{formatRoleName(myRole.name)}</div>
              <div className={`text-sm font-medium ${
                myRole.team === 'GOOD' ? 'text-green-400' : 'text-red-400'
              }`}>
                Team: {myRole.team}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Event Log */}
      {state.resolutionLog && state.resolutionLog.length > 0 && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200">Event Log</h2>
            <select 
              value={logFilter} 
              onChange={(e) => setLogFilter(e.target.value as 'current' | 'all')}
              className="rounded-md border border-slate-600 bg-slate-700 px-3 py-1 text-sm text-slate-200"
            >
              <option value="current">Current Round</option>
              <option value="all">All Rounds</option>
            </select>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {state.resolutionLog
              .filter(entry => logFilter === 'all' || entry.round === state.round)
              .map((entry, i) => (
              <div key={i} className="text-sm">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Round {entry.round}</span>
                  <div className={`flex-1 ${
                    entry.type === 'primary' ? 'text-blue-400 font-semibold' :
                    entry.type === 'secondary' ? 'text-purple-400 font-semibold' :
                    'text-slate-300'
                  }`}>
                    {entry.message}
                  </div>
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
          <h2 className="mb-2 text-sm text-slate-400">Game Decks</h2>
          <div className="flex flex-wrap gap-4 items-start">
            {/* Blood/Milk Center Deck */}
            <div className="flex flex-col items-center gap-1 relative group">
              <div className="h-40 w-28 rounded-md border-2 border-purple-600 bg-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{state.centerDeck.cards.length}</div>
                  <div className="text-xs text-slate-400">Cards</div>
                </div>
              </div>
              <div className="text-xs text-slate-400">Blood/Milk</div>
              
              {/* Center Deck Initial Info Tooltip */}
              <div className="absolute bottom-full left-0 md:left-1/2 mb-2 hidden group-hover:block z-10 w-48 max-w-[90vw] md:-translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl">
                <div className="mb-1 text-xs font-semibold text-slate-300">Initial deck composition:</div>
                <div className="space-y-1">
                  <div className="text-xs text-green-400">8 MILK cards</div>
                  <div className="text-xs text-red-400">8 BLOOD cards</div>
                </div>
                {(deckCounts.MILK > 0 || deckCounts.BLOOD > 0) && (
                  <>
                    <div className="my-2 border-t border-slate-700"></div>
                    <div className="mb-1 text-xs font-semibold text-slate-300">You know in deck:</div>
                    <div className="space-y-1">
                      {deckCounts.MILK > 0 && (
                        <div className="text-xs text-green-400">MILK ({deckCounts.MILK})</div>
                      )}
                      {deckCounts.BLOOD > 0 && (
                        <div className="text-xs text-red-400">BLOOD ({deckCounts.BLOOD})</div>
                      )}
                    </div>
                  </>
                )}
                <div className="absolute left-8 md:left-1/2 top-full h-0 w-0 md:-translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
              </div>
            </div>
            
            {/* Hero Deck */}
            <div className="flex flex-col items-center gap-1 relative group">
              <div className="h-40 w-28 rounded-md border-2 border-yellow-600 bg-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{state.heroDeck.length}</div>
                  <div className="text-xs text-slate-400">Roles</div>
                </div>
              </div>
              <div className="text-xs text-slate-400">Heroes</div>
              
              {/* Hero Deck Tooltip */}
              <div className="absolute bottom-full left-0 md:left-1/2 mb-2 hidden group-hover:block z-10 w-56 max-w-[90vw] md:-translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl max-h-64 overflow-y-auto">
                <div className="mb-2">
                  <div className="text-xs font-semibold text-green-400 mb-1">Good Heroes:</div>
                  <div className="space-y-0.5">
                    {Object.values(state.roles).filter(r => r.team === 'GOOD').concat(state.heroDeck.filter(r => r.team === 'GOOD')).filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i).map(role => (
                      <div key={role.id} className="text-xs text-slate-300">• {formatRoleName(role.name)}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-red-400 mb-1">Evil Heroes:</div>
                  <div className="space-y-0.5">
                    {Object.values(state.roles).filter(r => r.team === 'EVIL').concat(state.heroDeck.filter(r => r.team === 'EVIL')).filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i).map(role => (
                      <div key={role.id} className="text-xs text-slate-300">• {formatRoleName(role.name)}</div>
                    ))}
                  </div>
                </div>
                <div className="absolute left-8 md:left-1/2 top-full h-0 w-0 md:-translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
              </div>
            </div>
            
            {/* Ingredient Deck */}
            <div className="flex flex-col items-center gap-1 relative group">
              <div className="h-40 w-28 rounded-md border-2 border-green-600 bg-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{state.deck.drawPile.length + state.deck.discardPile.length}</div>
                  <div className="text-xs text-slate-400">Cards</div>
                </div>
              </div>
              <div className="text-xs text-slate-400">Ingredients</div>
              
              {/* Ingredient Deck Tooltip */}
              <div className="absolute bottom-full left-0 md:left-1/2 mb-2 hidden group-hover:block z-10 w-56 max-w-[90vw] md:-translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl max-h-64 overflow-y-auto">
                <div className="mb-1 text-xs font-semibold text-slate-300">Initial deck (10 of each):</div>
                <div className="space-y-0.5">
                  {Array.from(new Set([...state.deck.drawPile, ...state.deck.discardPile].map(c => c.name))).sort().map(name => (
                    <div key={name} className="text-xs text-slate-300">• {formatIngredientName(name)}</div>
                  ))}
                </div>
                <div className="absolute left-8 md:left-1/2 top-full h-0 w-0 md:-translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
              </div>
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
                {(discardCounts.MILK > 0 || discardCounts.BLOOD > 0) && (
                  <div className="absolute bottom-full left-0 md:left-1/2 mb-2 hidden group-hover:block z-10 w-48 max-w-[90vw] md:-translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl">
                    <div className="mb-1 text-xs font-semibold text-slate-300">Cards you know were discarded:</div>
                    <div className="space-y-1">
                      {discardCounts.MILK > 0 && (
                        <div className="text-xs text-green-400">
                          MILK ({discardCounts.MILK})
                        </div>
                      )}
                      {discardCounts.BLOOD > 0 && (
                        <div className="text-xs text-red-400">
                          BLOOD ({discardCounts.BLOOD})
                        </div>
                      )}
                    </div>
                    <div className="absolute left-8 md:left-1/2 top-full h-0 w-0 md:-translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="col-span-2 md:col-span-3">
          <h2 className="mb-2 text-sm text-slate-400">Table</h2>
          <div className="flex flex-wrap gap-2">
            {shuffledTable.map((t, i) => {
              const cardId = t.cardId;
              const claimedBy = cardId && state.cardClaims?.[cardId];
              const claimerName = claimedBy ? state.players.find(p => p.id === claimedBy)?.name : undefined;
              const isClickable = state.phase === 'DAY' && cardId;
              
              return (
                <div key={i} className="relative group">
                  <CardImage 
                    src={t.image} 
                    cardName={t.cardName} 
                    playerCount={state.players.length}
                    onClick={isClickable ? () => onClaimCard(cardId) : undefined}
                    className={`${
                      isClickable ? 'cursor-pointer hover:scale-105 transition-transform' : ''
                    } ${
                      claimedBy ? 'ring-4 ring-blue-500' : ''
                    }`}
                  />
                  {claimerName && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-blue-600 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Claimed by {claimerName}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="col-span-2 md:col-span-3">
          <h2 className="mb-2 text-sm text-slate-400">Your Hand</h2>
          
          {/* Player Status during Night Phase */}
          {state.phase === 'NIGHT' && (
            <div className="mb-3 rounded-lg border border-slate-700 bg-slate-800 p-3">
              <div className="mb-2 text-xs font-semibold text-slate-400">Player Status:</div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {state.players.map(player => {
                  const hasPlayed = state.table.some(t => t.playerId === player.id);
                  return (
                    <div key={player.id} className={`text-sm ${hasPlayed ? 'text-green-400' : 'text-slate-500'}`}>
                      {hasPlayed ? '✓' : '⏳'} {player.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {hasPlayedCard && state.phase === 'NIGHT' && (
            <div className="mb-2 flex items-center gap-3">
              <div className="text-sm text-green-400">✓ Card played - waiting for other players...</div>
              <button
                onClick={onUnplayCard}
                className="rounded-md border border-slate-600 bg-slate-700 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-600 transition-colors"
              >
                Take Back
              </button>
            </div>
          )}
          
          {/* End Discussion Button */}
          {state.phase === 'DAY' && (
            <div className="mb-3">
              {myPlayer?.endedDiscussion ? (
                <div className="text-sm text-green-400">✓ Ready to end discussion - waiting for others...</div>
              ) : (
                <button
                  onClick={onEndDiscussion}
                  className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${
                    isTimeExpired && state.phase === 'DAY'
                      ? 'bg-blue-600 hover:bg-blue-700 animate-pulse ring-2 ring-yellow-500'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  End Discussion
                </button>
              )}
              <div className="mt-1 text-xs text-slate-400">
                {state.players.filter(p => p.endedDiscussion).length} / {state.players.length} players ready
              </div>
            </div>
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
                  playerCount={state.players.length}
                  onClick={() => !hasPlayedCard && state.phase === 'NIGHT' && onPlayCard(c.id)}
                  className={`${
                    hasPlayedCard || state.phase !== 'NIGHT' 
                      ? 'opacity-50 cursor-not-allowed' 
                      : isTimeExpired && !hasPlayedCard && state.phase === 'NIGHT'
                      ? 'cursor-pointer hover:scale-105 transition-transform animate-pulse ring-2 ring-yellow-500'
                      : 'cursor-pointer hover:scale-105 transition-transform'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
