export const CARD_EFFECTS = {
  "brigids_blessing": {
    name: "Brigid's Blessing",
    primary: "Reveal top 2 cards from deck. If both are milk, play 1 face up and return other to bottom. Otherwise, return both to bottom.",
    secondary: "Repeat the primary effect again (except Ceol, which only triggers once)"
  },
  "cailleachs_gaze": {
    name: "Cailleach's Gaze",
    primary: "Each player who played this views 1 random card from the deck and secretly decides to keep it (bottom of deck) or discard it",
    secondary: "Each player who played this views the top card of the deck (it stays on top)"
  },
  "ceol_of_the_midnight_cairn": {
    name: "Ceol of the Midnight Cairn",
    primary: "Randomly swap roles among all players who played this card (1 extra role is discarded)",
    secondary: "Each player who played this sees the role of one other random player who played it (without revealing their name). Does nothing if only one player played it."
  },
  "faerie_thistle": {
    name: "Faerie Thistle",
    primary: "Reveal top 2 cards from deck. If >3 Faeries played: discard milk, shuffle blood back. If ≤3 played: discard blood, shuffle milk back.",
    secondary: "Discard the top card from the deck without revealing it"
  },
  "wolfbane_root": {
    name: "Wolfbane Root",
    primary: "Each player discards 1 random card from their hand (from their remaining 2 cards)",
    secondary: "Blocks the primary effect"
  }
} as const;

export function getCardEffect(cardName: string) {
  // Normalize the card name to match keys
  const normalized = cardName.toLowerCase().trim().replace(/\s+/g, '_').replace(/'/g, '');
  return CARD_EFFECTS[normalized as keyof typeof CARD_EFFECTS];
}
