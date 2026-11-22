// Verified Final Fantasy X / HD Remaster binary value tables
// Derived from FFXED & Farplane reference schemas

export interface IdName {
  id: number;
  name: string;
}

export interface BitFlagSpec {
  name: string;
  offset: number;
  bit: number;
}

export interface MonsterArenaAreaSpec {
  name: string;
  monsters: { index: number; name: string }[];
}

export const CHARACTER_NAMES_DEFAULT = [
  "Tidus",
  "Yuna",
  "Auron",
  "Kimahri",
  "Wakka",
  "Lulu",
  "Rikku",
  "Seymour",
  "Valefor",
  "Ifrit",
  "Ixion",
  "Shiva",
  "Bahamut",
  "Anima",
  "Yojimbo",
  "Cindy",
  "Sandy",
  "Mindy",
] as const;

export const PARTY_ROSTER_OPTIONS: IdName[] = [
  ...CHARACTER_NAMES_DEFAULT.map((name, id) => ({ id, name })),
  { id: 0xFF, name: "None (Empty)" },
];

export const ACTIVATION_OPTIONS: IdName[] = [
  { id: 17, name: "Enabled (In Party Pool)" },
  { id: 16, name: "Disabled (Greyed Out)" },
  { id: 0, name: "Inactivated (Hidden)" },
];

export const OVERDRIVE_MODES: { id: number; bit: number; name: string; countOffset: number }[] = [
  { id: 0, bit: 0, name: "Warrior", countOffset: 22124 },
  { id: 1, bit: 1, name: "Comrade", countOffset: 22126 },
  { id: 2, bit: 2, name: "Stoic", countOffset: 22128 },
  { id: 3, bit: 3, name: "Healer", countOffset: 22130 },
  { id: 4, bit: 4, name: "Tactician", countOffset: 22132 },
  { id: 5, bit: 5, name: "Victim", countOffset: 22134 },
  { id: 6, bit: 6, name: "Dancer", countOffset: 22136 },
  { id: 7, bit: 7, name: "Avenger", countOffset: 22138 },
  { id: 8, bit: 8, name: "Slayer", countOffset: 22140 },
  { id: 9, bit: 9, name: "Hero", countOffset: 22142 },
  { id: 10, bit: 10, name: "Rook", countOffset: 22144 },
  { id: 11, bit: 11, name: "Victor", countOffset: 22146 },
  { id: 12, bit: 12, name: "Coward", countOffset: 22148 },
  { id: 13, bit: 13, name: "Ally", countOffset: 22150 },
  { id: 14, bit: 14, name: "Sufferer", countOffset: 22152 },
  { id: 15, bit: 15, name: "Daredevil", countOffset: 22154 },
  { id: 16, bit: 16, name: "Loner", countOffset: 22156 },
  { id: 17, bit: 17, name: "Unused 1", countOffset: 22158 },
  { id: 18, bit: 18, name: "Unused 2", countOffset: 22160 },
  { id: 19, bit: 19, name: "Aeons Only", countOffset: 22162 },
];

export const CHARACTER_ABILITIES: BitFlagSpec[] = [
  {
    "name": "Attack",
    "offset": 22090,
    "bit": 0
  },
  {
    "name": "Switch",
    "offset": 22090,
    "bit": 2
  },
  {
    "name": "Item",
    "offset": 22090,
    "bit": 1
  },
  {
    "name": "Weapon",
    "offset": 22090,
    "bit": 4
  },
  {
    "name": "Armor",
    "offset": 22090,
    "bit": 5
  },
  {
    "name": "Escape",
    "offset": 22090,
    "bit": 3
  },
  {
    "name": "Shield",
    "offset": 22090,
    "bit": 84
  },
  {
    "name": "Boost",
    "offset": 22090,
    "bit": 85
  },
  {
    "name": "Dismiss",
    "offset": 22090,
    "bit": 86
  },
  {
    "name": "Sleep Attack",
    "offset": 22090,
    "bit": 8
  },
  {
    "name": "Silence Attack",
    "offset": 22090,
    "bit": 9
  },
  {
    "name": "Dark Attack",
    "offset": 22090,
    "bit": 10
  },
  {
    "name": "Sleep Buster",
    "offset": 22090,
    "bit": 12
  },
  {
    "name": "Silence Buster",
    "offset": 22090,
    "bit": 13
  },
  {
    "name": "Dark Buster",
    "offset": 22090,
    "bit": 14
  },
  {
    "name": "Zombie Attack",
    "offset": 22090,
    "bit": 11
  },
  {
    "name": "Triple Foul",
    "offset": 22090,
    "bit": 15
  },
  {
    "name": "Delay Attack",
    "offset": 22090,
    "bit": 6
  },
  {
    "name": "Delay Buster",
    "offset": 22090,
    "bit": 7
  },
  {
    "name": "Extract Power",
    "offset": 22090,
    "bit": 90
  },
  {
    "name": "Extract Mana",
    "offset": 22090,
    "bit": 91
  },
  {
    "name": "Extract Speed",
    "offset": 22090,
    "bit": 92
  },
  {
    "name": "Extract Ability",
    "offset": 22090,
    "bit": 93
  },
  {
    "name": "Power Break",
    "offset": 22090,
    "bit": 16
  },
  {
    "name": "Magic Break",
    "offset": 22090,
    "bit": 17
  },
  {
    "name": "Armor Break",
    "offset": 22090,
    "bit": 18
  },
  {
    "name": "Mental Break",
    "offset": 22090,
    "bit": 19
  },
  {
    "name": "Full Break",
    "offset": 22090,
    "bit": 89
  },
  {
    "name": "Mug",
    "offset": 22090,
    "bit": 20
  },
  {
    "name": "Nab Gil",
    "offset": 22090,
    "bit": 94
  },
  {
    "name": "Quick Hit",
    "offset": 22090,
    "bit": 21
  },
  {
    "name": "Steal",
    "offset": 22090,
    "bit": 22
  },
  {
    "name": "Use",
    "offset": 22090,
    "bit": 23
  },
  {
    "name": "Flee",
    "offset": 22090,
    "bit": 24
  },
  {
    "name": "Pray",
    "offset": 22090,
    "bit": 25
  },
  {
    "name": "Cheer",
    "offset": 22090,
    "bit": 26
  },
  {
    "name": "Aim",
    "offset": 22090,
    "bit": 27
  },
  {
    "name": "Focus",
    "offset": 22090,
    "bit": 28
  },
  {
    "name": "Reflex",
    "offset": 22090,
    "bit": 29
  },
  {
    "name": "Luck",
    "offset": 22090,
    "bit": 30
  },
  {
    "name": "Jinx",
    "offset": 22090,
    "bit": 31
  },
  {
    "name": "Lancet",
    "offset": 22090,
    "bit": 32
  },
  {
    "name": "Defend",
    "offset": 22090,
    "bit": 33
  },
  {
    "name": "Guard",
    "offset": 22090,
    "bit": 34
  },
  {
    "name": "Sentinel",
    "offset": 22090,
    "bit": 35
  },
  {
    "name": "Spare Change",
    "offset": 22090,
    "bit": 36
  },
  {
    "name": "Threaten",
    "offset": 22090,
    "bit": 37
  },
  {
    "name": "Provoke",
    "offset": 22090,
    "bit": 38
  },
  {
    "name": "Entrust",
    "offset": 22090,
    "bit": 39
  },
  {
    "name": "Copycat",
    "offset": 22090,
    "bit": 40
  },
  {
    "name": "Pilfer Gil",
    "offset": 22090,
    "bit": 88
  },
  {
    "name": "Quick Pockets",
    "offset": 22090,
    "bit": 95
  },
  {
    "name": "Doublecast",
    "offset": 22090,
    "bit": 41
  },
  {
    "name": "Bribe",
    "offset": 22090,
    "bit": 42
  },
  {
    "name": "Cure",
    "offset": 22090,
    "bit": 43
  },
  {
    "name": "Cura",
    "offset": 22090,
    "bit": 44
  },
  {
    "name": "Curaga",
    "offset": 22090,
    "bit": 45
  },
  {
    "name": "NulBlaze",
    "offset": 22090,
    "bit": 47
  },
  {
    "name": "NulShock",
    "offset": 22090,
    "bit": 48
  },
  {
    "name": "NulTide",
    "offset": 22090,
    "bit": 49
  },
  {
    "name": "NulFrost",
    "offset": 22090,
    "bit": 46
  },
  {
    "name": "Scan",
    "offset": 22090,
    "bit": 50
  },
  {
    "name": "Esuna",
    "offset": 22090,
    "bit": 51
  },
  {
    "name": "Life",
    "offset": 22090,
    "bit": 52
  },
  {
    "name": "Full-Life",
    "offset": 22090,
    "bit": 53
  },
  {
    "name": "Haste",
    "offset": 22090,
    "bit": 54
  },
  {
    "name": "Hastega",
    "offset": 22090,
    "bit": 55
  },
  {
    "name": "Slow",
    "offset": 22090,
    "bit": 56
  },
  {
    "name": "Slowga",
    "offset": 22090,
    "bit": 57
  },
  {
    "name": "Shell",
    "offset": 22090,
    "bit": 58
  },
  {
    "name": "Protect",
    "offset": 22090,
    "bit": 59
  },
  {
    "name": "Reflect",
    "offset": 22090,
    "bit": 60
  },
  {
    "name": "Dispel",
    "offset": 22090,
    "bit": 61
  },
  {
    "name": "Regen",
    "offset": 22090,
    "bit": 62
  },
  {
    "name": "Holy",
    "offset": 22090,
    "bit": 63
  },
  {
    "name": "Auto-Life",
    "offset": 22090,
    "bit": 64
  },
  {
    "name": "Fire",
    "offset": 22090,
    "bit": 66
  },
  {
    "name": "Thunder",
    "offset": 22090,
    "bit": 67
  },
  {
    "name": "Water",
    "offset": 22090,
    "bit": 68
  },
  {
    "name": "Blizzard",
    "offset": 22090,
    "bit": 65
  },
  {
    "name": "Fira",
    "offset": 22090,
    "bit": 69
  },
  {
    "name": "Thundara",
    "offset": 22090,
    "bit": 71
  },
  {
    "name": "Watera",
    "offset": 22090,
    "bit": 72
  },
  {
    "name": "Blizzara",
    "offset": 22090,
    "bit": 70
  },
  {
    "name": "Firaga",
    "offset": 22090,
    "bit": 73
  },
  {
    "name": "Thundaga",
    "offset": 22090,
    "bit": 75
  },
  {
    "name": "Waterga",
    "offset": 22090,
    "bit": 76
  },
  {
    "name": "Blizzaga",
    "offset": 22090,
    "bit": 74
  },
  {
    "name": "Bio",
    "offset": 22090,
    "bit": 77
  },
  {
    "name": "Demi",
    "offset": 22090,
    "bit": 78
  },
  {
    "name": "Death",
    "offset": 22090,
    "bit": 79
  },
  {
    "name": "Drain",
    "offset": 22090,
    "bit": 80
  },
  {
    "name": "Osmose",
    "offset": 22090,
    "bit": 81
  },
  {
    "name": "Flare",
    "offset": 22090,
    "bit": 82
  },
  {
    "name": "Ultima",
    "offset": 22090,
    "bit": 83
  }
];

export const OVERDRIVES_LIST: BitFlagSpec[] = [
  {
    "name": "Swordplay",
    "offset": 15811,
    "bit": 1
  },
  {
    "name": "Spiral Cut",
    "offset": 15788,
    "bit": 0
  },
  {
    "name": "Slice & Dice",
    "offset": 15788,
    "bit": 1
  },
  {
    "name": "Energy Rain",
    "offset": 15788,
    "bit": 2
  },
  {
    "name": "Blitz Ace",
    "offset": 15788,
    "bit": 3
  },
  {
    "name": "Grand Summon",
    "offset": 15811,
    "bit": 0
  },
  {
    "name": "Bushido",
    "offset": 15811,
    "bit": 3
  },
  {
    "name": "Dragon Fang",
    "offset": 15788,
    "bit": 5
  },
  {
    "name": "Shooting Star",
    "offset": 15788,
    "bit": 4
  },
  {
    "name": "Banishing Blade",
    "offset": 15788,
    "bit": 6
  },
  {
    "name": "Tornado",
    "offset": 15788,
    "bit": 7
  },
  {
    "name": "Ronso Rage",
    "offset": 15811,
    "bit": 2
  },
  {
    "name": "Jump",
    "offset": 15789,
    "bit": 0
  },
  {
    "name": "Fire Breath",
    "offset": 15789,
    "bit": 1
  },
  {
    "name": "Seed Cannon",
    "offset": 15789,
    "bit": 2
  },
  {
    "name": "Self-Destruct",
    "offset": 15789,
    "bit": 3
  },
  {
    "name": "Thrust Kick",
    "offset": 15789,
    "bit": 4
  },
  {
    "name": "Stone Breath",
    "offset": 15789,
    "bit": 5
  },
  {
    "name": "Aqua Breath",
    "offset": 15789,
    "bit": 6
  },
  {
    "name": "Doom",
    "offset": 15789,
    "bit": 7
  },
  {
    "name": "White Wind",
    "offset": 15790,
    "bit": 0
  },
  {
    "name": "Bad Breath",
    "offset": 15790,
    "bit": 1
  },
  {
    "name": "Mighty Guard",
    "offset": 15790,
    "bit": 2
  },
  {
    "name": "Nova",
    "offset": 15790,
    "bit": 3
  },
  {
    "name": "Slots",
    "offset": 15811,
    "bit": 4
  },
  {
    "name": "Element Reels",
    "offset": 15790,
    "bit": 4
  },
  {
    "name": "Attack Reels",
    "offset": 15790,
    "bit": 5
  },
  {
    "name": "Status Reels",
    "offset": 15790,
    "bit": 6
  },
  {
    "name": "Aurochs Reels",
    "offset": 15790,
    "bit": 7
  },
  {
    "name": "Fury",
    "offset": 15811,
    "bit": 5
  },
  {
    "name": "Fire Fury",
    "offset": 15791,
    "bit": 1
  },
  {
    "name": "Thunder Fury",
    "offset": 15791,
    "bit": 2
  },
  {
    "name": "Water Fury",
    "offset": 15791,
    "bit": 3
  },
  {
    "name": "Blizzard Fury",
    "offset": 15791,
    "bit": 0
  },
  {
    "name": "Fira Fury",
    "offset": 15791,
    "bit": 4
  },
  {
    "name": "Thundara Fury",
    "offset": 15791,
    "bit": 6
  },
  {
    "name": "Watera Fury",
    "offset": 15791,
    "bit": 7
  },
  {
    "name": "Blizzara Fury",
    "offset": 15791,
    "bit": 5
  },
  {
    "name": "Firaga Fury",
    "offset": 15792,
    "bit": 0
  },
  {
    "name": "Thundaga Fury",
    "offset": 15792,
    "bit": 2
  },
  {
    "name": "Waterga Fury",
    "offset": 15792,
    "bit": 3
  },
  {
    "name": "Blizzaga Fury",
    "offset": 15792,
    "bit": 1
  },
  {
    "name": "Bio Fury",
    "offset": 15792,
    "bit": 4
  },
  {
    "name": "Demi Fury",
    "offset": 15792,
    "bit": 5
  },
  {
    "name": "Death Fury",
    "offset": 15792,
    "bit": 6
  },
  {
    "name": "Drain Fury",
    "offset": 15792,
    "bit": 7
  },
  {
    "name": "Osmose Fury",
    "offset": 15793,
    "bit": 0
  },
  {
    "name": "Flare Fury",
    "offset": 15793,
    "bit": 1
  },
  {
    "name": "Ultima Fury",
    "offset": 15793,
    "bit": 2
  },
  {
    "name": "Mix",
    "offset": 15811,
    "bit": 6
  },
  {
    "name": "Requiem",
    "offset": 15804,
    "bit": 3
  },
  {
    "name": "Energy Ray",
    "offset": 15801,
    "bit": 6
  },
  {
    "name": "Energy Blast",
    "offset": 15801,
    "bit": 5
  },
  {
    "name": "Hellfire",
    "offset": 15802,
    "bit": 1
  },
  {
    "name": "Thor's Hammer",
    "offset": 15802,
    "bit": 4
  },
  {
    "name": "Diamond Dust",
    "offset": 15802,
    "bit": 7
  },
  {
    "name": "Mega Flare",
    "offset": 15803,
    "bit": 2
  },
  {
    "name": "Oblivion",
    "offset": 15803,
    "bit": 5
  },
  {
    "name": "Delta Attack",
    "offset": 15805,
    "bit": 2
  }
];

