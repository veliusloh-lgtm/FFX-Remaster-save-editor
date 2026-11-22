import {
  CHARACTER_ABILITIES,
  CHARACTER_NAMES_DEFAULT,
  OVERDRIVE_MODES,
  OVERDRIVES_LIST,
  SPECIAL_ABILITIES_LIST,
} from './tables';

export const CORE_SIZE = 0x64f8; // 25,848 bytes
export const PC_SWITCH_SIZE = 0x6900; // 26,880 bytes
export const VITA_SIZE = 26872;
export const CRC_START = 0x40;
export const CRC_TOP = 0x1a;
export const CRC_BOTTOM = 0x64f4;

export type SaveFormat = 'pc-steam' | 'switch' | 'ps-vita' | 'ps2-raw';

export interface SaveContainer {
  format: SaveFormat;
  fileName: string;
  core: Uint8Array; // 25,848 bytes
  switchPrefix: Uint8Array; // 8 bytes for Switch
  trailing: Uint8Array; // remaining bytes after core (e.g. 1032 bytes on PC)
}

export interface ChecksumStatus {
  valid: boolean;
  expected: number;
  storedTop: number;
  storedBottom: number;
}

export interface PartyMemberData {
  index: number;
  defaultName: string;
  customName: string;
  activation: number;
  baseHp: number;
  baseMp: number;
  baseStrength: number;
  baseDefense: number;
  baseMagic: number;
  baseMagicDefense: number;
  baseAgility: number;
  baseLuck: number;
  baseEvasion: number;
  baseAccuracy: number;
  currentHp: number;
  currentMp: number;
  currentHpMax: number;
  currentMpMax: number;
  currentStrength: number;
  currentDefense: number;
  currentMagic: number;
  currentMagicDefense: number;
  currentAgility: number;
  currentLuck: number;
  currentEvasion: number;
  currentAccuracy: number;
  apTotal: number;
  apCurrent: number;
  sphereLevelCurrent: number;
  sphereLevelTotal: number;
  equippedWeapon: number;
  equippedArmor: number;
  poisonDamage: number;
  overdriveMode: number;
  overdriveLevel: number;
  overdriveMax: number;
  totalBattles: number;
  enemiesDefeated: number;
  affection: number; // only chars 0..6
}

export interface EquipmentSlotData {
  slot: number;
  nameId: number;
  name2: number;
  occupied: boolean;
  customizeMode: number;
  character: number;
  type: number; // 0 = Weapon, 1 = Armor
  equippedBy: number; // 0xFF = none
  damageFormula: number;
  attackPower: number;
  critical: number;
  abilityCount: number;
  appearance: number;
  abilities: [number, number, number, number];
}

export interface InventoryItemSlot {
  slot: number;
  id: number;
  quantity: number;
}

export interface SphereGridNodeData {
  index: number;
  nodeType: number;
  activatedMask: number; // bits 0..6 = Tidus..Rikku
}

export interface BlitzballPlayerData {
  index: number;
  level: number;
  experience: number;
  contract: number;
  salary: number;
  leagueGoals: number;
  tournamentGoals: number;
  techCapacity: number;
  equippedTechs: [number, number, number, number, number];
  knownTechMask1: number;
  knownTechMask2: number;
}

// FFX Text Encoding Table (matching StringConverter.cs & FFXED)
const FFX_TO_CHAR: Record<number, string> = {
  0x03: '\n',
  0x30: '0', 0x31: '1', 0x32: '2', 0x33: '3', 0x34: '4',
  0x35: '5', 0x36: '6', 0x37: '7', 0x38: '8', 0x39: '9',
  0x3a: ' ', 0x3b: '!', 0x3c: '"', 0x3d: '~', 0x3e: '$',
  0x3f: '%', 0x40: '&', 0x41: "'", 0x42: '(', 0x43: ')',
  0x44: '*', 0x45: '+', 0x46: ',', 0x47: '-', 0x48: '.',
  0x49: '/', 0x4a: ':', 0x4b: ';', 0x4c: '[', 0x4d: '=',
  0x4e: ']', 0x4f: '?',
  0x50: 'A', 0x51: 'B', 0x52: 'C', 0x53: 'D', 0x54: 'E',
  0x55: 'F', 0x56: 'G', 0x57: 'H', 0x58: 'I', 0x59: 'J',
  0x5a: 'K', 0x5b: 'L', 0x5c: 'M', 0x5d: 'N', 0x5e: 'O',
  0x5f: 'P', 0x60: 'Q', 0x61: 'R', 0x62: 'S', 0x63: 'T',
  0x64: 'U', 0x65: 'V', 0x66: 'W', 0x67: 'X', 0x68: 'Y',
  0x69: 'Z', 0x6a: '[', 0x6b: '\\', 0x6c: ']', 0x6d: '^',
  0x6e: '`',
  0x70: 'a', 0x71: 'b', 0x72: 'c', 0x73: 'd', 0x74: 'e',
  0x75: 'f', 0x76: 'g', 0x77: 'h', 0x78: 'i', 0x79: 'j',
  0x7a: 'k', 0x7b: 'l', 0x7c: 'm', 0x7d: 'n', 0x7e: 'o',
  0x7f: 'p', 0x80: 'q', 0x81: 'r', 0x82: 's', 0x83: 't',
  0x84: 'u', 0x85: 'v', 0x86: 'w', 0x87: 'x', 0x88: 'y',
  0x89: 'z', 0x8a: '{', 0x8b: '|', 0x8c: '}', 0x8d: '～',
  0x8e: '·', 0x8f: '【', 0x90: '】', 0x91: '♪', 0x92: '♥',
  0x93: 'Œ', 0x94: '“', 0x95: '”', 0x96: '—', 0x97: 'œ',
  0x98: '¡', 0x99: '↑', 0x9a: '↓', 0x9b: '←', 0x9c: '→',
  0x9d: '¨', 0x9e: '«', 0x9f: '°', 0xa1: '»', 0xa2: '¿',
  0xa3: 'À', 0xa4: 'Á', 0xa5: 'Â', 0xa6: 'Ä', 0xa7: 'Ç',
  0xa8: 'È', 0xa9: 'É', 0xaa: 'Ê', 0xab: 'Ë', 0xac: 'Ì',
  0xad: 'Í', 0xae: 'Î', 0xaf: 'Ï', 0xb0: 'Ñ', 0xb1: 'Ò',
  0xb2: 'Ó', 0xb3: 'Ô', 0xb4: 'Ö', 0xb5: 'Ù', 0xb6: 'Ú',
  0xb7: 'Û', 0xb8: 'Ü', 0xb9: 'ß', 0xba: 'à', 0xbb: 'á',
  0xbc: 'â', 0xbd: 'ä', 0xbe: 'ç', 0xbf: 'è', 0xc0: 'é',
  0xc1: 'ê', 0xc2: 'ë', 0xc3: 'ì', 0xc4: 'í', 0xc5: 'î',
  0xc6: 'ï', 0xc7: 'ñ', 0xc8: 'ò', 0xc9: 'ó', 0xca: 'ô',
  0xcb: 'ö', 0xcc: 'ù', 0xcd: 'ú', 0xce: 'û', 0xcf: 'ü',
};

const CHAR_TO_FFX: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  for (const [k, v] of Object.entries(FFX_TO_CHAR)) {
    if (!(v in map)) {
      map[v] = Number(k);
    }
  }
  return map;
})();

