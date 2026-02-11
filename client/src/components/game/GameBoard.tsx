import type { ShapedState } from '@irish-potions/shared';
import { CardImage } from './CardImage';
import { ResolutionModal } from './ResolutionModal';
import { CharacterBioModal } from './CharacterBioModal';
import { HelpButton } from './HelpButton';
import { CountdownTimer } from './CountdownTimer';
import { useMobile } from '../../hooks/useMobile';
import React, { useState, useEffect } from 'react';

type Props = {
  state: ShapedState;
  onPlayCard: (cardId: string) => void;
  onUnplayCard: () => void;
  onClaimCard: (cardId: string) => void;
  onResolutionChoice: (choice: 'keep' | 'discard' | 'confirm') => void;
  onYewTarget: (targetPlayerId: string) => void;
  onEndDiscussion: () => void;
  onSendRune: (toPlayerId: string, message: string) => void;
  onAcknowledgeBio: () => void;
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

export function GameBoard({ state, onPlayCard, onUnplayCard, onClaimCard, onResolutionChoice, onYewTarget, onEndDiscussion, onSendRune, onAcknowledgeBio }: Props) {
  const isMobile = useMobile();
  const myId = state.currentPlayerId;
  const myHand = myId ? state.hands[myId] || [] : [];
  const hasPlayedCard = state.table.some(t => t.playerId === myId);
  
  // Rune communication state
  const [showRuneSelector, setShowRuneSelector] = useState(false);
  const [showReceivedRunes, setShowReceivedRunes] = useState(false);
  const [selectedRuneTarget, setSelectedRuneTarget] = useState<string | null>(null);
  const [currentRuneIndex, setCurrentRuneIndex] = useState(0);
  
  const myReceivedRunes = state.runes.filter(r => r.toPlayerId === myId && r.round === state.round);
  const hasSentRune = myId ? state.runesSentThisRound[myId] : false;
  const canSendRune = state.phase === 'DAY' && !hasSentRune;
  
  // Expanded deck modal
  const [expandedDeck, setExpandedDeck] = React.useState<'center' | 'discard' | null>(null);
  
  // Drag and drop state
  const [draggedCardId, setDraggedCardId] = React.useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  
  // Get player's current role
  const myPlayer = state.players.find(p => p.id === myId);
  const myRole = myPlayer?.roleId ? state.roles[myPlayer.roleId] : undefined;
  
  // Character bio modal state - show at start of first NIGHT phase
  const [hasSeenBio, setHasSeenBio] = React.useState(false);
  const [showBioModal, setShowBioModal] = React.useState(false);
  
  React.useEffect(() => {
    // Show bio modal when entering NIGHT phase for the first time (round 1)
    if (state.phase === 'NIGHT' && state.round === 1 && !hasSeenBio && myRole) {
      setShowBioModal(true);
      setHasSeenBio(true);
    }
  }, [state.phase, state.round, hasSeenBio, myRole]);
  
  // Filter for event log
  const [logFilter, setLogFilter] = React.useState<'current' | 'all'>('current');
  
  // Track timer expiration for flashing effects
  const [isTimeExpired, setIsTimeExpired] = React.useState(false);
  const [isTimeLow, setIsTimeLow] = React.useState(false); // Track when 10 seconds or less remain
  
  React.useEffect(() => {
    if (!state.expiresAt) {
      setIsTimeExpired(false);
      setIsTimeLow(false);
      return;
    }
    
    const checkExpiration = () => {
      const now = Date.now();
      const timeRemaining = state.expiresAt! - now;
      
      if (now > state.expiresAt!) {
        setIsTimeExpired(true);
        setIsTimeLow(false);
      } else if (timeRemaining <= 10000) { // 10 seconds or less
        setIsTimeExpired(false);
        setIsTimeLow(true);
      } else {
        setIsTimeExpired(false);
        setIsTimeLow(false);
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
    
    const [revealedCount, setRevealedCount] = useState(0);
    const [showWinner, setShowWinner] = useState(false);
    
    useEffect(() => {
      // Reveal cards one by one
      if (revealedCount < allFinalCards.length) {
        const timer = setTimeout(() => {
          setRevealedCount(prev => prev + 1);
        }, 600); // Reveal one card every 600ms
        return () => clearTimeout(timer);
      } else if (!showWinner) {
        // After all cards revealed, wait 1 second then show winner
        const timer = setTimeout(() => setShowWinner(true), 1000);
        return () => clearTimeout(timer);
      }
    }, [revealedCount, allFinalCards.length, showWinner]);
    
    const revealedCards = allFinalCards.slice(0, revealedCount);
    const currentMilk = revealedCards.filter(c => c.type === 'MILK').length;
    const currentBlood = revealedCards.filter(c => c.type === 'BLOOD').length;
    
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>Room {state.room.code}</div>
          <div>Game Over</div>
        </div>
        
        {/* Running Score Display */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 text-center">
          <div className="mb-4 text-2xl font-bold text-slate-200">
            Final Cards Reveal
          </div>
          <div className="flex items-center justify-center gap-8 text-3xl font-bold">
            <div className="text-green-400">
              <div className="text-sm text-slate-400 mb-1">Milk</div>
              <div className="text-5xl">{currentMilk}</div>
            </div>
            <div className="text-slate-500 text-4xl">vs</div>
            <div className="text-red-400">
              <div className="text-sm text-slate-400 mb-1">Blood</div>
              <div className="text-5xl">{currentBlood}</div>
            </div>
          </div>
          {revealedCount < allFinalCards.length && (
            <div className="mt-4 text-slate-400 animate-pulse">
              Revealing cards... {revealedCount} / {allFinalCards.length}
            </div>
          )}
        </div>
        
        {/* Winner Banner - only show after all cards revealed */}
        {showWinner && (
          <div className={`rounded-lg border-4 p-8 text-center animate-[pulse_1s_ease-in-out_3] ${
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
              {state.winner === 'GOOD' ? '🎉 Good Wins! 🎉' : state.winner === 'EVIL' ? '💀 Evil Wins! 💀' : "⚖️ It's a Tie! ⚖️"}
            </h1>
            <div className="text-xl text-slate-300">
              Final Count: {milkCount} Milk vs {bloodCount} Blood
            </div>
          </div>
        )}
        
        {/* Cards Grid */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-200">Final Cards</h2>
          <div className="flex flex-wrap gap-2">
            {allFinalCards.map((card, i) => (
              <div 
                key={i} 
                className={`h-32 w-24 rounded-md border-2 overflow-hidden transition-all duration-500 ${
                  i < revealedCount 
                    ? card.type === 'MILK' 
                      ? 'border-green-500 opacity-100' 
                      : 'border-red-500 opacity-100'
                    : 'border-slate-600 opacity-30 scale-95'
                } ${i === revealedCount - 1 ? 'ring-4 ring-yellow-400 scale-110' : ''}`}
                style={{ 
                  transform: i < revealedCount ? 'rotateY(0deg)' : 'rotateY(180deg)',
                  transition: 'all 0.6s ease-in-out'
                }}
              >
                {i < revealedCount ? (
                  <img 
                    src={`/assets/center_deck/${card.type.toLowerCase()}.png`} 
                    alt={card.type}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-slate-700 flex items-center justify-center text-slate-500">
                    ?
                  </div>
                )}
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
      {/* Character Bio Modal - shown at game start */}
      {showBioModal && myRole && (
        <CharacterBioModal 
          role={myRole}
          onContinue={() => {
            setShowBioModal(false);
            onAcknowledgeBio();
          }}
        />
      )}
      
      {/* Resolution Modal */}
      <ResolutionModal 
        state={state} 
        myPendingAction={myPendingAction}
        onChoice={onResolutionChoice}
        onYewTarget={onYewTarget}
      />
      
      <div className="flex items-center justify-between">
        <div>Room {state.room.code}</div>
        <div className="flex items-center gap-4">
          {state.round === 1 && state.phase === 'NIGHT' && !state.expiresAt ? (
            <div className="text-sm text-yellow-400 animate-pulse flex items-center gap-2">
              <span>⏳</span>
              <span>Waiting for {state.players.filter(p => !(p as any).acknowledgedBio).length} player(s) to read character bio...</span>
            </div>
          ) : (
            <CountdownTimer expiresAt={state.expiresAt} phase={state.phase} />
          )}
          <div>Phase: {state.phase} | Round {state.round}</div>
          <HelpButton playerCount={state.players.length} />
        </div>
      </div>
      
      {/* Game Progress Indicator with Deck Info */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-3 relative group cursor-help">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-slate-300">
            Game Progress <span className="text-xs text-slate-500">({isMobile ? 'tap' : 'hover'} for decks)</span>
          </div>
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
        
        {/* Deck Details Tooltip with Visual Cards */}
        <div className="absolute top-full left-0 right-0 mt-2 hidden group-hover:block z-20 rounded-lg border border-slate-700 bg-slate-900 shadow-2xl">
          <div className="p-4">
            <div className="text-sm font-semibold text-slate-300 mb-3">Game Decks</div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {/* Blood/Milk Center Deck */}
              <div className="flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedDeck('center');
                  }}
                  className="flex flex-col items-center gap-1 group/deck cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="h-32 w-24 rounded-md border-2 border-purple-600 bg-slate-800 flex items-center justify-center relative">
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-400">{state.centerDeck.cards.length}</div>
                      <div className="text-xs text-slate-400">Cards</div>
                    </div>
                    {(deckCounts.MILK > 0 || deckCounts.BLOOD > 0) && (
                      <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-400 animate-pulse" title="You have knowledge"></div>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">Blood/Milk</div>
                  <div className="text-xs text-slate-500 opacity-0 group-hover/deck:opacity-100 transition-opacity">Click for details</div>
                </button>
              </div>
              
              {/* Ingredient Deck */}
              <div className="flex-shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-32 w-24 rounded-md border-2 border-green-600 bg-slate-800 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">{state.deck.drawPile.length + state.deck.discardPile.length}</div>
                      <div className="text-xs text-slate-400">Cards</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">Ingredients</div>
                </div>
              </div>
              
              {/* Revealed Cards */}
              {state.centerDeck.revealed.map((card, i) => (
                <div key={i} className="flex-shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`h-32 w-24 rounded-md border-2 overflow-hidden ${
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
                </div>
              ))}
              
              {/* Discard Pile */}
              {state.centerDeck.discarded.length > 0 && (
                <div className="flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedDeck('discard');
                    }}
                    className="flex flex-col items-center gap-1 group/deck cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className="h-32 w-24 rounded-md border-2 border-slate-600 bg-slate-800 flex items-center justify-center relative">
                      <div className="text-center">
                        <div className="text-xl font-bold text-slate-400">{state.centerDeck.discarded.length}</div>
                        <div className="text-xs text-slate-500">Discarded</div>
                      </div>
                      {(discardCounts.MILK > 0 || discardCounts.BLOOD > 0) && (
                        <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-400 animate-pulse" title="You have knowledge"></div>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">Discard</div>
                    <div className="text-xs text-slate-500 opacity-0 group-hover/deck:opacity-100 transition-opacity">Click for details</div>
                  </button>
                </div>
              )}
            </div>
            {state.centerDeck.revealed.length + (state.centerDeck.discarded.length > 0 ? 1 : 0) > 0 && (
              <div className="text-xs text-slate-500 text-center mt-2">← Scroll to see all decks →</div>
            )}
          </div>
          <div className="absolute left-8 bottom-full h-0 w-0 border-8 border-transparent border-b-slate-900"></div>
        </div>
      </div>
      
      {/* Player's Current Role */}
      {myRole && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 relative group">
          <h2 className="mb-3 text-lg font-semibold text-slate-200">
            Your Role <span className="text-xs text-slate-500 font-normal">({isMobile ? 'tap' : 'hover'} for hero pool)</span>
          </h2>
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
          
          {/* Hero Pool Tooltip */}
          <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-20 w-72 max-w-[90vw] rounded-lg border border-slate-700 bg-slate-900 p-4 shadow-xl max-h-80 overflow-y-auto">
            <div className="mb-3 text-sm font-semibold text-slate-300">
              Hero Pool ({state.heroDeck.length} remaining in deck)
            </div>
            <div className="mb-3">
              <div className="text-xs font-semibold text-green-400 mb-1">Good Heroes:</div>
              <div className="space-y-0.5 pl-2">
                {Object.values(state.roles).filter(r => r.team === 'GOOD').concat(state.heroDeck.filter(r => r.team === 'GOOD')).filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i).map(role => (
                  <div key={role.id} className="text-xs text-slate-300">• {formatRoleName(role.name)}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-red-400 mb-1">Evil Heroes:</div>
              <div className="space-y-0.5 pl-2">
                {Object.values(state.roles).filter(r => r.team === 'EVIL').concat(state.heroDeck.filter(r => r.team === 'EVIL')).filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i).map(role => (
                  <div key={role.id} className="text-xs text-slate-300">• {formatRoleName(role.name)}</div>
                ))}
              </div>
            </div>
            <div className="absolute left-8 bottom-full h-0 w-0 border-8 border-transparent border-b-slate-900"></div>
          </div>
        </div>
      )}
      
      {/* Runic Communication - only during day phase */}
      {state.phase === 'DAY' && (
        <div className="rounded-lg border border-purple-700/50 bg-purple-900/10 p-4">
          <h2 className="mb-3 text-lg font-semibold text-purple-300">Runic Communication</h2>
          
          {canSendRune ? (
            showRuneSelector ? (
              /* Rune Message Builder */
              <div className="space-y-3">
                <div className="text-sm text-slate-300">Select a player to send a rune to:</div>
                <div className="flex flex-wrap gap-2">
                  {state.players
                    .filter(p => p.id !== myId)
                    .map(player => (
                      <button
                        key={player.id}
                        onClick={() => {
                          setSelectedRuneTarget(player.id);
                          setCurrentRuneIndex(0); // Reset to first message when changing target
                        }}
                        className={`px-3 py-2 rounded-md text-sm transition-all ${ 
                          selectedRuneTarget === player.id
                            ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {player.name}
                      </button>
                    ))
                  }
                </div>
                
                {selectedRuneTarget && (() => {
                  const runeMessages = [
                    { value: 'play_brigid', label: "Play Brigid's Blessing" },
                    { value: 'play_cailleach', label: "Play Cailleach's Gaze" },
                    { value: 'play_ceol', label: "Play Ceol" },
                    { value: 'play_faerie', label: "Play Faerie Thistle" },
                    { value: 'play_wolfbane', label: "Play Wolfbane Root" },
                    { value: 'play_yew', label: "Play Yew" },
                    { value: 'dont_play_brigid', label: "Don't play Brigid's Blessing" },
                    { value: 'dont_play_cailleach', label: "Don't play Cailleach's Gaze" },
                    { value: 'dont_play_ceol', label: "Don't play Ceol" },
                    { value: 'dont_play_faerie', label: "Don't play Faerie Thistle" },
                    { value: 'dont_play_wolfbane', label: "Don't play Wolfbane Root" },
                    { value: 'dont_play_yew', label: "Don't play Yew" },
                    { value: 'trust_me', label: "Trust me" },
                    { value: 'dont_trust_me', label: "Don't trust me" },
                    { value: 'follow_lead', label: "Follow my lead" },
                  ];
                  const currentMessage = runeMessages[currentRuneIndex];
                  
                  return (
                    <>
                      <div className="mt-3 space-y-2">
                        <div className="text-sm text-slate-300">Choose your message:</div>
                        {/* Message carousel */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setCurrentRuneIndex((prev) => 
                              prev === 0 ? runeMessages.length - 1 : prev - 1
                            )}
                            className="px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                            title="Previous message"
                          >
                            ←
                          </button>
                          
                          <div className="flex-1 px-4 py-3 rounded-md bg-slate-700 text-slate-200 text-center">
                            <div className="font-medium">{currentMessage.label}</div>
                            <div className="text-xs text-slate-400 mt-1">
                              {currentRuneIndex + 1} / {runeMessages.length}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setCurrentRuneIndex((prev) => 
                              (prev + 1) % runeMessages.length
                            )}
                            className="px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                            title="Next message"
                          >
                            →
                          </button>
                        </div>
                        
                        {/* Send and Cancel buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onSendRune(selectedRuneTarget, currentMessage.value);
                              setShowRuneSelector(false);
                              setSelectedRuneTarget(null);
                              setCurrentRuneIndex(0);
                            }}
                            className="flex-1 px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
                          >
                            Send Rune
                          </button>
                          <button
                            onClick={() => {
                              setShowRuneSelector(false);
                              setSelectedRuneTarget(null);
                              setCurrentRuneIndex(0);
                            }}
                            className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <button
                onClick={() => setShowRuneSelector(true)}
                className="w-full px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
              >
                Send a Rune
              </button>
            )
          ) : (
            <div className="text-sm text-purple-300/70">
              ✓ Rune sent this round
            </div>
          )}
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
      
      {/* Your Hand Section */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
        <h2 className="mb-2 text-sm text-slate-400">Your Hand</h2>
        
        {/* Player Status during Night Phase */}
        {state.phase === 'NIGHT' && (
          <div className="mb-3 rounded-lg border border-slate-700 bg-slate-900 p-3">
            <div className="mb-2 text-xs font-semibold text-slate-400">Player Status:</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {state.players.map(player => {
                const hasPlayed = state.table.some(t => t.playerId === player.id);
                const isPoisoned = player.poisoned;
                return (
                  <div key={player.id} className={`text-sm flex items-center gap-1 ${
                    isPoisoned ? 'text-purple-400 line-through' : 
                    hasPlayed ? 'text-green-400' : 'text-slate-500'
                  }`}>
                    {isPoisoned ? '☠️' : hasPlayed ? '✓' : '⏳'} {player.name}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Poison Warning */}
        {myPlayer?.poisoned && state.phase === 'NIGHT' && (
          <div className="mb-3 rounded-lg bg-purple-900/30 border-2 border-purple-500 p-3 animate-pulse">
            <div className="flex items-center gap-2 text-purple-300">
              <span className="text-xl">☠️</span>
              <div>
                <div className="font-semibold">You are poisoned!</div>
                <div className="text-xs">You cannot play a card this round.</div>
              </div>
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
            
            {/* Voting Progress Bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>
                  {state.players.filter(p => p.endedDiscussion).length} / {state.players.length} players ready
                </span>
                <span className="text-slate-500">
                  {Math.ceil(state.players.length * 0.66)} needed (66%)
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    state.players.filter(p => p.endedDiscussion).length >= Math.ceil(state.players.length * 0.66)
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ 
                    width: `${(state.players.filter(p => p.endedDiscussion).length / state.players.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        {myHand.length === 0 ? (
          <div className="text-sm text-slate-400">No cards in hand (Player ID: {myId || 'unknown'})</div>
        ) : (
          <div className="flex gap-2">
            {myHand.map((c) => {
              const canPlay = !hasPlayedCard && state.phase === 'NIGHT';
              const shouldFlash = canPlay && isTimeLow && state.phase === 'NIGHT';
              return (
                <div
                  key={c.id}
                  draggable={canPlay}
                  onDragStart={(e) => {
                    if (canPlay) {
                      setDraggedCardId(c.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }
                  }}
                  onDragEnd={() => setDraggedCardId(null)}
                >
                  <CardImage 
                    src={(c as any).image}
                    cardName={c.kind === 'INGREDIENT' ? c.name : c.type}
                    playerCount={state.players.length}
                    onClick={() => canPlay && onPlayCard(c.id)}
                    className={`${
                      !canPlay
                        ? 'opacity-50 cursor-not-allowed' 
                        : shouldFlash
                        ? 'cursor-pointer hover:scale-105 transition-transform animate-pulse ring-2 ring-orange-500 shadow-lg shadow-orange-500/50'
                        : isTimeExpired && !hasPlayedCard && state.phase === 'NIGHT'
                        ? 'cursor-pointer hover:scale-105 transition-transform animate-pulse ring-2 ring-yellow-500'
                        : 'cursor-grab active:cursor-grabbing hover:scale-105 transition-transform'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
        <div className="col-span-2 md:col-span-3">
          <h2 className="mb-2 text-sm text-slate-400">The Cauldron</h2>
          
          {/* Cauldron Container */}
          <div className="relative mx-auto max-w-4xl">
            {/* Cauldron Shape with CSS */}
            <div 
              className={`relative rounded-b-full border-4 bg-gradient-to-b from-slate-900 via-slate-800 to-amber-950 p-8 pt-12 shadow-2xl transition-all ${
                isDraggingOver 
                  ? 'border-yellow-400 shadow-yellow-400/50' 
                  : 'border-amber-800'
              }`}
              onDragOver={(e) => {
                if (draggedCardId && !hasPlayedCard && state.phase === 'NIGHT') {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                if (draggedCardId && !hasPlayedCard && state.phase === 'NIGHT') {
                  onPlayCard(draggedCardId);
                  setDraggedCardId(null);
                }
              }}
            >
              {/* Cauldron Rim */}
              <div className="absolute -top-4 left-0 right-0 h-8 rounded-t-lg border-4 border-amber-800 bg-gradient-to-b from-amber-900 to-amber-950 shadow-lg"></div>
              
              {/* Bubbling Effect Overlay */}
              <div className="absolute inset-0 overflow-hidden rounded-b-full opacity-30">
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 via-purple-900/30 to-transparent animate-pulse"></div>
              </div>
              
              {/* Drop Zone Indicator */}
              {isDraggingOver && (
                <div className="absolute inset-0 rounded-b-full bg-yellow-400/20 border-4 border-dashed border-yellow-400 animate-pulse pointer-events-none z-10 flex items-center justify-center">
                  <div className="text-2xl font-bold text-yellow-400 drop-shadow-lg">Drop to Add Ingredient</div>
                </div>
              )}
              
              {/* Cards arranged in circular pattern inside cauldron */}
              <div className="relative flex flex-wrap justify-center gap-3 min-h-[200px]">
                {shuffledTable.length === 0 ? (
                  <div className="flex items-center justify-center text-slate-500 italic text-sm py-8">
                    The cauldron awaits ingredients...
                  </div>
                ) : (
                  shuffledTable.map((t, i) => {
                    const cardId = t.cardId;
                    // Get all players who claimed this card
                    const claimerIds = cardId && state.cardClaims?.[cardId] ? state.cardClaims[cardId] : [];
                    const claimers = claimerIds
                      .map((pid: string) => state.players.find(p => p.id === pid)?.name)
                      .filter(Boolean);
                    const isClaimedByMe = cardId && claimerIds.includes(myId || '');
                    const isClickable = state.phase === 'DAY' && cardId;
                    
                    // Slight rotation for organic feel
                    const rotation = (i % 5 - 2) * 5; // Rotates between -10 to 10 degrees
                    
                    return (
                      <div 
                        key={i} 
                        className="relative group"
                        style={{ transform: `rotate(${rotation}deg)` }}
                      >
                        <CardImage 
                          src={t.image} 
                          cardName={t.cardName} 
                          playerCount={state.players.length}
                          onClick={isClickable ? () => onClaimCard(cardId) : undefined}
                          className={`${
                            isClickable ? 'cursor-pointer hover:scale-110 transition-transform' : ''
                          } ${
                            isClaimedByMe ? 'ring-4 ring-blue-500 shadow-lg shadow-blue-500/50' : 
                            claimers.length > 0 ? 'ring-4 ring-purple-500 shadow-lg shadow-purple-500/50' : 
                            'shadow-xl'
                          }`}
                        />
                        {claimers.length > 0 && (
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-blue-600 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Claimed by: {claimers.join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Ingredient Count Badge */}
              {shuffledTable.length > 0 && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-800 border-2 border-amber-600 px-4 py-1 shadow-lg">
                  <div className="text-xs font-semibold text-amber-200">
                    {shuffledTable.length} {shuffledTable.length === 1 ? 'Ingredient' : 'Ingredients'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Expanded Deck Modal */}
      {expandedDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setExpandedDeck(null)}>
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-200">
                {expandedDeck === 'center' ? 'Blood/Milk Deck' : 'Discard Pile'}
              </h2>
              <button
                onClick={() => setExpandedDeck(null)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {expandedDeck === 'center' && (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-slate-300 mb-2">Current Status</div>
                  <div className="text-lg text-purple-400 font-bold">{state.centerDeck.cards.length} cards hidden</div>
                  <div className="text-sm text-slate-400 mt-1">{state.centerDeck.revealed.length} cards revealed</div>
                </div>
                
                <div className="border-t border-slate-700 pt-4">
                  <div className="text-sm font-semibold text-slate-300 mb-2">Initial Composition</div>
                  <div className="space-y-1 text-sm">
                    <div className="text-green-400">• 8 MILK cards</div>
                    <div className="text-red-400">• 8 BLOOD cards</div>
                  </div>
                </div>
                
                {(deckCounts.MILK > 0 || deckCounts.BLOOD > 0) && (
                  <div className="border-t border-slate-700 pt-4">
                    <div className="text-sm font-semibold text-blue-400 mb-2">Your Knowledge</div>
                    <div className="text-sm text-slate-300 mb-2">You know these cards are in the deck:</div>
                    <div className="space-y-1 text-sm">
                      {deckCounts.MILK > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="text-green-400 font-bold">MILK</div>
                          <div className="text-slate-400">× {deckCounts.MILK}</div>
                        </div>
                      )}
                      {deckCounts.BLOOD > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="text-red-400 font-bold">BLOOD</div>
                          <div className="text-slate-400">× {deckCounts.BLOOD}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {expandedDeck === 'discard' && (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-slate-300 mb-2">Discarded Cards</div>
                  <div className="text-lg text-slate-400 font-bold">{state.centerDeck.discarded.length} cards permanently removed</div>
                </div>
                
                {(discardCounts.MILK > 0 || discardCounts.BLOOD > 0) && (
                  <div className="border-t border-slate-700 pt-4">
                    <div className="text-sm font-semibold text-blue-400 mb-2">Your Knowledge</div>
                    <div className="text-sm text-slate-300 mb-2">You know these cards were discarded:</div>
                    <div className="space-y-1 text-sm">
                      {discardCounts.MILK > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="text-green-400 font-bold">MILK</div>
                          <div className="text-slate-400">× {discardCounts.MILK}</div>
                        </div>
                      )}
                      {discardCounts.BLOOD > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="text-red-400 font-bold">BLOOD</div>
                          <div className="text-slate-400">× {discardCounts.BLOOD}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Received Runes Notification Icon - Bottom Right */}
      {myReceivedRunes.length > 0 && state.phase === 'DAY' && (
        <>
          <button
            onClick={() => setShowReceivedRunes(!showReceivedRunes)}
            className="fixed bottom-6 right-6 z-40 h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-500/50 animate-pulse hover:scale-110 transition-transform flex items-center justify-center text-3xl"
            aria-label="View received runes"
          >
            ✉️
            {myReceivedRunes.length > 1 && (
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                {myReceivedRunes.length}
              </div>
            )}
          </button>
          
          {showReceivedRunes && (
            <div className="fixed bottom-24 right-6 z-40 w-80 max-w-[90vw] rounded-lg border-2 border-purple-500 bg-slate-900 p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-purple-300">Received Runes</h3>
                <button
                  onClick={() => setShowReceivedRunes(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {myReceivedRunes.map((rune, i) => {
                  const sender = state.players.find(p => p.id === rune.fromPlayerId);
                  const messageLabels: Record<string, string> = {
                    play_brigid: "Play Brigid's Blessing",
                    play_cailleach: "Play Cailleach's Gaze",
                    play_ceol: "Play Ceol",
                    play_faerie: "Play Faerie Thistle",
                    play_wolfbane: "Play Wolfbane Root",
                    play_yew: "Play Yew",
                    dont_play_brigid: "Don't play Brigid's Blessing",
                    dont_play_cailleach: "Don't play Cailleach's Gaze",
                    dont_play_ceol: "Don't play Ceol",
                    dont_play_faerie: "Don't play Faerie Thistle",
                    dont_play_wolfbane: "Don't play Wolfbane Root",
                    dont_play_yew: "Don't play Yew",
                    trust_me: "Trust me",
                    dont_trust_me: "Don't trust me",
                    follow_lead: "Follow my lead",
                  };
                  
                  return (
                    <div key={i} className="rounded-md border border-purple-700 bg-purple-900/20 p-3">
                      <div className="mb-1 text-xs text-purple-400 font-semibold">
                        From: {sender?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-slate-200">
                        "{messageLabels[rune.message] || rune.message}"
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
