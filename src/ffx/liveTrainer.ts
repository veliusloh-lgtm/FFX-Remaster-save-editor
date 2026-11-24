import {
  EQUIP_BASE,
  EQUIP_STRIDE,
  EquipmentSlotData,
  MONSTER_ARENA_BASE,
  PARTY_BASE,
  PARTY_STRIDE,
  equipGearOnCharacter,
  readBlitzballPlayer,
  readEquipmentSlot,
  readPartyMember,
  readU32,
  readU8,
  unequipGearFromCharacter,
  writeBlitzballPlayer,
  writeEquipmentSlot,
  writePartyMember,
  writeU32,
  writeU8,
} from './saveCodec';
import { CHARACTER_NAMES_DEFAULT } from './tables';

export type TrainerConnectionMode = 'disconnected' | 'connecting' | 'live-bridge' | 'sandbox';

export interface LiveMemoryHookSpec {
  id: string;
  label: string;
  symbol: string;
  staticOffsetHex: string;
  aobPattern: string;
  aobByteOffset: number;
  width: 'u8' | 'u16' | 'u32' | 'ptr';
  notes: string;
}

export const FFX_LIVE_HOOKS: LiveMemoryHookSpec[] = [
  {
    id: 'gil',
    label: 'Current Gil',
    symbol: 'FFX_CurrentGil',
    staticOffsetHex: '0xD307D8',
    aobPattern: 'c3 c7 05 ?? ?? ?? ?? ff c9 9a 3b 3d ff c9 9a 3b',
    aobByteOffset: 3,
    width: 'u32',
    notes: 'Direct 4-byte unsigned integer for party Gil.',
  },
  {
    id: 'debug-flags',
    label: 'Engine Debug & Trainer Flags',
    symbol: 'FFX_DebugFlags',
    staticOffsetHex: '0xD2A8F8',
    aobPattern: '83 f8 01 75 09 80 3d ?? ?? ?? ?? 00 75 17 ff 75 08',
    aobByteOffset: 7,
    width: 'u8',
    notes: '+1 Invincible, +9 Unlimited MP, +20 Always Overdrive, +24 99999 Dmg, +26 100x AP, +27 100x Gil, +38 Enemy 1 HP.',
  },
  {
    id: 'party-stats',
    label: 'Party & Aeon Stat Structs (18 × 0x94)',
    symbol: 'FFX_PartyStatBase',
    staticOffsetHex: '0xD32060',
    aobPattern: '81 C6 ?? ?? ?? ?? 83 7D 0C 00',
    aobByteOffset: 2,
    width: 'u32',
    notes: 'Out-of-battle stats: +0x18 CurHP, +0x1C CurMP, +0x20 MaxHP, +0x24 MaxMP, +0x29 Weapon, +0x2A Armor, +0x35 OD, +0x37 S.Lv.',
  },
  {
    id: 'equipment-base',
    label: 'Equipment Inventory Block (200 × 22B)',
    symbol: 'FFX_EquipmentBase',
    staticOffsetHex: '0xD30F2C',
    aobPattern: '81 C6 ?? ?? ?? ?? 83 7D 0C 00 (PartyBase - 0x1134)',
    aobByteOffset: 2,
    width: 'u8',
    notes: 'Live 200-slot weapon & armor inventory array derived cleanly from FFX_PartyStatBase - 0x1134.',
  },
  {
    id: 'battle-party',
    label: 'In-Battle Party Entity Pointer (Stride 0xF90)',
    symbol: 'FFX_BattlePointerParty',
    staticOffsetHex: '0xD334CC',
    aobPattern: '83 f8 1f 7d 0e 69 c0 90 0f 00 00 03 05 ?? ?? ?? ?? 5d c3',
    aobByteOffset: 13,
    width: 'ptr',
    notes: 'Non-zero while in combat. +0x5D0 hp_current, +0x5D4 mp_current, +0x5BC overdrive_current.',
  },
  {
    id: 'battle-enemy',
    label: 'In-Battle Enemy Entity Pointer (Stride 0xF90)',
    symbol: 'FFX_BattlePointerEnemy',
    staticOffsetHex: '0xD34460',
    aobPattern: '0f b6 45 08 69 c0 90 0f 00 00 03 05 ?? ?? ?? ?? 5d c3',
    aobByteOffset: 12,
    width: 'ptr',
    notes: 'Points to active battle enemy entity array.',
  },
  {
    id: 'blitz-data',
    label: 'Blitzball Data Block (EXP, Levels, Prizes)',
    symbol: 'FFX_BlitzballData',
    staticOffsetHex: '0x384670',
    aobPattern: '6a 05 b9 78 00 00 00 bf ?? ?? ?? ?? 68 ?? ?? ?? ?? f3 ab',
    aobByteOffset: 8,
    width: 'u16',
    notes: '+0x568 PlayerExperience[60] (u16), +0x3CE PlayerLevels[60] (u8), +0x566 TeamWins.',
  },
  {
    id: 'blitz-match',
    label: 'Blitzball Active Match Pointer',
    symbol: 'FFX_BlitzballPointer',
    staticOffsetHex: '0xF2FF14',
    aobPattern: '55 8b ec 8b 45 08 a3 ?? ?? ?? ?? 5d c3',
    aobByteOffset: 7,
    width: 'ptr',
    notes: 'Active match runtime struct for halftime/full-game EXP & score.',
  },
];

export interface LiveTrainerConfig {
  // Economy
  freezeGil: boolean;
  targetGil: number;
  gil100x: boolean;

  // Party Vitals & Limit Break
  infiniteHp: boolean;
  infiniteMp: boolean;
  infiniteOverdrive: boolean;
  maxSphereLevels: boolean;

  // Combat Modifiers
  alwaysDeal99999: boolean;
  alwaysCritical: boolean;
  enemyAlways1Hp: boolean;
  ap100x: boolean;
  alwaysRareDrop: boolean;
  permanentSensor: boolean;

  // Blitzball Halftime / Match Cheats
  maxBlitzballExp: boolean;
  targetBlitzExp: number;
  targetBlitzLevel: number;
  blitzAurochsOnly: boolean;
  blitzInfiniteStamina: boolean;

  // Loop cadence
  tickRateMs: 100 | 250 | 500 | 1000;
}