export function decodeFFXString(buf: Uint8Array, offset: number, maxLen = 20): string {
  let out = '';
  for (let i = 0; i < maxLen && offset + i < buf.length; i++) {
    const b = buf[offset + i];
    if (b === 0x00) break;
    out += FFX_TO_CHAR[b] ?? '?';
  }
  return out;
}

export function encodeFFXString(
  buf: Uint8Array,
  offset: number,
  text: string,
  maxBytes = 20
): void {
  const limit = Math.min(text.length, maxBytes - 1);
  for (let i = 0; i < maxBytes; i++) {
    if (i < limit) {
      buf[offset + i] = CHAR_TO_FFX[text[i]] ?? 0x4f; // '?'
    } else {
      buf[offset + i] = 0x00;
    }
  }
}

// CRC-16-CCITT with FFX's exact lookup table (table[255] === 0x0000)
const CRC16_TABLE: Uint16Array = (() => {
  const table = new Uint16Array(256);
  const poly = 0x1021;
  for (let i = 0; i < 256; i++) {
    let crc = (i << 8) & 0xffff;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ poly) & 0xffff : (crc << 1) & 0xffff;
    }
    table[i] = crc;
  }
  table[255] = 0x0000; // FFX quirk
  return table;
})();

export function computeFFXChecksum(core: Uint8Array): number {
  let crc = 0xffff;
  for (let i = CRC_START; i < CORE_SIZE; i++) {
    const b = i === CRC_BOTTOM || i === CRC_BOTTOM + 1 ? 0 : core[i];
    const idx = ((crc >> 8) ^ b) & 0xff;
    crc = (CRC16_TABLE[idx] ^ (crc << 8)) & 0xffff;
  }
  return (crc ^ 0xffff) & 0xffff;
}

export function verifyFFXChecksum(core: Uint8Array): ChecksumStatus {
  const expected = computeFFXChecksum(core);
  const storedTop = readU16(core, CRC_TOP);
  const storedBottom = readU16(core, CRC_BOTTOM);
  return {
    valid: expected === storedTop && expected === storedBottom,
    expected,
    storedTop,
    storedBottom,
  };
}

export function repairFFXChecksum(core: Uint8Array): number {
  const cs = computeFFXChecksum(core);
  writeU16(core, CRC_TOP, cs);
  writeU16(core, CRC_BOTTOM, cs);
  return cs;
}

// Low-level little-endian readers & writers
export function readU8(buf: Uint8Array, offset: number): number {
  return buf[offset] & 0xff;
}

export function writeU8(buf: Uint8Array, offset: number, val: number): void {
  buf[offset] = Math.max(0, Math.min(0xff, Math.trunc(val))) & 0xff;
}

export function readU16(buf: Uint8Array, offset: number): number {
  return (buf[offset] | (buf[offset + 1] << 8)) & 0xffff;
}

export function writeU16(buf: Uint8Array, offset: number, val: number): void {
  const v = Math.max(0, Math.min(0xffff, Math.trunc(val)));
  buf[offset] = v & 0xff;
  buf[offset + 1] = (v >> 8) & 0xff;
}

export function readU32(buf: Uint8Array, offset: number): number {
  return (
    (buf[offset] |
      (buf[offset + 1] << 8) |
      (buf[offset + 2] << 16) |
      (buf[offset + 3] << 24)) >>>
    0
  );
}

export function writeU32(buf: Uint8Array, offset: number, val: number): void {
  const v = Math.max(0, Math.min(0xffffffff, Math.trunc(val))) >>> 0;
  buf[offset] = v & 0xff;
  buf[offset + 1] = (v >> 8) & 0xff;
  buf[offset + 2] = (v >> 16) & 0xff;
  buf[offset + 3] = (v >> 24) & 0xff;
}

export function getBit(buf: Uint8Array, baseOffset: number, bitIndex: number): boolean {
  const byteOffset = baseOffset + Math.floor(bitIndex / 8);
  const bit = bitIndex % 8;
  return ((buf[byteOffset] >> bit) & 1) === 1;
}

export function setBit(
  buf: Uint8Array,
  baseOffset: number,
  bitIndex: number,
  enabled: boolean
): void {
  const byteOffset = baseOffset + Math.floor(bitIndex / 8);
  const bit = bitIndex % 8;
  if (enabled) {
    buf[byteOffset] |= 1 << bit;
  } else {
    buf[byteOffset] &= ~(1 << bit) & 0xff;
  }
}

export function parseSaveFile(bytes: Uint8Array, fileName = 'ffx_000'): SaveContainer {
  if (bytes.length === CORE_SIZE) {
    return {
      format: 'ps2-raw',
      fileName,
      core: bytes.slice(0, CORE_SIZE),
      switchPrefix: new Uint8Array(0),
      trailing: new Uint8Array(0),
    };
  }

  if (bytes.length === VITA_SIZE) {
    return {
      format: 'ps-vita',
      fileName,
      core: bytes.slice(0, CORE_SIZE),
      switchPrefix: new Uint8Array(0),
      trailing: bytes.slice(CORE_SIZE),
    };
  }

  if (bytes.length === PC_SWITCH_SIZE) {
    // Distinguish PC Steam (core at 0) vs Switch (8-byte timestamp prefix, core at 8)
    const pcCoreCandidate = bytes.slice(0, CORE_SIZE);
    const switchCoreCandidate = bytes.slice(8, 8 + CORE_SIZE);

    const pcCheck = verifyFFXChecksum(pcCoreCandidate);
    const switchCheck = verifyFFXChecksum(switchCoreCandidate);

    let isSwitch = false;
    if (switchCheck.valid && !pcCheck.valid) {
      isSwitch = true;
    } else if (!pcCheck.valid && !switchCheck.valid) {
      // Fallback matching FFXED: if any of bytes 25848..25856 is 0, Switch
      for (let i = 0; i < 9; i++) {
        if (bytes[CORE_SIZE + i] === 0) {
          isSwitch = true;
          break;
        }
      }
    }

    if (isSwitch) {
      return {
        format: 'switch',
        fileName,
        core: switchCoreCandidate,
        switchPrefix: bytes.slice(0, 8),
        trailing: bytes.slice(8 + CORE_SIZE),
      };
    }

    return {
      format: 'pc-steam',
      fileName,
      core: pcCoreCandidate,
      switchPrefix: new Uint8Array(0),
      trailing: bytes.slice(CORE_SIZE),
    };
  }

  // Fallback for slightly non-standard decrypted sizes >= CORE_SIZE
  if (bytes.length > CORE_SIZE) {
    return {
      format: 'pc-steam',
      fileName,
      core: bytes.slice(0, CORE_SIZE),
      switchPrefix: new Uint8Array(0),
      trailing: bytes.slice(CORE_SIZE),
    };
  }

  throw new Error(
    `Unsupported save size (${bytes.length} bytes). Expected 26,880 (PC/Switch), 26,872 (PS Vita), or 25,848 (Raw PS2) bytes.`
  );
}

