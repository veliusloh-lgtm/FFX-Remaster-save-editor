import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CORE_SIZE,
  PC_SWITCH_SIZE,
  VITA_SIZE,
  CRC_TOP,
  CRC_BOTTOM,
  PARTY_BASE,
  PARTY_STAT_LIMITS,
  PARTY_STRIDE,
  applyEditedSaveMarker,
  assignUniqueInventoryItem,
  batchActivateSphereGridAll,
  batchActivateSphereGridForChar,
  batchClearSphereGridActivation,
  batchMaxSphereGridStatNodes,
  batchRemoveSphereGridLocks,
  captureAllMonsterArena,
  clampAllPartyStats,
  clampPartyMemberStats,
  computeFFXChecksum,
  createSampleSave,
  decodeFFXString,
  encodeFFXString,
  formatSaveSlotFileName,
  getBit,
  getSphereGridMeta,
  getUsedInventorySlotMap,
  hasUnsafePartyStats,
  inspectEditedSaveMarker,
  maxCharacterStats,
  maxOwnedInventoryItems,
  parseSaveFile,
  parseSaveSlotNumber,
  readBlitzballPlayer,
  readEquipmentSlot,
  readInventoryItem,
  readPartyMember,
  readSphereGridNode,
  readU16,
  readU32,
  readU8,
  removeBlitzballExp,
  removeBlitzballSkills,
  repairFFXChecksum,
  resetBlitzballLevelToOne,
  resetBlitzballTournament,
  serializeSaveFile,
  setBit,
  stampPlaytimeSecondsMarker,
  syncHeaderPartyAndTime,
  syncPrimerCount,
  tagHeroNameAsEdited,
  unlockAllCharacterAbilities,
  unlockAllCharacterOverdriveModes,
  unlockAllOverdrives,
  verifyFFXChecksum,
  writeBlitzballPlayer,
  writeEquipmentSlot,
  writeInventoryItem,
  writePartyMember,
  writeSphereGridNode,
  writeU32,
  writeU8,
} from './saveCodec';
import { KEY_ITEMS_LIST } from './tables';

test('createSampleSave produces valid 26,880-byte PC Steam save with valid CRC-16-CCITT', () => {
  const sample = createSampleSave();
  assert.equal(sample.format, 'pc-steam');
  assert.equal(sample.core.length, CORE_SIZE);
  const status = verifyFFXChecksum(sample.core);
  assert.equal(status.valid, true);
  assert.equal(status.storedTop, status.expected);
  assert.equal(status.storedBottom, status.expected);

  const bytes = serializeSaveFile(sample, 'pc-steam');
  assert.equal(bytes.length, PC_SWITCH_SIZE);
  assert.equal(readU16(bytes, CRC_TOP), readU16(bytes, CRC_BOTTOM));
});

test('CRC-16-CCITT detects mutations and repairs both top and bottom checksums', () => {
  const sample = createSampleSave();
  const core = sample.core.slice();
  // Mutate Gil at 15752
  writeU32(core, 15752, 9999999);
  const broken = verifyFFXChecksum(core);
  assert.equal(broken.valid, false);
  assert.notEqual(broken.expected, broken.storedTop);

  // Changes inside 0x00..0x3F (except checksum) are outside CRC range, changes >= 0x40 affect CRC
  const expectedBeforeRepair = computeFFXChecksum(core);
  const repaired = repairFFXChecksum(core);
  assert.equal(repaired, expectedBeforeRepair);
  const fixed = verifyFFXChecksum(core);
  assert.equal(fixed.valid, true);
  assert.equal(readU16(core, CRC_TOP), repaired);
  assert.equal(readU16(core, CRC_BOTTOM), repaired);
});