export const DEFAULT_TRAINER_CONFIG: LiveTrainerConfig = {
  freezeGil: false,
  targetGil: 99999999,
  gil100x: false,

  infiniteHp: true,
  infiniteMp: true,
  infiniteOverdrive: true,
  maxSphereLevels: false,

  alwaysDeal99999: false,
  alwaysCritical: false,
  enemyAlways1Hp: false,
  ap100x: false,
  alwaysRareDrop: false,
  permanentSensor: false,

  maxBlitzballExp: false,
  targetBlitzExp: 9999,
  targetBlitzLevel: 99,
  blitzAurochsOnly: true,
  blitzInfiniteStamina: false,

  tickRateMs: 250,
};

export interface TrainerWriteOp {
  key: string;
  label: string;
  symbol: string;
  subOffsetHex: string;
  width: 'u8' | 'u16' | 'u32';
  value: number;
  category: 'economy' | 'vitals' | 'combat' | 'blitzball';
}

export interface LiveBattleEntity {
  side: 'party' | 'enemy';
  slot: number;
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  overdrive: number;
  overdriveMax: number;
}

export interface LiveBattleState {
  active: boolean;
  source: 'live-bridge' | 'sandbox';
  party: LiveBattleEntity[];
  enemies: LiveBattleEntity[];
}

export interface LiveCharacterEquipmentLoadout {
  characterIndex: number;
  name: string;
  equippedWeaponSlot: number;
  equippedArmorSlot: number;
  weapon: EquipmentSlotData | null;
  armor: EquipmentSlotData | null;
}

export interface LiveTelemetrySnapshot {
  pid: number | null;
  processName: string;
  gil: number;
  inBattle: boolean;
  roomId: number;
  party: {
    index: number;
    name: string;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    overdrive: number;
    overdriveMax: number;
    sphereLevel: number;
    equippedWeapon?: number;
    equippedArmor?: number;
  }[];
  battleParty: LiveBattleEntity[];
  battleEnemies: LiveBattleEntity[];
  blitzball: {
    index: number;
    name: string;
    level: number;
    exp: number;
    hp: number;
  }[];
  lastTickAt: number;
}

export interface CustomPokeSpec {
  symbol: LiveMemoryHookSpec['symbol'];
  byteOffset: number;
  width: 'u8' | 'u16' | 'u32';
  value: number;
}

/**
 * Generates deterministic live memory operations from active trainer switches.
 * Works identically for both the external Windows Bridge (`FFX.exe`) and sandbox verification.
 */
export function computeTrainerOperations(config: LiveTrainerConfig): TrainerWriteOp[] {
  const ops: TrainerWriteOp[] = [];

  if (config.freezeGil) {
    ops.push({
      key: 'freeze-gil',
      label: `Freeze Gil = ${config.targetGil.toLocaleString()}`,
      symbol: 'FFX_CurrentGil',
      subOffsetHex: '+0x00',
      width: 'u32',
      value: Math.max(0, Math.min(999999999, Math.trunc(config.targetGil))),
      category: 'economy',
    });
  }

  if (config.gil100x) {
    ops.push({
      key: 'gil-100x',
      label: '100x Gil Multiplier',
      symbol: 'FFX_DebugFlags',
      subOffsetHex: '+0x1B', // 27
      width: 'u8',
      value: 1,
      category: 'economy',
    });
  }

  if (config.infiniteHp) {
    ops.push({
      key: 'party-invincible',
      label: 'Infinite HP / Party Invincible',
      symbol: 'FFX_DebugFlags',
      subOffsetHex: '+0x01', // 1
      width: 'u8',
      value: 1,
      category: 'vitals',
    });
  }

  if (config.infiniteMp) {
    ops.push({
      key: 'unlimited-mp',
      label: 'Infinite MP',
      symbol: 'FFX_DebugFlags',
      subOffsetHex: '+0x09', // 9
      width: 'u8',
      value: 1,
      category: 'vitals',
    });
  }

  if (config.infiniteOverdrive) {
    ops.push({
      key: 'always-overdrive',
      label: 'Infinite Limit Break (Always Overdrive)',
      symbol: 'FFX_DebugFlags',
      subOffsetHex: '+0x14', // 20
      width: 'u8',
      value: 1,
      category: 'vitals',
    });
  }

  if (config.maxSphereLevels) {
    ops.push({
      key: 'max-slv',
      label: 'Lock Party Sphere Levels = 99',
      symbol: 'FFX_PartyStatBase',
      subOffsetHex: '+0x37 (×7)',
      width: 'u8',
      value: 99,
      category: 'vitals',
    });
  }

  if (config.alwaysDeal99999) {
    ops.push({
      key: 'deal-99999',
      label: 'Always Deal 99,999 Damage',
      symbol: 'FFX_DebugFlags',
      subOffsetHex: '+0x18', // 24
      width: 'u8',
      value: 1,
      category: 'combat',
    });
  }

  if (config.alwaysCritical) {
    ops.push({
      key: 'always-crit',
      label: 'Always Critical Hits',
      symbol: 'FFX_DebugFlags',
      subOffsetHex: '+0x15', // 21
      width: 'u8',
      value: 1,
      category: 'combat',
    });
  }

  if (config.enemyAlways1Hp) {
    ops.push({
      key: 'enemy-1hp',
      label: 'Enemies Always 1 HP (One-Hit KO)',
      symbol: 'FFX_DebugFlags',
      subOffsetHex: '+0x26', // 38
      width: 'u8',
      value: 1,
      category: 'combat',
    });
  }

  if (config.ap100x) {
    ops.push({
      key: 'ap-100x',
      label: '100x AP Gain After Battle',
      symbol: 'FFX_DebugFlags',
      subOffsetHex: '+0x1A', // 26
      width: 'u8',
      value: 1,
      category: 'combat',
    });
  }

  if (config.alwaysRareDrop) {
    ops.push({
      key: 'rare-drop',
      label: 'Always Rare Steal & Drop',
      symbol: 'FFX_DebugFlags',
      subOffsetHex: '+0x19', // 25
      width: 'u8',
      value: 1,
      category: 'combat',
    });
  }

  if (config.permanentSensor) {
    ops.push({
      key: 'perm-sensor',
      label: 'Permanent Sensor Status',
      symbol: 'FFX_DebugFlags',
      subOffsetHex: '+0x1D', // 29
      width: 'u8',
      value: 1,
      category: 'combat',
    });
  }

  if (config.maxBlitzballExp) {
    const expVal = Math.max(0, Math.min(65535, Math.trunc(config.targetBlitzExp)));
    const lvlVal = Math.max(1, Math.min(99, Math.trunc(config.targetBlitzLevel)));
    ops.push({
      key: 'blitz-exp',
      label: `Max Blitzball Halftime/Match EXP (${expVal})`,
      symbol: 'FFX_BlitzballData',
      subOffsetHex: '+0x568',
      width: 'u16',
      value: expVal,
      category: 'blitzball',
    });
    ops.push({
      key: 'blitz-lvl',
      label: `Sync Blitzball Level = ${lvlVal}`,
      symbol: 'FFX_BlitzballData',
      subOffsetHex: '+0x3CE',
      width: 'u8',
      value: lvlVal,
      category: 'blitzball',
    });
  }

  if (config.blitzInfiniteStamina) {
    ops.push({
      key: 'blitz-hp',
      label: 'Freeze Blitzball Match HP / Stamina (9999)',
      symbol: 'FFX_BlitzballPointer',
      subOffsetHex: '+HP Pool',
      width: 'u16',
      value: 9999,
      category: 'blitzball',
    });
  }

  return ops;
}