export function serializeSaveFile(
  container: SaveContainer,
  targetFormat: SaveFormat = container.format
): Uint8Array {
  const coreCopy = container.core.slice();
  repairFFXChecksum(coreCopy);

  if (targetFormat === 'ps2-raw') {
    return coreCopy;
  }

  if (targetFormat === 'ps-vita') {
    const out = new Uint8Array(VITA_SIZE);
    out.set(coreCopy, 0);
    if (container.trailing.length > 0) {
      out.set(container.trailing.slice(0, VITA_SIZE - CORE_SIZE), CORE_SIZE);
    }
    return out;
  }

  if (targetFormat === 'switch') {
    const out = new Uint8Array(PC_SWITCH_SIZE);
    if (container.switchPrefix.length === 8) {
      out.set(container.switchPrefix, 0);
    } else {
      const ts = Math.floor(Date.now() / 1000);
      writeU32(out, 0, ts);
    }
    out.set(coreCopy, 8);
    out[8 + CORE_SIZE] = 0xff;
    return out;
  }

  // pc-steam (26,880 bytes)
  const out = new Uint8Array(PC_SWITCH_SIZE);
  out.set(coreCopy, 0);
  if (container.trailing.length > 0 && container.format === 'pc-steam') {
    out.set(container.trailing.slice(0, PC_SWITCH_SIZE - CORE_SIZE), CORE_SIZE);
  } else {
    // Valid default PC Steam tail marker
    out[CORE_SIZE] = 0xff;
  }
  return out;
}

// ==========================================
// Domain Read / Write Helpers
// ==========================================

export const PARTY_BASE = 22032; // 0x5610
export const PARTY_STRIDE = 148; // 0x94
export const EQUIP_BASE = 17628; // 0x44DC
export const EQUIP_STRIDE = 22;
export const ITEM_ID_BASE = 16140; // 0x3F0C
export const ITEM_QTY_BASE = 16652; // 0x410C
export const SPHERE_GRID_BASE = 8748; // 0x222C
export const MONSTER_ARENA_BASE = 16972; // 0x424C

export function readPartyMember(core: Uint8Array, index: number): PartyMemberData {
  const base = PARTY_BASE + index * PARTY_STRIDE;
  return {
    index,
    defaultName: CHARACTER_NAMES_DEFAULT[index] ?? `Unit ${index}`,
    customName: decodeFFXString(core, 25484 + index * 20, 20),
    activation: readU8(core, base + 40),
    baseHp: readU32(core, base + 0),
    baseMp: readU32(core, base + 4),
    baseStrength: readU8(core, base + 8),
    baseDefense: readU8(core, base + 9),
    baseMagic: readU8(core, base + 10),
    baseMagicDefense: readU8(core, base + 11),
    baseAgility: readU8(core, base + 12),
    baseLuck: readU8(core, base + 13),
    baseEvasion: readU8(core, base + 14),
    baseAccuracy: readU8(core, base + 15),
    apTotal: readU32(core, base + 16),
    apCurrent: readU32(core, base + 20),
    currentHp: readU32(core, base + 24),
    currentMp: readU32(core, base + 28),
    currentHpMax: readU32(core, base + 32),
    currentMpMax: readU32(core, base + 36),
    equippedWeapon: readU8(core, base + 41),
    equippedArmor: readU8(core, base + 42),
    currentStrength: readU8(core, base + 43),
    currentDefense: readU8(core, base + 44),
    currentMagic: readU8(core, base + 45),
    currentMagicDefense: readU8(core, base + 46),
    currentAgility: readU8(core, base + 47),
    currentLuck: readU8(core, base + 48),
    currentEvasion: readU8(core, base + 49),
    currentAccuracy: readU8(core, base + 50),
    poisonDamage: readU8(core, base + 51),
    overdriveMode: readU8(core, base + 52),
    overdriveLevel: readU8(core, base + 53),
    overdriveMax: readU8(core, base + 54),
    sphereLevelCurrent: readU8(core, base + 55),
    sphereLevelTotal: readU8(core, base + 56),
    totalBattles: readU32(core, base + 76),
    enemiesDefeated: readU32(core, base + 80),
    affection: index < 7 ? readU32(core, 108 + index * 4) : 0,
  };
}

export const PARTY_STAT_LIMITS = {
  minHp: 1,
  maxHp: 99999,
  minMp: 0,
  maxMp: 9999,
  minAttr: 0,
  minAgility: 1,
  maxAttr: 255,
  maxSphereLevelCurrent: 99,
  maxSphereLevelTotal: 255,
  maxAp: 99999999,
  maxOverdrive: 255,
  maxBattles: 9999999,
  maxAffection: 999,
  maxOverdriveModeCount: 65535,
} as const;

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

export function clampPartyMemberStats(data: PartyMemberData): PartyMemberData {
  const baseHp = clampInt(data.baseHp, PARTY_STAT_LIMITS.minHp, PARTY_STAT_LIMITS.maxHp);
  const currentHpMax = clampInt(data.currentHpMax, PARTY_STAT_LIMITS.minHp, PARTY_STAT_LIMITS.maxHp);
  const currentHp = clampInt(data.currentHp, 0, currentHpMax);

  const baseMp = clampInt(data.baseMp, PARTY_STAT_LIMITS.minMp, PARTY_STAT_LIMITS.maxMp);
  const currentMpMax = clampInt(data.currentMpMax, PARTY_STAT_LIMITS.minMp, PARTY_STAT_LIMITS.maxMp);
  const currentMp = clampInt(data.currentMp, 0, currentMpMax);

  const overdriveMax = clampInt(data.overdriveMax, 0, PARTY_STAT_LIMITS.maxOverdrive);
  const overdriveLevel = clampInt(
    data.overdriveLevel,
    0,
    overdriveMax > 0 ? overdriveMax : PARTY_STAT_LIMITS.maxOverdrive
  );

  const sphereLevelCurrent = clampInt(
    data.sphereLevelCurrent,
    0,
    PARTY_STAT_LIMITS.maxSphereLevelCurrent
  );
  const sphereLevelTotal = clampInt(
    data.sphereLevelTotal,
    0,
    PARTY_STAT_LIMITS.maxSphereLevelTotal
  );

  return {
    ...data,
    activation: data.activation === 17 || data.activation === 16 || data.activation === 0 ? data.activation : 0,
    baseHp,
    baseMp,
    baseStrength: clampInt(data.baseStrength, PARTY_STAT_LIMITS.minAttr, PARTY_STAT_LIMITS.maxAttr),
    baseDefense: clampInt(data.baseDefense, PARTY_STAT_LIMITS.minAttr, PARTY_STAT_LIMITS.maxAttr),
    baseMagic: clampInt(data.baseMagic, PARTY_STAT_LIMITS.minAttr, PARTY_STAT_LIMITS.maxAttr),
    baseMagicDefense: clampInt(data.baseMagicDefense, PARTY_STAT_LIMITS.minAttr, PARTY_STAT_LIMITS.maxAttr),
    baseAgility: clampInt(data.baseAgility, PARTY_STAT_LIMITS.minAgility, PARTY_STAT_LIMITS.maxAttr),
    baseLuck: clampInt(data.baseLuck, PARTY_STAT_LIMITS.minAttr, PARTY_STAT_LIMITS.maxAttr),
    baseEvasion: clampInt(data.baseEvasion, PARTY_STAT_LIMITS.minAttr, PARTY_STAT_LIMITS.maxAttr),
    baseAccuracy: clampInt(data.baseAccuracy, PARTY_STAT_LIMITS.minAttr, PARTY_STAT_LIMITS.maxAttr),
    apTotal: clampInt(data.apTotal, 0, PARTY_STAT_LIMITS.maxAp),
    apCurrent: clampInt(data.apCurrent, 0, PARTY_STAT_LIMITS.maxAp),
    currentHp,
    currentMp,
    currentHpMax,
    currentMpMax,
    equippedWeapon: clampInt(data.equippedWeapon, 0, 255),
    equippedArmor: clampInt(data.equippedArmor, 0, 255),
    currentStrength: clampInt(data.currentStrength, PARTY_STAT_LIMITS.minAttr, PARTY_STAT_LIMITS.maxAttr),
    currentDefense: clampInt(data.currentDefense, PARTY_STAT_LIMITS.minAttr, PARTY_STAT_LIMITS.maxAttr),
    currentMagic: clampInt(data.currentMagic, PARTY_STAT_LIMITS.minAttr, PARTY_STAT_LIMITS.maxAttr),
    currentMagicDefense: clampInt(data.currentMagicDefense, PARTY_STAT_LIMITS.minAttr, PARTY_STAT_LIMITS.maxAttr),
    currentAgility: clampInt(data.currentAgility, PARTY_STAT_LIMITS.minAgility, PARTY_STAT_LIMITS.maxAttr),
    currentLuck: clampInt(data.currentLuck, PARTY_STAT_LIMITS.minAttr, PARTY_STAT_LIMITS.maxAttr),
    currentEvasion: clampInt(data.currentEvasion, PARTY_STAT_LIMITS.minAttr, PARTY_STAT_LIMITS.maxAttr),
    currentAccuracy: clampInt(data.currentAccuracy, PARTY_STAT_LIMITS.minAttr, PARTY_STAT_LIMITS.maxAttr),
    poisonDamage: clampInt(data.poisonDamage, 0, 255),
    overdriveMode: clampInt(data.overdriveMode, 0, 19),
    overdriveLevel,
    overdriveMax,
    sphereLevelCurrent,
    sphereLevelTotal,
    totalBattles: clampInt(data.totalBattles, 0, PARTY_STAT_LIMITS.maxBattles),
    enemiesDefeated: clampInt(data.enemiesDefeated, 0, PARTY_STAT_LIMITS.maxBattles),
    affection: data.index < 7 ? clampInt(data.affection, 0, PARTY_STAT_LIMITS.maxAffection) : 0,
  };
}