test('parseSaveFile and serializeSaveFile round-trip PC Steam, Switch, PS Vita, and Raw PS2 containers', () => {
  const sample = createSampleSave();
  // Customize trailing PC marker to ensure preservation
  sample.trailing[0] = 0xab;
  sample.trailing[1031] = 0xcd;

  // PC Steam
  const pcBytes = serializeSaveFile(sample, 'pc-steam');
  assert.equal(pcBytes.length, PC_SWITCH_SIZE);
  const parsedPc = parseSaveFile(pcBytes, 'ffx_001');
  assert.equal(parsedPc.format, 'pc-steam');
  assert.equal(parsedPc.trailing[0], 0xab);
  assert.equal(parsedPc.trailing[1031], 0xcd);
  assert.equal(verifyFFXChecksum(parsedPc.core).valid, true);

  // Switch (8-byte prefix)
  const switchSample = {
    ...sample,
    switchPrefix: new Uint8Array([0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88]),
  };
  const swBytes = serializeSaveFile(switchSample, 'switch');
  assert.equal(swBytes.length, PC_SWITCH_SIZE);
  const parsedSw = parseSaveFile(swBytes, 'ffx_switch');
  assert.equal(parsedSw.format, 'switch');
  assert.deepEqual(Array.from(parsedSw.switchPrefix), [0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88]);
  assert.equal(verifyFFXChecksum(parsedSw.core).valid, true);

  // PS Vita (26,872 bytes)
  const vitaBytes = serializeSaveFile(sample, 'ps-vita');
  assert.equal(vitaBytes.length, VITA_SIZE);
  const parsedVita = parseSaveFile(vitaBytes, 'ffx_vita');
  assert.equal(parsedVita.format, 'ps-vita');
  assert.equal(verifyFFXChecksum(parsedVita.core).valid, true);

  // Raw PS2 (25,848 bytes)
  const ps2Bytes = serializeSaveFile(sample, 'ps2-raw');
  assert.equal(ps2Bytes.length, CORE_SIZE);
  const parsedPs2 = parseSaveFile(ps2Bytes, 'ffx_ps2');
  assert.equal(parsedPs2.format, 'ps2-raw');
  assert.equal(verifyFFXChecksum(parsedPs2.core).valid, true);

  // Reject too-small files
  assert.throws(() => parseSaveFile(new Uint8Array(100), 'bad'), /Unsupported save size/);
});

test('FFX string encoding and decoding preserve ASCII, punctuation, and special glyphs', () => {
  const buf = new Uint8Array(20);
  for (const text of ['Tidus', "O'aka XXIII", 'Aeon ♪♥', 'Besaid-01', 'Éclair']) {
    encodeFFXString(buf, 0, text, 20);
    assert.equal(decodeFFXString(buf, 0, 20), text);
  }
  encodeFFXString(buf, 0, 'ABCDEFGHIJKLMNOPQRSTUVWX', 20);
  assert.equal(decodeFFXString(buf, 0, 20).length, 19);
  assert.equal(buf[19], 0x00);
});

test('Party stats, abilities, overdrive modes, and global overdrives round-trip cleanly', () => {
  const core = createSampleSave().core;
  const tidus = readPartyMember(core, 0);
  assert.equal(tidus.customName, 'Tidus');
  assert.equal(tidus.baseHp, 520);

  tidus.customName = 'StarPlayer';
  tidus.baseHp = 12345;
  tidus.affection = 88;
  writePartyMember(core, tidus);

  const reread = readPartyMember(core, 0);
  assert.equal(reread.customName, 'StarPlayer');
  assert.equal(reread.baseHp, 12345);
  assert.equal(reread.affection, 88);

  maxCharacterStats(core, 0);
  const maxed = readPartyMember(core, 0);
  assert.equal(maxed.baseHp, 99999);
  assert.equal(maxed.currentHpMax, 99999);
  assert.equal(maxed.baseMp, 9999);
  assert.equal(maxed.baseStrength, 255);
  assert.equal(maxed.currentAccuracy, 255);

  unlockAllCharacterAbilities(core, 0);
  assert.equal(getBit(core, 22090, 0), true);
  assert.equal(getBit(core, 22090, 86), true);

  unlockAllCharacterOverdriveModes(core, 0);
  assert.equal(getBit(core, 22164, 0), true);
  assert.equal(getBit(core, 22164, 16), true);

  unlockAllOverdrives(core);
  // Wakizashi dual bits at 15804:0 and 15804:1
  assert.equal(getBit(core, 15804, 0), true);
  assert.equal(getBit(core, 15804, 1), true);
});