/**
 * Applies active trainer configuration directly onto an FFX save core buffer.
 * Used both for Sandbox Loop testing and for persisting live cheat state into the active save.
 */
export function applyTrainerToCore(
  core: Uint8Array,
  config: LiveTrainerConfig,
  partyMemberLimit = 7
): number {
  let writes = 0;

  if (config.freezeGil) {
    writeU32(core, 15752, Math.max(0, Math.min(999999999, Math.trunc(config.targetGil))));
    writes++;
  }

  for (let i = 0; i < partyMemberLimit; i++) {
    const m = readPartyMember(core, i);
    let dirty = false;
    if (config.infiniteHp && m.currentHp !== m.currentHpMax) {
      m.currentHp = m.currentHpMax;
      dirty = true;
    }
    if (config.infiniteMp && m.currentMp !== m.currentMpMax) {
      m.currentMp = m.currentMpMax;
      dirty = true;
    }
    if (config.infiniteOverdrive && m.overdriveLevel !== m.overdriveMax) {
      m.overdriveLevel = m.overdriveMax > 0 ? m.overdriveMax : 100;
      dirty = true;
    }
    if (config.maxSphereLevels && m.sphereLevelCurrent < 99) {
      m.sphereLevelCurrent = 99;
      dirty = true;
    }
    if (dirty) {
      writePartyMember(core, m);
      writes++;
    }
  }

  if (config.maxBlitzballExp) {
    const expVal = Math.max(0, Math.min(65535, Math.trunc(config.targetBlitzExp)));
    const lvlVal = Math.max(1, Math.min(99, Math.trunc(config.targetBlitzLevel)));

    // Collect either active Besaid Aurochs roster (team 5, 8 slots at 5702+40) or all 60 players
    const indices: number[] = [];
    if (config.blitzAurochsOnly) {
      const seen = new Set<number>();
      for (let slot = 0; slot < 8; slot++) {
        const pid = readU8(core, 5702 + 5 * 8 + slot);
        if (pid < 60 && !seen.has(pid)) {
          seen.add(pid);
          indices.push(pid);
        }
      }
      if (indices.length === 0) indices.push(0, 1, 2, 3, 4, 5);
    } else {
      for (let i = 0; i < 60; i++) indices.push(i);
    }

    for (const pid of indices) {
      const p = readBlitzballPlayer(core, pid);
      if (p.experience !== expVal || p.level !== lvlVal) {
        p.experience = expVal;
        p.level = lvlVal;
        writeBlitzballPlayer(core, p);
        writes++;
      }
    }
  }

  return writes;
}

/**
 * Extracts live telemetry view from an FFX core buffer (used in Sandbox mode & telemetry formatting).
 */
export function readTelemetryFromCore(
  core: Uint8Array,
  blitzHpPool = 9999
): LiveTelemetrySnapshot {
  const party = Array.from({ length: 7 }, (_, i) => {
    const m = readPartyMember(core, i);
    return {
      index: i,
      name: m.customName || m.defaultName,
      hp: m.currentHp,
      maxHp: m.currentHpMax,
      mp: m.currentMp,
      maxMp: m.currentMpMax,
      overdrive: m.overdriveLevel,
      overdriveMax: m.overdriveMax || 100,
      sphereLevel: m.sphereLevelCurrent,
      equippedWeapon: m.equippedWeapon,
      equippedArmor: m.equippedArmor,
    };
  });

  // Read first 6 Besaid Aurochs roster slots for live Blitzball telemetry
  const blitzIndices: number[] = [];
  for (let s = 0; s < 6; s++) {
    const pid = readU8(core, 5702 + 40 + s);
    blitzIndices.push(pid < 60 ? pid : s);
  }

  const blitzball = blitzIndices.map((pid) => {
    const bp = readBlitzballPlayer(core, pid);
    return {
      index: pid,
      name: ['Tidus', 'Wakka', 'Datto', 'Letty', 'Jassu', 'Botta', 'Keepa'][pid] ?? `Player #${pid}`,
      level: bp.level,
      exp: bp.experience,
      hp: blitzHpPool,
    };
  });

  return {
    pid: null,
    processName: 'Sandbox Core',
    gil: readU32(core, 15752),
    inBattle: false,
    roomId: readU8(core, 250) | (readU8(core, 251) << 8),
    party,
    battleParty: [],
    battleEnemies: [],
    blitzball,
    lastTickAt: Date.now(),
  };
}

function clampBattleInt(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, Math.trunc(val)));
}

/**
 * Creates a realistic simulated active battle encounter from the loaded party roster
 * so active-battle editing can be tested directly without FFX.exe running.
 */