export function hasUnsafePartyStats(member: PartyMemberData): boolean {
  return (
    member.baseHp > PARTY_STAT_LIMITS.maxHp ||
    member.baseHp < PARTY_STAT_LIMITS.minHp ||
    member.currentHpMax > PARTY_STAT_LIMITS.maxHp ||
    member.currentHpMax < PARTY_STAT_LIMITS.minHp ||
    member.currentHp > member.currentHpMax ||
    member.baseMp > PARTY_STAT_LIMITS.maxMp ||
    member.currentMpMax > PARTY_STAT_LIMITS.maxMp ||
    member.currentMp > member.currentMpMax ||
    member.sphereLevelCurrent > PARTY_STAT_LIMITS.maxSphereLevelCurrent ||
    member.apCurrent > PARTY_STAT_LIMITS.maxAp ||
    member.apTotal > PARTY_STAT_LIMITS.maxAp ||
    (member.overdriveMax > 0 && member.overdriveLevel > member.overdriveMax) ||
    member.affection > PARTY_STAT_LIMITS.maxAffection
  );
}

export function clampAllPartyStats(core: Uint8Array): number {
  let fixed = 0;
  for (let i = 0; i < 18; i++) {
    const m = readPartyMember(core, i);
    if (hasUnsafePartyStats(m)) {
      writePartyMember(core, m);
      fixed++;
    }
  }
  return fixed;
}

export function writePartyMember(core: Uint8Array, raw: PartyMemberData): void {
  const data = clampPartyMemberStats(raw);
  const base = PARTY_BASE + data.index * PARTY_STRIDE;
  encodeFFXString(core, 25484 + data.index * 20, data.customName, 20);
  writeU8(core, base + 40, data.activation);
  writeU32(core, base + 0, data.baseHp);
  writeU32(core, base + 4, data.baseMp);
  writeU8(core, base + 8, data.baseStrength);
  writeU8(core, base + 9, data.baseDefense);
  writeU8(core, base + 10, data.baseMagic);
  writeU8(core, base + 11, data.baseMagicDefense);
  writeU8(core, base + 12, data.baseAgility);
  writeU8(core, base + 13, data.baseLuck);
  writeU8(core, base + 14, data.baseEvasion);
  writeU8(core, base + 15, data.baseAccuracy);
  writeU32(core, base + 16, data.apTotal);
  writeU32(core, base + 20, data.apCurrent);
  writeU32(core, base + 24, data.currentHp);
  writeU32(core, base + 28, data.currentMp);
  writeU32(core, base + 32, data.currentHpMax);
  writeU32(core, base + 36, data.currentMpMax);
  writeU8(core, base + 41, data.equippedWeapon);
  writeU8(core, base + 42, data.equippedArmor);
  writeU8(core, base + 43, data.currentStrength);
  writeU8(core, base + 44, data.currentDefense);
  writeU8(core, base + 45, data.currentMagic);
  writeU8(core, base + 46, data.currentMagicDefense);
  writeU8(core, base + 47, data.currentAgility);
  writeU8(core, base + 48, data.currentLuck);
  writeU8(core, base + 49, data.currentEvasion);
  writeU8(core, base + 50, data.currentAccuracy);
  writeU8(core, base + 51, data.poisonDamage);
  writeU8(core, base + 52, data.overdriveMode);
  writeU8(core, base + 53, data.overdriveLevel);
  writeU8(core, base + 54, data.overdriveMax);
  writeU8(core, base + 55, data.sphereLevelCurrent);
  writeU8(core, base + 56, data.sphereLevelTotal);
  writeU32(core, base + 76, data.totalBattles);
  writeU32(core, base + 80, data.enemiesDefeated);
  if (data.index < 7) {
    writeU32(core, 108 + data.index * 4, data.affection);
  }
}

export function maxCharacterStats(core: Uint8Array, index: number): void {
  const m = readPartyMember(core, index);
  m.baseHp = PARTY_STAT_LIMITS.maxHp;
  m.currentHp = PARTY_STAT_LIMITS.maxHp;
  m.currentHpMax = PARTY_STAT_LIMITS.maxHp;
  m.baseMp = PARTY_STAT_LIMITS.maxMp;
  m.currentMp = PARTY_STAT_LIMITS.maxMp;
  m.currentMpMax = PARTY_STAT_LIMITS.maxMp;
  m.baseStrength = PARTY_STAT_LIMITS.maxAttr;
  m.baseDefense = PARTY_STAT_LIMITS.maxAttr;
  m.baseMagic = PARTY_STAT_LIMITS.maxAttr;
  m.baseMagicDefense = PARTY_STAT_LIMITS.maxAttr;
  m.baseAgility = PARTY_STAT_LIMITS.maxAttr;
  m.baseLuck = PARTY_STAT_LIMITS.maxAttr;
  m.baseEvasion = PARTY_STAT_LIMITS.maxAttr;
  m.baseAccuracy = PARTY_STAT_LIMITS.maxAttr;
  m.currentStrength = PARTY_STAT_LIMITS.maxAttr;
  m.currentDefense = PARTY_STAT_LIMITS.maxAttr;
  m.currentMagic = PARTY_STAT_LIMITS.maxAttr;
  m.currentMagicDefense = PARTY_STAT_LIMITS.maxAttr;
  m.currentAgility = PARTY_STAT_LIMITS.maxAttr;
  m.currentLuck = PARTY_STAT_LIMITS.maxAttr;
  m.currentEvasion = PARTY_STAT_LIMITS.maxAttr;
  m.currentAccuracy = PARTY_STAT_LIMITS.maxAttr;
  m.sphereLevelCurrent = PARTY_STAT_LIMITS.maxSphereLevelCurrent;
  m.sphereLevelTotal = Math.max(m.sphereLevelTotal, 101);
  m.overdriveLevel = m.overdriveMax > 0 ? Math.min(PARTY_STAT_LIMITS.maxOverdrive, m.overdriveMax) : 100;
  writePartyMember(core, m);
}