export const SPECIAL_ABILITIES_LIST: {
  name: string;
  accessors: { offset: number; bit: number; value: boolean }[];
}[] = [
  ...[
  {
    "name": "Summon",
    "offset": 15810,
    "bit": 7
  },
  {
    "name": "Attack (Valefor)",
    "offset": 15801,
    "bit": 3
  },
  {
    "name": "Sonic Wings",
    "offset": 15801,
    "bit": 4
  },
  {
    "name": "Attack (Ifrit)",
    "offset": 15801,
    "bit": 7
  },
  {
    "name": "Meteor Strike",
    "offset": 15802,
    "bit": 0
  },
  {
    "name": "Attack (Ixion)",
    "offset": 15802,
    "bit": 2
  },
  {
    "name": "Aerospark",
    "offset": 15802,
    "bit": 3
  },
  {
    "name": "Attack (Shiva)",
    "offset": 15802,
    "bit": 5
  },
  {
    "name": "Heavenly Strike",
    "offset": 15802,
    "bit": 6
  },
  {
    "name": "Attack (Bahamut)",
    "offset": 15803,
    "bit": 0
  },
  {
    "name": "Impulse",
    "offset": 15803,
    "bit": 1
  },
  {
    "name": "Attack (Anima)",
    "offset": 15803,
    "bit": 3
  },
  {
    "name": "Pain",
    "offset": 15803,
    "bit": 4
  },
  {
    "name": "Pay",
    "offset": 15812,
    "bit": 3
  },
  {
    "name": "Dismiss (Yojimbo)",
    "offset": 24172,
    "bit": 7
  },
  {
    "name": "Daigoro",
    "offset": 15803,
    "bit": 6
  },
  {
    "name": "Kozuka",
    "offset": 15803,
    "bit": 7
  },
  {
    "name": "Zanmato",
    "offset": 15804,
    "bit": 2
  },
  {
    "name": "Camisade",
    "offset": 15804,
    "bit": 5
  },
  {
    "name": "Razzia",
    "offset": 15804,
    "bit": 7
  },
  {
    "name": "Passado",
    "offset": 15805,
    "bit": 1
  },
  {
    "name": "Auto-Life",
    "offset": 15811,
    "bit": 7
  },
  {
    "name": "Stand by",
    "offset": 15808,
    "bit": 4
  },
  {
    "name": "Struggle",
    "offset": 15809,
    "bit": 1
  },
  {
    "name": "Talk",
    "offset": 15808,
    "bit": 5
  }
].map((item) => ({
    name: item.name,
    accessors: [{ offset: item.offset, bit: item.bit, value: true }],
  })),
  {
    name: "Wakizashi",
    accessors: [
      { offset: 15804, bit: 0, value: true },
      { offset: 15804, bit: 1, value: true },
    ],
  },
];

export const ITEMS_LIST: IdName[] = [
  {
    "id": 255,
    "name": "Empty"
  },
  {
    "id": 8192,
    "name": "Potion"
  },
  {
    "id": 8193,
    "name": "Hi-Potion"
  },
  {
    "id": 8194,
    "name": "X-Potion"
  },
  {
    "id": 8195,
    "name": "Mega-Potion"
  },
  {
    "id": 8196,
    "name": "Ether"
  },
  {
    "id": 8197,
    "name": "Turbo Ether"
  },
  {
    "id": 8198,
    "name": "Phoenix Down"
  },
  {
    "id": 8199,
    "name": "Mega Phoenix"
  },
  {
    "id": 8200,
    "name": "Elixir"
  },
  {
    "id": 8201,
    "name": "Megalixir"
  },
  {
    "id": 8202,
    "name": "Antidote"
  },
  {
    "id": 8203,
    "name": "Soft"
  },
  {
    "id": 8204,
    "name": "Eye Drops"
  },
  {
    "id": 8205,
    "name": "Echo Screen"
  },
  {
    "id": 8206,
    "name": "Holy Water"
  },
  {
    "id": 8207,
    "name": "Remedy"
  },
  {
    "id": 8208,
    "name": "Power Distiller"
  },
  {
    "id": 8209,
    "name": "Mana Distiller"
  },
  {
    "id": 8210,
    "name": "Speed Distiller"
  },
  {
    "id": 8211,
    "name": "Ability Distiller"
  },
  {
    "id": 8212,
    "name": "Al Bhed Potion"
  },
  {
    "id": 8213,
    "name": "Healing Water"
  },
  {
    "id": 8214,
    "name": "Tetra Elemental"
  },
  {
    "id": 8215,
    "name": "Antarctic Wind"
  },
  {
    "id": 8216,
    "name": "Arctic Wind"
  },
  {
    "id": 8217,
    "name": "Ice Gem"
  },
  {
    "id": 8218,
    "name": "Bomb Fragment"
  },
  {
    "id": 8219,
    "name": "Bomb Core"
  },
  {
    "id": 8220,
    "name": "Fire Gem"
  },
  {
    "id": 8221,
    "name": "Electro Marble"
  },
  {
    "id": 8222,
    "name": "Lightning Marble"
  },
  {
    "id": 8223,
    "name": "Lightning Gem"
  },
  {
    "id": 8224,
    "name": "Fish Scale"
  },
  {
    "id": 8225,
    "name": "Dragon Scale"
  },
  {
    "id": 8226,
    "name": "Water Gem"
  },
  {
    "id": 8227,
    "name": "Grenade"
  },
  {
    "id": 8228,
    "name": "Frag Grenade"
  },
  {
    "id": 8229,
    "name": "Sleeping Grenade"
  },
  {
    "id": 8230,
    "name": "Dream Powder"
  },
  {
    "id": 8231,
    "name": "Silence Grenade"
  },
  {
    "id": 8232,
    "name": "Smoke Bomb"
  },
  {
    "id": 8233,
    "name": "Shadow Gem"
  },
  {
    "id": 8234,
    "name": "Shining Gem"
  },
  {
    "id": 8235,
    "name": "Blessed Gem"
  },
  {
    "id": 8236,
    "name": "Supreme Gem"
  },
  {
    "id": 8237,
    "name": "Poison Gem"
  },
  {
    "id": 8238,
    "name": "Silver Hourglass"
  },
  {
    "id": 8239,
    "name": "Gold Hourglass"
  },
  {
    "id": 8240,
    "name": "Candle of Life"
  },
  {
    "id": 8241,
    "name": "Petrify Grenade"
  },
  {
    "id": 8242,
    "name": "Farplane Shadow"
  },
  {
    "id": 8243,
    "name": "Farplane Wind"
  },
  {
    "id": 8244,
    "name": "Designer Wallet"
  },
  {
    "id": 8245,
    "name": "Dark Matter"
  },
  {
    "id": 8246,
    "name": "Chocobo Feather"
  },
  {
    "id": 8247,
    "name": "Chocobo Wing"
  },
  {
    "id": 8248,
    "name": "Lunar Curtain"
  },
  {
    "id": 8249,
    "name": "Light Curtain"
  },
  {
    "id": 8250,
    "name": "Star Curtain"
  },
  {
    "id": 8251,
    "name": "Healing Spring"
  },
  {
    "id": 8252,
    "name": "Mana Spring"
  },
  {
    "id": 8253,
    "name": "Stamina Spring"
  },
  {
    "id": 8254,
    "name": "Soul Spring"
  },
  {
    "id": 8255,
    "name": "Purifying Salt"
  },
  {
    "id": 8256,
    "name": "Stamina Tablet"
  },
  {
    "id": 8257,
    "name": "Mana Tablet"
  },
  {
    "id": 8258,
    "name": "Twin Stars"
  },
  {
    "id": 8259,
    "name": "Stamina Tonic"
  },
  {
    "id": 8260,
    "name": "Mana Tonic"
  },
  {
    "id": 8261,
    "name": "Three Stars"
  },
  {
    "id": 8262,
    "name": "Power Sphere"
  },
  {
    "id": 8263,
    "name": "Mana Sphere"
  },
  {
    "id": 8264,
    "name": "Speed Sphere"
  },
  {
    "id": 8265,
    "name": "Ability Sphere"
  },
  {
    "id": 8266,
    "name": "Fortune Sphere"
  },
  {
    "id": 8267,
    "name": "Attribute Sphere"
  },
  {
    "id": 8268,
    "name": "Special Sphere"
  },
  {
    "id": 8269,
    "name": "Skill Sphere"
  },
  {
    "id": 8270,
    "name": "Wht Magic Sphere"
  },
  {
    "id": 8271,
    "name": "Blk Magic Sphere"
  },
  {
    "id": 8272,
    "name": "Master Sphere"
  },
  {
    "id": 8273,
    "name": "Lv. 1 Key Sphere"
  },
  {
    "id": 8274,
    "name": "Lv. 2 Key Sphere"
  },
  {
    "id": 8275,
    "name": "Lv. 3 Key Sphere"
  },
  {
    "id": 8276,
    "name": "Lv. 4 Key Sphere"
  },
  {
    "id": 8277,
    "name": "HP Sphere"
  },
  {
    "id": 8278,
    "name": "MP Sphere"
  },
  {
    "id": 8279,
    "name": "Strength Sphere"
  },
  {
    "id": 8280,
    "name": "Defense Sphere"
  },
  {
    "id": 8281,
    "name": "Magic Sphere"
  },
  {
    "id": 8282,
    "name": "Magic Def Sphere"
  },
  {
    "id": 8283,
    "name": "Agility Sphere"
  },
  {
    "id": 8284,
    "name": "Evasion Sphere"
  },
  {
    "id": 8285,
    "name": "Accuracy Sphere"
  },
  {
    "id": 8286,
    "name": "Luck Sphere"
  },
  {
    "id": 8287,
    "name": "Clear Sphere"
  },
  {
    "id": 8288,
    "name": "Return Sphere"
  },
  {
    "id": 8289,
    "name": "Friend Sphere"
  },
  {
    "id": 8290,
    "name": "Teleport Sphere"
  },
  {
    "id": 8291,
    "name": "Warp Sphere"
  },
  {
    "id": 8292,
    "name": "Map"
  },
  {
    "id": 8293,
    "name": "Rename Card"
  },
  {
    "id": 8294,
    "name": "Musk"
  },
  {
    "id": 8295,
    "name": "Hypello Potion"
  },
  {
    "id": 8296,
    "name": "Shining Thorn"
  },
  {
    "id": 8297,
    "name": "Pendulum"
  },
  {
    "id": 8298,
    "name": "Amulet"
  },
  {
    "id": 8299,
    "name": "Door To Tomorrow"
  },
  {
    "id": 8300,
    "name": "Wings to Discovery"
  },
  {
    "id": 8301,
    "name": "Gambler's Spirit"
  },
  {
    "id": 8302,
    "name": "Underdog's Secret"
  },
  {
    "id": 8303,
    "name": "Winning Formula"
  },
  {
    "id": 12567,
    "name": "Summon"
  },
  {
    "id": 12568,
    "name": "Grand Summon"
  },
  {
    "id": 12436,
    "name": "Chaos Grenade"
  },
  {
    "id": 12458,
    "name": "Black Hole"
  },
  {
    "id": 12459,
    "name": "Sunburst"
  },
  {
    "id": 12467,
    "name": "Super Elixir"
  },
  {
    "id": 12468,
    "name": "Final Elixir"
  },
  {
    "id": 12472,
    "name": "Ultra NulAll"
  },
  {
    "id": 12476,
    "name": "Hyper Mighty G"
  },
  {
    "id": 12479,
    "name": "Hyper Vitality"
  },
  {
    "id": 12486,
    "name": "Trio of 9999"
  },
  {
    "id": 12488,
    "name": "Miracle Drink"
  },
  {
    "id": 12489,
    "name": "Hot Spurs"
  },
  {
    "id": 12490,
    "name": "Eccentrick"
  },
  {
    "id": 12515,
    "name": "Requiem"
  },
  {
    "id": 12492,
    "name": "Sonic Wings"
  },
  {
    "id": 24789,
    "name": "Energy Ray"
  },
  {
    "id": 24788,
    "name": "Energy Blast"
  },
  {
    "id": 12496,
    "name": "Meteor Strike"
  },
  {
    "id": 24791,
    "name": "Hellfire"
  },
  {
    "id": 12499,
    "name": "Aerospark"
  },
  {
    "id": 24793,
    "name": "Thor's Hammer"
  },
  {
    "id": 12502,
    "name": "Heavenly Strike"
  },
  {
    "id": 24795,
    "name": "Diamond Dust"
  },
  {
    "id": 12505,
    "name": "Impulse"
  },
  {
    "id": 24797,
    "name": "Mega Flare"
  },
  {
    "id": 12508,
    "name": "Pain"
  },
  {
    "id": 24799,
    "name": "Oblivion"
  },
  {
    "id": 12513,
    "name": "Wakizashi"
  },
  {
    "id": 12514,
    "name": "Zanmato"
  },
  {
    "id": 16606,
    "name": "Cindy Mighty Guard"
  },
  {
    "id": 12517,
    "name": "Camisade"
  },
  {
    "id": 12519,
    "name": "Razzia"
  },
  {
    "id": 12521,
    "name": "Passado"
  },
  {
    "id": 24806,
    "name": "Delta Attack"
  },
  {
    "id": 16388,
    "name": "Seed Burst"
  },
  {
    "id": 16450,
    "name": "Bomb Self-Destruct"
  },
  {
    "id": 16426,
    "name": "Ochu Earthquake"
  },
  {
    "id": 16399,
    "name": "Berserk"
  },
  {
    "id": 16431,
    "name": "Maelstrom"
  },
  {
    "id": 16404,
    "name": "Thrust Kick"
  },
  {
    "id": 16389,
    "name": "Sand Worm Swallow"
  },
  {
    "id": 16392,
    "name": "Sand Worm Earthquake"
  },
  {
    "id": 24690,
    "name": "Confuse"
  },
  {
    "id": 16405,
    "name": "Water Spurt"
  },
  {
    "id": 16417,
    "name": "Sonic Wave"
  },
  {
    "id": 16402,
    "name": "Rifle"
  },
  {
    "id": 16403,
    "name": "Flamethrower"
  },
  {
    "id": 16519,
    "name": "Wrong!"
  },
  {
    "id": 16425,
    "name": "Electrocute"
  },
  {
    "id": 16393,
    "name": "Splasher Self-Destruct"
  },
  {
    "id": 16442,
    "name": "Emblem of Fate"
  },
  {
    "id": 24589,
    "name": "Doze Ball"
  },
  {
    "id": 24590,
    "name": "Blind Ball"
  },
  {
    "id": 24591,
    "name": "Mute Ball"
  },
  {
    "id": 24588,
    "name": "Blitzball Rush"
  },
  {
    "id": 24610,
    "name": "Gatling Gun"
  },
  {
    "id": 24609,
    "name": "Mana Beam"
  },
  {
    "id": 24691,
    "name": "Guided Missiles"
  },
  {
    "id": 24745,
    "name": "Mortibsorption"
  },
  {
    "id": 24819,
    "name": "Dispel All"
  },
  {
    "id": 24692,
    "name": "Cross Cleave"
  },
  {
    "id": 24688,
    "name": "Blind"
  },
  {
    "id": 24689,
    "name": "Sleep"
  },
  {
    "id": 24704,
    "name": "Hellbiter"
  },
  {
    "id": 24705,
    "name": "Mind Blast"
  },
  {
    "id": 24706,
    "name": "Mega Death"
  },
  {
    "id": 24773,
    "name": "Negation"
  },
  {
    "id": 24724,
    "name": "Gravija"
  },
  {
    "id": 24732,
    "name": "Giga-Graviton"
  },
  {
    "id": 24698,
    "name": "Osmose"
  },
  {
    "id": 24699,
    "name": "Curse"
  },
  {
    "id": 24708,
    "name": "Jecht Beam"
  },
  {
    "id": 24776,
    "name": "Jecht Bomber"
  },
  {
    "id": 24777,
    "name": "Triumphant Grasp"
  },
  {
    "id": 24710,
    "name": "Ultimate Jecht Shot"
  },
  {
    "id": 24629,
    "name": "Lord Ochu falls asleep."
  },
  {
    "id": 24622,
    "name": "Geosgaeno Swallow"
  },
  {
    "id": 16562,
    "name": "Paean of the Heavens"
  },
  {
    "id": 16564,
    "name": "Putrid Breath"
  },
  {
    "id": 16565,
    "name": "Mega Gastric Juice"
  },
  {
    "id": 16567,
    "name": "Gastric Juice Blast"
  },
  {
    "id": 16569,
    "name": "Hyper Blaster"
  },
  {
    "id": 16610,
    "name": "Space-Time Vorpal"
  },
  {
    "id": 16626,
    "name": "99999 Needles"
  },
  {
    "id": 16573,
    "name": "Hades Claws"
  },
  {
    "id": 16623,
    "name": "Pop Fly"
  },
  {
    "id": 16578,
    "name": "Fangs of Hell"
  },
  {
    "id": 16581,
    "name": "Drain Touch"
  },
  {
    "id": 16582,
    "name": "Poison Touch"
  },
  {
    "id": 16589,
    "name": "Venemous Stab"
  },
  {
    "id": 16579,
    "name": "Black Stare"
  },
  {
    "id": 16580,
    "name": "Shockwave"
  },
  {
    "id": 16598,
    "name": "Goodnight"
  },
  {
    "id": 16592,
    "name": "Salvo"
  },
  {
    "id": 16597,
    "name": "Shinryudan"
  },
  {
    "id": 16631,
    "name": "Toxic Cloud"
  },
  {
    "id": 16636,
    "name": "Condemn"
  },
  {
    "id": 16634,
    "name": "Rainbow"
  },
  {
    "id": 16635,
    "name": "Convergence"
  },
  {
    "id": 24767,
    "name": "Slime"
  },
  {
    "id": 16638,
    "name": "Contamination"
  },
  {
    "id": 16575,
    "name": "Shining"
  },
  {
    "id": 16630,
    "name": "Eraser"
  },
  {
    "id": 16600,
    "name": "Ethereal Cannon"
  },
  {
    "id": 16601,
    "name": "Ultra Spark"
  },
  {
    "id": 16628,
    "name": "Armageddon"
  },
  {
    "id": 16663,
    "name": "Dark Shiva Heavenly Strike"
  },
  {
    "id": 16660,
    "name": "Dark Ixion Attack 1"
  },
  {
    "id": 16661,
    "name": "Dark Ixion Attack 2"
  },
  {
    "id": 16659,
    "name": "Thundaja"
  },
  {
    "id": 16662,
    "name": "Dark Ixion Aerospark"
  },
  {
    "id": 16667,
    "name": "Dark Bahamut Impulse"
  },
  {
    "id": 16668,
    "name": "Dark Anima Attack"
  },
  {
    "id": 16669,
    "name": "Dark Anima Pain"
  },
  {
    "id": 16649,
    "name": "Dark Yojimbo Wakizashi"
  },
  {
    "id": 16683,
    "name": "Extra 44 (Dispel Attack)"
  },
  {
    "id": 16641,
    "name": "Dark Cindy Camisade"
  },
  {
    "id": 16679,
    "name": "Dark Sandy Attack"
  },
  {
    "id": 16644,
    "name": "Calamity"
  },
  {
    "id": 16642,
    "name": "Dark Mindy Passado"
  },
  {
    "id": 16646,
    "name": "Dark Cindy Delta Attack"
  },
  {
    "id": 16681,
    "name": "Tera-Graviton"
  },
  {
    "id": 16682,
    "name": "Penance Mighty Guard"
  },
  {
    "id": 16672,
    "name": "Obliteration"
  },
  {
    "id": 16671,
    "name": "Immolation"
  },
  {
    "id": 16673,
    "name": "Judgment Day"
  },
  {
    "id": 24695,
    "name": "Biora"
  },
  {
    "id": 24807,
    "name": "Possess Valefor"
  },
  {
    "id": 24808,
    "name": "Possess Ifrit"
  },
  {
    "id": 24809,
    "name": "Possess Ixion"
  },
  {
    "id": 24810,
    "name": "Possess Shiva"
  },
  {
    "id": 24811,
    "name": "Possess Bahamut"
  },
  {
    "id": 24813,
    "name": "Possess Anima"
  },
  {
    "id": 24812,
    "name": "Possess Yojimbo"
  },
  {
    "id": 24814,
    "name": "Possess Magus Sisters"
  }
];