export function createSimulatedBattle(core: Uint8Array): LiveBattleState {
  const party: LiveBattleEntity[] = [0, 1, 2].map((slot) => {
    const m = readPartyMember(core, slot);
    return {
      side: 'party',
      slot,
      name: m.customName || m.defaultName,
      hp: m.currentHp,
      maxHp: Math.max(1, m.currentHpMax),
      mp: m.currentMp,
      maxMp: m.currentMpMax,
      overdrive: m.overdriveLevel,
      overdriveMax: m.overdriveMax > 0 ? m.overdriveMax : 100,
    };
  });

  const enemies: LiveBattleEntity[] = [
    {
      side: 'enemy',
      slot: 0,
      name: 'Fiend Slot #0 (Front)',
      hp: 2400,
      maxHp: 2400,
      mp: 120,
      maxMp: 120,
      overdrive: 0,
      overdriveMax: 100,
    },
    {
      side: 'enemy',
      slot: 1,
      name: 'Fiend Slot #1 (Flank)',
      hp: 8500,
      maxHp: 8500,
      mp: 260,
      maxMp: 260,
      overdrive: 0,
      overdriveMax: 100,
    },
    {
      side: 'enemy',
      slot: 2,
      name: 'Boss / Elite Slot #2',
      hp: 65000,
      maxHp: 65000,
      mp: 999,
      maxMp: 999,
      overdrive: 0,
      overdriveMax: 100,
    },
  ];

  return {
    active: true,
    source: 'sandbox',
    party,
    enemies,
  };
}

export function applyBattleEntityEdit(
  battle: LiveBattleState,
  side: 'party' | 'enemy',
  slot: number,
  patch: Partial<Pick<LiveBattleEntity, 'hp' | 'maxHp' | 'mp' | 'maxMp' | 'overdrive' | 'overdriveMax'>>
): LiveBattleState {
  const hpCap = side === 'party' ? 99999 : 99999999;
  const updateList = (list: LiveBattleEntity[]) =>
    list.map((ent) => {
      if (ent.slot !== slot) return ent;
      const maxHp = clampBattleInt(patch.maxHp ?? ent.maxHp, 1, hpCap);
      const hp = clampBattleInt(patch.hp ?? ent.hp, 0, maxHp);
      const maxMp = clampBattleInt(patch.maxMp ?? ent.maxMp, 0, 9999);
      const mp = clampBattleInt(patch.mp ?? ent.mp, 0, maxMp);
      const overdriveMax = clampBattleInt(patch.overdriveMax ?? ent.overdriveMax, 0, 255);
      const overdrive = clampBattleInt(
        patch.overdrive ?? ent.overdrive,
        0,
        overdriveMax > 0 ? overdriveMax : 255
      );
      return { ...ent, hp, maxHp, mp, maxMp, overdrive, overdriveMax };
    });

  return {
    ...battle,
    party: side === 'party' ? updateList(battle.party) : battle.party,
    enemies: side === 'enemy' ? updateList(battle.enemies) : battle.enemies,
  };
}

export type BattleBatchAction = 'heal_party' | 'fill_overdrive' | 'enemies_1hp' | 'enemies_0hp';

export function applyBattleBatchAction(
  battle: LiveBattleState,
  action: BattleBatchAction
): LiveBattleState {
  if (action === 'heal_party') {
    return {
      ...battle,
      party: battle.party.map((ent) => ({
        ...ent,
        hp: ent.maxHp,
        mp: ent.maxMp,
      })),
    };
  }
  if (action === 'fill_overdrive') {
    return {
      ...battle,
      party: battle.party.map((ent) => ({
        ...ent,
        overdrive: ent.overdriveMax > 0 ? ent.overdriveMax : 100,
      })),
    };
  }
  if (action === 'enemies_1hp') {
    return {
      ...battle,
      enemies: battle.enemies.map((ent) => ({
        ...ent,
        hp: ent.maxHp > 0 ? 1 : 0,
      })),
    };
  }
  return {
    ...battle,
    enemies: battle.enemies.map((ent) => ({
      ...ent,
      hp: 0,
    })),
  };
}

/**
 * Reads all 18 characters' & Aeons' live equipped Weapon and Armor loadouts
 * from a save/memory core buffer.
 */
export function readLiveCharacterLoadouts(core: Uint8Array): LiveCharacterEquipmentLoadout[] {
  return Array.from({ length: 18 }, (_, i) => {
    const m = readPartyMember(core, i);
    const weapon = m.equippedWeapon < 200 ? readEquipmentSlot(core, m.equippedWeapon) : null;
    const armor = m.equippedArmor < 200 ? readEquipmentSlot(core, m.equippedArmor) : null;
    return {
      characterIndex: i,
      name: m.customName || m.defaultName || CHARACTER_NAMES_DEFAULT[i] || `Unit ${i}`,
      equippedWeaponSlot: m.equippedWeapon,
      equippedArmorSlot: m.equippedArmor,
      weapon,
      armor,
    };
  });
}

/**
 * Decodes a Base64 4,400-byte equipment snapshot and [weapon, armor] pair list
 * streamed from `FFX.exe` into a copy of the core buffer.
 */
export function applyLiveEquipmentSnapshot(
  core: Uint8Array,
  equipBytes: Uint8Array,
  partyEquipPairs?: number[][]
): void {
  const maxBytes = Math.min(200 * EQUIP_STRIDE, equipBytes.length);
  for (let i = 0; i < maxBytes; i++) {
    core[EQUIP_BASE + i] = equipBytes[i];
  }
  if (partyEquipPairs) {
    for (let i = 0; i < Math.min(18, partyEquipPairs.length); i++) {
      const pair = partyEquipPairs[i];
      if (!Array.isArray(pair) || pair.length < 2) continue;
      writeU8(core, PARTY_BASE + i * PARTY_STRIDE + 41, pair[0] & 0xff);
      writeU8(core, PARTY_BASE + i * PARTY_STRIDE + 42, pair[1] & 0xff);
    }
  }
}

export { equipGearOnCharacter, unequipGearFromCharacter, writeEquipmentSlot, readEquipmentSlot };

export function getBridgeLaunchCommand(): string {
  return 'powershell -ExecutionPolicy Bypass -File "$HOME\\Downloads\\spira-hook-bridge.ps1"';
}

/**
 * Generates a self-contained Windows PowerShell + inline C# Win32 WebSocket Companion Bridge
 * (`spira-hook-bridge.ps1`) that attaches directly to `FFX.exe` (Steam HD Remaster),
 * resolves FFX AOB signatures / fallback offsets, streams live telemetry, and applies
 * real-time memory writes & freezes over `ws://127.0.0.1:<port>/`.
 */