export function unlockAllCharacterAbilities(core: Uint8Array, index: number): void {
  const delta = index * PARTY_STRIDE;
  for (const ab of CHARACTER_ABILITIES) {
    setBit(core, ab.offset + delta, ab.bit, true);
  }
}

export function unlockAllCharacterOverdriveModes(core: Uint8Array, index: number): void {
  const delta = index * PARTY_STRIDE;
  for (const mode of OVERDRIVE_MODES) {
    if (mode.bit < 17 || mode.bit === 19) {
      setBit(core, 22164 + delta, mode.bit, true);
    }
  }
}

export function unlockAllOverdrives(core: Uint8Array): void {
  for (const od of OVERDRIVES_LIST) {
    setBit(core, od.offset, od.bit, true);
  }
  for (const sp of SPECIAL_ABILITIES_LIST) {
    for (const acc of sp.accessors) {
      setBit(core, acc.offset, acc.bit, acc.value);
    }
  }
}

export function readEquipmentSlot(core: Uint8Array, slot: number): EquipmentSlotData {
  const base = EQUIP_BASE + slot * EQUIP_STRIDE;
  return {
    slot,
    nameId: readU8(core, base + 0),
    name2: readU8(core, base + 1),
    occupied: readU8(core, base + 2) !== 0,
    customizeMode: readU8(core, base + 3),
    character: readU8(core, base + 4),
    type: readU8(core, base + 5),
    equippedBy: readU8(core, base + 6),
    damageFormula: readU8(core, base + 8),
    attackPower: readU8(core, base + 9),
    critical: readU8(core, base + 10),
    abilityCount: readU8(core, base + 11),
    appearance: readU16(core, base + 12),
    abilities: [
      readU16(core, base + 14),
      readU16(core, base + 16),
      readU16(core, base + 18),
      readU16(core, base + 20),
    ],
  };
}

export function writeEquipmentSlot(core: Uint8Array, item: EquipmentSlotData): void {
  const base = EQUIP_BASE + item.slot * EQUIP_STRIDE;
  writeU8(core, base + 0, item.nameId);
  writeU8(core, base + 1, item.name2);
  writeU8(core, base + 2, item.occupied ? 1 : 0);
  writeU8(core, base + 3, item.customizeMode);
  writeU8(core, base + 4, item.character);
  writeU8(core, base + 5, item.type);
  writeU8(core, base + 6, item.equippedBy);
  writeU8(core, base + 7, 0);
  writeU8(core, base + 8, item.damageFormula);
  writeU8(core, base + 9, item.attackPower);
  writeU8(core, base + 10, item.critical);
  writeU8(core, base + 11, item.abilityCount);
  writeU16(core, base + 12, item.appearance);
  writeU16(core, base + 14, item.abilities[0]);
  writeU16(core, base + 16, item.abilities[1]);
  writeU16(core, base + 18, item.abilities[2]);
  writeU16(core, base + 20, item.abilities[3]);
}

export function readInventoryItem(core: Uint8Array, slot: number): InventoryItemSlot {
  return {
    slot,
    id: readU16(core, ITEM_ID_BASE + slot * 2),
    quantity: readU8(core, ITEM_QTY_BASE + slot),
  };
}

export function writeInventoryItem(core: Uint8Array, item: InventoryItemSlot): void {
  writeU16(core, ITEM_ID_BASE + item.slot * 2, item.id);
  writeU8(core, ITEM_QTY_BASE + item.slot, item.id === 0x00ff ? 0 : item.quantity);
}

/**
 * Returns a map from non-empty item ID (id !== 0x00ff) to all bag slot indices (0..111) holding it.
 */
export function getUsedInventorySlotMap(core: Uint8Array): Map<number, number[]> {
  const map = new Map<number, number[]>();
  for (let slot = 0; slot < 112; slot++) {
    const item = readInventoryItem(core, slot);
    if (item.id === 0x00ff) continue;
    const list = map.get(item.id);
    if (list) {
      list.push(slot);
    } else {
      map.set(item.id, [slot]);
    }
  }
  return map;
}

/**
 * Writes an inventory item only if the item ID is empty (0x00ff) or not already listed
 * in another bag slot. Returns true if written, false if rejected as a duplicate.
 */
export function assignUniqueInventoryItem(core: Uint8Array, item: InventoryItemSlot): boolean {
  if (item.id !== 0x00ff) {
    for (let s = 0; s < 112; s++) {
      if (s === item.slot) continue;
      if (readInventoryItem(core, s).id === item.id) {
        return false;
      }
    }
  }
  writeInventoryItem(core, item);
  return true;
}

/**
 * Sets quantity to targetQuantity (default 99) for all bag slots currently in possession
 * (id !== 0x00ff and quantity > 0). Returns the number of slots updated.
 */
export function maxOwnedInventoryItems(core: Uint8Array, targetQuantity = 99): number {
  const clamped = Math.max(1, Math.min(99, Math.trunc(targetQuantity)));
  let updated = 0;
  for (let slot = 0; slot < 112; slot++) {
    const item = readInventoryItem(core, slot);
    if (item.id !== 0x00ff && item.quantity > 0) {
      writeInventoryItem(core, { ...item, quantity: clamped });
      updated++;
    }
  }
  return updated;
}

export function getSphereGridMeta(core: Uint8Array): {
  typeLabel: 'Standard (International)' | 'Expert' | 'Original';
  nodeCount: number;
} {
  if (getBit(core, 15693, 6)) {
    return { typeLabel: 'Standard (International)', nodeCount: 860 };
  }
  if (getBit(core, 15693, 7)) {
    return { typeLabel: 'Expert', nodeCount: 814 };
  }
  return { typeLabel: 'Original', nodeCount: 828 };
}

export function readSphereGridNode(core: Uint8Array, index: number): SphereGridNodeData {
  const base = SPHERE_GRID_BASE + index * 2;
  return {
    index,
    nodeType: readU8(core, base),
    activatedMask: readU8(core, base + 1),
  };
}

export function writeSphereGridNode(core: Uint8Array, node: SphereGridNodeData): void {
  const base = SPHERE_GRID_BASE + node.index * 2;
  writeU8(core, base, node.nodeType);
  writeU8(core, base + 1, node.activatedMask);
}

export function readBlitzballPlayer(core: Uint8Array, index: number): BlitzballPlayerData {
  return {
    index,
    level: readU8(core, 5626 + index),
    experience: readU16(core, 6036 + index * 2),
    contract: readU8(core, 5974 + index),
    salary: readU16(core, 6596 + index * 2),
    leagueGoals: readU16(core, 6356 + index * 2),
    tournamentGoals: readU16(core, 6476 + index * 2),
    techCapacity: readU8(core, 5566 + index),
    equippedTechs: [
      readU8(core, 5266 + index * 5 + 0),
      readU8(core, 5266 + index * 5 + 1),
      readU8(core, 5266 + index * 5 + 2),
      readU8(core, 5266 + index * 5 + 3),
      readU8(core, 5266 + index * 5 + 4),
    ],
    knownTechMask1: readU32(core, 4652 + index * 4),
    knownTechMask2: readU32(core, 4892 + index * 4),
  };
}

