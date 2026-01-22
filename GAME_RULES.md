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
The game ends when either:
1. **6 cards from the center deck are revealed face-up**, OR
2. **Only 6 cards remain** in the center deck (after discards)

When the game ends, count the revealed cards to determine which team wins:
- More **Milk** = Good team wins
- More **Blood** = Evil team wins

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

### Phase 4: Day (Discussion)
- Players can see what ingredients were played
- Players discuss and prepare for the next round
- After the timer, a new Night phase begins

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
Identity swap mechanic:
- Take **1 random hero card** from unused roles
- **Shuffle** it with the hero cards of all players who played Ceol
- Give a **random hero card** from this pool to each Ceol player
- **Discard** the remaining hero card

#### Faerie Thistle
Draw **two cards** from the top of the center deck and reveal them publicly:
- **If more than 3 Faerie Thistles were played:**
  - Discard any **Milk** cards
  - Shuffle any **Blood** cards back into the deck
- **If 3 or fewer Faerie Thistles were played:**
  - Discard any **Blood** cards
  - Shuffle any **Milk** cards back into the deck

#### Wolfbane Root
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
**Blocks the primary effect completely**
- No matter what the primary ingredient is, its effect does not activate

#### Wolfbane Root (Secondary)
**Discard the top card** from the center deck **without revealing it**

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
- **Day Phase:** 15 seconds (configurable)
- **Resolution:** Automatic (processes effects immediately)

## Notes
- When the ingredient draw pile is empty, the discard pile is automatically reshuffled
- Center deck discarded cards are permanently removed (not reshuffled)
- Players cannot see others' hands
- Hero identities remain secret unless revealed by Ceol effect