export function generateWindowsBridgeScript(port = 28420): string {
  return `# Spira Hook by Velius — Local Windows Live Memory Bridge for FFX.exe (HD Remaster Steam)
# How to run (Windows PowerShell, preferably "Run as Administrator"):
#   powershell -ExecutionPolicy Bypass -File "$HOME\\Downloads\\spira-hook-bridge.ps1"
# Keep this PowerShell window open while you click "Connect FFX.exe Bridge" in your browser.

$Port = ${port}
Write-Host ""
Write-Host "=== Spira Hook by Velius -> FFX.exe Companion Bridge ===" -ForegroundColor Cyan
Write-Host "1. Make sure FINAL FANTASY X (FFX.exe) is running on this PC." -ForegroundColor Gray
Write-Host "2. Compiling tiny Win32 memory helper (takes ~2 seconds)..." -ForegroundColor Gray

$CSharpSource = @"
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Threading;

public class SpiraHookBridge
{
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern IntPtr OpenProcess(int dwDesiredAccess, bool bInheritHandle, int dwProcessId);

    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool ReadProcessMemory(IntPtr hProcess, IntPtr lpBaseAddress, byte[] lpBuffer, int dwSize, out int lpNumberOfBytesRead);

    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool WriteProcessMemory(IntPtr hProcess, IntPtr lpBaseAddress, byte[] lpBuffer, int nSize, out int lpNumberOfBytesWritten);

    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool CloseHandle(IntPtr hObject);

    const int PROCESS_ALL_ACCESS = 0x1F0FFF;

    public static int ScanAob(byte[] mem, int baseAddr, string pattern, int byteOffset, int fallback)
    {
        var tokens = pattern.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
        var pat = new byte[tokens.Length];
        var mask = new bool[tokens.Length];
        for (int i = 0; i < tokens.Length; i++)
        {
            if (tokens[i] == "??" || tokens[i] == "?") { mask[i] = false; }
            else { mask[i] = true; pat[i] = Convert.ToByte(tokens[i], 16); }
        }
        int limit = mem.Length - pat.Length;
        for (int i = 0; i < limit; i++)
        {
            bool match = true;
            for (int j = 0; j < pat.Length; j++)
            {
                if (mask[j] && mem[i + j] != pat[j]) { match = false; break; }
            }
            if (match)
            {
                return BitConverter.ToInt32(mem, i + byteOffset);
            }
        }
        return fallback;
    }

    public static void Run(int port)
    {
        var listener = new TcpListener(IPAddress.Loopback, port);
        listener.Start();
        Console.WriteLine("[Spira Hook Bridge] Ready! Listening on ws://127.0.0.1:" + port + "/");
        Console.WriteLine("[Spira Hook Bridge] Return to your browser tab and click 'Connect FFX.exe Bridge'. Keep this window open (Ctrl+C to stop).");

        while (true)
        {
            var client = listener.AcceptTcpClient();
            ThreadPool.QueueUserWorkItem(_ => HandleClient(client));
        }
    }

    static void HandleClient(TcpClient client)
    {
        try
        {
            var stream = client.GetStream();
            var buf = new byte[8192];
            int n = stream.Read(buf, 0, buf.Length);
            string req = Encoding.UTF8.GetString(buf, 0, n);
            var lines = req.Split(new[] { "\\r\\n" }, StringSplitOptions.None);
            string key = null;
            foreach (var l in lines)
            {
                if (l.StartsWith("Sec-WebSocket-Key:", StringComparison.OrdinalIgnoreCase))
                    key = l.Substring(18).Trim();
            }
            if (key == null) { client.Close(); return; }

            string accept = Convert.ToBase64String(SHA1.Create().ComputeHash(
                Encoding.UTF8.GetBytes(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")));
            string hs = "HTTP/1.1 101 Switching Protocols\\r\\nUpgrade: websocket\\r\\nConnection: Upgrade\\r\\nSec-WebSocket-Accept: " + accept + "\\r\\n\\r\\n";
            var hsBytes = Encoding.UTF8.GetBytes(hs);
            stream.Write(hsBytes, 0, hsBytes.Length);

            var procs = Process.GetProcessesByName("FFX");
            if (procs.Length == 0)
            {
                SendText(stream, "{\\"type\\":\\"error\\",\\"message\\":\\"FFX.exe not found. Start Final Fantasy X HD Remaster first.\\"}");
                client.Close();
                return;
            }

            var proc = procs[0];
            IntPtr hProc = OpenProcess(PROCESS_ALL_ACCESS, false, proc.Id);
            int modBase = proc.MainModule.BaseAddress.ToInt32();
            int modSize = proc.MainModule.ModuleMemorySize;
            var modBytes = new byte[modSize];
            int readLen;
            ReadProcessMemory(hProc, proc.MainModule.BaseAddress, modBytes, modSize, out readLen);

            int addrGil = ScanAob(modBytes, modBase, "c3 c7 05 ?? ?? ?? ?? ff c9 9a 3b 3d ff c9 9a 3b", 3, 0xD307D8);
            int addrDebug = ScanAob(modBytes, modBase, "83 f8 01 75 09 80 3d ?? ?? ?? ?? 00 75 17 ff 75 08", 7, 0xD2A8F8);
            int addrParty = ScanAob(modBytes, modBase, "81 C6 ?? ?? ?? ?? 83 7D 0C 00", 2, 0xD32060);
            int addrEquip = addrParty - 0x1134;
            int addrBattleParty = ScanAob(modBytes, modBase, "83 f8 1f 7d 0e 69 c0 90 0f 00 00 03 05 ?? ?? ?? ?? 5d c3", 13, 0xD334CC);
            int addrBattleEnemy = ScanAob(modBytes, modBase, "0f b6 45 08 69 c0 90 0f 00 00 03 05 ?? ?? ?? ?? 5d c3", 12, 0xD34460);
            int addrBlitzData = ScanAob(modBytes, modBase, "6a 05 b9 78 00 00 00 bf ?? ?? ?? ?? 68 ?? ?? ?? ?? f3 ab", 8, 0x384670);

            SendText(stream, "{\\"type\\":\\"hello\\",\\"pid\\":" + proc.Id + ",\\"processName\\":\\"FFX.exe\\"}");
            SendEquipmentSnapshot(stream, hProc, addrParty, addrEquip);

            while (client.Connected && !proc.HasExited)
            {
                while (stream.DataAvailable)
                {
                    string msg = ReadText(stream);
                    if (msg != null)
                    {
                        ApplyJsonCommand(stream, hProc, msg, addrGil, addrDebug, addrParty, addrEquip, addrBattleParty, addrBattleEnemy, addrBlitzData);
                    }
                }
                // Stream live Gil + Battle Entity arrays + Party equipped summary
                var gilBuf = new byte[4];
                ReadProcessMemory(hProc, (IntPtr)addrGil, gilBuf, 4, out readLen);
                uint gil = BitConverter.ToUInt32(gilBuf, 0);
                var bpBuf = new byte[4];
                ReadProcessMemory(hProc, (IntPtr)addrBattleParty, bpBuf, 4, out readLen);
                int ptrParty = BitConverter.ToInt32(bpBuf, 0);
                var beBuf = new byte[4];
                ReadProcessMemory(hProc, (IntPtr)addrBattleEnemy, beBuf, 4, out readLen);
                int ptrEnemy = BitConverter.ToInt32(beBuf, 0);
                bool inBattle = ptrParty != 0;

                var sb = new StringBuilder();
                sb.Append("{\\"type\\":\\"telemetry\\",\\"pid\\":").Append(proc.Id)
                  .Append(",\\"gil\\":").Append(gil)
                  .Append(",\\"inBattle\\":").Append(inBattle ? "true" : "false")
                  .Append(",\\"battleParty\\":").Append(BuildBattleJson(hProc, ptrParty, "party"))
                  .Append(",\\"battleEnemies\\":").Append(BuildBattleJson(hProc, ptrEnemy, "enemy"))
                  .Append(",\\"party\\":").Append(BuildPartyJson(hProc, addrParty))
                  .Append("}");
                SendText(stream, sb.ToString());
                Thread.Sleep(250);
            }
            CloseHandle(hProc);
        }
        catch { }
        finally { try { client.Close(); } catch { } }
    }

    static string BuildPartyJson(IntPtr h, int addrParty)
    {
        var sb = new StringBuilder("[");
        var pBuf = new byte[148];
        int r;
        for (int i = 0; i < 7; i++)
        {
            ReadProcessMemory(h, (IntPtr)(addrParty + i * 0x94), pBuf, 148, out r);
            uint hp = BitConverter.ToUInt32(pBuf, 24);
            uint mp = BitConverter.ToUInt32(pBuf, 28);
            uint maxHp = BitConverter.ToUInt32(pBuf, 32);
            uint maxMp = BitConverter.ToUInt32(pBuf, 36);
            byte wep = pBuf[41];
            byte arm = pBuf[42];
            byte od = pBuf[53];
            byte odMax = pBuf[54];
            byte slv = pBuf[55];
            if (i > 0) sb.Append(",");
            sb.Append("{\\"index\\":").Append(i)
              .Append(",\\"hp\\":").Append(hp)
              .Append(",\\"maxHp\\":").Append(maxHp)
              .Append(",\\"mp\\":").Append(mp)
              .Append(",\\"maxMp\\":").Append(maxMp)
              .Append(",\\"overdrive\\":").Append(od)
              .Append(",\\"overdriveMax\\":").Append(odMax)
              .Append(",\\"sphereLevel\\":").Append(slv)
              .Append(",\\"equippedWeapon\\":").Append(wep)
              .Append(",\\"equippedArmor\\":").Append(arm).Append("}");
        }
        sb.Append("]");
        return sb.ToString();
    }

    static string BuildBattleJson(IntPtr h, int basePtr, string side)
    {
        if (basePtr == 0) return "[]";
        var sb = new StringBuilder("[");
        bool first = true;
        var eBuf = new byte[0x5E0];
        int r;
        for (int i = 0; i < 8; i++)
        {
            ReadProcessMemory(h, (IntPtr)(basePtr + i * 0xF90), eBuf, eBuf.Length, out r);
            if (r < 0x5D8) continue;
            uint maxHp = BitConverter.ToUInt32(eBuf, 0x594);
            if (maxHp == 0 || maxHp > 99999999) continue;
            uint maxMp = BitConverter.ToUInt32(eBuf, 0x598);
            byte od = eBuf[0x5BC];
            byte odMax = eBuf[0x5BD];
            uint hp = BitConverter.ToUInt32(eBuf, 0x5D0);
            uint mp = BitConverter.ToUInt32(eBuf, 0x5D4);
            if (!first) sb.Append(",");
            first = false;
            sb.Append("{\\"side\\":\\"").Append(side)
              .Append("\\",\\"slot\\":").Append(i)
              .Append(",\\"hp\\":").Append(hp)
              .Append(",\\"maxHp\\":").Append(maxHp)
              .Append(",\\"mp\\":").Append(mp)
              .Append(",\\"maxMp\\":").Append(maxMp)
              .Append(",\\"overdrive\\":").Append(od)
              .Append(",\\"overdriveMax\\":").Append(odMax).Append("}");
        }
        sb.Append("]");
        return sb.ToString();
    }

    static void SendEquipmentSnapshot(NetworkStream s, IntPtr h, int addrParty, int addrEquip)
    {
        var equipBytes = new byte[200 * 22];
        int r;
        ReadProcessMemory(h, (IntPtr)addrEquip, equipBytes, equipBytes.Length, out r);
        string b64 = Convert.ToBase64String(equipBytes);
        var pairs = new StringBuilder("[");
        var buf = new byte[2];
        for (int i = 0; i < 18; i++)
        {
            ReadProcessMemory(h, (IntPtr)(addrParty + i * 0x94 + 41), buf, 2, out r);
            if (i > 0) pairs.Append(",");
            pairs.Append("[").Append(buf[0]).Append(",").Append(buf[1]).Append("]");
        }
        pairs.Append("]");
        SendText(s, "{\\"type\\":\\"equipment_snapshot\\",\\"equipB64\\":\\"" + b64 + "\\",\\"partyEquip\\":" + pairs.ToString() + "}");
    }

    static string ExtractString(string json, string key, string defVal)
    {
        var marker = "\\"" + key + "\\":\\"";
        int idx = json.IndexOf(marker, StringComparison.Ordinal);
        if (idx < 0) return defVal;
        idx += marker.Length;
        int end = json.IndexOf('"', idx);
        return end > idx ? json.Substring(idx, end - idx) : defVal;
    }

    static int ExtractInt(string json, string key, int defVal)
    {
        var marker = "\\"" + key + "\\":";
        int idx = json.IndexOf(marker, StringComparison.Ordinal);
        if (idx < 0) return defVal;
        idx += marker.Length;
        int end = idx;
        while (end < json.Length && (char.IsDigit(json[end]) || json[end] == '-')) end++;
        int parsed;
        return int.TryParse(json.Substring(idx, end - idx), out parsed) ? parsed : defVal;
    }

    static bool ExtractBool(string json, string key)
    {
        return json.IndexOf("\\"" + key + "\\":true", StringComparison.Ordinal) >= 0;
    }

    static uint ReadU32(IntPtr h, int addr) { var b = new byte[4]; int r; ReadProcessMemory(h, (IntPtr)addr, b, 4, out r); return BitConverter.ToUInt32(b, 0); }
    static int ReadI32(IntPtr h, int addr) { var b = new byte[4]; int r; ReadProcessMemory(h, (IntPtr)addr, b, 4, out r); return BitConverter.ToInt32(b, 0); }
    static void WriteU8(IntPtr h, int addr, byte v) { int w; WriteProcessMemory(h, (IntPtr)addr, new[] { v }, 1, out w); }
    static void WriteU16(IntPtr h, int addr, ushort v) { int w; WriteProcessMemory(h, (IntPtr)addr, BitConverter.GetBytes(v), 2, out w); }
    static void WriteU32(IntPtr h, int addr, uint v) { int w; WriteProcessMemory(h, (IntPtr)addr, BitConverter.GetBytes(v), 4, out w); }

    static void ApplyJsonCommand(NetworkStream stream, IntPtr h, string msg, int addrGil, int addrDebug, int addrParty, int addrEquip, int addrBattleParty, int addrBattleEnemy, int addrBlitzData)
    {
        string cmdType = ExtractString(msg, "type", "apply_cheats");
        if (cmdType == "request_equipment")
        {
            SendEquipmentSnapshot(stream, h, addrParty, addrEquip);
            return;
        }
        if (cmdType == "write_equipment_slot")
        {
            int slot = ExtractInt(msg, "slot", -1);
            if (slot >= 0 && slot < 200)
            {
                int b = addrEquip + slot * 22;
                WriteU8(h, b + 0, (byte)ExtractInt(msg, "nameId", 0));
                WriteU8(h, b + 1, (byte)ExtractInt(msg, "name2", 0));
                WriteU8(h, b + 2, ExtractBool(msg, "occupied") ? (byte)1 : (byte)0);
                WriteU8(h, b + 3, (byte)ExtractInt(msg, "customizeMode", 0));
                WriteU8(h, b + 4, (byte)ExtractInt(msg, "character", 0));
                WriteU8(h, b + 5, (byte)ExtractInt(msg, "equipType", 0));
                WriteU8(h, b + 6, (byte)ExtractInt(msg, "equippedBy", 255));
                WriteU8(h, b + 7, 0);
                WriteU8(h, b + 8, (byte)ExtractInt(msg, "damageFormula", 1));
                WriteU8(h, b + 9, (byte)ExtractInt(msg, "attackPower", 0));
                WriteU8(h, b + 10, (byte)ExtractInt(msg, "critical", 0));
                WriteU8(h, b + 11, (byte)ExtractInt(msg, "abilityCount", 1));
                WriteU16(h, b + 12, (ushort)ExtractInt(msg, "appearance", 255));
                WriteU16(h, b + 14, (ushort)ExtractInt(msg, "ab0", 255));
                WriteU16(h, b + 16, (ushort)ExtractInt(msg, "ab1", 255));
                WriteU16(h, b + 18, (ushort)ExtractInt(msg, "ab2", 255));
                WriteU16(h, b + 20, (ushort)ExtractInt(msg, "ab3", 255));
                SendEquipmentSnapshot(stream, h, addrParty, addrEquip);
            }
            return;
        }
        if (cmdType == "equip_character")
        {
            int charIdx = ExtractInt(msg, "charIndex", -1);
            int slot = ExtractInt(msg, "slot", 255);
            int gType = ExtractInt(msg, "equipType", 0);
            if (charIdx >= 0 && charIdx < 18)
            {
                var eqBuf = new byte[200 * 22];
                int r;
                ReadProcessMemory(h, (IntPtr)addrEquip, eqBuf, eqBuf.Length, out r);
                for (int s = 0; s < 200; s++)
                {
                    if (eqBuf[s * 22 + 6] == charIdx && eqBuf[s * 22 + 5] == gType && s != slot)
                        WriteU8(h, addrEquip + s * 22 + 6, 255);
                }
                if (slot >= 0 && slot < 200)
                {
                    WriteU8(h, addrEquip + slot * 22 + 2, 1);
                    WriteU8(h, addrEquip + slot * 22 + 6, (byte)charIdx);
                }
                WriteU8(h, addrParty + charIdx * 0x94 + (gType == 0 ? 41 : 42), (byte)(slot >= 0 && slot < 200 ? slot : 255));
                SendEquipmentSnapshot(stream, h, addrParty, addrEquip);
            }
            return;
        }
        if (cmdType == "edit_battle_entity")
        {
            string side = ExtractString(msg, "side", "party");
            int slot = ExtractInt(msg, "slot", 0);
            int basePtr = ReadI32(h, side == "enemy" ? addrBattleEnemy : addrBattleParty);
            if (basePtr != 0 && slot >= 0 && slot < 8)
            {
                int ent = basePtr + slot * 0xF90;
                WriteU32(h, ent + 0x594, (uint)Math.Max(1, ExtractInt(msg, "maxHp", 1)));
                WriteU32(h, ent + 0x598, (uint)Math.Max(0, ExtractInt(msg, "maxMp", 0)));
                WriteU32(h, ent + 0x5D0, (uint)Math.Max(0, ExtractInt(msg, "hp", 1)));
                WriteU32(h, ent + 0x5D4, (uint)Math.Max(0, ExtractInt(msg, "mp", 0)));
                WriteU8(h, ent + 0x5BC, (byte)Math.Max(0, Math.Min(255, ExtractInt(msg, "overdrive", 0))));
                WriteU8(h, ent + 0x5BD, (byte)Math.Max(0, Math.Min(255, ExtractInt(msg, "overdriveMax", 100))));
            }
            return;
        }
        if (cmdType == "battle_batch")
        {
            string action = ExtractString(msg, "action", "");
            int ptrParty = ReadI32(h, addrBattleParty);
            int ptrEnemy = ReadI32(h, addrBattleEnemy);
            if (ptrParty != 0 && (action == "heal_party" || action == "fill_overdrive"))
            {
                for (int i = 0; i < 8; i++)
                {
                    int ent = ptrParty + i * 0xF90;
                    uint maxHp = ReadU32(h, ent + 0x594);
                    if (maxHp == 0 || maxHp > 99999999) continue;
                    if (action == "heal_party")
                    {
                        WriteU32(h, ent + 0x5D0, maxHp);
                        WriteU32(h, ent + 0x5D4, ReadU32(h, ent + 0x598));
                    }
                    else
                    {
                        var odBuf = new byte[1]; int r;
                        ReadProcessMemory(h, (IntPtr)(ent + 0x5BD), odBuf, 1, out r);
                        WriteU8(h, ent + 0x5BC, odBuf[0] > 0 ? odBuf[0] : (byte)100);
                    }
                }
            }
            if (ptrEnemy != 0 && (action == "enemies_1hp" || action == "enemies_0hp"))
            {
                uint targetHp = action == "enemies_1hp" ? 1u : 0u;
                for (int i = 0; i < 8; i++)
                {
                    int ent = ptrEnemy + i * 0xF90;
                    uint maxHp = ReadU32(h, ent + 0x594);
                    if (maxHp == 0 || maxHp > 99999999) continue;
                    WriteU32(h, ent + 0x5D0, targetHp);
                }
            }
            return;
        }

        if (ExtractBool(msg, "freezeGil")) WriteU32(h, addrGil, (uint)Math.Max(0, ExtractInt(msg, "targetGil", 99999999)));
        WriteU8(h, addrDebug + 1, ExtractBool(msg, "infiniteHp") ? (byte)1 : (byte)0);
        WriteU8(h, addrDebug + 9, ExtractBool(msg, "infiniteMp") ? (byte)1 : (byte)0);
        WriteU8(h, addrDebug + 20, ExtractBool(msg, "infiniteOverdrive") ? (byte)1 : (byte)0);
        WriteU8(h, addrDebug + 21, ExtractBool(msg, "alwaysCritical") ? (byte)1 : (byte)0);
        WriteU8(h, addrDebug + 24, ExtractBool(msg, "alwaysDeal99999") ? (byte)1 : (byte)0);
        WriteU8(h, addrDebug + 25, ExtractBool(msg, "alwaysRareDrop") ? (byte)1 : (byte)0);
        WriteU8(h, addrDebug + 26, ExtractBool(msg, "ap100x") ? (byte)1 : (byte)0);
        WriteU8(h, addrDebug + 27, ExtractBool(msg, "gil100x") ? (byte)1 : (byte)0);
        WriteU8(h, addrDebug + 29, ExtractBool(msg, "permanentSensor") ? (byte)1 : (byte)0);
        WriteU8(h, addrDebug + 38, ExtractBool(msg, "enemyAlways1Hp") ? (byte)1 : (byte)0);

        if (ExtractBool(msg, "maxSphereLevels"))
        {
            for (int i = 0; i < 7; i++) WriteU8(h, addrParty + 0x94 * i + 0x37, 99);
        }
        if (ExtractBool(msg, "maxBlitzballExp"))
        {
            ushort exp = (ushort)Math.Max(0, Math.Min(65535, ExtractInt(msg, "targetBlitzExp", 9999)));
            byte lvl = (byte)Math.Max(1, Math.Min(99, ExtractInt(msg, "targetBlitzLevel", 99)));
            for (int p = 0; p < 60; p++)
            {
                WriteU16(h, addrBlitzData + 0x568 + p * 2, exp);
                WriteU8(h, addrBlitzData + 0x3CE + p, lvl);
            }
        }
    }

    static void SendText(NetworkStream s, string txt)
    {
        var payload = Encoding.UTF8.GetBytes(txt);
        var frame = new MemoryStream();
        frame.WriteByte(0x81);
        if (payload.Length < 126) frame.WriteByte((byte)payload.Length);
        else { frame.WriteByte(126); frame.WriteByte((byte)(payload.Length >> 8)); frame.WriteByte((byte)(payload.Length & 0xFF)); }
        frame.Write(payload, 0, payload.Length);
        var b = frame.ToArray();
        s.Write(b, 0, b.Length);
    }

    static string ReadText(NetworkStream s)
    {
        int b1 = s.ReadByte(); if (b1 < 0) return null;
        int b2 = s.ReadByte(); if (b2 < 0) return null;
        int len = b2 & 0x7F;
        if (len == 126) { len = (s.ReadByte() << 8) | s.ReadByte(); }
        var mask = new byte[4];
        if ((b2 & 0x80) != 0) s.Read(mask, 0, 4);
        var data = new byte[len];
        int read = 0;
        while (read < len) read += s.Read(data, read, len - read);
        if ((b2 & 0x80) != 0) for (int i = 0; i < len; i++) data[i] ^= mask[i % 4];
        return Encoding.UTF8.GetString(data);
    }
}
"@

Add-Type -TypeDefinition $CSharpSource -Language CSharp
[SpiraHookBridge]::Run($Port)
`;
}