export function writeBlitzballPlayer(core: Uint8Array, p: BlitzballPlayerData): void {
  writeU8(core, 5626 + p.index, p.level);
  writeU16(core, 6036 + p.index * 2, p.experience);
  writeU8(core, 5974 + p.index, p.contract);
  writeU16(core, 6596 + p.index * 2, p.salary);
  writeU16(core, 6356 + p.index * 2, p.leagueGoals);
  writeU16(core, 6476 + p.index * 2, p.tournamentGoals);
  writeU8(core, 5566 + p.index, p.techCapacity);
  for (let i = 0; i < 5; i++) {
    writeU8(core, 5266 + p.index * 5 + i, p.equippedTechs[i]);
  }
  writeU32(core, 4652 + p.index * 4, p.knownTechMask1);
  writeU32(core, 4892 + p.index * 4, p.knownTechMask2);
}

/**
 * Sets experience to 0 for the specified Blitzball players (defaults to all 60 players).
 * Returns the number of player records cleared.
 */
export function removeBlitzballExp(core: Uint8Array, playerIndices?: number[]): number {
  const targets =
    playerIndices && playerIndices.length > 0
      ? playerIndices
      : Array.from({ length: 60 }, (_, i) => i);
  let count = 0;
  for (const idx of targets) {
    if (idx < 0 || idx >= 60) continue;
    const p = readBlitzballPlayer(core, idx);
    writeBlitzballPlayer(core, { ...p, experience: 0 });
    count++;
  }
  return count;
}

/**
 * Returns the specified Blitzball players (defaults to all 60 players) to Level 1
 * and resets their EXP to 0 so they remain Level 1 in-game.
 */
export function resetBlitzballLevelToOne(core: Uint8Array, playerIndices?: number[]): number {
  const targets =
    playerIndices && playerIndices.length > 0
      ? playerIndices
      : Array.from({ length: 60 }, (_, i) => i);
  let count = 0;
  for (const idx of targets) {
    if (idx < 0 || idx >= 60) continue;
    const p = readBlitzballPlayer(core, idx);
    writeBlitzballPlayer(core, { ...p, level: 1, experience: 0 });
    count++;
  }
  return count;
}

/**
 * Clears all learned tech flags (knownTechMask1/2 = 0) and equipped tech slots ([0,0,0,0,0])
 * for the specified Blitzball players (defaults to all 60 players).
 */
export function removeBlitzballSkills(core: Uint8Array, playerIndices?: number[]): number {
  const targets =
    playerIndices && playerIndices.length > 0
      ? playerIndices
      : Array.from({ length: 60 }, (_, i) => i);
  let count = 0;
  for (const idx of targets) {
    if (idx < 0 || idx >= 60) continue;
    const p = readBlitzballPlayer(core, idx);
    writeBlitzballPlayer(core, {
      ...p,
      equippedTechs: [0, 0, 0, 0, 0],
      knownTechMask1: 0,
      knownTechMask2: 0,
    });
    count++;
  }
  return count;
}

/**
 * Creates a clean, valid 26,880-byte FFX HD Remaster PC Steam sample save file
 * with authentic starter stats, items, equipment, Sphere Grid nodes, and valid CRC-16-CCITT.
 */