export const KEY_ITEMS_LIST: {
  name: string;
  category: "Key Items" | "Celestial" | "Al Bhed Primers";
  accessors: { offset: number; bit: number }[];
}[] = [
  { name: "Cloudy Mirror", category: "Celestial", accessors: [{ offset: 17612, bit: 2 }] },
  { name: "Celestial Mirror", category: "Celestial", accessors: [{ offset: 17612, bit: 3 }, { offset: 3192, bit: 0 }] },
  { name: "Withered Bouquet", category: "Key Items", accessors: [{ offset: 17612, bit: 0 }, { offset: 940, bit: 0 }] },
  { name: "Flint", category: "Key Items", accessors: [{ offset: 17612, bit: 1 }, { offset: 941, bit: 0 }] },
  { name: "Summoner's Soul", category: "Key Items", accessors: [{ offset: 17612, bit: 30 }] },
  { name: "Aeon's Soul", category: "Key Items", accessors: [{ offset: 17612, bit: 31 }] },
  { name: "Jecht's Sphere", category: "Key Items", accessors: [{ offset: 17612, bit: 32 }] },
  { name: "Rusty Sword", category: "Celestial", accessors: [{ offset: 17612, bit: 33 }] },
  { name: "Sun Crest (Tidus)", category: "Celestial", accessors: [{ offset: 17612, bit: 35 }] },
  { name: "Sun Sigil (Tidus)", category: "Celestial", accessors: [{ offset: 17612, bit: 36 }] },
  { name: "Moon Crest (Yuna)", category: "Celestial", accessors: [{ offset: 17612, bit: 37 }] },
  { name: "Moon Sigil (Yuna)", category: "Celestial", accessors: [{ offset: 17612, bit: 38 }] },
  { name: "Mars Crest (Auron)", category: "Celestial", accessors: [{ offset: 17612, bit: 39 }] },
  { name: "Mars Sigil (Auron)", category: "Celestial", accessors: [{ offset: 17612, bit: 40 }] },
  { name: "Saturn Crest (Kimahri)", category: "Celestial", accessors: [{ offset: 17612, bit: 42 }] },
  { name: "Saturn Sigil (Kimahri)", category: "Celestial", accessors: [{ offset: 17612, bit: 43 }] },
  { name: "Jupiter Crest (Wakka)", category: "Celestial", accessors: [{ offset: 17612, bit: 44 }] },
  { name: "Jupiter Sigil (Wakka)", category: "Celestial", accessors: [{ offset: 17612, bit: 45 }] },
  { name: "Venus Crest (Lulu)", category: "Celestial", accessors: [{ offset: 17612, bit: 46 }] },
  { name: "Venus Sigil (Lulu)", category: "Celestial", accessors: [{ offset: 17612, bit: 47 }] },
  { name: "Mercury Crest (Rikku)", category: "Celestial", accessors: [{ offset: 17612, bit: 48 }] },
  { name: "Mercury Sigil (Rikku)", category: "Celestial", accessors: [{ offset: 17612, bit: 49 }] },
  { name: "Blossom Crown", category: "Key Items", accessors: [{ offset: 17612, bit: 50 }] },
  { name: "Flower Scepter", category: "Key Items", accessors: [{ offset: 17612, bit: 51 }] },
  { name: "Mark of Conquest", category: "Key Items", accessors: [{ offset: 17612, bit: 41 }] },
  ...Array.from({ length: 26 }, (_, i) => {
    const roman = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI"][i];
    return {
      name: `Al Bhed Primer ${roman}`,
      category: "Al Bhed Primers" as const,
      accessors: [
        { offset: 17612, bit: 4 + i },
        { offset: 15696, bit: i },
      ],
    };
  }),
];

export const AUTO_ABILITIES_LIST: IdName[] = [
  {
    "id": 255,
    "name": "Empty"
  },
  {
    "id": 32891,
    "name": "Aeon Immunities"
  },
  {
    "id": 32775,
    "name": "Alchemy"
  },
  {
    "id": 32854,
    "name": "Auto-Haste"
  },
  {
    "id": 32777,
    "name": "Auto-Med"
  },
  {
    "id": 32778,
    "name": "Auto-Phoenix"
  },
  {
    "id": 32776,
    "name": "Auto-Potion"
  },
  {
    "id": 32853,
    "name": "Auto-Protect"
  },
  {
    "id": 32856,
    "name": "Auto-Reflect"
  },
  {
    "id": 32855,
    "name": "Auto-Regen"
  },
  {
    "id": 32852,
    "name": "Auto-Shell"
  },
  {
    "id": 32849,
    "name": "Beserk Ward"
  },
  {
    "id": 32848,
    "name": "Beserkproof"
  },
  {
    "id": 32793,
    "name": "Break Damage Limit"
  },
  {
    "id": 32791,
    "name": "Break HP Limit"
  },
  {
    "id": 32792,
    "name": "Break MP Limit"
  },
  {
    "id": 32890,
    "name": "Capture"
  },
  {
    "id": 32847,
    "name": "Confuse Ward"
  },
  {
    "id": 32846,
    "name": "Confuseproof"
  },
  {
    "id": 32771,
    "name": "Counterattack"
  },
  {
    "id": 32851,
    "name": "Curse Ward"
  },
  {
    "id": 32850,
    "name": "Curseproof"
  },
  {
    "id": 32841,
    "name": "Dark Ward"
  },
  {
    "id": 32840,
    "name": "Darkproof"
  },
  {
    "id": 32838,
    "name": "Darkstrike"
  },
  {
    "id": 32839,
    "name": "Darktouch"
  },
  {
    "id": 32817,
    "name": "Death Ward"
  },
  {
    "id": 32816,
    "name": "Deathproof"
  },
  {
    "id": 32814,
    "name": "Deathstrike"
  },
  {
    "id": 32815,
    "name": "Deathtouch"
  },
  {
    "id": 32874,
    "name": "Defense +3%"
  },
  {
    "id": 32875,
    "name": "Defense +5%"
  },
  {
    "id": 32876,
    "name": "Defense +10%"
  },
  {
    "id": 32877,
    "name": "Defense +20%"
  },
  {
    "id": 32895,
    "name": "Distill Ability"
  },
  {
    "id": 32893,
    "name": "Distill Mana"
  },
  {
    "id": 32892,
    "name": "Distill Power"
  },
  {
    "id": 32894,
    "name": "Distill Speed"
  },
  {
    "id": 32786,
    "name": "Double AP"
  },
  {
    "id": 32782,
    "name": "Double Overdrive"
  },
  {
    "id": 32772,
    "name": "Evade & Counter"
  },
  {
    "id": 32801,
    "name": "Fire Eater"
  },
  {
    "id": 32799,
    "name": "Fire Ward"
  },
  {
    "id": 32800,
    "name": "Fireproof"
  },
  {
    "id": 32798,
    "name": "Firestrike"
  },
  {
    "id": 32769,
    "name": "First Strike"
  },
  {
    "id": 32794,
    "name": "Gillionaire"
  },
  {
    "id": 32780,
    "name": "Half MP Cost"
  },
  {
    "id": 32882,
    "name": "HP +5%"
  },
  {
    "id": 32883,
    "name": "HP +10%"
  },
  {
    "id": 32884,
    "name": "HP +20%"
  },
  {
    "id": 32885,
    "name": "HP +30%"
  },
  {
    "id": 32795,
    "name": "HP Stroll"
  },
  {
    "id": 32805,
    "name": "Ice Eater"
  },
  {
    "id": 32803,
    "name": "Ice Ward"
  },
  {
    "id": 32804,
    "name": "Iceproof"
  },
  {
    "id": 32802,
    "name": "Icestrike"
  },
  {
    "id": 32770,
    "name": "Initiative"
  },
  {
    "id": 32809,
    "name": "Lightning Eater"
  },
  {
    "id": 32807,
    "name": "Lightning Ward"
  },
  {
    "id": 32808,
    "name": "Lightningproof"
  },
  {
    "id": 32806,
    "name": "Lightningstrike"
  },
  {
    "id": 32870,
    "name": "Magic +3%"
  },
  {
    "id": 32871,
    "name": "Magic +5%"
  },
  {
    "id": 32872,
    "name": "Magic +10%"
  },
  {
    "id": 32873,
    "name": "Magic +20%"
  },
  {
    "id": 32774,
    "name": "Magic Booster"
  },
  {
    "id": 32773,
    "name": "Magic Counter"
  },
  {
    "id": 32878,
    "name": "Magic Def +3%"
  },
  {
    "id": 32879,
    "name": "Magic Def +5%"
  },
  {
    "id": 32880,
    "name": "Magic Def +10%"
  },
  {
    "id": 32881,
    "name": "Magic Def +20%"
  },
  {
    "id": 32790,
    "name": "Master Thief"
  },
  {
    "id": 32886,
    "name": "MP +5%"
  },
  {
    "id": 32887,
    "name": "MP +10%"
  },
  {
    "id": 32888,
    "name": "MP +20%"
  },
  {
    "id": 32889,
    "name": "MP +30%"
  },
  {
    "id": 32796,
    "name": "MP Stroll"
  },
  {
    "id": 32788,
    "name": "No AP"
  },
  {
    "id": 32797,
    "name": "No Encounters"
  },
  {
    "id": 32781,
    "name": "One MP Cost"
  },
  {
    "id": 32785,
    "name": "Overdrive \\u2192 AP"
  },
  {
    "id": 32789,
    "name": "Pickpocket"
  },
  {
    "id": 32779,
    "name": "Piercing"
  },
  {
    "id": 32829,
    "name": "Poison Ward"
  },
  {
    "id": 32828,
    "name": "Poisonproof"
  },
  {
    "id": 32826,
    "name": "Poisonstrike"
  },
  {
    "id": 32827,
    "name": "Poisontouch"
  },
  {
    "id": 32896,
    "name": "Ribbon"
  },
  {
    "id": 32837,
    "name": "Silence Ward"
  },
  {
    "id": 32836,
    "name": "Silenceproof"
  },
  {
    "id": 32834,
    "name": "Silencestrike"
  },
  {
    "id": 32835,
    "name": "Silencetouch"
  },
  {
    "id": 32833,
    "name": "Sleep Ward"
  },
  {
    "id": 32832,
    "name": "Sleepproof"
  },
  {
    "id": 32830,
    "name": "Sleepstrike"
  },
  {
    "id": 32831,
    "name": "Sleeptouch"
  },
  {
    "id": 32845,
    "name": "Slow Ward"
  },
  {
    "id": 32844,
    "name": "Slowproof"
  },
  {
    "id": 32842,
    "name": "Slowstrike"
  },
  {
    "id": 32843,
    "name": "Slowtouch"
  },
  {
    "id": 32859,
    "name": "SOS Haste"
  },
  {
    "id": 32865,
    "name": "SOS NulBlaze"
  },
  {
    "id": 32863,
    "name": "SOS NulFrost"
  },
  {
    "id": 32864,
    "name": "SOS NulShock"
  },
  {
    "id": 32862,
    "name": "SOS NulTide"
  },
  {
    "id": 32784,
    "name": "SOS Overdrive"
  },
  {
    "id": 32858,
    "name": "SOS Protect"
  },
  {
    "id": 32861,
    "name": "SOS Reflect"
  },
  {
    "id": 32860,
    "name": "SOS Regen"
  },
  {
    "id": 32857,
    "name": "SOS Shell"
  },
  {
    "id": 32825,
    "name": "Stone Ward"
  },
  {
    "id": 32824,
    "name": "Stoneproof"
  },
  {
    "id": 32822,
    "name": "Stonestrike"
  },
  {
    "id": 32823,
    "name": "Stonetouch"
  },
  {
    "id": 32866,
    "name": "Strength +3%"
  },
  {
    "id": 32867,
    "name": "Strength +5%"
  },
  {
    "id": 32868,
    "name": "Strength +10%"
  },
  {
    "id": 32869,
    "name": "Strength +20%"
  },
  {
    "id": 32787,
    "name": "Triple AP"
  },
  {
    "id": 32783,
    "name": "Triple Overdrive"
  },
  {
    "id": 32813,
    "name": "Water Eater"
  },
  {
    "id": 32811,
    "name": "Water Ward"
  },
  {
    "id": 32812,
    "name": "Waterproof"
  },
  {
    "id": 32810,
    "name": "Waterstrike"
  },
  {
    "id": 32821,
    "name": "Zombie Ward"
  },
  {
    "id": 32820,
    "name": "Zombieproof"
  },
  {
    "id": 32818,
    "name": "Zombiestrike"
  },
  {
    "id": 32819,
    "name": "Zombietouch"
  },
  {
    "id": 0,
    "name": "Nothing"
  }
];

