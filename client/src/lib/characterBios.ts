export const CHARACTER_BIOS: Record<string, string> = {
  // Heroes
  "good_finn": "In Old Irish, finn/find means \"white, bright, fair, handsome, blessed.\" In the Fenian cycle, a body of Irish literature spanning the 7th to 14th centuries, Fionn is the leader of the Fianna bands of young roving hunter-warriors, as well as being a seer and poet. He is said to have a magic thumb that bestows him with great wisdom. He is often depicted hunting with his hounds Bran and Sceólang, and fighting with his spear and sword. The tales of Fionn and his fiann form the Fianna Cycle or Fenian Cycle (an Fhiannaíocht), much of it narrated by Fionn's son, the poet Oisín.",
  
  "good_oisin": "Finn's son; name literally means \"young deer\" or fawn. In Oisín in Tir na nÓg, his most famous echtra or adventure tale, he is visited by a fairy woman called Niamh Chinn Óir (Niamh of the Golden Hair or Head, one of the daughters of Manannán mac Lir, a god of the sea). Niamh's father turned her head into a pig's head because of a prophecy. She tells this to Oisín and informs him she would return to her original form if he marries her. He agrees and they return to Tir na nÓg (\"the land of the young\", also referred to as Tir Tairngire, \"the land of promise\") where Oisín becomes king. He eventually tired of the land of eternal youth and longed to return to the Emerald Isle, where immediately upon touching foot to the earth he became a wizened old man.",
  
  "good_cu_chullain": "\"Culann's hound\" or \"chariot warrior\"; an Irish warrior hero and demigod in the Ulster Cycle of Irish mythology found in manuscripts from the 12th to 15th centuries. He gained his name as a child, after killing the blacksmith Culann's fierce guard dog in self-defence and offering to take its place until a replacement could be reared. He is believed to be an incarnation of the Irish god Lugh, a member of the Tuatha Dé Danann, who is also his father. He is also mentioned as possessing skills in poetry and magic.",
  
  "good_brigid": "Meaning 'exalted one'; one of the Tuatha Dé Danann, a supernatural race from Irish mythology, often described as god-like beings who possessed great magical and artistic skills. Daughter of chief god the Dagda, she is associated with healing, fertility, craft, and platonic love, and is known as the \"goddess of the poets.\" She is said to have begun the custom of keening, a combination of wailing and singing, while mourning the death of her son Ruadán. The Christian Saint Brigid shares many of the goddess's attributes and her feast day.",
  
  "good_eriu": "From \"fertile land\" or \"land of abundance\"; one of the Tuatha Dé Danann, a supernatural race from Irish mythology, often described as god-like beings who possessed great magical and artistic skills. She is one of three sister goddesses—along with Banba and Fódla—who asked the Milesian druid Amergin that the island be named after them, with Ériu ultimately giving her name to Éire (Ireland). Along with her sisters, she became a symbol of the true spirit of Ireland and a muse for poets who retold her tale in stories and poems.",
  
  // Villains
  "evil_fair_dohrik": "Literally \"Dark Man\"—a villainous druid in Irish mythology in events surrounding the hero Fionn mac Cumhaill and his wife Sadhbh. He is sometimes described as a malevolent fairy, acting as a butler-like servant of the Fairy Queen. Fear Doirich had sought Sadhbh to wife, but transformed her into a deer or fawn when she refused his advances.",
  
  "evil_banshee": "From Bean Sith meaning \"woman of the fairies\"—the Banshee is a harbinger of death, often appearing as a wailing woman whose mournful cries foretell the passing of a loved one. According to the legend, the Banshee is a spirit tied to specific Irish families, particularly those with surnames beginning with \"O'\" or \"Mac.\" When a member of one of these families is about to die, the Banshee appears to warn them of the impending tragedy. Her cries are said to be so sorrowful that they can bring even the bravest of men to tears.",
  
  "evil_dullahan": "\"Hobgoblin\" or \"dark person\"—a legendary creature in Irish folklore who appears as a headless rider on a black horse, who carries his own head in his hand or under his arm, or as a coachman driving a horse-drawn carriage out of graveyards. The rumour of a Dullahan's appearance often develops near a graveyard or a charnel vault where a wicked aristocrat is reputed to be buried.",
};

export function getCharacterBio(roleId: string): string | undefined {
  return CHARACTER_BIOS[roleId];
}

export function getCharacterDisplayName(roleId: string): string {
  // Convert "evil_fair_dohrik" or "good_finn" to display name
  const withoutTeam = roleId.replace(/^(evil_|good_)/i, '');
  
  // Special cases for proper formatting
  const specialCases: Record<string, string> = {
    "finn": "Fionn mac Cumhaill",
    "oisin": "Oisín",
    "cu_chullain": "Cú Chulainn",
    "brigid": "Brigid",
    "eriu": "Ériu",
    "fair_dohrik": "Fear Doirche",
    "banshee": "The Banshee",
    "the_dullahan": "The Dullahan",
  };
  
  return specialCases[withoutTeam] || withoutTeam
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
