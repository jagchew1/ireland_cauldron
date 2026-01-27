# Bug Fix: Premature Night Phase End

## Problem Statement

**Symptoms:**
1. Night phase ends before all players have selected their cards
2. Cards that have been played do not get revealed
3. Game skips directly from NIGHT phase to DAY phase

## Root Cause

In [websocket.ts](server/src/websocket.ts), there were two problems:

1. **Wrong Function Call**: When the night phase timer expired, it called `revealDay(s)` which:
   - Changed phase from NIGHT → DAY directly
   - Completely skipped the RESOLUTION phase
   - Never revealed or processed any submitted cards

2. **Timer Only Checked on Actions**: The timer expiry check was inside the `GAME_ACTION` handler, so it only ran when players performed actions. If no players acted after the timer expired, the phase would never advance.

```typescript
// OLD BUGGY CODE:
socket.on(WS.GAME_ACTION, (raw) => {
  // ... handle action ...
  
  // Timer check only runs when action occurs!
  if (s.expiresAt && Date.now() > s.expiresAt) {
    if (s.phase === 'NIGHT') revealDay(s); // Wrong function!
  }
});
```

This bypassed the entire resolution flow that:
1. Reveals all cards on the table
2. Determines primary/secondary ingredients
3. Applies ingredient effects
4. Creates pending player actions

## The Fix

### Changes Made