export const EQUIP_APPEARANCES_LIST: IdName[] = [
  {
    "id": 255,
    "name": "Empty"
  },
  {
    "id": 16385,
    "name": "Brotherhood"
  },
  {
    "id": 16386,
    "name": "Longsword Red"
  },
  {
    "id": 16387,
    "name": "Longsword Runed"
  },
  {
    "id": 16388,
    "name": "Longsword Black"
  },
  {
    "id": 16389,
    "name": "Longsword Blue"
  },
  {
    "id": 16390,
    "name": "Longsword Yellow"
  },
  {
    "id": 16391,
    "name": "Caladbolg"
  },
  {
    "id": 16395,
    "name": "Staff Standard"
  },
  {
    "id": 16396,
    "name": "Staff Ball"
  },
  {
    "id": 16397,
    "name": "Staff Orange"
  },
  {
    "id": 16398,
    "name": "Staff Pink"
  },
  {
    "id": 16399,
    "name": "Staff Green"
  },
  {
    "id": 16400,
    "name": "Nirvana"
  },
  {
    "id": 16405,
    "name": "Katana Standard"
  },
  {
    "id": 16406,
    "name": "Katana Curved"
  },
  {
    "id": 16407,
    "name": "Katana Hooked"
  },
  {
    "id": 16408,
    "name": "Katana Symmetric"
  },
  {
    "id": 16409,
    "name": "Masamune"
  },
  {
    "id": 16415,
    "name": "Spear Standard"
  },
  {
    "id": 16416,
    "name": "Spear Dual Crescent"
  },
  {
    "id": 16417,
    "name": "Spear Halberd"
  },
  {
    "id": 16418,
    "name": "Spear Green"
  },
  {
    "id": 16419,
    "name": "Spear Red"
  },
  {
    "id": 16420,
    "name": "Spirit Lance"
  },
  {
    "id": 16425,
    "name": "Ball Standard"
  },
  {
    "id": 16426,
    "name": "Ball Wrapped"
  },
  {
    "id": 16427,
    "name": "Ball Twin Spike"
  },
  {
    "id": 16428,
    "name": "Ball Banded"
  },
  {
    "id": 16429,
    "name": "Ball Spiked"
  },
  {
    "id": 16430,
    "name": "World Champion"
  },
  {
    "id": 16435,
    "name": "Doll Moogle"
  },
  {
    "id": 16436,
    "name": "Doll Cait Sith"
  },
  {
    "id": 16437,
    "name": "Doll Moomba"
  },
  {
    "id": 16438,
    "name": "Doll Cactuar"
  },
  {
    "id": 16439,
    "name": "Doll PuPu"
  },
  {
    "id": 16440,
    "name": "Onion Knight"
  },
  {
    "id": 16445,
    "name": "Claw Standard"
  },
  {
    "id": 16446,
    "name": "Claw Spiked"
  },
  {
    "id": 16447,
    "name": "Claw Blocky"
  },
  {
    "id": 16448,
    "name": "Claw Blue"
  },
  {
    "id": 16449,
    "name": "Godhand"
  },
  {
    "id": 16450,
    "name": "Shield 1"
  },
  {
    "id": 16451,
    "name": "Shield 2"
  },
  {
    "id": 16452,
    "name": "Shield 3"
  },
  {
    "id": 16453,
    "name": "Shield 4"
  },
  {
    "id": 16454,
    "name": "Shield 5"
  },
  {
    "id": 16455,
    "name": "Ring 1"
  },
  {
    "id": 16456,
    "name": "Ring 2"
  },
  {
    "id": 16457,
    "name": "Ring 3"
  },
  {
    "id": 16458,
    "name": "Ring 4"
  },
  {
    "id": 16459,
    "name": "Ring 5"
  },
  {
    "id": 16460,
    "name": "Bracer 1"
  },
  {
    "id": 16461,
    "name": "Bracer 2"
  },
  {
    "id": 16462,
    "name": "Bracer 3"
  },
  {
    "id": 16463,
    "name": "Bracer 4"
  },
  {
    "id": 16464,
    "name": "Armlet 1"
  },
  {
    "id": 16465,
    "name": "Armlet 2"
  },
  {
    "id": 16466,
    "name": "Armlet 3"
  },
  {
    "id": 16467,
    "name": "Armlet 4"
  },
  {
    "id": 16468,
    "name": "Armlet 5"
  },
  {
    "id": 16469,
    "name": "Armguard 1"
  },
  {
    "id": 16470,
    "name": "Armguard 2"
  },
  {
    "id": 16471,
    "name": "Armguard 3"
  },
  {
    "id": 16472,
    "name": "Armguard 4"
  },
  {
    "id": 16473,
    "name": "Armguard 5"
  },
  {
    "id": 16474,
    "name": "Bangle 1"
  },
  {
    "id": 16475,
    "name": "Bangle 2"
  },
  {
    "id": 16476,
    "name": "Bangle 3"
  },
  {
    "id": 16477,
    "name": "Bangle 4"
  },
  {
    "id": 16478,
    "name": "Bangle 5"
  },
  {
    "id": 16479,
    "name": "Targe 1"
  },
  {
    "id": 16480,
    "name": "Targe 2"
  },
  {
    "id": 16481,
    "name": "Targe 3"
  },
  {
    "id": 16482,
    "name": "Targe 4"
  },
  {
    "id": 16484,
    "name": "Flamethrower"
  },
  {
    "id": 16485,
    "name": "Rifle"
  },
  {
    "id": 16486,
    "name": "Seymour Staff"
  },
  {
    "id": 16487,
    "name": "Seymour Armor"
  },
  {
    "id": 20503,
    "name": "Yojimbo Dog"
  },
  {
    "id": 4212,
    "name": "Dark Yojimbo Dog"
  },
  {
    "id": 12319,
    "name": "Kozuka"
  },
  {
    "id": 16392,
    "name": "Buster Sword"
  },
  {
    "id": 20583,
    "name": "Samurai Sword"
  },
  {
    "id": 20578,
    "name": "Knight Sword"
  },
  {
    "id": 20568,
    "name": "Rusty Sword"
  },
  {
    "id": 20544,
    "name": "Saw"
  },
  {
    "id": 20504,
    "name": "Video Camera"
  },
  {
    "id": 20507,
    "name": "Megaphone"
  },
  {
    "id": 20497,
    "name": "Beer Bottle"
  },
  {
    "id": 20735,
    "name": "Celestial Mirror"
  },
  {
    "id": 65404,
    "name": "Jecht Sword"
  }
];

export const DAMAGE_FORMULAS_LIST: IdName[] = [
  {
    "id": 1,
    "name": "Normal"
  },
  {
    "id": 0,
    "name": "No Damage"
  },
  {
    "id": 2,
    "name": "Ignore Defense"
  },
  {
    "id": 4,
    "name": "Ignore Magic Defense"
  },
  {
    "id": 5,
    "name": "Target HP"
  },
  {
    "id": 8,
    "name": "Target Max HP"
  },
  {
    "id": 12,
    "name": "Target MP"
  },
  {
    "id": 10,
    "name": "Target Max MP"
  },
  {
    "id": 17,
    "name": "Wielder High HP"
  },
  {
    "id": 18,
    "name": "Wielder High MP"
  },
  {
    "id": 19,
    "name": "Wielder Low HP"
  },
  {
    "id": 16,
    "name": "Wielder Max HP"
  },
  {
    "id": 3,
    "name": "Magic"
  },
  {
    "id": 7,
    "name": "Healing"
  },
  {
    "id": 15,
    "name": "Special Magic"
  },
  {
    "id": 6,
    "name": "Multiples of 50"
  },
  {
    "id": 23,
    "name": "Multiples of 9999"
  },
  {
    "id": 22,
    "name": "Target Kill Count"
  },
  {
    "id": 11,
    "name": "Target Tick Speed"
  },
  {
    "id": 13,
    "name": "Target Tick Counter"
  },
  {
    "id": 14,
    "name": "Ignore Defense (NR)"
  },
  {
    "id": 20,
    "name": "Special Magic (NR)"
  },
  {
    "id": 9,
    "name": "Multiples of 50 (R)"
  }
];