export function createSampleSave(): SaveContainer {
  const core = new Uint8Array(CORE_SIZE);

  // Set Standard Sphere Grid (bit 6 at 15693)
  setBit(core, 15693, 6, true);

  // Header metadata
  writeU16(core, 250, 129); // Room Number (Besaid Village)
  writeU8(core, 248, 0); // Spawn Point
  writeU16(core, 3116, 200); // Storyline Progress
  writeU32(core, 252, 5420); // 1h 30m 20s playtime
  writeU32(core, 15752, 25000); // 25,000 Gil
  writeU32(core, 15700, 42); // 42 Battles Fought
  writeU32(core, 3168, 1001); // O'aka donation
  writeU8(core, 15844, 120); // Yojimbo compatibility

  // Active Party Roster (Tidus, Yuna, Auron, Kimahri, Wakka, Lulu, Rikku)
  for (let i = 0; i < 7; i++) {
    writeU8(core, 15768 + i, i);
  }
  for (let i = 7; i < 18; i++) {
    writeU8(core, 15768 + i, 0xff);
  }

  // Starter Party Stats
  const starterStats: Array<{
    hp: number;
    mp: number;
    str: number;
    def: number;
    mag: number;
    mdef: number;
    agi: number;
    lck: number;
    eva: number;
    acc: number;
    slv: number;
    weapon: number;
    armor: number;
  }> = [
    { hp: 520, mp: 12, str: 15, def: 10, mag: 5, mdef: 5, agi: 10, lck: 18, eva: 10, acc: 10, slv: 3, weapon: 0, armor: 1 },
    { hp: 475, mp: 84, str: 5, def: 5, mag: 20, mdef: 20, agi: 10, lck: 17, eva: 30, acc: 3, slv: 4, weapon: 2, armor: 3 },
    { hp: 1030, mp: 33, str: 20, def: 15, mag: 5, mdef: 5, agi: 5, lck: 17, eva: 5, acc: 3, slv: 2, weapon: 4, armor: 5 },
    { hp: 644, mp: 78, str: 16, def: 15, mag: 17, mdef: 5, agi: 6, lck: 18, eva: 5, acc: 5, slv: 3, weapon: 6, armor: 7 },
    { hp: 618, mp: 10, str: 14, def: 10, mag: 10, mdef: 5, agi: 7, lck: 19, eva: 5, acc: 25, slv: 2, weapon: 8, armor: 9 },
    { hp: 380, mp: 92, str: 5, def: 8, mag: 20, mdef: 30, agi: 5, lck: 17, eva: 40, acc: 3, slv: 3, weapon: 10, armor: 11 },
    { hp: 360, mp: 85, str: 10, def: 8, mag: 10, mdef: 8, agi: 16, lck: 18, eva: 5, acc: 5, slv: 3, weapon: 0xff, armor: 0xff },
  ];

  for (let i = 0; i < 18; i++) {
    const s = starterStats[i];
    const base = PARTY_BASE + i * PARTY_STRIDE;
    encodeFFXString(core, 25484 + i * 20, CHARACTER_NAMES_DEFAULT[i], 20);
    writeU8(core, base + 40, i < 7 || i === 8 ? 17 : 0);
    if (s) {
      writeU32(core, base + 0, s.hp);
      writeU32(core, base + 4, s.mp);
      writeU8(core, base + 8, s.str);
      writeU8(core, base + 9, s.def);
      writeU8(core, base + 10, s.mag);
      writeU8(core, base + 11, s.mdef);
      writeU8(core, base + 12, s.agi);
      writeU8(core, base + 13, s.lck);
      writeU8(core, base + 14, s.eva);
      writeU8(core, base + 15, s.acc);
      writeU32(core, base + 24, s.hp);
      writeU32(core, base + 28, s.mp);
      writeU32(core, base + 32, s.hp);
      writeU32(core, base + 36, s.mp);
      writeU8(core, base + 41, s.weapon);
      writeU8(core, base + 42, s.armor);
      writeU8(core, base + 43, s.str);
      writeU8(core, base + 44, s.def);
      writeU8(core, base + 45, s.mag);
      writeU8(core, base + 46, s.mdef);
      writeU8(core, base + 47, s.agi);
      writeU8(core, base + 48, s.lck);
      writeU8(core, base + 49, s.eva);
      writeU8(core, base + 50, s.acc);
      writeU8(core, base + 54, 100);
      writeU8(core, base + 55, s.slv);
      writeU8(core, base + 56, s.slv);
      writeU32(core, 108 + i * 4, 20);
      setBit(core, base + 58, 0, true); // Attack
      setBit(core, base + 58, 1, true); // Item
      setBit(core, base + 58, 2, true); // Switch
    } else {
      writeU32(core, base + 0, 1200);
      writeU32(core, base + 4, 120);
      writeU32(core, base + 24, 1200);
      writeU32(core, base + 28, 120);
      writeU32(core, base + 32, 1200);
      writeU32(core, base + 36, 120);
      writeU8(core, base + 41, 0xff);
      writeU8(core, base + 42, 0xff);
      writeU8(core, base + 54, 100);
    }
  }

  // Starter Equipment (slots 0..11 + empty rest)
  for (let slot = 0; slot < 200; slot++) {
    writeEquipmentSlot(core, {
      slot,
      nameId: 0,
      name2: 0,
      occupied: false,
      customizeMode: 0,
      character: 0,
      type: 0,
      equippedBy: 0xff,
      damageFormula: 1,
      attackPower: 16,
      critical: 3,
      abilityCount: 1,
      appearance: 0x00ff,
      abilities: [0x00ff, 0x00ff, 0x00ff, 0x00ff],
    });
  }

  const starterGear: EquipmentSlotData[] = [
    {
      slot: 0, nameId: 1, name2: 0, occupied: true, customizeMode: 0, character: 0, type: 0,
      equippedBy: 0, damageFormula: 1, attackPower: 16, critical: 3, abilityCount: 4,
      appearance: 0x4001, abilities: [0x8062, 0x8066, 0x801e, 0x00ff],
    },
    {
      slot: 1, nameId: 148, name2: 0, occupied: true, customizeMode: 0, character: 0, type: 1,
      equippedBy: 0, damageFormula: 1, attackPower: 0, critical: 0, abilityCount: 2,
      appearance: 0x4042, abilities: [0x806a, 0x00ff, 0x00ff, 0x00ff],
    },
    {
      slot: 2, nameId: 10, name2: 0, occupied: true, customizeMode: 0, character: 1, type: 0,
      equippedBy: 1, damageFormula: 1, attackPower: 16, critical: 3, abilityCount: 2,
      appearance: 0x400b, abilities: [0x8066, 0x00ff, 0x00ff, 0x00ff],
    },
    {
      slot: 3, nameId: 140, name2: 0, occupied: true, customizeMode: 0, character: 1, type: 1,
      equippedBy: 1, damageFormula: 1, attackPower: 0, critical: 0, abilityCount: 2,
      appearance: 0x4047, abilities: [0x8072, 0x00ff, 0x00ff, 0x00ff],
    },
    {
      slot: 4, nameId: 14, name2: 0, occupied: true, customizeMode: 0, character: 2, type: 0,
      equippedBy: 2, damageFormula: 1, attackPower: 16, critical: 3, abilityCount: 2,
      appearance: 0x4015, abilities: [0x8004, 0x00ff, 0x00ff, 0x00ff],
    },
    {
      slot: 5, nameId: 140, name2: 0, occupied: true, customizeMode: 0, character: 2, type: 1,
      equippedBy: 2, damageFormula: 1, attackPower: 0, critical: 0, abilityCount: 2,
      appearance: 0x404c, abilities: [0x806a, 0x00ff, 0x00ff, 0x00ff],
    },
  ];
  for (const g of starterGear) {
    writeEquipmentSlot(core, g);
  }

  // Starter Inventory Items (112 slots)
  for (let i = 0; i < 112; i++) {
    writeInventoryItem(core, { slot: i, id: 0x00ff, quantity: 0 });
  }
  const starterItems: [number, number][] = [
    [0x2000, 15], // Potion
    [0x2001, 6],  // Hi-Potion
    [0x2006, 5],  // Phoenix Down
    [0x200a, 4],  // Antidote
    [0x2046, 8],  // Power Sphere
    [0x2047, 6],  // Mana Sphere
    [0x2048, 7],  // Speed Sphere
    [0x2049, 3],  // Ability Sphere
  ];
  starterItems.forEach(([id, quantity], slot) => {
    writeInventoryItem(core, { slot, id, quantity });
  });

  // Sphere Grid sample nodes (860 nodes)
  const sampleNodes = [2, 34, 6, 10, 14, 18, 22, 26, 30, 38, 39, 40, 1];
  for (let i = 0; i < 860; i++) {
    writeSphereGridNode(core, {
      index: i,
      nodeType: sampleNodes[i % sampleNodes.length],
      activatedMask: i < 12 ? 0x01 : 0,
    });
  }

  // Blitzball sample roster (Besaid Aurochs)
  for (let i = 0; i < 60; i++) {
    writeU8(core, 5626 + i, (i % 10) + 1);
    writeU8(core, 5566 + i, 3);
    writeU8(core, 5974 + i, 10);
    writeU16(core, 6596 + i * 2, 120 + i * 10);
  }
  [0, 1, 2, 3, 4, 5, 6, 59].forEach((playerId, slot) => {
    writeU8(core, 5702 + 40 + slot, playerId);
  });
  writeU8(core, 3252 + 5, 8);
  for (let t = 0; t < 5; t++) {
    writeU8(core, 5702 + t * 8 + 0, 7 + t * 6);
  }

  // Monster Arena sample captures
  writeU8(core, MONSTER_ARENA_BASE + 8, 3); // Dingo
  writeU8(core, MONSTER_ARENA_BASE + 27, 2); // Condor
  writeU8(core, MONSTER_ARENA_BASE + 15, 1); // Water Flan

  repairFFXChecksum(core);
  const trailing = new Uint8Array(PC_SWITCH_SIZE - CORE_SIZE);
  trailing[0] = 0xff;

  return {
    format: 'pc-steam',
    fileName: 'ffx_000',
    core,
    switchPrefix: new Uint8Array(0),
    trailing,
  };
}

// ==========================================
// Pure Batch Actions & Save Integrity Syncs
// ==========================================

export function syncPrimerCount(core: Uint8Array): number {
  let count = 0;
  for (let i = 0; i < 26; i++) {
    if (getBit(core, 17612, 4 + i) || getBit(core, 15696, i)) {
      count++;
    }
  }
  writeU8(core, 3212, count);
  return count;
}

export function syncHeaderPartyAndTime(core: Uint8Array): void {
  // Mirror playtime bytes 252..255 -> header 16..19
  core[16] = core[252];
  core[17] = core[253];
  core[18] = core[254];
  core[19] = core[255];

  // Mirror active roster 15768..15774 -> header portrait slots 5..11
  const rikkuWetsuit = getBit(core, 273, 0);
  for (let i = 0; i < 7; i++) {
    let charId = readU8(core, 15768 + i);
    if (charId === 7) {
      charId = 8; // Seymour portrait code in header
    } else if (charId === 6 && rikkuWetsuit) {
      charId = 7; // Rikku wetsuit portrait code in header
    }
    writeU8(core, 5 + i, charId);
  }
}