#### 1. Exported `startResolution` function
**File:** [server/src/gameLogic.ts](server/src/gameLogic.ts#L319)

Changed from private to exported so websocket handler can trigger resolution.

#### 2. Created `forceNightPhaseEnd` function
**File:** [server/src/gameLogic.ts](server/src/gameLogic.ts#L181-L209)

New function that:
- Identifies all connected, non-poisoned players who haven't submitted
- Auto-plays a **random card** from each player's hand
- Logs which cards were auto-played
- Triggers `startResolution()` to begin normal resolution flow

```typescript
export function forceNightPhaseEnd(state: GameState) {
  if (state.phase !== 'NIGHT') return;
  
  console.log('=== FORCING NIGHT PHASE END (TIMER EXPIRED) ===');
  
  // Find all connected, non-poisoned players who haven't played
  const playersWhoPlayed = new Set(state.table.map(t => t.playerId));
  const activePlayers = state.players.filter(p => p.connected && !p.poisoned);
  const playersWhoNeedToPlay = activePlayers.filter(p => !playersWhoPlayed.has(p.id));
  
  // Auto-play a random card for each player who hasn't submitted
  for (const player of playersWhoNeedToPlay) {
    const hand = state.hands[player.id];
    if (hand && hand.length > 0) {
      const randomIndex = Math.floor(Math.random() * hand.length);
      const [card] = hand.splice(randomIndex, 1);
      state.table.push({ playerId: player.id, cardId: card.id, card, revealed: false });
      const cardName = card.kind === 'INGREDIENT' ? card.name : card.type;
      console.log(`Auto-played random card for ${player.name}: ${cardName}`);
    }
  }
  
  startResolution(state);
}
```

**Key Features:**
- ⏰ Auto-plays random cards for players who didn't submit
- 📝 Logs notification message visible to all players
- 🔍 Server logs show which specific cards were auto-played
- ⚖️ Respects poisoned and disconnected player states

#### 3. Added global timer check mechanism
**Files:** [websocket.ts](server/src/websocket.ts#L8-L31), [storage.ts](server/src/storage.ts#L59-L61)

**New interval-based timer check:**
- Set up `setInterval()` that runs every **1 second**
- Checks all active game rooms for expired timers
- Immediately triggers phase transitions when timers expire
- Works independently of player actions

```typescript
// Set up interval to check for expired timers every second
setInterval(() => {
  const rooms = getAllRooms();
  for (const room of rooms) {
    checkTimerExpiry(io, room.state.room.code, room.state);
  }
}, 1000); // Check every second
```

**Helper function** `checkTimerExpiry()`:
- Checks if `expiresAt` has passed
- Handles all three phases (NIGHT, RESOLUTION, DAY)
- Broadcasts state updates automatically
- Removed duplicate check from action handler

#### 4. Updated timer handler in websocket
**File:** [websocket.ts](server/src/websocket.ts#L95-L98)

Removed the old timer check from the action handler since it's now handled by the interval.

## Expected Behavior After Fix

### Normal Flow (all players submit)
```
NIGHT → (all submit) → RESOLUTION → (effects applied) → DAY
```

### Timer Expiry Flow (some players didn't submit)
```
NIGHT → (timer expires) → Auto-play random cards → RESOLUTION → DAY
```

### Player Notification

When random cards are auto-played, **all players** see a message in the **Resolution Log**:

```
⏰ Timer expired! Random cards were played for: Alice, Bob
```

This message appears:
- ✅ In the "Resolution Log" section on the game board
- ✅ Visible to all players (not just affected players)
- ✅ Shown for both current round and "All Rounds" filter
- ❌ Affected players do NOT see which specific card was played for them (maintains fairness)

**Server logs** (admin/debug only) show the specific cards that were auto-played.

## Testing Checklist

### Test Case 1: Normal Submission (No Timer)
- [ ] Start a 5-player game
- [ ] All players submit cards before timer expires
- [ ] Verify: Resolution phase starts immediately
- [ ] Verify: All cards are revealed
- [ ] Verify: Effects are applied correctly
- [ ] Verify: Game proceeds to DAY phase

### Test Case 2: Timer Expiry with 1 Player Missing
- [ ] Start a 5-player game
- [ ] Have 4 players submit cards
- [ ] Wait for timer to expire (30 seconds by default)
- [ ] **DO NOT take any actions after timer expires**
- [ ] Verify: **Timer triggers automatically within 1 second** of expiry
- [ ] Verify: Server logs show "FORCING NIGHT PHASE END"
- [ ] Verify: Server logs show auto-play for the missing player
- [ ] Verify: **All players see notification in Resolution Log** (e.g., "⏰ Timer expired! Random cards were played for: PlayerName")
- [ ] Verify: Resolution phase starts
- [ ] Verify: All 5 cards are revealed (4 chosen + 1 random)
- [ ] Verify: Effects are applied to all cards
- [ ] Verify: Game proceeds to DAY phase

### Test Case 3: Timer Expiry with Multiple Players Missing
- [ ] Start a 5-player game
- [ ] Have only 2 players submit cards
- [ ] Wait for timer to expire
- [ ] Verify: **Resolution Log shows notification listing all 3 affected players**
- [ ] Verify: 3 random cards are auto-played
- [ ] Verify: Resolution processes all 5 cards
- [ ] Verify: Game continues normally

### Test Case 4: Timer Expiry with Poisoned Players
- [ ] Start a 5-player game
- [ ] Poison 1 player (using Yew's Quiet Draught in previous round)
- [ ] Have 3 of 4 non-poisoned players submit
- [ ] Wait for timer to expire
- [ ] Verify: Only 1 card is auto-played (for the 4th non-poisoned player)
- [ ] Verify: Poisoned player is NOT forced to play
- [ ] Verify: Resolution processes 4 cards total

### Test Case 5: Timer Expiry with Disconnected Players
- [ ] Start a 5-player game
- [ ] Disconnect 1 player
- [ ] Have 3 of 4 connected players submit
- [ ] Wait for timer to expire
- [ ] Verify: Only 1 card is auto-played (for the 4th connected player)
- [ ] Verify: Disconnected player is NOT forced to play
- [ ] Verify: Resolution processes 4 cards total

### Test Case 6: No Players Submit (Edge Case)
- [ ] Start a 5-player game
- [ ] No players submit any cards
- [ ] Wait for timer to expire
- [ ] **Verify: Automatic transition happens without any player action**
- [ ] Verify: All 5 players have random cards auto-played
- [ ] Verify: Resolution processes 5 random cards
- [ ] Verify: Game continues normally

### Test Case 7: Timer Check Independence (Critical)
- [ ] Start a 5-player game
- [ ] Have 4 players submit cards
- [ ] Wait for timer to expire
- [ ] **DO NOT perform any actions** (no clicks, no card plays)
- [ ] Verify: Phase advances automatically within 1 second
- [ ] Verify: Game does NOT require player action to trigger timer check

## Monitoring

Check server logs for these indicators:

### Success Indicators
```
=== FORCING NIGHT PHASE END (TIMER EXPIRED) ===
Active players: X, Already played: Y, Need to play: Z
Auto-played random card for [PlayerName]: [CardName]
=== RESOLUTION PHASE STARTING ===
Table contents: [...]
```

### Red Flags
- "FORCING NIGHT PHASE END" appears but no "RESOLUTION PHASE STARTING" follows
- Resolution phase starts but `state.table.length` is less than expected
- Cards show as `revealed: false` in the DAY phase

## Rollback Plan

If issues occur, revert these commits:
1. `gameLogic.ts` - Remove `export` from `startResolution`, delete `forceNightPhaseEnd` function
2. `websocket.ts` - Remove interval and `checkTimerExpiry` function, restore old timer check in action handler
3. `storage.ts` - Remove `getAllRooms` export

## Additional Notes

- Auto-played cards are **truly random** - no strategy is applied
- Players will see in the day phase which cards were played, but won't know which were auto-played
- **All players are notified** via the Resolution Log when timer expires and cards are auto-played
- The notification lists the names of affected players (e.g., "⏰ Timer expired! Random cards were played for: Alice, Bob")
- Affected players do NOT see which specific card was chosen for them (maintains competitive fairness)
- This maintains game fairness while preventing softlocks
- Server logs will show which cards were auto-played for debugging purposes