export const EQUIP_NAMES_BY_CHAR: string[][] = [
  [
    "Caladbolg",
    "Brotherhood",
    "Taming Sword",
    "Crystal Sword",
    "Excalibur",
    "Ragnarok",
    "Balmung",
    "Save the Queen",
    "Heartbreaker",
    "Lionheart",
    "Durandal",
    "Ascalon",
    "Ambitious",
    "Hrunting",
    "Longsword",
    "Astral Sword",
    "Apocalypse",
    "Longsword",
    "Longsword",
    "Master Sword",
    "Runemaster",
    "Warlock",
    "Arc Sword",
    "Gilventure",
    "Tri-Steel",
    "Helter-Skelter",
    "Vendetta",
    "Avenger",
    "P-Steel",
    "M-Steel",
    "S-Steel",
    "A-Steel",
    "Prism Steel",
    "Mirage Sword",
    "Lifesaver",
    "Sonic Steel",
    "Vigilante",
    "Dance Macabre",
    "Largamente",
    "Gravestone",
    "Sidewinder",
    "Nightmare",
    "Mage Masher",
    "Nightbringer",
    "Knight Sword",
    "Wizard Sword",
    "Double-Edge",
    "Razzmatazz",
    "Deathbringer",
    "Stunning Steel",
    "Basilisk Steel",
    "Poison Steel",
    "Lullaby Steel",
    "Muted Steel",
    "Twilight Steel",
    "Hunter's Sword",
    "Flametongue",
    "Ice Brand",
    "Lightning Steel",
    "Liquid Steel",
    "Variable Steel",
    "Force Saber",
    "Baroque Sword",
    "Sorcery Sword",
    "Soldier's Saber",
    "Rune Steel",
    "Enchanted Sword",
    "Fencing Saber",
    "Warrior's Sword",
    "Slasher",
    "Longsword",
    "Longsword",
    "Longsword",
    "Longsword",
    "Endless Road",
    "Genji Shield",
    "Emblem",
    "Crystal Shield",
    "Aegis Shield",
    "Golem Shield",
    "Revive Shield",
    "Rescue Shield",
    "Paladin Shield",
    "Diamond Shield",
    "Ruby Shield",
    "Dynasty Shield",
    "Magister Shield",
    "Collector's Shield",
    "Treasure Shield",
    "Shield of Hope",
    "Assault Shield",
    "Phantom Shield",
    "Recovery Shield",
    "Spiritual Shield",
    "Phoenix Shield",
    "Curative Shield",
    "Rainbow Shield",
    "Shining Shield",
    "Faerie Shield",
    "Peaceful Shield",
    "Shaman Shield",
    "Barrier Shield",
    "Star Shield",
    "Marching Shield",
    "Moon Shield",
    "Regen Shield",
    "Haste Shield",
    "Reflect Shield",
    "Shell Shield",
    "Protect Shield",
    "Buckler",
    "Platinum Shield",
    "Sapphire Shield",
    "Knight's Shield",
    "Wizard Shield",
    "Elemental Shield",
    "Defending Shield",
    "Crimson Shield",
    "Snow Shield",
    "Ochre Shield",
    "Cerulean Shield",
    "Medical Shield",
    "Lucid Shield",
    "Serene Shield",
    "Light Shield",
    "Soul Shield",
    "Blessed Shield",
    "Soft Shield",
    "Serum Shield",
    "Alert Shield",
    "Echo Shield",
    "Bright Shield",
    "Red Shield",
    "White Shield",
    "Yellow Shield",
    "Blue Shield",
    "NulTide Shield",
    "NulBlaze Shield",
    "NulShock Shield",
    "NulFrost Shield",
    "Adept's Shield",
    "Tetra Shield",
    "Mythril Shield",
    "Gold Shield",
    "Emerald Shield",
    "Soldier's Shield",
    "Mage's Shield",
    "Silver Shield",
    "Onyx Shield",
    "Sorcery Shield",
    "Warrior's Shield",
    "Glorious Shield",
    "Metal Shield",
    "Pearl Shield",
    "Magic Shield",
    "Seeker's Shield",
    "Shield",
    "Buckler",
    "Sanctuary",
    "Buckler",
    "Buckler",
    "Buckler",
    "Buckler",
    "Buckler",
    "Buckler",
    "Buckler",
    "Buckler",
    "Buckler",
    "Buckler",
    "Buckler",
    "-"
  ],
  [
    "Nirvana",
    "Staff",
    "Herding Staff",
    "Arc Arcana",
    "Abraxas",
    "Heavenly Axis",
    "Judgment",
    "Seraphim Rod",
    "Rod of Roses",
    "Nimbus Rod",
    "Wonder Wing",
    "Wing Wand",
    "Wonder Wand",
    "Laevatein",
    "Staff",
    "Astral Rod",
    "Chaos Rod",
    "Staff",
    "Staff",
    "Power Staff",
    "Shining Staff",
    "Faerie Staff",
    "Magistral Rod",
    "El Dorado",
    "Tri-Rod",
    "Wicked Wand",
    "Nemesis Rod",
    "Defender",
    "P-Staff",
    "M-Staff",
    "S-Staff",
    "A-Staff",
    "Prism Rod",
    "Mirage Rod",
    "Healing Rod",
    "Wind Rod",
    "Conductor",
    "Punisher",
    "Impasse",
    "Calcite Staff",
    "Bizarre Staff",
    "Staff of Thorns",
    "Reticent Staff",
    "Darkness Staff",
    "Monk Staff",
    "Mage's Staff",
    "Dual Rod",
    "Ominous Rod",
    "Death Wand",
    "Entangling Rod",
    "Break Rod",
    "Beladonna Wand",
    "Lullaby Rod",
    "Rod of Silence",
    "Rod of Darkness",
    "Rod of Wisdom",
    "Rod of Fire",
    "Rod of Ice",
    "Rod of Lightning",
    "Rod of Water",
    "Malleable Staff",
    "Force Rod",
    "Ductile Rod",
    "Sorcery Rod",
    "Full Metal Rod",
    "Rune Rod",
    "Enchanted Rod",
    "Rod of Striking",
    "Rod of Beating",
    "Spiked Rod",
    "Staff",
    "Staff",
    "Staff",
    "Staff",
    "Solomon Ring",
    "Arcane Ring",
    "Mythical Ring",
    "Sophia Ring",
    "Aegis Ring",
    "Sheltering Ring",
    "Saviour Ring",
    "Healing Ring",
    "Forbidding Ring",
    "Diamond Ring",
    "Ruby Ring",
    "Fortitude Ring",
    "Magical Ring",
    "Collector Ring",
    "Treasure Ring",
    "Ring of Hope",
    "Assault Ring",
    "Phantom Ring",
    "Recovery Ring",
    "Spiritual Ring",
    "Phoenix Ring",
    "Curative Ring",
    "Rainbow Ring",
    "Shining Ring",
    "Faerie Ring",
    "Peaceful Ring",
    "Shaman Ring",
    "Barrier Ring",
    "Star Ring",
    "Marching Ring",
    "Moon Ring",
    "Regen Ring",
    "Haste Ring",
    "Reflect Ring",
    "Shell Ring",
    "Protect Ring",
    "Ring",
    "Platinum Ring",
    "Sapphire Ring",
    "Power Ring",
    "Wizard Ring",
    "Elemental Ring",
    "Defending Ring",
    "Crimson Ring",
    "Snow Ring",
    "Ochre Ring",
    "Cerulean Ring",
    "Medical Ring",
    "Lucid Ring",
    "Serene Ring",
    "Light Ring",
    "Soul Ring",
    "Blessed Ring",
    "Soft Ring",
    "Serum Ring",
    "Alert Ring",
    "Echo Ring",
    "Bright Ring",
    "Red Ring",
    "White Ring",
    "Yellow Ring",
    "Blue Ring",
    "NulTide Ring",
    "NulBlaze Ring",
    "NulShock Ring",
    "NulFrost Ring",
    "Adept's Ring",
    "Tetra Ring",
    "Mythril Ring",
    "Gold Ring",
    "Emerald Ring",
    "Soldier's Ring",
    "Mage's Ring",
    "Silver Ring",
    "Onyx Ring",
    "Sorcery Ring",
    "Tough Ring",
    "Glorious Ring",
    "Metal Ring",
    "Pearl Ring",
    "Magic Ring",
    "Seeker's Ring",
    "Wide Ring",
    "Ring",
    "Holy Ring",
    "Ring",
    "Ring",
    "Ring",
    "Ring",
    "Ring",
    "Ring",
    "Ring",
    "Ring",
    "Ring",
    "Ring",
    "Ring",
    "-"
  ],
  [
    "Masamune",
    "Dull Blade",
    "Beastmaster",
    "Conqueror",
    "Heaven's Cloud",
    "Muramasa",
    "Alkaid",
    "Peacemaker",
    "Genji Blade",
    "Dragonkiller",
    "Painkiller",
    "Divider",
    "The Nameless",
    "Ogrekiller",
    "Dull Blade",
    "Murasame",
    "Riot Blade",
    "Dull Blade",
    "Dull Blade",
    "Master Ogre",
    "Master Djinn",
    "Matoya's Blade",
    "Inducer",
    "Gilmonger",
    "Ichimonji",
    "Corruptor",
    "Ashura",
    "Kotetsu",
    "P-Blade",
    "M-Blade",
    "S-Blade",
    "A-Blade",
    "Prism Blade",
    "Mirage Blade",
    "Lifegiver",
    "Sonic Blade",
    "Sentry",
    "Assassin Blade",
    "Blockade",
    "Stillblade",
    "Venomous Blade",
    "Dozing Blade",
    "Tacit Blade",
    "Dark Blade",
    "Ogre Blade",
    "Djinn Blade",
    "Dual Blade",
    "Chaos Blade",
    "Critical Blade",
    "Stunner",
    "Gorgon Gaze",
    "Spider's Kiss",
    "Peaceful Slumber",
    "Soundless Scream",
    "Blurry Moon",
    "Hunter's Blade",
    "Fire Blade",
    "Frost Blade",
    "Thunder Blade",
    "Water Blade",
    "Shiranui",
    "Basara Blade",
    "Shimmering Blade",
    "Spiritual Blade",
    "Knight Blade",
    "Rune Blade",
    "Magic Blade",
    "Warblade",
    "Nodachi",
    "Katana",
    "Dull Blade",
    "Dull Blade",
    "Dull Blade",
    "Dull Blade",
    "Overlord",
    "Genji Bracer",
    "Dragon Lord",
    "Glutton",
    "Resistant",
    "Warder",
    "Immortal",
    "Healer",
    "Undefeated",
    "Diamond Bracer",
    "Ruby Bracer",
    "Battle Bracer",
    "Magical Bracer",
    "Collector Bracer",
    "Treasure Bracer",
    "Bracer of Hope",
    "Assault Bracer",
    "Phantom Bracer",
    "Recovery Bracer",
    "Spiritual Bracer",
    "Phoenix Bracer",
    "Curative Bracer",
    "Rainbow Bracer",
    "Shining Bracer",
    "Faerie Bracer",
    "Peaceful Bracer",
    "Shaman Bracer",
    "Barrier Bracer",
    "Star Bracer",
    "Marching Bracer",
    "Moon Bracer",
    "Regen Bracer",
    "Haste Bracer",
    "Reflect Bracer",
    "Shell Bracer",
    "Protect Bracer",
    "Bracer",
    "Platinum Bracer",
    "Sapphire Bracer",
    "Knight's Bracer",
    "Wizard Bracer",
    "Elemental Bracer",
    "Defending Bracer",
    "Crimson Bracer",
    "Snow Bracer",
    "Ochre Bracer",
    "Cerulean Bracer",
    "Medical Bracer",
    "Lucid Bracer",
    "Serene Bracer",
    "Light Bracer",
    "Soul Bracer",
    "Blessed Bracer",
    "Soft Bracer",
    "Serum Bracer",
    "Alert Bracer",
    "Echo Bracer",
    "Bright Bracer",
    "Red Bracer",
    "White Bracer",
    "Yellow Bracer",
    "Blue Bracer",
    "NulTide Bracer",
    "NulBlaze Bracer",
    "NulShock Bracer",
    "NulFrost Bracer",
    "Adept's Bracer",
    "Tetra Bracer",
    "Mythril Bracer",
    "Gold Bracer",
    "Emerald Bracer",
    "Soldier's Bracer",
    "Mage's Bracer",
    "Silver Bracer",
    "Onyx Bracer",
    "Sorcery Bracer",
    "Warrior's Bracer",
    "Glorious Bracer",
    "Metal Bracer",
    "Pearl Bracer",
    "Magic Bracer",
    "Seeker's Bracer",
    "Guardian Bracer",
    "Bracer",
    "Solidity",
    "Bracer",
    "Bracer",
    "Bracer",
    "Bracer",
    "Bracer",
    "Bracer",
    "Bracer",
    "Bracer",
    "Bracer",
    "Bracer",
    "Bracer",
    "-"
  ],
  [
    "Spirit Lance",
    "Spear",
    "Taming Spear",
    "Quadforce",
    "Gungnir",
    "Luin",
    "Gae Bolg",
    "Venus Gospel",
    "Highwind",
    "Berserker",
    "Horn of the Ronso",
    "Chariot",
    "Transmuter",
    "Kain's Lance",
    "Spear",
    "Astral Spear",
    "Chaos Lance",
    "Spear",
    "Spear",
    "Giant Spear",
    "Titan Lance",
    "Eldritch Lance",
    "Shamanic Spear",
    "Prospector",
    "Trident",
    "Vicious Lance",
    "Dragoon Lance",
    "Rebel Lance",
    "P-Lance",
    "M-Lance",
    "S-Lance",
    "A-Lance",
    "Prism Spear",
    "Mirage Lance",
    "Healer Spear",
    "Sonic Lance",
    "Detector",
    "Thanatos Lance",
    "Net Spear",
    "Rock Buster",
    "Venom Spike",
    "Hypnos Spear",
    "Mage Hunter",
    "Darkbringer",
    "Knight Lance",
    "Wizard Lance",
    "Twin Lance",
    "Calamity Spear",
    "Matador Spear",
    "Web Lance",
    "Break Lance",
    "Snakehead",
    "Dream Lance",
    "Silent Spear",
    "Dusk Lance",
    "Hunter's Spear",
    "Heat Lance",
    "Ice Lance",
    "Thunder Spear",
    "Tidal Spear",
    "Shapeshifter",
    "Force Lance",
    "Halberd",
    "Magic Lance",
    "Full Metal Spear",
    "Rune Lance",
    "Enchanted Lance",
    "Striking Spear",
    "Heavy Spear",
    "Harpoon",
    "Spear",
    "Spear",
    "Spear",
    "Spear",
    "Pride of the Ronso",
    "Genji Armlet",
    "Sage's Armlet",
    "Crystal Armlet",
    "Aegis Armlet",
    "Adamantite",
    "Orichalcum",
    "Safe Passage",
    "Ronso Armlet",
    "Diamond Armlet",
    "Ruby Armlet",
    "Enhanced Armlet",
    "Magical Armlet",
    "Collector Armlet",
    "Treasure Armlet",
    "Armlet of Hope",
    "Assault Armlet",
    "Phantom Armlet",
    "Recovery Armlet",
    "Spiritual Armlet",
    "Phoenix Armlet",
    "Curative Armlet",
    "Rainbow Armlet",
    "Shining Armlet",
    "Faerie Armlet",
    "Peaceful Armlet",
    "Shaman Armlet",
    "Barrier Armlet",
    "Star Armlet",
    "Marching Armlet",
    "Moon Armlet",
    "Regen Armlet",
    "Haste Armlet",
    "Reflect Armlet",
    "Shell Armlet",
    "Protect Armlet",
    "Armlet",
    "Platinum Armlet",
    "Sapphire Armlet",
    "Knight's Armlet",
    "Wizard Armlet",
    "Elemental Armlet",
    "Defending Armlet",
    "Crimson Armlet",
    "Snow Armlet",
    "Ochre Armlet",
    "Cerulean Armlet",
    "Medical Armlet",
    "Lucid Armlet",
    "Serene Armlet",
    "Light Armlet",
    "Soul Armlet",
    "Blessed Armlet",
    "Soft Armlet",
    "Serum Armlet",
    "Alert Armlet",
    "Echo Armlet",
    "Bright Armlet",
    "Red Armlet",
    "White Armlet",
    "Yellow Armlet",
    "Blue Armlet",
    "NulTide Armlet",
    "NulBlaze Armlet",
    "NulShock Armlet",
    "NulFrost Armlet",
    "Adept's Armlet",
    "Tetra Armlet",
    "Mythril Armlet",
    "Gold Armlet",
    "Emerald Armlet",
    "Soldier's Armlet",
    "Mage's Armlet",
    "Silver Armlet",
    "Onyx Armlet",
    "Sorcery Armlet",
    "Warrior's Armlet",
    "Glorious Armlet",
    "Metal Armlet",
    "Pearl Armlet",
    "Magic Armlet",
    "Seeker's Armlet",
    "Guardian Armlet",
    "Armlet",
    "Acropolis",
    "Armlet",
    "Armlet",
    "Armlet",
    "Armlet",
    "Armlet",
    "Armlet",
    "Armlet",
    "Armlet",
    "Armlet",
    "Armlet",
    "Armlet",
    "-"
  ],
  [
    "World Champion",
    "Official Ball",
    "Catcher",
    "Four-on-One",
    "Grand Slam",
    "Blowout",
    "Rout",
    "Tie Breaker",
    "Winning Streak",
    "Scoring Spree",
    "Triple Score",
    "Double Score",
    "Rookie Star",
    "Buzzerbeater",
    "Official Ball",
    "Overtime",
    "Penalty Master",
    "Official Ball",
    "Official Ball",
    "Ace Striker",
    "Ace Wizard",
    "Over the Top",
    "Halftime",
    "Free Agent",
    "Tricolor",
    "Triple Penalty",
    "Turnover",
    "Rematch",
    "P-Ball",
    "M-Ball",
    "S-Ball",
    "A-Ball",
    "Prism Ball",
    "Mirage Ball",
    "Comeback",
    "Breakaway",
    "First Goal",
    "Sudden Death",
    "Timeout",
    "Stone Cold",
    "Violation",
    "Sleeper",
    "Muffler",
    "Blackout",
    "Power Play",
    "Virtuoso",
    "Double Header",
    "Double Penalty",
    "Rough Play",
    "Delay of Game",
    "T.K.O.",
    "Rulebreaker",
    "Dream Team",
    "Noisebreaker",
    "Blind Pass",
    "Scout",
    "Fire Ball",
    "Ice Ball",
    "Thunder Ball",
    "Water Ball",
    "All-Rounder",
    "Ovation",
    "Switch Hitter",
    "Trickster",
    "Striker",
    "Rune Ball",
    "Magic Ball",
    "Hyper Ball",
    "Power Ball",
    "Center Forward",
    "Official Ball",
    "Official Ball",
    "Official Ball",
    "Official Ball",
    "Indomitable",
    "Super Goalie",
    "High Spirits",
    "Final Four",
    "Great Four",
    "The Guardian",
    "Automatic",
    "First Aid",
    "Keeper",
    "Diamond Armguard",
    "Ruby Armguard",
    "Power Ace",
    "Magic Ace",
    "Best Play",
    "Great Play",
    "Benchwarmer",
    "Triple Save",
    "Element Save",
    "Recovery Armguard",
    "Spiritual Armguard",
    "Miracle Comeback",
    "Top Shape",
    "Miracle Save",
    "Last-Ditch",
    "Triple Guard",
    "Off-Season",
    "Shaman Armguard",
    "Hat Trick",
    "Pep Talk",
    "Auto Armguard",
    "Danger Armguard",
    "Second Wind",
    "Fast Break",
    "Reflect Armguard",
    "Shell Armguard",
    "Protect Armguard",
    "Armguard",
    "Platinum Armguard",
    "Sapphire Armguard",
    "Power Armguard",
    "Energy Armguard",
    "Elemental Armguard",
    "Low Risk",
    "Crimson Armguard",
    "Snow Armguard",
    "Ochre Armguard",
    "Cerulean Armguard",
    "Medical Armguard",
    "Lucid Armguard",
    "Serene Armguard",
    "Light Armguard",
    "Soul Armguard",
    "Blessed Armguard",
    "Soft Armguard",
    "Serum Armguard",
    "Alert Armguard",
    "Echo Armguard",
    "Bright Armguard",
    "Red Armguard",
    "White Armguard",
    "Yellow Armguard",
    "Blue Armguard",
    "NulTide Armguard",
    "NulBlaze Armguard",
    "NulShock Armguard",
    "NulFrost Armguard",
    "Adept's Armguard",
    "Tetra Armguard",
    "Mythril Armguard",
    "Gold Armguard",
    "Emerald Armguard",
    "Soldier's Armguard",
    "Mage's Armguard",
    "Silver Armguard",
    "Onyx Armguard",
    "Sorcery Armguard",
    "Warrior's Armguard",
    "Glorious Armguard",
    "Metal Armguard",
    "Pearl Armguard",
    "Magic Armguard",
    "Seeker's Armguard",
    "Guardian Armguard",
    "Armguard",
    "Shutout",
    "Armguard",
    "Armguard",
    "Armguard",
    "Armguard",
    "Armguard",
    "Armguard",
    "Armguard",
    "Armguard",
    "Armguard",
    "Armguard",
    "Armguard",
    "-"
  ],
  [
    "Onion Knight",
    "Moogle",
    "Trapper Mog",
    "Moomba Quartet",
    "Soul of Mog",
    "Space Soul",
    "Space Master",
    "Space King",
    "Space Force",
    "Space Energy",
    "Comet Cactuar",
    "Star Cactuar",
    "Lord Cactuar",
    "Space Power",
    "Moogle",
    "Magical Cactuar",
    "Chaotic Cait Sith",
    "Moogle",
    "Moogle",
    "Space Warrior",
    "Space Mage",
    "Mana Mog",
    "Cactuar Wizard",
    "Space Bandit",
    "Moomba Trio",
    "Abaddon Cait Sith",
    "Vengeful Cactuar",
    "Raging Cactuar",
    "P-Mog",
    "M-Mog",
    "S-Mog",
    "A-Mog",
    "Prism Cactuar",
    "Booster Cactuar",
    "Medical Mog",
    "Swift Cactuar",
    "Cactuar Spy",
    "Wicked Cait Sith",
    "Chronos Cait Sith",
    "Stone Cait Sith",
    "Toxic Cait Sith",
    "Dreamy Cait Sith",
    "Mute Cait Sith",
    "Dark Cait Sith",
    "Power Mog",
    "Magician Mog",
    "Moomba Duo",
    "Ominous Cait Sith",
    "Fatal Cait Sith",
    "Late Cait Sith",
    "Fossil Cait Sith",
    "Noxious Cait Sith",
    "Sleepy Cait Sith",
    "Quiet Cait Sith",
    "Blinding Cait Sith",
    "Cactuar Scope",
    "Fire Moomba",
    "Ice Moomba",
    "Thunder Moomba",
    "Water Moomba",
    "Morphing Mog",
    "Moomba Force",
    "Variable Mog",
    "Moomba Mage",
    "Moomba Warrior",
    "Rune Mog",
    "Magical Mog",
    "Buster Mog",
    "Attack Mog",
    "Stinger Mog",
    "Moogle",
    "Moogle",
    "Moogle",
    "Moogle",
    "Samantha Soul",
    "Minerva Bangle",
    "Mythical Bangle",
    "Draupnir",
    "Aegis Bangle",
    "Precious Bangle",
    "Imperial Bangle",
    "Auto Bangle",
    "Black Bangle",
    "Diamond Bangle",
    "Ruby Bangle",
    "Queen's Bangle",
    "Magister Bangle",
    "Collector Bangle",
    "Treasure Bangle",
    "Bangle of Hope",
    "Assault Bangle",
    "Phantom Bangle",
    "Recovery Bangle",
    "Spiritual Bangle",
    "Phoenix Bangle",
    "Curative Bangle",
    "Rainbow Bangle",
    "Shining Bangle",
    "Faerie Bangle",
    "Peaceful Bangle",
    "Shaman Bangle",
    "Barrier Bangle",
    "Star Bangle",
    "Marching Bangle",
    "Moon Bangle",
    "Regen Bangle",
    "Haste Bangle",
    "Reflect Bangle",
    "Shell Bangle",
    "Protect Bangle",
    "Bangle",
    "Platinum Bangle",
    "Sapphire Bangle",
    "Power Bangle",
    "Wizard Bangle",
    "Elemental Bangle",
    "Savior Bangle",
    "Crimson Bangle",
    "Snow Bangle",
    "Ochre Bangle",
    "Cerulean Bangle",
    "Medical Bangle",
    "Lucid Bangle",
    "Serene Bangle",
    "Light Bangle",
    "Soul Bangle",
    "Blessed Bangle",
    "Soft Bangle",
    "Serum Bangle",
    "Alert Bangle",
    "Echo Bangle",
    "Bright Bangle",
    "Red Bangle",
    "White Bangle",
    "Yellow Bangle",
    "Blue Bangle",
    "NulTide Bangle",
    "NulBlaze Bangle",
    "NulShock Bangle",
    "NulFrost Bangle",
    "Adept's Bangle",
    "Tetra Bangle",
    "Mythril Bangle",
    "Gold Bangle",
    "Emerald Bangle",
    "Vita Bangle",
    "Mage's Bangle",
    "Silver Bangle",
    "Onyx Bangle",
    "Sorcery Bangle",
    "Tough Bangle",
    "Glorious Bangle",
    "Metal Bangle",
    "Pearl Bangle",
    "Magic Bangle",
    "Seeker's Bangle",
    "Guardian Bangle",
    "Bangle",
    "Eternity",
    "Bangle",
    "Bangle",
    "Bangle",
    "Bangle",
    "Bangle",
    "Bangle",
    "Bangle",
    "Bangle",
    "Bangle",
    "Bangle",
    "Bangle",
    "-"
  ],
  [
    "Godhand",
    "Claw",
    "Iron Grip",
    "Deus Ex Machina",
    "Kaiser Knuckles",
    "Victorix",
    "Unlimited",
    "Warmonger",
    "Overload",
    "Override",
    "Golden Arm",
    "Golden Hand",
    "Ironside",
    "Battle Freak",
    "Claw",
    "Infinity",
    "Tempest Claw",
    "Claw",
    "Claw",
    "Spartan",
    "Brunhilde",
    "Valkyrie",
    "Magical Rave",
    "Stickyfingers",
    "Rising Sun",
    "Typhoon Claw",
    "Untouchable",
    "Tit-for-Tat",
    "P-Claw",
    "M-Claw",
    "S-Claw",
    "A-Claw",
    "Prism Claw",
    "Mirage Claw",
    "Survivor",
    "Vanguard",
    "Sonar",
    "Executioner",
    "Clockwork",
    "Colossus",
    "Manticore Claw",
    "Lights Out",
    "Mage Masher",
    "Jammer",
    "Iron Claw",
    "The Ogre",
    "Dual Claw",
    "Hurricane Claw",
    "Ninja Claw",
    "Clock Hand",
    "Break Knuckles",
    "Poison Claw",
    "Daydreamer",
    "Tongue Holder",
    "Eye Poker",
    "Hawkeye",
    "Hot Knuckles",
    "Ice Claw",
    "Shocking Fist",
    "Tidal Knuckles",
    "Flexible Arm",
    "Force Knuckles",
    "Devastator",
    "Magic Knuckles",
    "Buster Knuckles",
    "Magic Claw",
    "Magic Glove",
    "Buster Claw",
    "Buster Glove",
    "Barbed Knuckles",
    "Claw",
    "Claw",
    "Claw",
    "Claw",
    "Dreadnought",
    "Atlas",
    "Celestial",
    "Invincible",
    "Armada",
    "Triumph",
    "Intrepid",
    "Goliath",
    "Argonaut",
    "Diamond Targe",
    "Ruby Targe",
    "Warlord",
    "Dominator",
    "Buccaneer",
    "Corsair",
    "Targe of Hope",
    "Assault Targe",
    "Phantom Targe",
    "Recovery Targe",
    "Spiritual Targe",
    "Phoenix Targe",
    "Curative Targe",
    "Phalanx",
    "Tercio",
    "Talisman",
    "Peaceful Targe",
    "Shaman Targe",
    "Victorious",
    "Star Targe",
    "Marching Targe",
    "Moon Targe",
    "Regen Targe",
    "Haste Targe",
    "Reflect Targe",
    "Shell Targe",
    "Protect Targe",
    "Targe",
    "Centurion",
    "Echelon",
    "Knight's Targe",
    "Wizard Targe",
    "Elemental Targe",
    "Reliant",
    "Crimson Targe",
    "Snow Targe",
    "Ochre Targe",
    "Cerulean Targe",
    "Medical Targe",
    "Lucid Targe",
    "Dauntless",
    "Light Targe",
    "Soul Targe",
    "Blessed Targe",
    "Soft Targe",
    "Serum Targe",
    "Alert Targe",
    "Echo Targe",
    "Bright Targe",
    "Red Targe",
    "White Targe",
    "Yellow Targe",
    "Blue Targe",
    "NulTide Targe",
    "NulBlaze Targe",
    "NulShock Targe",
    "NulFrost Targe",
    "Adept's Targe",
    "Tetra Targe",
    "Mythril Targe",
    "Gold Targe",
    "Emerald Targe",
    "Soldier's Targe",
    "Mage's Targe",
    "Silver Targe",
    "Onyx Targe",
    "Sorcery Targe",
    "Warrior's Targe",
    "Glorious Targe",
    "Metal Targe",
    "Pearl Targe",
    "Magic Targe",
    "Seeker's Targe",
    "Guardian Targe",
    "Targe",
    "Impervious",
    "Targe",
    "Targe",
    "Targe",
    "Targe",
    "Targe",
    "Targe",
    "Targe",
    "Targe",
    "Targe",
    "Targe",
    "Targe",
    "-"
  ]
];

