import React, { useMemo, useState } from 'react';
import { Sparkles, CheckSquare, Zap, Shield } from 'lucide-react';
import {
  PARTY_STAT_LIMITS,
  PARTY_STRIDE,
  PartyMemberData,
  clampAllPartyStats,
  getBit,
  hasUnsafePartyStats,
  maxCharacterStats,
  readPartyMember,
  readU16,
  readU8,
  setBit,
  syncHeaderPartyAndTime,
  unlockAllCharacterAbilities,
  unlockAllCharacterOverdriveModes,
  unlockAllOverdrives,
  writePartyMember,
  writeU16,
  writeU8,
} from '../ffx/saveCodec';
import {
  ACTIVATION_OPTIONS,
  CHARACTER_ABILITIES,
  CHARACTER_NAMES_DEFAULT,
  OVERDRIVES_LIST,
  OVERDRIVE_MODES,
  PARTY_ROSTER_OPTIONS,
  SPECIAL_ABILITIES_LIST,
} from '../ffx/tables';

interface PartyAeonsPanelProps {
  core: Uint8Array;
  onUpdateCore: (mutator: (draft: Uint8Array) => void) => void;
}

type PartySubTab = 'stats' | 'abilities' | 'od-modes' | 'global-od' | 'roster';

export const PartyAeonsPanel: React.FC<PartyAeonsPanelProps> = ({ core, onUpdateCore }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [subTab, setSubTab] = useState<PartySubTab>('stats');
  const [abilitySearch, setAbilitySearch] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const member = useMemo(() => readPartyMember(core, selectedIndex), [core, selectedIndex]);
  const isAeon = selectedIndex >= 8;
  const unsafeUnitsCount = useMemo(
    () => Array.from({ length: 18 }, (_, i) => hasUnsafePartyStats(readPartyMember(core, i))).filter(Boolean).length,
    [core]
  );

  const clampNumeric = (
    raw: number,
    min: number,
    max: number,
    fieldLabel?: string
  ): number => {
    const val = Number.isFinite(raw) ? Math.trunc(raw) : min;
    if (val > max) {
      if (fieldLabel) {
        setNotice(`${fieldLabel} capped at FFX safe maximum (${max.toLocaleString()}) to prevent save corruption.`);
      }
      return max;
    }
    if (val < min) {
      if (fieldLabel && min > 0) {
        setNotice(`${fieldLabel} set to minimum safe value (${min}).`);
      }
      return min;
    }
    return val;
  };

  const updateMember = (patch: Partial<PartyMemberData>) => {
    onUpdateCore((d) => {
      const current = readPartyMember(d, selectedIndex);
      writePartyMember(d, { ...current, ...patch });
    });
  };

  const filteredAbilities = useMemo(() => {
    const q = abilitySearch.trim().toLowerCase();
    if (!q) return CHARACTER_ABILITIES;
    return CHARACTER_ABILITIES.filter((a) => a.name.toLowerCase().includes(q));
  }, [abilitySearch]);

  const partyDelta = selectedIndex * PARTY_STRIDE;

  return (
    <div className="space-y-6">
      {/* Header + Quick Unit Batch Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">
            Party &amp; Aeons
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Edit all 18 party members, Seymour, and Aeons: custom names, base/current stats, abilities, overdrive modes, and active roster.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              onUpdateCore((d) => maxCharacterStats(d, selectedIndex));
              setNotice(`Maxed stats for ${member.customName || member.defaultName}.`);
            }}
            className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Max Selected Unit
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdateCore((d) => {
                for (let i = 0; i < 18; i++) maxCharacterStats(d, i);
              });
              setNotice('Maxed stats for all 18 characters & Aeons.');
            }}
            className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
          >
            Max All 18 Units
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdateCore((d) => unlockAllCharacterAbilities(d, selectedIndex));
              setNotice(`Unlocked all abilities for ${member.customName || member.defaultName}.`);
            }}
            className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Unlock Unit Abilities
          </button>
        </div>
      </div>

      {notice && (
        <div className="text-xs font-medium text-sky-400">{notice}</div>
      )}

      {unsafeUnitsCount > 0 && (
        <div
          role="alert"
          className="bg-amber-950/50 border border-amber-700/60 rounded-md px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200"
        >
          <span>
            {unsafeUnitsCount} unit{unsafeUnitsCount === 1 ? '' : 's'} currently exceed FFX&apos;s safe stat limits (HP &le; 99,999, MP &le; 9,999, Stats &le; 255, S.Lv &le; 99), which can crash or corrupt the game.
          </span>
          <button
            type="button"
            onClick={() => {
              onUpdateCore((d) => {
                clampAllPartyStats(d);
              });
              setNotice(`Clamped ${unsafeUnitsCount} unit(s) to safe FFX stat limits.`);
            }}
            className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            Clamp All Units to Safe Limits
          </button>
        </div>
      )}

      {/* 18-Unit Selector Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-md p-2 space-y-1 max-h-[640px] overflow-y-auto">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Playable Characters (0–7)
          </div>
          {CHARACTER_NAMES_DEFAULT.slice(0, 8).map((defName, idx) => {
            const unit = readPartyMember(core, idx);
            const active = selectedIndex === idx;
            return (
              <button
                key={defName}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                  active
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40'
                    : 'text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                <span className="truncate font-medium">{unit.customName || defName}</span>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  HP {unit.currentHpMax.toLocaleString()}
                </span>
              </button>
            );
          })}

          <div className="px-2 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Aeons (8–17)
          </div>
          {CHARACTER_NAMES_DEFAULT.slice(8).map((defName, offsetIdx) => {
            const idx = offsetIdx + 8;
            const unit = readPartyMember(core, idx);
            const active = selectedIndex === idx;
            return (
              <button
                key={defName}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                  active
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40'
                    : 'text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                <span className="truncate font-medium">{unit.customName || defName}</span>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  HP {unit.currentHpMax.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Unit Detail Workspace */}
        <div className="lg:col-span-9 space-y-4">
          {/* Sub-navigation tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-3">
            {[
              { id: 'stats' as const, label: 'Stats & Profile' },
              { id: 'abilities' as const, label: 'Combat Abilities (95)' },
              { id: 'od-modes' as const, label: 'Overdrive Modes (20)' },
              { id: 'global-od' as const, label: 'Global Overdrives & Specials' },
              { id: 'roster' as const, label: 'Active Party Roster' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                  subTab === t.id
                    ? 'bg-slate-800 text-sky-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {subTab === 'stats' && (
            <div className="space-y-4">
              {/* Profile & Progression */}
              <div className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                    {member.defaultName} Profile {isAeon ? '(Aeon)' : '(Party Unit)'}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Unit #{selectedIndex} · Offset 0x{(22032 + partyDelta).toString(16).toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="unit-name" className="block text-xs font-medium text-slate-400 mb-1">
                      Custom Name (max 19 chars)
                    </label>
                    <input
                      id="unit-name"
                      type="text"
                      maxLength={19}
                      value={member.customName}
                      onChange={(e) => updateMember({ customName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="unit-activation" className="block text-xs font-medium text-slate-400 mb-1">
                      Pool Activation Status
                    </label>
                    <select
                      id="unit-activation"
                      value={member.activation}
                      onChange={(e) => updateMember({ activation: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
                    >
                      {ACTIVATION_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="unit-od-mode" className="block text-xs font-medium text-slate-400 mb-1">
                      Equipped Overdrive Mode
                    </label>
                    <select
                      id="unit-od-mode"
                      value={member.overdriveMode}
                      onChange={(e) => updateMember({ overdriveMode: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
                    >
                      {OVERDRIVE_MODES.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="unit-slv-cur" className="block text-xs font-medium text-slate-400 mb-1">
                      Sphere Level (Current max 99 / Total max 255)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="unit-slv-cur"
                        type="number"
                        min={0}
                        max={PARTY_STAT_LIMITS.maxSphereLevelCurrent}
                        value={member.sphereLevelCurrent}
                        onChange={(e) =>
                          updateMember({
                            sphereLevelCurrent: clampNumeric(
                              Number(e.target.value) || 0,
                              0,
                              PARTY_STAT_LIMITS.maxSphereLevelCurrent,
                              'Sphere Level (Current)'
                            ),
                          })
                        }
                        className="w-1/2 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                      />
                      <input
                        aria-label="Sphere Level Total"
                        type="number"
                        min={0}
                        max={PARTY_STAT_LIMITS.maxSphereLevelTotal}
                        value={member.sphereLevelTotal}
                        onChange={(e) =>
                          updateMember({
                            sphereLevelTotal: clampNumeric(
                              Number(e.target.value) || 0,
                              0,
                              PARTY_STAT_LIMITS.maxSphereLevelTotal,
                              'Sphere Level (Total)'
                            ),
                          })
                        }
                        className="w-1/2 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="unit-ap-cur" className="block text-xs font-medium text-slate-400 mb-1">
                      Ability Points (Current / Total)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="unit-ap-cur"
                        type="number"
                        min={0}
                        max={PARTY_STAT_LIMITS.maxAp}
                        value={member.apCurrent}
                        onChange={(e) =>
                          updateMember({
                            apCurrent: clampNumeric(
                              Number(e.target.value) || 0,
                              0,
                              PARTY_STAT_LIMITS.maxAp,
                              'Current AP'
                            ),
                          })
                        }
                        className="w-1/2 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                      />
                      <input
                        aria-label="Ability Points Total"
                        type="number"
                        min={0}
                        max={PARTY_STAT_LIMITS.maxAp}
                        value={member.apTotal}
                        onChange={(e) =>
                          updateMember({
                            apTotal: clampNumeric(
                              Number(e.target.value) || 0,
                              0,
                              PARTY_STAT_LIMITS.maxAp,
                              'Total AP'
                            ),
                          })
                        }
                        className="w-1/2 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="unit-od-cur" className="block text-xs font-medium text-slate-400 mb-1">
                      Overdrive Gauge (Current / Max)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="unit-od-cur"
                        type="number"
                        min={0}
                        max={member.overdriveMax > 0 ? member.overdriveMax : PARTY_STAT_LIMITS.maxOverdrive}
                        value={member.overdriveLevel}
                        onChange={(e) =>
                          updateMember({
                            overdriveLevel: clampNumeric(
                              Number(e.target.value) || 0,
                              0,
                              member.overdriveMax > 0 ? member.overdriveMax : PARTY_STAT_LIMITS.maxOverdrive,
                              'Overdrive Gauge'
                            ),
                          })
                        }
                        className="w-1/2 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                      />
                      <input
                        aria-label="Overdrive Max"
                        type="number"
                        min={0}
                        max={PARTY_STAT_LIMITS.maxOverdrive}
                        value={member.overdriveMax}
                        onChange={(e) =>
                          updateMember({
                            overdriveMax: clampNumeric(
                              Number(e.target.value) || 0,
                              0,
                              PARTY_STAT_LIMITS.maxOverdrive,
                              'Overdrive Max'
                            ),
                          })
                        }
                        className="w-1/2 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="unit-battles" className="block text-xs font-medium text-slate-400 mb-1">
                      Battles Participated / Kills
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="unit-battles"
                        type="number"
                        min={0}
                        max={PARTY_STAT_LIMITS.maxBattles}
                        value={member.totalBattles}
                        onChange={(e) =>
                          updateMember({
                            totalBattles: clampNumeric(
                              Number(e.target.value) || 0,
                              0,
                              PARTY_STAT_LIMITS.maxBattles,
                              'Battles Participated'
                            ),
                          })
                        }
                        className="w-1/2 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                      />
                      <input
                        aria-label="Enemies Defeated"
                        type="number"
                        min={0}
                        max={PARTY_STAT_LIMITS.maxBattles}
                        value={member.enemiesDefeated}
                        onChange={(e) =>
                          updateMember({
                            enemiesDefeated: clampNumeric(
                              Number(e.target.value) || 0,
                              0,
                              PARTY_STAT_LIMITS.maxBattles,
                              'Enemies Defeated'
                            ),
                          })
                        }
                        className="w-1/2 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                      />
                    </div>
                  </div>

                  {selectedIndex < 7 && (
                    <div>
                      <label htmlFor="unit-affection" className="block text-xs font-medium text-slate-400 mb-1">
                        Affection Toward Tidus (0–999)
                      </label>
                      <input
                        id="unit-affection"
                        type="number"
                        min={0}
                        max={PARTY_STAT_LIMITS.maxAffection}
                        value={member.affection}
                        onChange={(e) =>
                          updateMember({
                            affection: clampNumeric(
                              Number(e.target.value) || 0,
                              0,
                              PARTY_STAT_LIMITS.maxAffection,
                              'Affection'
                            ),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Base vs Current Stats Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                    Base &amp; Effective Combat Attributes
                  </h3>
                  <span className="text-xs text-slate-400">
                    Safe FFX caps enforced: HP 99,999 · MP 9,999 · Stats 255
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs text-slate-400 bg-slate-950/60">
                        <th className="text-left font-medium px-4 py-2">Attribute</th>
                        <th className="text-left font-medium px-4 py-2">Base Value</th>
                        <th className="text-left font-medium px-4 py-2">Current / Max Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      <tr>
                        <td className="px-4 py-2 font-medium text-slate-200">HP (1–99,999)</td>
                        <td className="px-4 py-2">
                          <input
                            aria-label="Base HP"
                            type="number"
                            min={PARTY_STAT_LIMITS.minHp}
                            max={PARTY_STAT_LIMITS.maxHp}
                            value={member.baseHp}
                            onChange={(e) =>
                              updateMember({
                                baseHp: clampNumeric(
                                  Number(e.target.value) || 0,
                                  PARTY_STAT_LIMITS.minHp,
                                  PARTY_STAT_LIMITS.maxHp,
                                  'Base HP'
                                ),
                              })
                            }
                            className="w-32 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1 font-mono tabular-nums text-slate-100"
                          />
                        </td>
                        <td className="px-4 py-2 flex items-center gap-2">
                          <input
                            aria-label="Current HP"
                            type="number"
                            min={0}
                            max={Math.min(PARTY_STAT_LIMITS.maxHp, member.currentHpMax)}
                            value={member.currentHp}
                            onChange={(e) =>
                              updateMember({
                                currentHp: clampNumeric(
                                  Number(e.target.value) || 0,
                                  0,
                                  Math.min(PARTY_STAT_LIMITS.maxHp, member.currentHpMax),
                                  'Current HP'
                                ),
                              })
                            }
                            className="w-28 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1 font-mono tabular-nums text-slate-100"
                          />
                          <span className="text-slate-500">/</span>
                          <input
                            aria-label="Current Max HP"
                            type="number"
                            min={PARTY_STAT_LIMITS.minHp}
                            max={PARTY_STAT_LIMITS.maxHp}
                            value={member.currentHpMax}
                            onChange={(e) =>
                              updateMember({
                                currentHpMax: clampNumeric(
                                  Number(e.target.value) || 0,
                                  PARTY_STAT_LIMITS.minHp,
                                  PARTY_STAT_LIMITS.maxHp,
                                  'Current Max HP'
                                ),
                              })
                            }
                            className="w-28 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1 font-mono tabular-nums text-slate-100"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium text-slate-200">MP (0–9,999)</td>
                        <td className="px-4 py-2">
                          <input
                            aria-label="Base MP"
                            type="number"
                            min={PARTY_STAT_LIMITS.minMp}
                            max={PARTY_STAT_LIMITS.maxMp}
                            value={member.baseMp}
                            onChange={(e) =>
                              updateMember({
                                baseMp: clampNumeric(
                                  Number(e.target.value) || 0,
                                  PARTY_STAT_LIMITS.minMp,
                                  PARTY_STAT_LIMITS.maxMp,
                                  'Base MP'
                                ),
                              })
                            }
                            className="w-32 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1 font-mono tabular-nums text-slate-100"
                          />
                        </td>
                        <td className="px-4 py-2 flex items-center gap-2">
                          <input
                            aria-label="Current MP"
                            type="number"
                            min={0}
                            max={Math.min(PARTY_STAT_LIMITS.maxMp, member.currentMpMax)}
                            value={member.currentMp}
                            onChange={(e) =>
                              updateMember({
                                currentMp: clampNumeric(
                                  Number(e.target.value) || 0,
                                  0,
                                  Math.min(PARTY_STAT_LIMITS.maxMp, member.currentMpMax),
                                  'Current MP'
                                ),
                              })
                            }
                            className="w-28 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1 font-mono tabular-nums text-slate-100"
                          />
                          <span className="text-slate-500">/</span>
                          <input
                            aria-label="Current Max MP"
                            type="number"
                            min={PARTY_STAT_LIMITS.minMp}
                            max={PARTY_STAT_LIMITS.maxMp}
                            value={member.currentMpMax}
                            onChange={(e) =>
                              updateMember({
                                currentMpMax: clampNumeric(
                                  Number(e.target.value) || 0,
                                  PARTY_STAT_LIMITS.minMp,
                                  PARTY_STAT_LIMITS.maxMp,
                                  'Current Max MP'
                                ),
                              })
                            }
                            className="w-28 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1 font-mono tabular-nums text-slate-100"
                          />
                        </td>
                      </tr>
                      {(
                        [
                          ['Strength', 'baseStrength', 'currentStrength', 0],
                          ['Defense', 'baseDefense', 'currentDefense', 0],
                          ['Magic', 'baseMagic', 'currentMagic', 0],
                          ['Magic Defense', 'baseMagicDefense', 'currentMagicDefense', 0],
                          ['Agility', 'baseAgility', 'currentAgility', PARTY_STAT_LIMITS.minAgility],
                          ['Luck', 'baseLuck', 'currentLuck', 0],
                          ['Evasion', 'baseEvasion', 'currentEvasion', 0],
                          ['Accuracy', 'baseAccuracy', 'currentAccuracy', 0],
                        ] as const
                      ).map(([label, baseKey, curKey, minAttr]) => (
                        <tr key={label}>
                          <td className="px-4 py-2 font-medium text-slate-200">
                            {label} ({minAttr}–255)
                          </td>
                          <td className="px-4 py-2">
                            <input
                              aria-label={`Base ${label}`}
                              type="number"
                              min={minAttr}
                              max={PARTY_STAT_LIMITS.maxAttr}
                              value={member[baseKey]}
                              onChange={(e) =>
                                updateMember({
                                  [baseKey]: clampNumeric(
                                    Number(e.target.value) || 0,
                                    minAttr,
                                    PARTY_STAT_LIMITS.maxAttr,
                                    `Base ${label}`
                                  ),
                                })
                              }
                              className="w-24 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1 font-mono tabular-nums text-slate-100"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              aria-label={`Current ${label}`}
                              type="number"
                              min={minAttr}
                              max={PARTY_STAT_LIMITS.maxAttr}
                              value={member[curKey]}
                              onChange={(e) =>
                                updateMember({
                                  [curKey]: clampNumeric(
                                    Number(e.target.value) || 0,
                                    minAttr,
                                    PARTY_STAT_LIMITS.maxAttr,
                                    `Current ${label}`
                                  ),
                                })
                              }
                              className="w-24 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1 font-mono tabular-nums text-slate-100"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {subTab === 'abilities' && (
            <div className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label htmlFor="ability-search" className="sr-only">
                    Filter Abilities
                  </label>
                  <input
                    id="ability-search"
                    type="text"
                    placeholder="Filter 95 abilities (e.g. Quick Hit, Ultima, Auto-Life)..."
                    value={abilitySearch}
                    onChange={(e) => setAbilitySearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateCore((d) => unlockAllCharacterAbilities(d, selectedIndex));
                      setNotice(`Unlocked all 95 abilities for ${member.customName || member.defaultName}.`);
                    }}
                    className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Check All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateCore((d) => {
                        for (const ab of CHARACTER_ABILITIES) {
                          setBit(d, ab.offset + partyDelta, ab.bit, false);
                        }
                      });
                    }}
                    className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Uncheck All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[480px] overflow-y-auto pr-1">
                {filteredAbilities.map((ab) => {
                  const checked = getBit(core, ab.offset + partyDelta, ab.bit);
                  return (
                    <label
                      key={ab.name}
                      className="flex items-center gap-2 text-xs text-slate-200 bg-slate-950/60 border border-slate-800/80 rounded px-2.5 py-2 cursor-pointer select-none hover:border-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          onUpdateCore((d) => setBit(d, ab.offset + partyDelta, ab.bit, e.target.checked))
                        }
                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 accent-sky-500 shrink-0"
                      />
                      <span className="truncate">{ab.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {subTab === 'od-modes' && (
            <div className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                    {member.customName || member.defaultName} Overdrive Modes &amp; Usage Counts
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Unlock modes and adjust progress counters used by the game to earn new modes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateCore((d) => unlockAllCharacterOverdriveModes(d, selectedIndex));
                    setNotice(`Unlocked Overdrive Modes for ${member.customName || member.defaultName}.`);
                  }}
                  className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Unlock All Modes
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {OVERDRIVE_MODES.map((m) => {
                  const unlocked = getBit(core, 22164 + partyDelta, m.bit);
                  const count = readU16(core, m.countOffset + partyDelta);
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-2 bg-slate-950/60 border border-slate-800 rounded px-3 py-2"
                    >
                      <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={unlocked}
                          onChange={(e) =>
                            onUpdateCore((d) =>
                              setBit(d, 22164 + partyDelta, m.bit, e.target.checked)
                            )
                          }
                          className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 accent-sky-500"
                        />
                        <span>{m.name}</span>
                      </label>
                      <input
                        aria-label={`${m.name} Count`}
                        type="number"
                        min={0}
                        max={PARTY_STAT_LIMITS.maxOverdriveModeCount}
                        value={count}
                        onChange={(e) =>
                          onUpdateCore((d) =>
                            writeU16(
                              d,
                              m.countOffset + partyDelta,
                              clampNumeric(
                                Number(e.target.value) || 0,
                                0,
                                PARTY_STAT_LIMITS.maxOverdriveModeCount,
                                `${m.name} Count`
                              )
                            )
                          )
                        }
                        className="w-20 bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 text-xs font-mono tabular-nums text-slate-100 text-right"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {subTab === 'global-od' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                      Global Overdrives (Swordplay, Bushido, Slots, Ronso Rage, Mix)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Shared save-wide Overdrive unlocks across Tidus, Auron, Kimahri, Wakka, Rikku, and Aeons.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateCore(unlockAllOverdrives);
                      setNotice('Unlocked all 59 Overdrives & 26 Special/Aeon abilities.');
                    }}
                    className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Unlock All Overdrives &amp; Specials
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
                  {OVERDRIVES_LIST.map((od) => {
                    const checked = getBit(core, od.offset, od.bit);
                    return (
                      <label
                        key={`${od.offset}-${od.bit}-${od.name}`}
                        className="flex items-center gap-2 text-xs text-slate-200 bg-slate-950/60 border border-slate-800/80 rounded px-2.5 py-2 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            onUpdateCore((d) => setBit(d, od.offset, od.bit, e.target.checked))
                          }
                          className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 accent-sky-500 shrink-0"
                        />
                        <span className="truncate">{od.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                  Special &amp; Aeon Command Flags (incl. Wakizashi &amp; Zanmato)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {SPECIAL_ABILITIES_LIST.map((sp) => {
                    const checked = sp.accessors.every(
                      (acc) => getBit(core, acc.offset, acc.bit) === acc.value
                    );
                    return (
                      <label
                        key={sp.name}
                        className="flex items-center gap-2 text-xs text-slate-200 bg-slate-950/60 border border-slate-800/80 rounded px-2.5 py-2 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            onUpdateCore((d) => {
                              for (const acc of sp.accessors) {
                                setBit(d, acc.offset, acc.bit, e.target.checked ? acc.value : !acc.value);
                              }
                            })
                          }
                          className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 accent-sky-500 shrink-0"
                        />
                        <span className="truncate">{sp.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {subTab === 'roster' && (
            <div className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                    Active Party &amp; Reserve Formation (18 Slots)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Slots 1–3 enter battle immediately; slots 4–7 are reserve switch-ins. Syncs save header portraits automatically.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateCore((d) => {
                      for (let i = 0; i < 7; i++) writeU8(d, 15768 + i, i);
                      for (let i = 7; i < 18; i++) writeU8(d, 15768 + i, 0xff);
                      syncHeaderPartyAndTime(d);
                    });
                    setNotice('Restored standard 7-member formation (Tidus–Rikku).');
                  }}
                  className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Standard 7-Member Party
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 18 }, (_, slot) => {
                  const val = readU8(core, 15768 + slot);
                  return (
                    <div key={slot}>
                      <label
                        htmlFor={`roster-slot-${slot}`}
                        className="block text-xs font-medium text-slate-400 mb-1"
                      >
                        {slot < 3
                          ? `Frontline Slot ${slot + 1}`
                          : slot < 7
                          ? `Reserve Slot ${slot + 1}`
                          : `Extra Slot ${slot + 1}`}
                      </label>
                      <select
                        id={`roster-slot-${slot}`}
                        value={val}
                        onChange={(e) => {
                          const nextVal = Number(e.target.value);
                          onUpdateCore((d) => {
                            writeU8(d, 15768 + slot, nextVal);
                            syncHeaderPartyAndTime(d);
                          });
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm text-slate-100"
                      >
                        {PARTY_ROSTER_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