/**
 * Helper to simulate an active game event in Sandbox mode (e.g. taking heavy damage,
 * spending Gil, using Overdrive, or reaching Blitzball Halftime) so users can verify
 * that enabled freeze/trainer locks snap values back automatically.
 */
export function simulateActiveGameDrainEvent(
  core: Uint8Array,
  event: 'combat-damage' | 'spend-gil' | 'blitz-halftime'
): string {
  if (event === 'combat-damage') {
    for (let i = 0; i < 3; i++) {
      const m = readPartyMember(core, i);
      m.currentHp = Math.max(1, Math.floor(m.currentHpMax * 0.2));
      m.currentMp = Math.max(0, Math.floor(m.currentMpMax * 0.15));
      m.overdriveLevel = 0;
      writePartyMember(core, m);
    }
    return 'Simulated incoming enemy AoE hit: dropped frontline HP/MP & drained Overdrive.';
  }
  if (event === 'spend-gil') {
    const cur = readU32(core, 15752);
    writeU32(core, 15752, Math.max(0, cur - 10000));
    return 'Simulated O\'aka shop purchase (-10,000 Gil).';
  }
  // blitz-halftime
  for (let slot = 0; slot < 6; slot++) {
    const pid = readU8(core, 5702 + 40 + slot);
    if (pid < 60) {
      const p = readBlitzballPlayer(core, pid);
      p.experience = Math.min(65535, p.experience + 25);
      writeBlitzballPlayer(core, p);
    }
  }
  return 'Simulated Blitzball Halftime whistle (+25 base match EXP tick before trainer override).';
}

export { MONSTER_ARENA_BASE };