export const BLITZBALL_PLAYERS: IdName[] = [
  {
    "id": 0,
    "name": "Tidus"
  },
  {
    "id": 1,
    "name": "Wakka"
  },
  {
    "id": 2,
    "name": "Datto"
  },
  {
    "id": 3,
    "name": "Letty"
  },
  {
    "id": 4,
    "name": "Jassu"
  },
  {
    "id": 5,
    "name": "Botta"
  },
  {
    "id": 6,
    "name": "Keepa"
  },
  {
    "id": 7,
    "name": "Bickson"
  },
  {
    "id": 8,
    "name": "Abus"
  },
  {
    "id": 9,
    "name": "Graav"
  },
  {
    "id": 10,
    "name": "Doram"
  },
  {
    "id": 11,
    "name": "Balgerda"
  },
  {
    "id": 12,
    "name": "Raudy"
  },
  {
    "id": 13,
    "name": "Larbeight"
  },
  {
    "id": 14,
    "name": "Isken"
  },
  {
    "id": 15,
    "name": "Vuroja"
  },
  {
    "id": 16,
    "name": "Kulukan"
  },
  {
    "id": 17,
    "name": "Deim"
  },
  {
    "id": 18,
    "name": "Nizarut"
  },
  {
    "id": 19,
    "name": "Eigaar"
  },
  {
    "id": 20,
    "name": "Blappa"
  },
  {
    "id": 21,
    "name": "Berrik"
  },
  {
    "id": 22,
    "name": "Judda"
  },
  {
    "id": 23,
    "name": "Lakkam"
  },
  {
    "id": 24,
    "name": "Nimrook"
  },
  {
    "id": 25,
    "name": "Basik Ronso"
  },
  {
    "id": 26,
    "name": "Argai Ronso"
  },
  {
    "id": 27,
    "name": "Gazna Ronso"
  },
  {
    "id": 28,
    "name": "Nuvy Ronso"
  },
  {
    "id": 29,
    "name": "Irga Ronso"
  },
  {
    "id": 30,
    "name": "Zamzi Ronso"
  },
  {
    "id": 31,
    "name": "Giera Guado"
  },
  {
    "id": 32,
    "name": "Zazi Guado"
  },
  {
    "id": 33,
    "name": "Nav Guado"
  },
  {
    "id": 34,
    "name": "Auda Guado"
  },
  {
    "id": 35,
    "name": "Pah Guado"
  },
  {
    "id": 36,
    "name": "Noy Guado"
  },
  {
    "id": 37,
    "name": "Rin"
  },
  {
    "id": 38,
    "name": "Tatts"
  },
  {
    "id": 39,
    "name": "Kyou"
  },
  {
    "id": 40,
    "name": "Shuu"
  },
  {
    "id": 41,
    "name": "Nedus"
  },
  {
    "id": 42,
    "name": "Biggs"
  },
  {
    "id": 43,
    "name": "Wedge"
  },
  {
    "id": 44,
    "name": "Ropp"
  },
  {
    "id": 45,
    "name": "Linna"
  },
  {
    "id": 46,
    "name": "Mep"
  },
  {
    "id": 47,
    "name": "Zalitz"
  },
  {
    "id": 48,
    "name": "Naida"
  },
  {
    "id": 49,
    "name": "Durren"
  },
  {
    "id": 50,
    "name": "Jumal"
  },
  {
    "id": 51,
    "name": "Svanda"
  },
  {
    "id": 52,
    "name": "Vilucha"
  },
  {
    "id": 53,
    "name": "Shaami"
  },
  {
    "id": 54,
    "name": "Zev Ronso"
  },
  {
    "id": 55,
    "name": "Yuma Guado"
  },
  {
    "id": 56,
    "name": "Kiyuri"
  },
  {
    "id": 57,
    "name": "Brother"
  },
  {
    "id": 58,
    "name": "Mifurey"
  },
  {
    "id": 59,
    "name": "Miyu"
  }
];

export const BLITZBALL_TEAMS: IdName[] = [
  {
    "id": 0,
    "name": "Luca Goers"
  },
  {
    "id": 1,
    "name": "Kilika Beasts"
  },
  {
    "id": 2,
    "name": "Al Bhed Psyches"
  },
  {
    "id": 3,
    "name": "Ronso Fangs"
  },
  {
    "id": 4,
    "name": "Guado Glories"
  },
  {
    "id": 5,
    "name": "Besaid Aurochs"
  },
  {
    "id": 29,
    "name": "No Team"
  }
];

export const BLITZBALL_TECHS: IdName[] = [
  {
    "id": 1,
    "name": "Jecht Shot"
  },
  {
    "id": 2,
    "name": "Jecht Shot 2"
  },
  {
    "id": 3,
    "name": "Sphere Shot"
  },
  {
    "id": 4,
    "name": "Invisible Shot"
  },
  {
    "id": 5,
    "name": "Venom Shot"
  },
  {
    "id": 6,
    "name": "Venom Shot 2"
  },
  {
    "id": 7,
    "name": "Venom Shot 3"
  },
  {
    "id": 8,
    "name": "Nap Shot"
  },
  {
    "id": 9,
    "name": "Nap Shot 2"
  },
  {
    "id": 10,
    "name": "Nap Shot 3"
  },
  {
    "id": 11,
    "name": "Wither Shot"
  },
  {
    "id": 12,
    "name": "Wither Shot 2"
  },
  {
    "id": 13,
    "name": "Wither Shot 3"
  },
  {
    "id": 14,
    "name": "Venom Pass"
  },
  {
    "id": 15,
    "name": "Venom Pass 2"
  },
  {
    "id": 16,
    "name": "Venom Pass 3"
  },
  {
    "id": 17,
    "name": "Nap Pass"
  },
  {
    "id": 18,
    "name": "Nap Pass 2"
  },
  {
    "id": 19,
    "name": "Nap Pass 3"
  },
  {
    "id": 20,
    "name": "Wither Pass"
  },
  {
    "id": 21,
    "name": "Wither Pass 2"
  },
  {
    "id": 22,
    "name": "Wither Pass 3"
  },
  {
    "id": 23,
    "name": "Volley Shot"
  },
  {
    "id": 24,
    "name": "Volley Shot 2"
  },
  {
    "id": 25,
    "name": "Volley Shot 3"
  },
  {
    "id": 26,
    "name": "Venom Tackle"
  },
  {
    "id": 27,
    "name": "Venom Tackle 2"
  },
  {
    "id": 28,
    "name": "Venom Tackle 3"
  },
  {
    "id": 29,
    "name": "Nap Tackle"
  },
  {
    "id": 30,
    "name": "Nap Tackle 2"
  },
  {
    "id": 31,
    "name": "Nap Tackle 3"
  },
  {
    "id": 32,
    "name": "Wither Tackle"
  },
  {
    "id": 33,
    "name": "Wither Tackle 2"
  },
  {
    "id": 34,
    "name": "Wither Tackle 3"
  },
  {
    "id": 35,
    "name": "Drain Tackle"
  },
  {
    "id": 36,
    "name": "Drain Tackle 2"
  },
  {
    "id": 37,
    "name": "Drain Tackle 3"
  },
  {
    "id": 38,
    "name": "Tackle Slip"
  },
  {
    "id": 39,
    "name": "Tackle Slip 2"
  },
  {
    "id": 40,
    "name": "Anti-Venom"
  },
  {
    "id": 41,
    "name": "Anti-Venom 2"
  },
  {
    "id": 42,
    "name": "Anti-Nap"
  },
  {
    "id": 43,
    "name": "Anti-Nap 2"
  },
  {
    "id": 44,
    "name": "Anti-Wither"
  },
  {
    "id": 45,
    "name": "Anti-Wither 2"
  },
  {
    "id": 46,
    "name": "Anti-Drain"
  },
  {
    "id": 47,
    "name": "Anti-Drain 2"
  },
  {
    "id": 48,
    "name": "Spin Ball"
  },
  {
    "id": 49,
    "name": "Grip Gloves"
  },
  {
    "id": 50,
    "name": "Elite Defense"
  },
  {
    "id": 51,
    "name": "Brawler"
  },
  {
    "id": 52,
    "name": "Pile Venom"
  },
  {
    "id": 53,
    "name": "Pile Wither"
  },
  {
    "id": 54,
    "name": "Regen"
  },
  {
    "id": 55,
    "name": "Good Morning!"
  },
  {
    "id": 56,
    "name": "Hi-Risk"
  },
  {
    "id": 57,
    "name": "Golden Arm"
  },
  {
    "id": 58,
    "name": "Gamble"
  },
  {
    "id": 59,
    "name": "Super Goalie"
  },
  {
    "id": 60,
    "name": "Aurochs Spirit"
  }
];