test('Equipment and Inventory Item slots serialize little-endian IDs and zero-qty empties', () => {
  const core = createSampleSave().core;
  const slot0 = readEquipmentSlot(core, 0);
  assert.equal(slot0.occupied, true);
  assert.equal(slot0.abilities[0], 0x8062);

  slot0.abilities = [0x801a, 0x801b, 0x800f, 0x8074]; // BDL, Triple OD, Evade&Counter, Magic Booster
  slot0.attackPower = 255;
  slot0.critical = 100;
  writeEquipmentSlot(core, slot0);

  const rereadSlot = readEquipmentSlot(core, 0);
  assert.equal(rereadSlot.attackPower, 255);
  assert.equal(rereadSlot.critical, 100);
  assert.deepEqual(rereadSlot.abilities, [0x801a, 0x801b, 0x800f, 0x8074]);

  writeInventoryItem(core, { slot: 10, id: 0x2055, quantity: 99 }); // Warp Sphere
  const item10 = readInventoryItem(core, 10);
  assert.equal(item10.id, 0x2055);
  assert.equal(item10.quantity, 99);

  writeInventoryItem(core, { slot: 10, id: 0x00ff, quantity: 42 }); // Empty clears quantity
  const cleared = readInventoryItem(core, 10);
  assert.equal(cleared.id, 0x00ff);
  assert.equal(cleared.quantity, 0);
});

test('Sphere Grid metadata, nodes, and batch transforms operate accurately', () => {
  const core = createSampleSave().core;
  assert.equal(getSphereGridMeta(core).typeLabel, 'Standard (International)');
  assert.equal(getSphereGridMeta(core).nodeCount, 860);

  // Switch to Expert grid
  setBit(core, 15693, 6, false);
  setBit(core, 15693, 7, true);
  assert.equal(getSphereGridMeta(core).typeLabel, 'Expert');
  assert.equal(getSphereGridMeta(core).nodeCount, 814);

  writeSphereGridNode(core, { index: 5, nodeType: 39, activatedMask: 0x00 }); // Lv.1 Lock
  batchRemoveSphereGridLocks(core);
  assert.equal(readSphereGridNode(core, 5).nodeType, 1); // Empty

  writeSphereGridNode(core, { index: 6, nodeType: 2, activatedMask: 0x00 }); // Str +1
  batchMaxSphereGridStatNodes(core);
  assert.equal(readSphereGridNode(core, 6).nodeType, 5); // Str +4

  batchActivateSphereGridForChar(core, 2); // Auron bit 2
  assert.equal((readSphereGridNode(core, 6).activatedMask & (1 << 2)) !== 0, true);

  batchActivateSphereGridAll(core);
  assert.equal(readSphereGridNode(core, 6).activatedMask, 0x7f);

  batchClearSphereGridActivation(core);
  assert.equal(readSphereGridNode(core, 6).activatedMask, 0);
});