export function batchActivateSphereGridForChar(core: Uint8Array, charIndex: number): void {
  if (charIndex < 0 || charIndex > 6) return;
  for (let n = 8748; n <= 10466; n += 2) {
    const t = readU8(core, n);
    if ((t > 1 && t < 39) || (t > 41 && t < 127)) {
      setBit(core, n + 1, charIndex, true);
    }
  }
}

export function batchActivateSphereGridAll(core: Uint8Array): void {
  for (let n = 8748; n <= 10466; n += 2) {
    const t = readU8(core, n);
    if ((t > 1 && t < 39) || (t > 41 && t < 127)) {
      writeU8(core, n + 1, 0x7f); // bits 0..6 (Tidus..Rikku)
    }
  }
}

export function batchClearSphereGridActivation(core: Uint8Array): void {
  for (let n = 8749; n <= 10467; n += 2) {
    writeU8(core, n, 0);
  }
}

export function batchRemoveSphereGridLocks(core: Uint8Array): void {
  for (let n = 8748; n <= 10466; n += 2) {
    const t = readU8(core, n);
    // Lv.1 (39), Lv.2 (40), Lv.4 (41), Lv.3 (0, 127, 129)
    if (t === 0 || t === 39 || t === 40 || t === 41 || t === 127 || t === 129) {
      writeU8(core, n, 1); // Empty node
      writeU8(core, n + 1, 0);
    }
  }
}

export function batchMaxSphereGridStatNodes(core: Uint8Array): void {
  for (let n = 8748; n <= 10466; n += 2) {
    const t = readU8(core, n);
    if (t >= 2) {
      if (t <= 5) writeU8(core, n, 5);       // Str +4
      else if (t <= 9) writeU8(core, n, 9);  // Def +4
      else if (t <= 13) writeU8(core, n, 13); // Mag +4
      else if (t <= 17) writeU8(core, n, 17); // MDef +4
      else if (t <= 21) writeU8(core, n, 21); // Agi +4
      else if (t <= 25) writeU8(core, n, 25); // Lck +4
      else if (t <= 29) writeU8(core, n, 29); // Eva +4
      else if (t <= 33) writeU8(core, n, 33); // Acc +4
      else if (t <= 35) writeU8(core, n, 35); // HP +300
      else if (t < 39) writeU8(core, n, 36);  // MP +40
    }
  }
}

export function resetBlitzballTournament(core: Uint8Array): void {
  writeU8(core, 5855, 20); // Round 1
  for (let i = 5958; i <= 5971; i++) {
    writeU8(core, i, 0);
  }
  const gamesWon = readU16(core, 6034);
  if (gamesWon >= 40) writeU8(core, 5973, 9);
  else if (gamesWon >= 35) writeU8(core, 5973, 8);
  else if (gamesWon >= 25) writeU8(core, 5973, 7);
  else if (gamesWon >= 15) writeU8(core, 5973, 6);
  else if (gamesWon >= 5) writeU8(core, 5973, 5);
  else writeU8(core, 5973, 4);
}

export function unlockAllAirshipDestinations(core: Uint8Array): void {
  writeU8(core, 3265, 0xff);
  setBit(core, 3266, 0, true);
  setBit(core, 3266, 1, true);
  setBit(core, 3266, 2, true);
}

export function unlockAllLucaTheaterSpheres(core: Uint8Array): void {
  writeU8(core, 895, 71);
  writeU8(core, 896, 50);
  writeU8(core, 906, 71);
  writeU8(core, 907, 50);
}

export function resetOmegaRuinsTreasures(core: Uint8Array): void {
  for (let b = 3; b <= 7; b++) setBit(core, 1022, b, false);
  setBit(core, 1023, 0, false);
  setBit(core, 1023, 1, false);
}

export function unlockAllLightningPrizes(core: Uint8Array): void {
  writeU8(core, 1076, 0xff);
  writeU8(core, 1090, 0);
  setBit(core, 1075, 1, true);
  setBit(core, 1075, 2, false);
  setBit(core, 1075, 3, false);
}

export function captureAllMonsterArena(core: Uint8Array, count = 10): void {
  const clamped = Math.max(0, Math.min(10, Math.trunc(count)));
  for (let offset = MONSTER_ARENA_BASE; offset <= 17075; offset++) {
    writeU8(core, offset, clamped);
  }
}

export const EDITED_NAME_SUFFIX = ' [ED]';
export const DEFAULT_EDITED_SLOT = 199;

export function formatSaveSlotFileName(slotNumber: number): string {
  const clamped = Math.max(0, Math.min(200, Math.trunc(slotNumber)));
  return `ffx_${String(clamped).padStart(3, '0')}`;
}

export function parseSaveSlotNumber(fileName: string): number | null {
  const m = /^ffx_(\d{1,3})$/i.exec(fileName.trim());
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isInteger(n) && n >= 0 && n <= 200 ? n : null;
}

export function tagHeroNameAsEdited(name: string, enabled: boolean): string {
  const trimmed = name.trim() || 'Tidus';
  const base = trimmed.endsWith(EDITED_NAME_SUFFIX)
    ? trimmed.slice(0, -EDITED_NAME_SUFFIX.length).trimEnd() || 'Tidus'
    : trimmed;
  if (!enabled) {
    return base.slice(0, 19);
  }
  const maxBaseLen = 19 - EDITED_NAME_SUFFIX.length;
  return `${base.slice(0, maxBaseLen)}${EDITED_NAME_SUFFIX}`;
}

export function stampPlaytimeSecondsMarker(totalSeconds: number, markerSecond = 59): number {
  const clamped = Math.max(0, Math.min(3599999, Math.trunc(totalSeconds)));
  const sec = Math.max(0, Math.min(59, Math.trunc(markerSecond)));
  const minutesBase = Math.floor(clamped / 60) * 60;
  return Math.min(3599999, minutesBase + sec);
}

export interface EditedSaveMarkerOptions {
  tagHeroName: boolean;
  stampPlaytimeSeconds: boolean;
}

export interface EditedSaveMarkerState {
  heroName: string;
  heroTagged: boolean;
  playtimeSeconds: number;
  secondsStamped: boolean;
  slotNumber: number | null;
  highSlot: boolean;
}

export function applyEditedSaveMarker(
  core: Uint8Array,
  options: EditedSaveMarkerOptions
): void {
  const currentName = decodeFFXString(core, 25484, 20) || 'Tidus';
  const nextName = tagHeroNameAsEdited(currentName, options.tagHeroName);
  encodeFFXString(core, 25484, nextName, 20);

  if (options.stampPlaytimeSeconds) {
    const stamped = stampPlaytimeSecondsMarker(readU32(core, 252), 59);
    writeU32(core, 252, stamped);
  }
  syncHeaderPartyAndTime(core);
}

export function inspectEditedSaveMarker(
  core: Uint8Array,
  fileName = ''
): EditedSaveMarkerState {
  const heroName = decodeFFXString(core, 25484, 20) || 'Tidus';
  const playtimeSeconds = readU32(core, 252);
  const slotNumber = parseSaveSlotNumber(fileName);
  return {
    heroName,
    heroTagged: heroName.endsWith(EDITED_NAME_SUFFIX),
    playtimeSeconds,
    secondsStamped: playtimeSeconds % 60 === 59,
    slotNumber,
    highSlot: slotNumber !== null && slotNumber >= 150,
  };
}
