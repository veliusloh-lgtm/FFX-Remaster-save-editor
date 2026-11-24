import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_TRAINER_CONFIG,
  FFX_LIVE_HOOKS,
  applyBattleBatchAction,
  applyBattleEntityEdit,
  applyLiveEquipmentSnapshot,
  applyTrainerToCore,
  computeTrainerOperations,
  createSimulatedBattle,
  equipGearOnCharacter,
  generateWindowsBridgeScript,
  getBridgeLaunchCommand,
  readLiveCharacterLoadouts,
  readTelemetryFromCore,
  simulateActiveGameDrainEvent,
  unequipGearFromCharacter,
} from './liveTrainer';
import {
  EQUIP_BASE,
  EQUIP_STRIDE,
  createSampleSave,
  readBlitzballPlayer,
  readEquipmentSlot,
  readPartyMember,
  readU32,
  writeEquipmentSlot,
} from './saveCodec';

test('FFX_LIVE_HOOKS contains verified FFX AOB patterns and fallback static offsets', () => {
  const symbols = new Set(FFX_LIVE_HOOKS.map((h) => h.symbol));
  assert.equal(symbols.has('FFX_CurrentGil'), true);
  assert.equal(symbols.has('FFX_DebugFlags'), true);
  assert.equal(symbols.has('FFX_PartyStatBase'), true);
  assert.equal(symbols.has('FFX_EquipmentBase'), true);
  assert.equal(symbols.has('FFX_BattlePointerParty'), true);
  assert.equal(symbols.has('FFX_BattlePointerEnemy'), true);
  assert.equal(symbols.has('FFX_BlitzballData'), true);
  assert.equal(symbols.has('FFX_BlitzballPointer'), true);
});

test('computeTrainerOperations outputs deterministic memory write specs for active cheats', () => {
  const ops = computeTrainerOperations({
    ...DEFAULT_TRAINER_CONFIG,
    freezeGil: true,
    targetGil: 50000000,
    infiniteHp: true,
    infiniteMp: true,
    infiniteOverdrive: true,
    alwaysDeal99999: true,
    maxBlitzballExp: true,
    targetBlitzExp: 9999,
    targetBlitzLevel: 99,
  });

  const keys = ops.map((o) => o.key);
  assert.equal(keys.includes('freeze-gil'), true);
  assert.equal(keys.includes('party-invincible'), true);
  assert.equal(keys.includes('unlimited-mp'), true);
  assert.equal(keys.includes('always-overdrive'), true);
  assert.equal(keys.includes('deal-99999'), true);
  assert.equal(keys.includes('blitz-exp'), true);
  assert.equal(keys.includes('blitz-lvl'), true);
});

test('applyTrainerToCore freezes Gil, restores HP/MP/Overdrive after simulated damage, and maxes Blitzball EXP', () => {
  const core = createSampleSave().core;

  // Simulate combat hit + shop spend + blitz halftime
  simulateActiveGameDrainEvent(core, 'combat-damage');
  simulateActiveGameDrainEvent(core, 'spend-gil');
  simulateActiveGameDrainEvent(core, 'blitz-halftime');

  const drainedTidus = readPartyMember(core, 0);
  assert.ok(drainedTidus.currentHp < drainedTidus.currentHpMax);
  assert.equal(drainedTidus.overdriveLevel, 0);
  assert.equal(readU32(core, 15752), 15000);

  const writes = applyTrainerToCore(core, {
    ...DEFAULT_TRAINER_CONFIG,
    freezeGil: true,
    targetGil: 99999999,
    infiniteHp: true,
    infiniteMp: true,
    infiniteOverdrive: true,
    maxSphereLevels: true,
    maxBlitzballExp: true,
    targetBlitzExp: 65535,
    targetBlitzLevel: 99,
  });

  assert.ok(writes > 0);
  assert.equal(readU32(core, 15752), 99999999);

  const restoredTidus = readPartyMember(core, 0);
  assert.equal(restoredTidus.currentHp, restoredTidus.currentHpMax);
  assert.equal(restoredTidus.currentMp, restoredTidus.currentMpMax);
  assert.equal(restoredTidus.overdriveLevel, restoredTidus.overdriveMax);
  assert.equal(restoredTidus.sphereLevelCurrent, 99);

  // Check active Besaid Aurochs Blitzball player Tidus (index 0)
  const bbTidus = readBlitzballPlayer(core, 0);
  assert.equal(bbTidus.experience, 65535);
  assert.equal(bbTidus.level, 99);

  // Telemetry snapshot matches updated core
  const telemetry = readTelemetryFromCore(core);
  assert.equal(telemetry.gil, 99999999);
  assert.equal(telemetry.party[0].hp, restoredTidus.currentHpMax);
  assert.equal(telemetry.blitzball[0].exp, 65535);
});