test('Blitzball player, tournament reset, Al Bhed primer sync, Monster Arena, and header sync', () => {
  const core = createSampleSave().core;
  const tidusBb = readBlitzballPlayer(core, 0);
  tidusBb.level = 99;
  tidusBb.experience = 9999;
  tidusBb.equippedTechs = [1, 2, 3, 4, 5];
  tidusBb.knownTechMask1 = 0xffffffff;
  writeBlitzballPlayer(core, tidusBb);

  const rereadBb = readBlitzballPlayer(core, 0);
  assert.equal(rereadBb.level, 99);
  assert.equal(rereadBb.experience, 9999);
  assert.deepEqual(rereadBb.equippedTechs, [1, 2, 3, 4, 5]);
  assert.equal(rereadBb.knownTechMask1, 0xffffffff);

  resetBlitzballTournament(core);
  assert.equal(readU8(core, 5855), 20);

  // Unlock all 26 Al Bhed Primers and sync count
  const primers = KEY_ITEMS_LIST.filter((k) => k.category === 'Al Bhed Primers');
  assert.equal(primers.length, 26);
  for (const p of primers) {
    for (const acc of p.accessors) {
      setBit(core, acc.offset, acc.bit, true);
    }
  }
  assert.equal(syncPrimerCount(core), 26);
  assert.equal(readU8(core, 3212), 26);

  captureAllMonsterArena(core, 10);
  assert.equal(readU8(core, 16972), 10);
  assert.equal(readU8(core, 17075), 10);

  // Sync header portraits (Rikku wetsuit flag 273:0 turns char 6 -> portrait 7)
  setBit(core, 273, 0, true);
  syncHeaderPartyAndTime(core);
  assert.equal(readU8(core, 5 + 6), 7);
});

test('maxOwnedInventoryItems maxes only possessed items and preserves empty/zero slots', () => {
  const core = createSampleSave().core;
  // Starter sample has 8 occupied slots (indices 0..7) and 104 empty slots (8..111)
  // Also write a corrupted/0-qty slot at slot 20 to verify quantity > 0 check
  writeInventoryItem(core, { slot: 20, id: 0x2000, quantity: 0 });

  const updated = maxOwnedInventoryItems(core, 99);
  assert.equal(updated, 8);
  for (let i = 0; i < 8; i++) {
    const slot = readInventoryItem(core, i);
    assert.notEqual(slot.id, 0x00ff);
    assert.equal(slot.quantity, 99);
  }
  assert.equal(readInventoryItem(core, 8).id, 0x00ff);
  assert.equal(readInventoryItem(core, 8).quantity, 0);
  assert.equal(readInventoryItem(core, 20).quantity, 0);
});

test('removeBlitzballExp and removeBlitzballSkills clear single player and all 60 players cleanly', () => {
  const core = createSampleSave().core;
  for (let i = 0; i < 60; i++) {
    const p = readBlitzballPlayer(core, i);
    writeBlitzballPlayer(core, {
      ...p,
      experience: 4500 + i,
      equippedTechs: [1, 2, 3, 4, 5],
      knownTechMask1: 0xffffffff,
      knownTechMask2: 0x0fffffff,
    });
  }

  // Single-player EXP and skills removal (player 0 only)
  assert.equal(removeBlitzballExp(core, [0]), 1);
  assert.equal(removeBlitzballSkills(core, [0]), 1);

  const p0 = readBlitzballPlayer(core, 0);
  assert.equal(p0.experience, 0);
  assert.deepEqual(p0.equippedTechs, [0, 0, 0, 0, 0]);
  assert.equal(p0.knownTechMask1, 0);
  assert.equal(p0.knownTechMask2, 0);

  // Player 1 should remain untouched until global clear
  const p1Before = readBlitzballPlayer(core, 1);
  assert.equal(p1Before.experience, 4501);
  assert.equal(p1Before.knownTechMask1, 0xffffffff);

  // All 60 players EXP and skills removal
  assert.equal(removeBlitzballExp(core), 60);
  assert.equal(removeBlitzballSkills(core), 60);

  for (let i = 0; i < 60; i++) {
    const pi = readBlitzballPlayer(core, i);
    assert.equal(pi.experience, 0);
    assert.deepEqual(pi.equippedTechs, [0, 0, 0, 0, 0]);
    assert.equal(pi.knownTechMask1, 0);
    assert.equal(pi.knownTechMask2, 0);
  }
});