export const BLITZBALL_PRIZES: IdName[] = [
  {
    "id": 0,
    "name": "Random"
  },
  {
    "id": 1,
    "name": "Dark Matter"
  },
  {
    "id": 2,
    "name": "Teleport Sphere"
  },
  {
    "id": 3,
    "name": "Three Stars"
  },
  {
    "id": 4,
    "name": "Luck Sphere"
  },
  {
    "id": 5,
    "name": "Underdog's Secret"
  },
  {
    "id": 6,
    "name": "Megalixir"
  },
  {
    "id": 7,
    "name": "Return Sphere"
  },
  {
    "id": 8,
    "name": "Lv. 1 Key Sphere"
  },
  {
    "id": 9,
    "name": "Mega Phoenix"
  },
  {
    "id": 10,
    "name": "Elixir"
  },
  {
    "id": 11,
    "name": "Mega-Potion"
  },
  {
    "id": 12,
    "name": "X-Potion"
  },
  {
    "id": 13,
    "name": "Ether"
  },
  {
    "id": 14,
    "name": "Remedy"
  },
  {
    "id": 15,
    "name": "Phoenix Down"
  },
  {
    "id": 16,
    "name": "Hi-Potion"
  },
  {
    "id": 17,
    "name": "Power Sphere"
  },
  {
    "id": 18,
    "name": "Mana Sphere"
  },
  {
    "id": 19,
    "name": "Speed Sphere"
  },
  {
    "id": 20,
    "name": "Ability Sphere"
  },
  {
    "id": 21,
    "name": "Echo Screen"
  },
  {
    "id": 22,
    "name": "Eye Drops"
  },
  {
    "id": 23,
    "name": "Antidote"
  },
  {
    "id": 24,
    "name": "Wakka Sigil"
  },
  {
    "id": 25,
    "name": "Elixir"
  },
  {
    "id": 26,
    "name": "X-Potion"
  },
  {
    "id": 27,
    "name": "Remedy"
  },
  {
    "id": 28,
    "name": "Hi-Potion"
  },
  {
    "id": 29,
    "name": "Echo Screen"
  },
  {
    "id": 30,
    "name": "Eye Drops"
  },
  {
    "id": 31,
    "name": "Antidote"
  },
  {
    "id": 32,
    "name": "Soft"
  },
  {
    "id": 33,
    "name": "Potion"
  },
  {
    "id": 34,
    "name": "Phoenix Down"
  },
  {
    "id": 35,
    "name": "Potion"
  },
  {
    "id": 36,
    "name": "Phoenix Down"
  },
  {
    "id": 37,
    "name": "Hi-Potion"
  },
  {
    "id": 38,
    "name": "Hi-Potion"
  },
  {
    "id": 39,
    "name": "Potion"
  },
  {
    "id": 40,
    "name": "Phoenix Down"
  },
  {
    "id": 41,
    "name": "Return Sphere"
  },
  {
    "id": 42,
    "name": "Rename Card"
  },
  {
    "id": 43,
    "name": "Ether"
  },
  {
    "id": 44,
    "name": "X-Potion"
  },
  {
    "id": 45,
    "name": "Mega-Potion"
  },
  {
    "id": 46,
    "name": "Remedy"
  },
  {
    "id": 47,
    "name": "Tidus Crest"
  },
  {
    "id": 48,
    "name": "Yuna Crest"
  },
  {
    "id": 49,
    "name": "Auron Crest"
  },
  {
    "id": 50,
    "name": "Kimahri Crest"
  },
  {
    "id": 51,
    "name": "Wakka Crest"
  },
  {
    "id": 52,
    "name": "Lulu Crest"
  },
  {
    "id": 53,
    "name": "Rikku Crest"
  },
  {
    "id": 54,
    "name": "Tidus Sigil"
  },
  {
    "id": 55,
    "name": "Yuna Sigil"
  },
  {
    "id": 56,
    "name": "Auron Sigil"
  },
  {
    "id": 57,
    "name": "Kimahri Sigil"
  },
  {
    "id": 58,
    "name": "Lulu Sigil"
  },
  {
    "id": 59,
    "name": "Rikku Sigil"
  },
  {
    "id": 60,
    "name": "Megalixir"
  },
  {
    "id": 61,
    "name": "Elixir"
  },
  {
    "id": 62,
    "name": "Hi-Potion"
  },
  {
    "id": 63,
    "name": "Potion"
  },
  {
    "id": 64,
    "name": "Potion"
  },
  {
    "id": 65,
    "name": "(blank)"
  },
  {
    "id": 66,
    "name": "Remedy"
  },
  {
    "id": 67,
    "name": "Seeker's Ring"
  },
  {
    "id": 68,
    "name": "Phoenix Down"
  },
  {
    "id": 69,
    "name": "(blank)"
  },
  {
    "id": 70,
    "name": "Ether"
  },
  {
    "id": 71,
    "name": "Antidote"
  },
  {
    "id": 72,
    "name": "Elixir"
  },
  {
    "id": 73,
    "name": "Remedy"
  },
  {
    "id": 74,
    "name": "Phoenix Down"
  },
  {
    "id": 75,
    "name": "Hi-Potion"
  },
  {
    "id": 76,
    "name": "Potion"
  },
  {
    "id": 77,
    "name": "Variable Steel"
  },
  {
    "id": 78,
    "name": "Soft Ring"
  },
  {
    "id": 79,
    "name": "Hi-Potion"
  },
  {
    "id": 80,
    "name": "Ether"
  },
  {
    "id": 81,
    "name": "Mega-Potion"
  },
  {
    "id": 82,
    "name": "Halberd"
  },
  {
    "id": 83,
    "name": "Potion"
  },
  {
    "id": 84,
    "name": "Hi-Potion"
  },
  {
    "id": 85,
    "name": "(blank)"
  },
  {
    "id": 86,
    "name": "Elixir"
  },
  {
    "id": 87,
    "name": "Ether"
  },
  {
    "id": 88,
    "name": "Hi-Potion"
  },
  {
    "id": 89,
    "name": "Hunter's Spear"
  },
  {
    "id": 90,
    "name": "Antidote"
  },
  {
    "id": 91,
    "name": "Hi-Potion"
  },
  {
    "id": 92,
    "name": "Soft"
  },
  {
    "id": 93,
    "name": "Red Ring"
  },
  {
    "id": 94,
    "name": "Ether"
  },
  {
    "id": 95,
    "name": "Hi-Potion"
  },
  {
    "id": 96,
    "name": "(blank)"
  },
  {
    "id": 97,
    "name": "Lv. 1 Key Sphere"
  },
  {
    "id": 98,
    "name": "Antidote"
  },
  {
    "id": 99,
    "name": "Tough Bangle"
  },
  {
    "id": 100,
    "name": "Phoenix Down"
  },
  {
    "id": 101,
    "name": "Jecht Shot"
  },
  {
    "id": 102,
    "name": "Jecht Shot 2"
  },
  {
    "id": 103,
    "name": "Sphere Shot"
  },
  {
    "id": 104,
    "name": "Invisible Shot"
  },
  {
    "id": 105,
    "name": "Venom Shot"
  },
  {
    "id": 106,
    "name": "Venom Shot 2"
  },
  {
    "id": 107,
    "name": "Venom Shot 3"
  },
  {
    "id": 108,
    "name": "Nap Shot"
  },
  {
    "id": 109,
    "name": "Nap Shot 2"
  },
  {
    "id": 110,
    "name": "Nap Shot 3"
  },
  {
    "id": 111,
    "name": "Wither Shot"
  },
  {
    "id": 112,
    "name": "Wither Shot 2"
  },
  {
    "id": 113,
    "name": "Wither Shot 3"
  },
  {
    "id": 114,
    "name": "Venom Pass"
  },
  {
    "id": 115,
    "name": "Venom Pass 2"
  },
  {
    "id": 116,
    "name": "Venom Pass 3"
  },
  {
    "id": 117,
    "name": "Nap Pass"
  },
  {
    "id": 118,
    "name": "Nap Pass 2"
  },
  {
    "id": 119,
    "name": "Nap Pass 3"
  },
  {
    "id": 120,
    "name": "Wither Pass"
  },
  {
    "id": 121,
    "name": "Wither Pass 2"
  },
  {
    "id": 122,
    "name": "Wither Pass 3"
  },
  {
    "id": 123,
    "name": "Volley Shot"
  },
  {
    "id": 124,
    "name": "Volley Shot 2"
  },
  {
    "id": 125,
    "name": "Volley Shot 3"
  },
  {
    "id": 126,
    "name": "Venom Tackle"
  },
  {
    "id": 127,
    "name": "Venom Tackle 2"
  },
  {
    "id": 128,
    "name": "Venom Tackle 3"
  },
  {
    "id": 129,
    "name": "Nap Tackle"
  },
  {
    "id": 130,
    "name": "Nap Tackle 2"
  },
  {
    "id": 131,
    "name": "Nap Tackle 3"
  },
  {
    "id": 132,
    "name": "Wither Tackle"
  },
  {
    "id": 133,
    "name": "Wither Tackle 2"
  },
  {
    "id": 134,
    "name": "Wither Tackle 3"
  },
  {
    "id": 135,
    "name": "Drain Tackle"
  },
  {
    "id": 136,
    "name": "Drain Tackle 2"
  },
  {
    "id": 137,
    "name": "Drain Tackle 3"
  },
  {
    "id": 138,
    "name": "Tackle Slip"
  },
  {
    "id": 139,
    "name": "Tackle Slip 2"
  },
  {
    "id": 140,
    "name": "Anti-Venom"
  },
  {
    "id": 141,
    "name": "Anti-Venom 2"
  },
  {
    "id": 142,
    "name": "Anti-Nap"
  },
  {
    "id": 143,
    "name": "Anti-Nap 2"
  },
  {
    "id": 144,
    "name": "Anti-Wither"
  },
  {
    "id": 145,
    "name": "Anti-Wither 2"
  },
  {
    "id": 146,
    "name": "Anti-Drain"
  },
  {
    "id": 147,
    "name": "Anti-Drain 2"
  },
  {
    "id": 148,
    "name": "Spin Ball"
  },
  {
    "id": 149,
    "name": "Grip Gloves"
  },
  {
    "id": 150,
    "name": "Elite Defense"
  },
  {
    "id": 151,
    "name": "Brawler"
  },
  {
    "id": 152,
    "name": "Pile Venom"
  },
  {
    "id": 153,
    "name": "Pile Wither"
  },
  {
    "id": 154,
    "name": "Regen"
  },
  {
    "id": 155,
    "name": "Good Morning!"
  },
  {
    "id": 156,
    "name": "Hi-Risk"
  },
  {
    "id": 157,
    "name": "Golden Arm"
  },
  {
    "id": 158,
    "name": "Gamble"
  },
  {
    "id": 159,
    "name": "Super Goalie"
  },
  {
    "id": 160,
    "name": "Aurochs Spirit"
  },
  {
    "id": 161,
    "name": "Normal"
  },
  {
    "id": 162,
    "name": "Counter"
  },
  {
    "id": 163,
    "name": "Center Attack"
  },
  {
    "id": 164,
    "name": "Right Side"
  },
  {
    "id": 165,
    "name": "Left Side"
  },
  {
    "id": 166,
    "name": "Flat Line"
  },
  {
    "id": 167,
    "name": "Double Sides"
  },
  {
    "id": 168,
    "name": "All-Out Defense"
  },
  {
    "id": 169,
    "name": "Mark Mode"
  },
  {
    "id": 170,
    "name": "Luca Goers"
  },
  {
    "id": 171,
    "name": "Kilika Beasts"
  },
  {
    "id": 172,
    "name": "Al Bhed Psyches"
  },
  {
    "id": 173,
    "name": "Ronso Fangs"
  },
  {
    "id": 174,
    "name": "Guado Glories"
  },
  {
    "id": 175,
    "name": "Besaid Aurochs"
  },
  {
    "id": 176,
    "name": "Free"
  },
  {
    "id": 177,
    "name": "---"
  },
  {
    "id": 178,
    "name": "78"
  },
  {
    "id": 179,
    "name": "79"
  },
  {
    "id": 180,
    "name": "80"
  },
  {
    "id": 181,
    "name": "81"
  },
  {
    "id": 182,
    "name": "82"
  },
  {
    "id": 183,
    "name": "83"
  },
  {
    "id": 184,
    "name": "84"
  },
  {
    "id": 185,
    "name": "85"
  },
  {
    "id": 186,
    "name": "Tech Find"
  },
  {
    "id": 187,
    "name": "Attack Reels"
  },
  {
    "id": 188,
    "name": "Status Reels"
  },
  {
    "id": 189,
    "name": "Aurochs Reels"
  },
  {
    "id": 190,
    "name": "Normal"
  },
  {
    "id": 191,
    "name": "Counter"
  },
  {
    "id": 192,
    "name": "Center Attack"
  },
  {
    "id": 193,
    "name": "Right Side"
  },
  {
    "id": 194,
    "name": "Left Side"
  },
  {
    "id": 195,
    "name": "Flat Line"
  },
  {
    "id": 196,
    "name": "Double Sides"
  },
  {
    "id": 197,
    "name": "All-Out Defense"
  },
  {
    "id": 198,
    "name": "Mark Mode"
  },
  {
    "id": 199,
    "name": "(blank)"
  },
  {
    "id": 286,
    "name": "Tech Find"
  },
  {
    "id": 287,
    "name": "Attack Reels"
  },
  {
    "id": 288,
    "name": "Status Reels"
  },
  {
    "id": 289,
    "name": "Aurochs Reels"
  }
];

