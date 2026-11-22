import test from 'node:test';
import assert from 'node:assert/strict';
import { createSampleSave, readBlitzballPlayer, readPartyMember, readU32 } from './saveCodec';
import {
  DEFAULT_TRAINER_CONFIG,
  FFX_LIVE_HOOKS,
  applyTrainerToCore,
  computeTrainerOperations,
  generateWindowsBridgeScript,
  getBridgeLaunchCommand,
  readTelemetryFromCore,
  simulateActiveGameDrainEvent,
} from './liveTrainer';

test('FFX_LIVE_HOOKS contains verified Farplane AOB patterns and fallback static offsets', () => {
  const symbols = new Set(FFX_LIVE_HOOKS.map((h) => h.symbol));
  assert.equal(symbols.has('FFX_CurrentGil'), true);
  assert.equal(symbols.has('FFX_DebugFlags'), true);
  assert.equal(symbols.has('FFX_PartyStatBase'), true);
  assert.equal(symbols.has('FFX_BattlePointerParty'), true);
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

test('generateWindowsBridgeScript and launch command support beginner Downloads execution', () => {
  const script = generateWindowsBridgeScript(28420);
  assert.ok(script.includes('ReadProcessMemory'));
  assert.ok(script.includes('WriteProcessMemory'));
  assert.ok(script.includes('Process.GetProcessesByName("FFX")'));
  assert.ok(script.includes('$Port = 28420'));
  assert.ok(script.includes('addrBlitzData'));

  const cmd = getBridgeLaunchCommand();
  assert.ok(cmd.includes('-ExecutionPolicy Bypass'));
  assert.ok(cmd.includes('$HOME\\Downloads\\farplane-live-bridge.ps1'));
});