test('Edited save markers format slot filenames, tag Tidus name, stamp :59 playtime, and sync header', () => {
  assert.equal(formatSaveSlotFileName(199), 'ffx_199');
  assert.equal(formatSaveSlotFileName(5), 'ffx_005');
  assert.equal(parseSaveSlotNumber('ffx_199'), 199);
  assert.equal(parseSaveSlotNumber('ffx_000'), 0);
  assert.equal(parseSaveSlotNumber('custom_save'), null);

  assert.equal(tagHeroNameAsEdited('Tidus', true), 'Tidus [ED]');
  assert.equal(tagHeroNameAsEdited('Tidus [ED]', true), 'Tidus [ED]');
  assert.equal(tagHeroNameAsEdited('Tidus [ED]', false), 'Tidus');
  const longTagged = tagHeroNameAsEdited('SuperLongCustomName', true);
  assert.equal(longTagged.length <= 19, true);
  assert.equal(longTagged.endsWith(' [ED]'), true);

  assert.equal(stampPlaytimeSecondsMarker(5420, 59), 5459); // 1h 30m 20s -> 1h 30m 59s

  const core = createSampleSave().core;
  applyEditedSaveMarker(core, { tagHeroName: true, stampPlaytimeSeconds: true });
  const state = inspectEditedSaveMarker(core, 'ffx_199');
  assert.equal(state.heroName, 'Tidus [ED]');
  assert.equal(state.heroTagged, true);
  assert.equal(state.playtimeSeconds, 5459);
  assert.equal(state.secondsStamped, true);
  assert.equal(state.slotNumber, 199);
  assert.equal(state.highSlot, true);
  // Header playtime bytes 16..19 must match 252..255
  assert.equal(readU32(core, 16), 5459);

  // Removing tag restores original name cleanly
  applyEditedSaveMarker(core, { tagHeroName: false, stampPlaytimeSeconds: false });
  assert.equal(inspectEditedSaveMarker(core, 'ffx_001').heroName, 'Tidus');
  assert.equal(inspectEditedSaveMarker(core, 'ffx_001').heroTagged, false);
});

test('assignUniqueInventoryItem blocks duplicate listed items and allows unowned/empty assignments', () => {
  const core = createSampleSave().core;
  const used = getUsedInventorySlotMap(core);
  // Slot 0 has Potion (0x2000)
  assert.deepEqual(used.get(0x2000), [0]);

  // Assigning Potion (0x2000) into empty slot 8 must be rejected
  assert.equal(assignUniqueInventoryItem(core, { slot: 8, id: 0x2000, quantity: 5 }), false);
  assert.equal(readInventoryItem(core, 8).id, 0x00ff);

  // Updating own slot 0's quantity to 25 is allowed
  assert.equal(assignUniqueInventoryItem(core, { slot: 0, id: 0x2000, quantity: 25 }), true);
  assert.equal(readInventoryItem(core, 0).quantity, 25);

  // Assigning unowned item X-Potion (0x2002) into slot 8 succeeds
  assert.equal(assignUniqueInventoryItem(core, { slot: 8, id: 0x2002, quantity: 3 }), true);
  assert.equal(readInventoryItem(core, 8).id, 0x2002);

  // Clearing slot 0 frees Potion (0x2000) so slot 9 can now claim it
  assert.equal(assignUniqueInventoryItem(core, { slot: 0, id: 0x00ff, quantity: 0 }), true);
  assert.equal(assignUniqueInventoryItem(core, { slot: 9, id: 0x2000, quantity: 10 }), true);
  assert.equal(readInventoryItem(core, 9).id, 0x2000);
});

test('resetBlitzballLevelToOne returns individual or all 60 Blitzball players to Level 1 and 0 EXP', () => {
  const core = createSampleSave().core;
  for (let i = 0; i < 60; i++) {
    const p = readBlitzballPlayer(core, i);
    writeBlitzballPlayer(core, { ...p, level: 40 + (i % 20), experience: 1200 + i });
  }

  // Individual reset for player 2 (Datto)
  assert.equal(resetBlitzballLevelToOne(core, [2]), 1);
  assert.equal(readBlitzballPlayer(core, 2).level, 1);
  assert.equal(readBlitzballPlayer(core, 2).experience, 0);
  // Player 3 remains high level until global reset
  assert.equal(readBlitzballPlayer(core, 3).level, 43);

  // Reset all 60 players to Level 1
  assert.equal(resetBlitzballLevelToOne(core), 60);
  for (let i = 0; i < 60; i++) {
    const p = readBlitzballPlayer(core, i);
    assert.equal(p.level, 1);
    assert.equal(p.experience, 0);
  }
});