export const SPHERE_GRID_NODE_TYPES: IdName[] = [
  {
    "id": 0,
    "name": "Lv. 3 Lock"
  },
  {
    "id": 1,
    "name": "Empty"
  },
  {
    "id": 2,
    "name": "Strength +1"
  },
  {
    "id": 3,
    "name": "Strength +2"
  },
  {
    "id": 4,
    "name": "Strength +3"
  },
  {
    "id": 5,
    "name": "Strength +4"
  },
  {
    "id": 6,
    "name": "Defense +1"
  },
  {
    "id": 7,
    "name": "Defense +2"
  },
  {
    "id": 8,
    "name": "Defense +3"
  },
  {
    "id": 9,
    "name": "Defense +4"
  },
  {
    "id": 10,
    "name": "Magic +1"
  },
  {
    "id": 11,
    "name": "Magic +2"
  },
  {
    "id": 12,
    "name": "Magic +3"
  },
  {
    "id": 13,
    "name": "Magic +4"
  },
  {
    "id": 14,
    "name": "Magic Defense +1"
  },
  {
    "id": 15,
    "name": "Magic Defense +2"
  },
  {
    "id": 16,
    "name": "Magic Defense +3"
  },
  {
    "id": 17,
    "name": "Magic Defense +4"
  },
  {
    "id": 18,
    "name": "Agility +1"
  },
  {
    "id": 19,
    "name": "Agility +2"
  },
  {
    "id": 20,
    "name": "Agility +3"
  },
  {
    "id": 21,
    "name": "Agility +4"
  },
  {
    "id": 22,
    "name": "Luck +1"
  },
  {
    "id": 23,
    "name": "Luck +2"
  },
  {
    "id": 24,
    "name": "Luck +3"
  },
  {
    "id": 25,
    "name": "Luck +4"
  },
  {
    "id": 26,
    "name": "Evasion +1"
  },
  {
    "id": 27,
    "name": "Evasion +2"
  },
  {
    "id": 28,
    "name": "Evasion +3"
  },
  {
    "id": 29,
    "name": "Evasion +4"
  },
  {
    "id": 30,
    "name": "Accuracy +1"
  },
  {
    "id": 31,
    "name": "Accuracy +2"
  },
  {
    "id": 32,
    "name": "Accuracy +3"
  },
  {
    "id": 33,
    "name": "Accuracy +4"
  },
  {
    "id": 34,
    "name": "HP +200"
  },
  {
    "id": 35,
    "name": "HP +300"
  },
  {
    "id": 36,
    "name": "MP +40"
  },
  {
    "id": 37,
    "name": "MP +20"
  },
  {
    "id": 38,
    "name": "MP +10"
  },
  {
    "id": 39,
    "name": "Lv. 1 Lock"
  },
  {
    "id": 40,
    "name": "Lv. 2 Lock"
  },
  {
    "id": 41,
    "name": "Lv. 4 Lock"
  },
  {
    "id": 42,
    "name": "Delay Attack"
  },
  {
    "id": 43,
    "name": "Delay Buster"
  },
  {
    "id": 44,
    "name": "Sleep Attack"
  },
  {
    "id": 45,
    "name": "Silence Attack"
  },
  {
    "id": 46,
    "name": "Dark Attack"
  },
  {
    "id": 47,
    "name": "Zombie Attack"
  },
  {
    "id": 48,
    "name": "Sleep Buster"
  },
  {
    "id": 49,
    "name": "Silence Buster"
  },
  {
    "id": 50,
    "name": "Dark Buster"
  },
  {
    "id": 51,
    "name": "Triple Foul"
  },
  {
    "id": 52,
    "name": "Power Break"
  },
  {
    "id": 53,
    "name": "Magic Break"
  },
  {
    "id": 54,
    "name": "Armor Break"
  },
  {
    "id": 55,
    "name": "Mental Break"
  },
  {
    "id": 56,
    "name": "Mug"
  },
  {
    "id": 57,
    "name": "Quick Hit"
  },
  {
    "id": 58,
    "name": "Steal"
  },
  {
    "id": 59,
    "name": "Use"
  },
  {
    "id": 60,
    "name": "Flee"
  },
  {
    "id": 61,
    "name": "Pray"
  },
  {
    "id": 62,
    "name": "Cheer"
  },
  {
    "id": 63,
    "name": "Focus"
  },
  {
    "id": 64,
    "name": "Reflex"
  },
  {
    "id": 65,
    "name": "Aim"
  },
  {
    "id": 66,
    "name": "Luck"
  },
  {
    "id": 67,
    "name": "Jinx"
  },
  {
    "id": 68,
    "name": "Lancet"
  },
  {
    "id": 69,
    "name": "Guard"
  },
  {
    "id": 70,
    "name": "Sentinel"
  },
  {
    "id": 71,
    "name": "Spare Change"
  },
  {
    "id": 72,
    "name": "Threaten"
  },
  {
    "id": 73,
    "name": "Provoke"
  },
  {
    "id": 74,
    "name": "Entrust"
  },
  {
    "id": 75,
    "name": "Copycat"
  },
  {
    "id": 76,
    "name": "Doublecast"
  },
  {
    "id": 77,
    "name": "Bribe"
  },
  {
    "id": 78,
    "name": "Cure"
  },
  {
    "id": 79,
    "name": "Cura"
  },
  {
    "id": 80,
    "name": "Curaga"
  },
  {
    "id": 81,
    "name": "NulFrost"
  },
  {
    "id": 82,
    "name": "NulBlaze"
  },
  {
    "id": 83,
    "name": "NulShock"
  },
  {
    "id": 84,
    "name": "NulTide"
  },
  {
    "id": 85,
    "name": "Scan"
  },
  {
    "id": 86,
    "name": "Esuna"
  },
  {
    "id": 87,
    "name": "Life"
  },
  {
    "id": 88,
    "name": "Full-Life"
  },
  {
    "id": 89,
    "name": "Haste"
  },
  {
    "id": 90,
    "name": "Hastega"
  },
  {
    "id": 91,
    "name": "Slow"
  },
  {
    "id": 92,
    "name": "Slowga"
  },
  {
    "id": 93,
    "name": "Shell"
  },
  {
    "id": 94,
    "name": "Protect"
  },
  {
    "id": 95,
    "name": "Reflect"
  },
  {
    "id": 96,
    "name": "Dispel"
  },
  {
    "id": 97,
    "name": "Regen"
  },
  {
    "id": 98,
    "name": "Holy"
  },
  {
    "id": 99,
    "name": "Auto-Life"
  },
  {
    "id": 100,
    "name": "Blizzard"
  },
  {
    "id": 101,
    "name": "Fire"
  },
  {
    "id": 102,
    "name": "Thunder"
  },
  {
    "id": 103,
    "name": "Water"
  },
  {
    "id": 104,
    "name": "Fira"
  },
  {
    "id": 105,
    "name": "Blizzara"
  },
  {
    "id": 106,
    "name": "Thundara"
  },
  {
    "id": 107,
    "name": "Watera"
  },
  {
    "id": 108,
    "name": "Firaga"
  },
  {
    "id": 109,
    "name": "Blizzaga"
  },
  {
    "id": 110,
    "name": "Thundaga"
  },
  {
    "id": 111,
    "name": "Waterga"
  },
  {
    "id": 112,
    "name": "Bio"
  },
  {
    "id": 113,
    "name": "Demi"
  },
  {
    "id": 114,
    "name": "Death"
  },
  {
    "id": 115,
    "name": "Drain"
  },
  {
    "id": 116,
    "name": "Osmose"
  },
  {
    "id": 117,
    "name": "Flare"
  },
  {
    "id": 118,
    "name": "Ultima"
  },
  {
    "id": 119,
    "name": "Pilfer Gil"
  },
  {
    "id": 120,
    "name": "Full Break"
  },
  {
    "id": 121,
    "name": "Extract Power"
  },
  {
    "id": 122,
    "name": "Extract Mana"
  },
  {
    "id": 123,
    "name": "Extract Speed"
  },
  {
    "id": 124,
    "name": "Extract Ability"
  },
  {
    "id": 125,
    "name": "Nab Gil"
  },
  {
    "id": 126,
    "name": "Quick Pockets"
  },
  {
    "id": 255,
    "name": "Null"
  }
];

export const MONSTER_ARENA_AREAS: MonsterArenaAreaSpec[] = [
  {
    "name": "Besaid",
    "monsters": [
      {
        "index": 8,
        "name": "Dingo"
      },
      {
        "index": 27,
        "name": "Condor"
      },
      {
        "index": 15,
        "name": "Water Flan"
      }
    ]
  },
  {
    "name": "Kilika",
    "monsters": [
      {
        "index": 21,
        "name": "Dinonix"
      },
      {
        "index": 30,
        "name": "Killer Bee"
      },
      {
        "index": 61,
        "name": "Yellow Element"
      },
      {
        "index": 38,
        "name": "Ragora"
      }
    ]
  },
  {
    "name": "Mi'ihen Highroad",
    "monsters": [
      {
        "index": 9,
        "name": "Mi'ihen Fang"
      },
      {
        "index": 22,
        "name": "Ipiria"
      },
      {
        "index": 34,
        "name": "Floating Eye"
      },
      {
        "index": 62,
        "name": "White Element"
      },
      {
        "index": 0,
        "name": "Raldo"
      },
      {
        "index": 50,
        "name": "Vouivre"
      },
      {
        "index": 85,
        "name": "Bomb"
      },
      {
        "index": 47,
        "name": "Dual Horn"
      }
    ]
  },
  {
    "name": "Mushroom Rock Road",
    "monsters": [
      {
        "index": 23,
        "name": "Raptor"
      },
      {
        "index": 5,
        "name": "Gandarewa"
      },
      {
        "index": 16,
        "name": "Thunder Flan"
      },
      {
        "index": 63,
        "name": "Red Element"
      },
      {
        "index": 51,
        "name": "Lamashtu"
      },
      {
        "index": 91,
        "name": "Funguar"
      },
      {
        "index": 40,
        "name": "Garuda"
      }
    ]
  },
  {
    "name": "Djose Road",
    "monsters": [
      {
        "index": 10,
        "name": "Garm"
      },
      {
        "index": 28,
        "name": "Simurgh"
      },
      {
        "index": 31,
        "name": "Bite Bug"
      },
      {
        "index": 17,
        "name": "Snow Flan"
      },
      {
        "index": 1,
        "name": "Bunyip"
      },
      {
        "index": 79,
        "name": "Basilisk"
      },
      {
        "index": 83,
        "name": "Ochu"
      }
    ]
  },
  {
    "name": "Thunder Plains",
    "monsters": [
      {
        "index": 24,
        "name": "Melusine"
      },
      {
        "index": 6,
        "name": "Aerouge"
      },
      {
        "index": 35,
        "name": "Buer"
      },
      {
        "index": 64,
        "name": "Gold Element"
      },
      {
        "index": 52,
        "name": "Kusariqqu"
      },
      {
        "index": 89,
        "name": "Larva"
      },
      {
        "index": 76,
        "name": "Iron Giant"
      },
      {
        "index": 87,
        "name": "Qactuar"
      }
    ]
  },
  {
    "name": "Macalania",
    "monsters": [
      {
        "index": 11,
        "name": "Snow Wolf"
      },
      {
        "index": 25,
        "name": "Iguion"
      },
      {
        "index": 32,
        "name": "Wasp"
      },
      {
        "index": 36,
        "name": "Evil Eye"
      },
      {
        "index": 18,
        "name": "Ice Flan"
      },
      {
        "index": 65,
        "name": "Blue Element"
      },
      {
        "index": 2,
        "name": "Murussu"
      },
      {
        "index": 3,
        "name": "Mafdet"
      },
      {
        "index": 94,
        "name": "Xiphos"
      },
      {
        "index": 71,
        "name": "Chimera"
      }
    ]
  },
  {
    "name": "Bikanel",
    "monsters": [
      {
        "index": 12,
        "name": "Sand Wolf"
      },
      {
        "index": 29,
        "name": "Alcyone"
      },
      {
        "index": 53,
        "name": "Mushussu"
      },
      {
        "index": 41,
        "name": "Zu"
      },
      {
        "index": 42,
        "name": "Sand Worm"
      },
      {
        "index": 88,
        "name": "Cactuar"
      }
    ]
  },
  {
    "name": "Calm Lands",
    "monsters": [
      {
        "index": 13,
        "name": "Skoll"
      },
      {
        "index": 33,
        "name": "Nebiros"
      },
      {
        "index": 19,
        "name": "Flame Flan"
      },
      {
        "index": 4,
        "name": "Shred"
      },
      {
        "index": 80,
        "name": "Anacondaur"
      },
      {
        "index": 57,
        "name": "Ogre"
      },
      {
        "index": 73,
        "name": "Coeurl"
      },
      {
        "index": 72,
        "name": "Chimera Brain"
      },
      {
        "index": 55,
        "name": "Malboro"
      }
    ]
  },
  {
    "name": "Mt. Gagazet",
    "monsters": [
      {
        "index": 14,
        "name": "Bandersnatch"
      },
      {
        "index": 37,
        "name": "Ahriman"
      },
      {
        "index": 20,
        "name": "Dark Flan"
      },
      {
        "index": 86,
        "name": "Grenade"
      },
      {
        "index": 39,
        "name": "Grat"
      },
      {
        "index": 49,
        "name": "Grendel"
      },
      {
        "index": 58,
        "name": "Bashura"
      },
      {
        "index": 84,
        "name": "Mandragora"
      },
      {
        "index": 69,
        "name": "Behemoth"
      },
      {
        "index": 60,
        "name": "Splasher"
      },
      {
        "index": 45,
        "name": "Achelous"
      },
      {
        "index": 46,
        "name": "Maelspike"
      }
    ]
  },
  {
    "name": "Cavern of the Stolen Fayth",
    "monsters": [
      {
        "index": 26,
        "name": "Yowie"
      },
      {
        "index": 7,
        "name": "Imp"
      },
      {
        "index": 66,
        "name": "Dark Element"
      },
      {
        "index": 54,
        "name": "Nidhogg"
      },
      {
        "index": 92,
        "name": "Thorn"
      },
      {
        "index": 48,
        "name": "Valaha"
      },
      {
        "index": 68,
        "name": "Epaaj"
      },
      {
        "index": 44,
        "name": "Ghost"
      },
      {
        "index": 98,
        "name": "Tonberry"
      }
    ]
  },
  {
    "name": "Inside Sin",
    "monsters": [
      {
        "index": 93,
        "name": "Exoray"
      },
      {
        "index": 97,
        "name": "Wraith"
      },
      {
        "index": 77,
        "name": "Gemini"
      },
      {
        "index": 78,
        "name": "Gemini"
      },
      {
        "index": 75,
        "name": "Demonolith"
      },
      {
        "index": 56,
        "name": "Great Malboro"
      },
      {
        "index": 90,
        "name": "Barbatos"
      },
      {
        "index": 81,
        "name": "Adamantoise"
      },
      {
        "index": 70,
        "name": "Behemoth King"
      }
    ]
  },
  {
    "name": "Omega Ruins",
    "monsters": [
      {
        "index": 100,
        "name": "Zaurus"
      },
      {
        "index": 102,
        "name": "Floating Death"
      },
      {
        "index": 67,
        "name": "Black Element"
      },
      {
        "index": 101,
        "name": "Halma"
      },
      {
        "index": 95,
        "name": "Puroboros"
      },
      {
        "index": 96,
        "name": "Spirit"
      },
      {
        "index": 103,
        "name": "Machea"
      },
      {
        "index": 74,
        "name": "Master Coeurl"
      },
      {
        "index": 99,
        "name": "Master Tonberry"
      },
      {
        "index": 82,
        "name": "Varuna"
      }
    ]
  },
  {
    "name": "Area Conquest",
    "monsters": [
      {
        "index": 120,
        "name": "Stratoavis"
      },
      {
        "index": 124,
        "name": "Malboro Menace"
      },
      {
        "index": 125,
        "name": "Kottos"
      },
      {
        "index": 129,
        "name": "Coeurlregina"
      },
      {
        "index": 131,
        "name": "Jormungand"
      },
      {
        "index": 134,
        "name": "Cactuar King"
      },
      {
        "index": 138,
        "name": "Espada"
      },
      {
        "index": 121,
        "name": "Abyss Worm"
      },
      {
        "index": 128,
        "name": "Chimerageist"
      },
      {
        "index": 137,
        "name": "Don Tonberry"
      },
      {
        "index": 127,
        "name": "Catoblepas"
      },
      {
        "index": 132,
        "name": "Abaddon"
      },
      {
        "index": 135,
        "name": "Vorban"
      }
    ]
  },
  {
    "name": "Species Conquest",
    "monsters": [
      {
        "index": 114,
        "name": "Fenrir"
      },
      {
        "index": 116,
        "name": "Ornitholestes"
      },
      {
        "index": 117,
        "name": "Pteryx"
      },
      {
        "index": 118,
        "name": "Hornet"
      },
      {
        "index": 113,
        "name": "Vidatu"
      },
      {
        "index": 119,
        "name": "One-Eye"
      },
      {
        "index": 115,
        "name": "Jumbo Flan"
      },
      {
        "index": 126,
        "name": "Nega Elemental"
      },
      {
        "index": 112,
        "name": "Tanket"
      },
      {
        "index": 123,
        "name": "Fafnir"
      },
      {
        "index": 136,
        "name": "Sleep Sprout"
      },
      {
        "index": 133,
        "name": "Bomb King"
      },
      {
        "index": 122,
        "name": "Juggernaut"
      },
      {
        "index": 130,
        "name": "Ironclad"
      }
    ]
  },
  {
    "name": "Original Creations",
    "monsters": [
      {
        "index": 107,
        "name": "Earth Eater"
      },
      {
        "index": 109,
        "name": "Greater Sphere"
      },
      {
        "index": 105,
        "name": "Catastrophe"
      },
      {
        "index": 110,
        "name": "Th'uban"
      },
      {
        "index": 106,
        "name": "Neslug"
      },
      {
        "index": 108,
        "name": "Ultima Buster"
      },
      {
        "index": 111,
        "name": "Shinryu"
      },
      {
        "index": 104,
        "name": "Nemesis"
      }
    ]
  }
];
