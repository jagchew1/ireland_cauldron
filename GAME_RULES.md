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
- **6 ingredient types:** 
  - Brigid's Blessing
  - Cailleach's Gaze
  - Ceol of the Midnight Cairn
  - Faerie Thistle
  - Wolfbane Root
  - Yew's Quiet Draught
- **10 cards of each ingredient** (60 total)
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
- **Tie for Secondary (with Primary):** One of the tied ingredients is randomly chosen as secondary
- **Tie for Secondary (no Primary):** Secondary effects are ignored

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

#### Ceol of the Midnight Cairn
- Draw a **random hero card** from the hero deck (roles not given to any player)
- **Shuffle** it with the hero cards of all players who played Ceol
- Give a **random hero card** from this pool to each Ceol player
- **Discard** the remaining hero card
- Players who swap roles will see their new identity in a modal

#### Faerie Thistle
Draw **two cards** from the top of the center deck and reveal them publicly:
- **Threshold:** Dynamic based on player count (minimum 2)
  - **5-6 players:** More than **2** Faerie Thistles
  - **7-8 players:** More than **3** Faerie Thistles
  - **9-10 players:** More than **4** Faerie Thistles
  - Formula: `max(2, floor((playerCount - 1) / 2))`
- **If more Faerie Thistles than threshold:**
  - Discard any **Milk** cards
  - Shuffle any **Blood** cards back into the deck
- **If at or below threshold:**
  - Discard any **Blood** cards
  - Shuffle any **Milk** cards back into the deck

#### Wolfbane Root
Each player **discards 1 random card** from their remaining 2 cards in hand

#### Yew's Quiet Draught
Each player who played Yew's Quiet Draught:
- **Votes** to poison one ingredient (select from a list of 5 other ingredients)
- If a **majority** of votes target the same ingredient, that ingredient becomes **poisoned**
- **Any player who casts the poisoned ingredient** in the following round is poisoned and cannot play cards in the round after that
- If there's a **tie** in votes, one ingredient is randomly selected to be poisoned
- Poisoned ingredient status is cleared after one round

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

#### Yew's Quiet Draught (Secondary)
**Reveal the top card** of the center deck:
- **If Blood:** All players who played Yew's Quiet Draught become **poisoned** and cannot play cards in the following round
- **If Milk:** Nothing happens (Yew players are safe)
- The revealed card remains in its position (on top of the deck)

## Strategy Tips

### For Good Players
- Use Brigid's Blessing to safely reveal Milk cards
- Use Faerie Thistle (≤3) to remove Blood cards
- Use Cailleach's Gaze to discard Blood cards when you see them
- Coordinate with other players to avoid ties

### For Evil Players
- Use Faerie Thistle (>3) to remove Milk cards
- Use Cailleach's Gaze to discard Milk cards
- Use Yew's Quiet Draught to poison key ingredients and disrupt good players' strategies
- Create chaos and confusion during discussion
- Try to create ties to waste rounds
- Use Wolfbane Root to force discards and reduce information

### General Strategy
- **Ceol of the Midnight Cairn** is high-risk, high-reward - you might change your own identity!
- **Yew's Quiet Draught** can eliminate key plays by poisoning strategic ingredients
- **Faerie Thistle as secondary** is a powerful blocking tool
- **Wolfbane Root secondary** can save critical information by blocking primary effects
- Pay attention to what ingredients are discarded - they won't appear again until reshuffled
- Poisoned ingredients create strategic depth - watch for which ingredient gets poisoned and plan accordingly

## Phase Timers
- **Night Phase:** 30 seconds (configurable)
- **Day Phase:** 60 seconds (configurable) - *timer forces advance to night even if players haven't clicked "End Discussion"*
- **Resolution:** Automatic (processes effects, then waits for player actions like Cailleach choices)

## End Game
When the game ends:
- All remaining center deck cards and revealed cards are shown
- All player identities and roles are revealed
- The winning team is displayed based on the final count

## Additional Information
- Your role is secret until game end (or until you swap via Ceol)
- Played cards remain visible on the table during day phase to help with discussion
- Players can hover over decks to see initial composition and what they know about cards

## Notes
- When the ingredient draw pile is empty, the discard pile is automatically reshuffled
- Center deck discarded cards are permanently removed (not reshuffled)
- Players cannot see others' hands
- Hero identities remain secret unless revealed by Ceol effect
