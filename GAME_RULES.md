# Ireland Cauldron - Game Rules

## Overview
Ireland Cauldron is a secret identity card game for 5-10 players. Players receive either a good or evil hero identity and work together (or against each other) to influence the outcome of the game through ingredient cards.

## Setup

### Players
- **Minimum:** 5 players
- **Maximum:** 10 players
- **Role Distribution:** At least 1 evil player must be in each game. Generally, floor(n/3) players are evil, and the rest are good.

### Card Decks

#### Center Deck (The Cauldron)
- **16 cards total:** 8 Milk cards and 8 Blood cards
- Cards are placed face-down in the center
- Cards can be revealed (face up), discarded, or remain hidden

#### Ingredient Deck
- **5 ingredient types:** 
  - Brigid's Blessing
  - Cailleach's Gaze
  - Ceol of the Midnight Cairn
  - Faerie Thistle
  - Wolfbane Root
- **10 cards of each ingredient** (50 total)
- Players draw from this deck to form their hands
- Discarded/played ingredients go to a discard pile, which is reshuffled when the draw pile is empty

### Starting Hands
- Each player starts with **3 ingredient cards**

## Win Condition
The game ends when the **center deck + revealed cards = 5 cards total**.

When the game ends, count all remaining cards (in deck + revealed):
- More **Milk** = Good team wins
- More **Blood** = Evil team wins
- **Tie** = Draw (both teams tie)

## Game Flow

### Phase 1: Night (Card Selection)
- Each player **secretly selects 1 card** from their hand of 3
- Players submit their chosen card face-down to the center table
- Once all players have submitted, the game moves to Resolution

### Phase 2: Resolution
- All submitted cards are **revealed and shuffled**
- The game counts how many of each ingredient was played
- **Primary ingredient** is determined (most cards played)
- **Secondary ingredient** is determined (second most cards played)

#### Tie Rules
- **Tie for Primary:** Both ingredients are treated as Secondary instead
- **Tie for Secondary:** Those ingredient effects are ignored

### Phase 3: Effects Resolution
Effects are resolved in this order:

1. **Secondary effects are applied first**
2. **Primary effect is applied** (unless blocked by Faerie Thistle secondary)
3. **Pending actions are resolved** (e.g., players make choices for Cailleach's Gaze, Wolfbane Root, or view their new role from Ceol)

### Phase 4: Day (Discussion)
- Played ingredient cards remain visible (shuffled order) throughout the day phase
- Players discuss and strategize
- Each player must click **"End Discussion"** when ready
- Once all players have clicked End Discussion, a new Night phase begins

### New Round
- All played ingredient cards are discarded
- Each player draws back up to 3 cards
- A new Night phase begins

## Ingredient Effects

### Primary Effects

#### Brigid's Blessing
Reveal the top two cards of the center deck:
- **If both are Milk:** Play one face-up and return the other to the bottom of the deck
- **Otherwise:** Return both to the bottom of the deck (no cards revealed)

#### Cailleach's Gaze
Each player who played this ingredient:
- Looks at **1 random card** from the center deck
- Secretly decides to either:
  - Place it at the **bottom** of the center deck, OR
  - **Discard** it (removed from game)

#### Ceol of the Mundealt hero card** from the hero deck (roles not given to any player)
- **Shuffle** it with the hero cards of all players who played Ceol
- Give a **random hero card** from this pool to each Ceol player
- The **leftover card** is returned to the hero deck
- Players who swap roles will see their new identity in a modalof all players who played Ceol
- Give a **random hero card** from this pool to each Ceol player
- **Discard** the remaining hero card

#### Faerie Thistle
Draw **two cards** from the top of the center deck and reveal them publicly:
- **Threshold:** Dynamic based on player count
  - **5-6 players:** More than **2** Faerie Thistles
  - **7-8 players:** More than **3** Faerie Thistles
  - **9-10 players:** More than **4** Faerie Thistles
  - Formula: `floor((playerCount - 1) / 2)`
- **If more Faerie Thistles than threshold:**
  - Discard any **Milk** cards
  - Shuffle any **Blood** cards back into the deck
- **If at or below threshold:**
  - Discard any **Blood** cards
  - Shuffle any **Milk** cards back into the deck

#### Wolfbanwho played this card e Root
Each player **discards 1 random card** from their remaining 2 cards in hand

### Secondary Effects

#### Brigid's Blessing (Secondary)
**Repeat the primary effect a second time**
- Exception: If primary is Ceol, don't repeat (Ceol only needs to be done once)

#### Cailleach's Gaze (Secondary)
Each player who played Cailleach's Gaze:
- May **look at the top card** of the center deck
- Card is **returned to the top** without changing its position
- This is information only (no decision made)

#### Ceol of the Midnight Cairn (Secondary)
**Nothing happens**

#### Faerie Thistle (Secondary)
**Discard the top card** from the center deck **without revealing it**

#### Wolfbane Root (Secondary)
**Blocks the primary effect completely**
- No matter what the primary ingredient is, its effect does not activate

## Strategy Tips

### For Good Players
- Use Brigid's Blessing to safely reveal Milk cards
- Use Faerie Thistle (≤3) to remove Blood cards
- Use Cailleach's Gaze to discard Blood cards when you see them
- Coordinate with other players to avoid ties

### For Evil Players
- Use Faerie Thistle (>3) to remove Milk cards
- Use Cailleach's Gaze to discard Milk cards
- Create chaos and confusion during discussion
- Try to create ties to waste rounds
- Use Wolfbane Root to force discards and reduce information

### General Strategy
- **Ceol of the Midnight Cairn** is high-risk, high-reward - you might change your own identity!
- **Faerie Thistle as secondary** is a powerful blocking tool
- **Wolfbane Root secondary** can thin the deck but also removes information
- Pay attention to what ingredients are discarded - they won't appear again until reshuffled

## Phase Timers
- **Night Phase:** 30 seconds (configurable)
- **Day Phase:** 15 seconds (configurable) - *does not end until all players click "End Discussion"*
- **Resolution:** Automatic (processes effects, then waits for player actions like Cailleach choices)

## End Game
When the game ends:
- All remaining center deck cards and revealed cards are shown
- All player identities and roles are revealed
- The winning team is displayed batil game end (or until you swap via Ceol)
- Played cards remain visible on the table during day phase to help with discussion
- Players can hover over decks to see initial composition and what they know about cards

## Notes
- When the ingredient draw pile is empty, the discard pile is automatically reshuffled
- Center deck discarded cards are permanently removed (not reshuffled)
- Players cannot see others' hands
- Hero identities remain secret unless revealed by Ceol effect