test('writePartyMember and clampPartyMemberStats enforce safe FFX maximums and repair corrupted stats', () => {
  const core = createSampleSave().core;
  const valefor = readPartyMember(core, 8);

  // Attempt to write crash-prone / overflow values to an Aeon (Valefor) and Tidus
  writePartyMember(core, {
    ...valefor,
    baseHp: 9999999,
    currentHpMax: 500000,
    currentHp: 250000,
    baseMp: 50000,
    currentMpMax: 20000,
    currentMp: 18000,
    baseStrength: 999,
    currentStrength: 500,
    baseAgility: 0,
    currentAgility: 0,
    sphereLevelCurrent: 250,
    sphereLevelTotal: 999,
    apCurrent: 9999999999,
    apTotal: 9999999999,
    overdriveMax: 100,
    overdriveLevel: 255,
    totalBattles: 99999999,
    enemiesDefeated: 99999999,
  });

  const clampedAeon = readPartyMember(core, 8);
  assert.equal(clampedAeon.baseHp, PARTY_STAT_LIMITS.maxHp);
  assert.equal(clampedAeon.currentHpMax, PARTY_STAT_LIMITS.maxHp);
  assert.equal(clampedAeon.currentHp, PARTY_STAT_LIMITS.maxHp);
  assert.equal(clampedAeon.baseMp, PARTY_STAT_LIMITS.maxMp);
  assert.equal(clampedAeon.currentMpMax, PARTY_STAT_LIMITS.maxMp);
  assert.equal(clampedAeon.currentMp, PARTY_STAT_LIMITS.maxMp);
  assert.equal(clampedAeon.baseStrength, 255);
  assert.equal(clampedAeon.currentStrength, 255);
  assert.equal(clampedAeon.baseAgility, 1);
  assert.equal(clampedAeon.currentAgility, 1);
  assert.equal(clampedAeon.sphereLevelCurrent, 99);
  assert.equal(clampedAeon.sphereLevelTotal, 255);
  assert.equal(clampedAeon.apCurrent, PARTY_STAT_LIMITS.maxAp);
  assert.equal(clampedAeon.apTotal, PARTY_STAT_LIMITS.maxAp);
  assert.equal(clampedAeon.overdriveLevel, 100);
  assert.equal(clampedAeon.totalBattles, PARTY_STAT_LIMITS.maxBattles);
  assert.equal(clampedAeon.enemiesDefeated, PARTY_STAT_LIMITS.maxBattles);

  // Current HP exceeding Current Max HP is clamped down to Current Max HP
  const clampedHpCheck = clampPartyMemberStats({
    ...clampedAeon,
    currentHpMax: 1200,
    currentHp: 5000,
    baseHp: 0,
  });
  assert.equal(clampedHpCheck.baseHp, 1);
  assert.equal(clampedHpCheck.currentHp, 1200);

  // Simulate raw corrupted binary bytes in save file (HP = 500,000 for Tidus) and repair via clampAllPartyStats
  writeU32(core, PARTY_BASE + 32, 500000);
  writeU32(core, PARTY_BASE + 24, 500000);
  writeU32(core, 108, 5000); // Affection > 999
  assert.equal(hasUnsafePartyStats(readPartyMember(core, 0)), true);
  assert.equal(clampAllPartyStats(core), 1);
  assert.equal(hasUnsafePartyStats(readPartyMember(core, 0)), false);
  assert.equal(readPartyMember(core, 0).currentHpMax, 99999);
  assert.equal(readPartyMember(core, 0).affection, 999);
});