test('Active battle entity editor clamps values and applies batch overrides cleanly', () => {
  const core = createSampleSave().core;
  let battle = createSimulatedBattle(core);
  assert.equal(battle.active, true);
  assert.equal(battle.party.length, 3);
  assert.equal(battle.enemies.length, 3);

  // Clamp party HP/MP/OD safely within max bounds
  battle = applyBattleEntityEdit(battle, 'party', 0, {
    maxHp: 500000, // should clamp to 99,999
    hp: 999999,
    maxMp: 25000, // should clamp to 9,999
    mp: 15000,
    overdriveMax: 100,
    overdrive: 255, // should clamp to 100
  });
  assert.equal(battle.party[0].maxHp, 99999);
  assert.equal(battle.party[0].hp, 99999);
  assert.equal(battle.party[0].maxMp, 9999);
  assert.equal(battle.party[0].mp, 9999);
  assert.equal(battle.party[0].overdrive, 100);

  // Drop party HP & test heal_party + fill_overdrive
  battle = applyBattleEntityEdit(battle, 'party', 0, { hp: 1, mp: 0, overdrive: 0 });
  battle = applyBattleBatchAction(battle, 'heal_party');
  assert.equal(battle.party[0].hp, 99999);
  assert.equal(battle.party[0].mp, 9999);
  battle = applyBattleBatchAction(battle, 'fill_overdrive');
  assert.equal(battle.party[0].overdrive, 100);

  // Drop all enemies to 1 HP then 0 HP
  battle = applyBattleBatchAction(battle, 'enemies_1hp');
  assert.deepEqual(
    battle.enemies.map((e) => e.hp),
    [1, 1, 1]
  );
  battle = applyBattleBatchAction(battle, 'enemies_0hp');
  assert.deepEqual(
    battle.enemies.map((e) => e.hp),
    [0, 0, 0]
  );
});

test('Live equipment helpers inspect character loadouts, equip/unequip slots, and apply bridge snapshots', () => {
  const core = createSampleSave().core;

  // Create a custom endgame sword for Tidus in slot 50
  writeEquipmentSlot(core, {
    slot: 50,
    nameId: 1,
    name2: 0,
    occupied: true,
    customizeMode: 0,
    character: 0,
    type: 0, // Weapon
    equippedBy: 0xff,
    damageFormula: 1,
    attackPower: 255,
    critical: 25,
    abilityCount: 4,
    appearance: 0x4000,
    abilities: [0x801a, 0x801b, 0x800f, 0x8074],
  });

  const beforeLoadouts = readLiveCharacterLoadouts(core);
  const oldWeaponSlot = beforeLoadouts[0].equippedWeaponSlot;
  assert.notEqual(oldWeaponSlot, 50);

  // Equip slot 50 onto Tidus (char 0)
  assert.equal(equipGearOnCharacter(core, 50, 0), true);

  const afterEquip = readLiveCharacterLoadouts(core);
  assert.equal(afterEquip[0].equippedWeaponSlot, 50);
  assert.equal(afterEquip[0].weapon?.attackPower, 255);
  assert.equal(readEquipmentSlot(core, 50).equippedBy, 0);
  if (oldWeaponSlot < 200) {
    assert.equal(readEquipmentSlot(core, oldWeaponSlot).equippedBy, 0xff);
  }

  // Unequip weapon from Tidus
  unequipGearFromCharacter(core, 0, 0);
  const afterUnequip = readLiveCharacterLoadouts(core);
  assert.equal(afterUnequip[0].equippedWeaponSlot, 0xff);
  assert.equal(afterUnequip[0].weapon, null);
  assert.equal(readEquipmentSlot(core, 50).equippedBy, 0xff);

  // Apply binary bridge snapshot onto a fresh core
  const target = createSampleSave().core;
  const equipBytes = core.slice(EQUIP_BASE, EQUIP_BASE + 200 * EQUIP_STRIDE);
  applyLiveEquipmentSnapshot(target, equipBytes, [[50, 0xff]]);
  assert.equal(readPartyMember(target, 0).equippedWeapon, 50);
  assert.equal(readEquipmentSlot(target, 50).attackPower, 255);
});

test('generateWindowsBridgeScript and launch command include active battle and equipment bridge support', () => {
  const script = generateWindowsBridgeScript(28420);
  assert.ok(script.includes('ReadProcessMemory'));
  assert.ok(script.includes('WriteProcessMemory'));
  assert.ok(script.includes('Process.GetProcessesByName("FFX")'));
  assert.ok(script.includes('$Port = 28420'));
  assert.ok(script.includes('addrBlitzData'));
  assert.ok(script.includes('addrEquip'));
  assert.ok(script.includes('addrBattleEnemy'));
  assert.ok(script.includes('edit_battle_entity'));
  assert.ok(script.includes('write_equipment_slot'));
  assert.ok(script.includes('equip_character'));
  assert.ok(script.includes('equipment_snapshot'));

  const cmd = getBridgeLaunchCommand();
  assert.ok(cmd.includes('-ExecutionPolicy Bypass'));
  assert.ok(cmd.includes('$HOME\\Downloads\\spira-hook-bridge.ps1'));
});
