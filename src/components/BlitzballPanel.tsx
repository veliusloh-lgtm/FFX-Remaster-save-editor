import React, { useMemo, useState } from 'react';
import { Sparkles, RotateCcw, Trophy, Users } from 'lucide-react';
import {
  BlitzballPlayerData,
  getBit,
  readBlitzballPlayer,
  readU16,
  readU8,
  removeBlitzballExp,
  removeBlitzballSkills,
  resetBlitzballLevelToOne,
  resetBlitzballTournament,
  setBit,
  writeBlitzballPlayer,
  writeU16,
  writeU8,
} from '../ffx/saveCodec';
import {
  BLITZBALL_PLAYERS,
  BLITZBALL_PRIZES,
  BLITZBALL_TEAMS,
  BLITZBALL_TECHS,
} from '../ffx/tables';

interface BlitzballPanelProps {
  core: Uint8Array;
  onUpdateCore: (mutator: (draft: Uint8Array) => void) => void;
}

type BlitzSubTab = 'players' | 'teams' | 'competitions';

const TOURNAMENT_TEAM_OPTIONS = [
  { id: 29, name: 'Undecided' },
  { id: 5, name: 'Besaid Aurochs' },
  { id: 0, name: 'Luca Goers' },
  { id: 1, name: 'Kilika Beasts' },
  { id: 2, name: 'Al Bhed Psyches' },
  { id: 3, name: 'Ronso Fangs' },
  { id: 4, name: 'Guado Glories' },
];

export const BlitzballPanel: React.FC<BlitzballPanelProps> = ({ core, onUpdateCore }) => {
  const [subTab, setSubTab] = useState<BlitzSubTab>('players');
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState(0);
  const [selectedTeamIdx, setSelectedTeamIdx] = useState(5); // Besaid Aurochs default
  const [notice, setNotice] = useState<string | null>(null);

  const player = useMemo(
    () => readBlitzballPlayer(core, selectedPlayerIdx),
    [core, selectedPlayerIdx]
  );

  const updatePlayer = (patch: Partial<BlitzballPlayerData>) => {
    onUpdateCore((d) => {
      const prev = readBlitzballPlayer(d, selectedPlayerIdx);
      writeBlitzballPlayer(d, { ...prev, ...patch });
    });
  };

  const isTechLearned = (techIndex: number): boolean => {
    if (techIndex < 32) {
      return ((player.knownTechMask1 >>> techIndex) & 1) === 1;
    }
    return ((player.knownTechMask2 >>> (techIndex - 32)) & 1) === 1;
  };

  const toggleTechLearned = (techIndex: number, learned: boolean) => {
    if (techIndex < 32) {
      const next = learned
        ? (player.knownTechMask1 | (1 << techIndex)) >>> 0
        : (player.knownTechMask1 & ~(1 << techIndex)) >>> 0;
      updatePlayer({ knownTechMask1: next });
    } else {
      const bit = techIndex - 32;
      const next = learned
        ? (player.knownTechMask2 | (1 << bit)) >>> 0
        : (player.knownTechMask2 & ~(1 << bit)) >>> 0;
      updatePlayer({ knownTechMask2: next });
    }
  };

  const learnAllPlayerTechs = () => {
    onUpdateCore((d) => {
      const cur = readBlitzballPlayer(d, selectedPlayerIdx);
      let m1 = cur.knownTechMask1;
      let m2 = cur.knownTechMask2;
      // Enable techs 2..58 for all players
      for (let t = 2; t < 59; t++) {
        if (t < 32) m1 = (m1 | (1 << t)) >>> 0;
        else m2 = (m2 | (1 << (t - 32))) >>> 0;
      }
      // Tidus gets Jecht Shot 1 & 2 (0, 1); Wakka gets Aurochs Spirit (59)
      if (selectedPlayerIdx === 0) {
        m1 = (m1 | 0x3) >>> 0;
      } else if (selectedPlayerIdx === 1) {
        m2 = (m2 | (1 << (59 - 32))) >>> 0;
      }
      writeBlitzballPlayer(d, { ...cur, knownTechMask1: m1, knownTechMask2: m2 });
    });
    setNotice(
      `Unlocked all learnable Blitzball techs for ${BLITZBALL_PLAYERS[selectedPlayerIdx]?.name ?? 'Player'}.`
    );
  };

  const totalGamesWon = readU16(core, 6034);
  const leagueStatus = readU8(core, 5810);
  const tournamentStatus = readU8(core, 5855);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">
            Blitzball League &amp; Roster
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Edit all 60 Blitzball players, 6 team rosters &amp; W/L records, League/Tournament prizes, and Jecht Shot / World Champion flags.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {(
            [
              ['players', 'Players (60)', Sparkles],
              ['teams', 'Teams & Rosters (6)', Users],
              ['competitions', 'League & Tournament', Trophy],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSubTab(id)}
              className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer ${
                subTab === id
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {notice && <div className="text-xs font-medium text-sky-400">{notice}</div>}

      {subTab === 'players' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-md p-2 space-y-1 max-h-[600px] overflow-y-auto">
            {BLITZBALL_PLAYERS.map((p) => {
              const pData = readBlitzballPlayer(core, p.id);
              const active = p.id === selectedPlayerIdx;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlayerIdx(p.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between gap-2 cursor-pointer ${
                    active
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40'
                      : 'text-slate-200 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <span className="truncate font-medium">{p.name}</span>
                  <span className="text-xs font-mono tabular-nums text-slate-400">
                    Lv.{pData.level}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <h3 className="text-base font-semibold text-slate-100">
                  {BLITZBALL_PLAYERS[selectedPlayerIdx]?.name} (#{selectedPlayerIdx})
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updatePlayer({ level: 99, experience: 9999, techCapacity: 5 });
                      setNotice(`Maxed ${BLITZBALL_PLAYERS[selectedPlayerIdx]?.name} to Lv.99.`);
                    }}
                    className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Max Player (Lv.99)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateCore((d) => {
                        for (let i = 0; i < 60; i++) {
                          const p = readBlitzballPlayer(d, i);
                          writeBlitzballPlayer(d, {
                            ...p,
                            level: 99,
                            experience: 9999,
                            techCapacity: 5,
                          });
                        }
                      });
                      setNotice('Set all 60 Blitzball players to Lv.99 & Tech Capacity 5.');
                    }}
                    className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Max All 60 Players
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateCore((d) => {
                        resetBlitzballLevelToOne(d, [selectedPlayerIdx]);
                      });
                      setNotice(
                        `Returned ${BLITZBALL_PLAYERS[selectedPlayerIdx]?.name ?? 'Player'} to Level 1 (0 EXP).`
                      );
                    }}
                    className="px-3 py-1.5 rounded border border-amber-700/60 bg-amber-950/40 hover:bg-amber-950/70 text-amber-200 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Reset Player to Lv. 1
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateCore((d) => {
                        resetBlitzballLevelToOne(d);
                      });
                      setNotice('Returned all 60 Blitzball players to Level 1 (0 EXP).');
                    }}
                    className="px-3 py-1.5 rounded border border-amber-700/60 bg-amber-950/40 hover:bg-amber-950/70 text-amber-200 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Reset All 60 to Lv. 1
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateCore((d) => {
                        removeBlitzballExp(d, [selectedPlayerIdx]);
                      });
                      setNotice(
                        `Removed all EXP for ${BLITZBALL_PLAYERS[selectedPlayerIdx]?.name ?? 'Player'}.`
                      );
                    }}
                    className="px-3 py-1.5 rounded border border-rose-800/60 bg-rose-950/40 hover:bg-rose-950/70 text-rose-200 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Remove Player EXP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateCore((d) => {
                        removeBlitzballExp(d);
                      });
                      setNotice('Removed all EXP for all 60 Blitzball players.');
                    }}
                    className="px-3 py-1.5 rounded border border-rose-800/60 bg-rose-950/40 hover:bg-rose-950/70 text-rose-200 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Remove All 60 EXP
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label htmlFor="bb-lvl" className="block text-xs font-medium text-slate-400 mb-1">
                    Level (1–99)
                  </label>
                  <input
                    id="bb-lvl"
                    type="number"
                    min={1}
                    max={99}
                    value={player.level}
                    onChange={(e) =>
                      updatePlayer({ level: Math.max(1, Math.min(99, Number(e.target.value) || 1)) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="bb-exp" className="block text-xs font-medium text-slate-400 mb-1">
                    EXP
                  </label>
                  <input
                    id="bb-exp"
                    type="number"
                    min={0}
                    max={65535}
                    value={player.experience}
                    onChange={(e) => updatePlayer({ experience: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="bb-contract" className="block text-xs font-medium text-slate-400 mb-1">
                    Contract Games
                  </label>
                  <input
                    id="bb-contract"
                    type="number"
                    min={0}
                    max={255}
                    value={player.contract}
                    onChange={(e) => updatePlayer({ contract: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="bb-salary" className="block text-xs font-medium text-slate-400 mb-1">
                    Salary (Gil)
                  </label>
                  <input
                    id="bb-salary"
                    type="number"
                    min={0}
                    max={65535}
                    value={player.salary}
                    onChange={(e) => updatePlayer({ salary: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="bb-lg-goals" className="block text-xs font-medium text-slate-400 mb-1">
                    League Goals
                  </label>
                  <input
                    id="bb-lg-goals"
                    type="number"
                    min={0}
                    max={65535}
                    value={player.leagueGoals}
                    onChange={(e) => updatePlayer({ leagueGoals: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="bb-tn-goals" className="block text-xs font-medium text-slate-400 mb-1">
                    Tournament Goals
                  </label>
                  <input
                    id="bb-tn-goals"
                    type="number"
                    min={0}
                    max={65535}
                    value={player.tournamentGoals}
                    onChange={(e) => updatePlayer({ tournamentGoals: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="bb-tech-cap" className="block text-xs font-medium text-slate-400 mb-1">
                    Equipped Tech Slots Unlocked (0–5)
                  </label>
                  <input
                    id="bb-tech-cap"
                    type="number"
                    min={0}
                    max={5}
                    value={player.techCapacity}
                    onChange={(e) =>
                      updatePlayer({
                        techCapacity: Math.max(0, Math.min(5, Number(e.target.value) || 0)),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Equipped Techs (Slots 1–5)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {player.equippedTechs.map((techId, slot) => (
                    <select
                      key={slot}
                      aria-label={`Equipped Tech ${slot + 1}`}
                      value={techId}
                      onChange={(e) => {
                        const next = [...player.equippedTechs] as [
                          number,
                          number,
                          number,
                          number,
                          number,
                        ];
                        next[slot] = Number(e.target.value);
                        updatePlayer({ equippedTechs: next });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1.5 text-xs text-slate-100"
                    >
                      <option value={0}>None (0)</option>
                      <option value={0xff}>Empty (0xFF)</option>
                      {BLITZBALL_TECHS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                  Learned Tech Library (60 Techs)
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={learnAllPlayerTechs}
                    className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Learn All Techs
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateCore((d) => {
                        removeBlitzballSkills(d, [selectedPlayerIdx]);
                      });
                      setNotice(
                        `Removed all learned & equipped Blitzball skills for ${BLITZBALL_PLAYERS[selectedPlayerIdx]?.name ?? 'Player'}.`
                      );
                    }}
                    className="px-3 py-1.5 rounded border border-rose-800/60 bg-rose-950/40 hover:bg-rose-950/70 text-rose-200 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Remove Player Skills
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateCore((d) => {
                        removeBlitzballSkills(d);
                      });
                      setNotice('Removed all learned & equipped Blitzball skills for all 60 players.');
                    }}
                    className="px-3 py-1.5 rounded border border-rose-800/60 bg-rose-950/40 hover:bg-rose-950/70 text-rose-200 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Remove All 60 Skills
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                {BLITZBALL_TECHS.map((tech, idx) => (
                  <label
                    key={tech.id}
                    className="flex items-center gap-2 text-xs text-slate-200 bg-slate-950/60 border border-slate-800 rounded px-2.5 py-1.5 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isTechLearned(idx)}
                      onChange={(e) => toggleTechLearned(idx, e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 accent-sky-500 shrink-0"
                    />
                    <span className="truncate">{tech.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'teams' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-md p-2 space-y-1">
            {BLITZBALL_TEAMS.filter((t) => t.id < 6).map((team) => {
              const wins = readU8(core, 5798 + team.id);
              const losses = readU8(core, 5804 + team.id);
              const active = team.id === selectedTeamIdx;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => setSelectedTeamIdx(team.id)}
                  className={`w-full text-left px-3 py-2.5 rounded text-sm flex items-center justify-between gap-2 cursor-pointer ${
                    active
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40'
                      : 'text-slate-200 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <span className="font-medium truncate">{team.name}</span>
                  <span className="text-xs font-mono tabular-nums text-slate-400">
                    {wins}W - {losses}L
                  </span>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-md p-5 space-y-5">
            <h3 className="text-base font-semibold text-slate-100">
              {BLITZBALL_TEAMS.find((t) => t.id === selectedTeamIdx)?.name} Roster &amp; Record
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="team-size" className="block text-xs font-medium text-slate-400 mb-1">
                  Team Size (0–8)
                </label>
                <input
                  id="team-size"
                  type="number"
                  min={0}
                  max={8}
                  value={readU8(core, 3252 + selectedTeamIdx)}
                  onChange={(e) =>
                    onUpdateCore((d) =>
                      writeU8(
                        d,
                        3252 + selectedTeamIdx,
                        Math.max(0, Math.min(8, Number(e.target.value) || 0))
                      )
                    )
                  }
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="team-wins" className="block text-xs font-medium text-slate-400 mb-1">
                  League Wins
                </label>
                <input
                  id="team-wins"
                  type="number"
                  min={0}
                  max={255}
                  value={readU8(core, 5798 + selectedTeamIdx)}
                  onChange={(e) =>
                    onUpdateCore((d) => writeU8(d, 5798 + selectedTeamIdx, Number(e.target.value) || 0))
                  }
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="team-losses" className="block text-xs font-medium text-slate-400 mb-1">
                  League Losses
                </label>
                <input
                  id="team-losses"
                  type="number"
                  min={0}
                  max={255}
                  value={readU8(core, 5804 + selectedTeamIdx)}
                  onChange={(e) =>
                    onUpdateCore((d) =>
                      writeU8(d, 5804 + selectedTeamIdx, Number(e.target.value) || 0)
                    )
                  }
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              {Array.from({ length: 8 }, (_, slot) => {
                const playerId = readU8(core, 5702 + selectedTeamIdx * 8 + slot);
                return (
                  <div key={slot}>
                    <label
                      htmlFor={`team-slot-${slot}`}
                      className="block text-xs font-medium text-slate-400 mb-1"
                    >
                      Roster Slot {slot + 1}
                    </label>
                    <select
                      id={`team-slot-${slot}`}
                      value={playerId}
                      onChange={(e) =>
                        onUpdateCore((d) =>
                          writeU8(d, 5702 + selectedTeamIdx * 8 + slot, Number(e.target.value))
                        )
                      }
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm text-slate-100"
                    >
                      {BLITZBALL_PLAYERS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                      <option value={0xff}>Empty (0xFF)</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {subTab === 'competitions' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* League & Global Blitzball Flags */}
          <section className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              League Status, Prizes &amp; Milestones
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="bb-league-status" className="block text-xs font-medium text-slate-400 mb-1">
                  League Status
                </label>
                <select
                  id="bb-league-status"
                  value={leagueStatus}
                  onChange={(e) => onUpdateCore((d) => writeU8(d, 5810, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i} value={i}>
                      Round {i + 1}
                    </option>
                  ))}
                  <option value={10}>Reset to Round 1 (10)</option>
                </select>
              </div>

              <div>
                <label htmlFor="bb-games-won" className="block text-xs font-medium text-slate-400 mb-1">
                  Total Games Won (Affects Reels Unlock)
                </label>
                <input
                  id="bb-games-won"
                  type="number"
                  min={0}
                  max={65535}
                  value={totalGamesWon}
                  onChange={(e) =>
                    onUpdateCore((d) => writeU16(d, 6034, Number(e.target.value) || 0))
                  }
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                />
              </div>

              {(
                [
                  ['League 1st Place Prize', 6716],
                  ['League 2nd Place Prize', 6718],
                  ['League 3rd Place Prize', 6720],
                  ['League Top Scorer Prize', 6728],
                ] as const
              ).map(([label, offset]) => (
                <div key={offset}>
                  <label
                    htmlFor={`prize-${offset}`}
                    className="block text-xs font-medium text-slate-400 mb-1"
                  >
                    {label}
                  </label>
                  <select
                    id={`prize-${offset}`}
                    value={readU16(core, offset)}
                    onChange={(e) =>
                      onUpdateCore((d) => writeU16(d, offset, Number(e.target.value)))
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
                  >
                    {BLITZBALL_PRIZES.map((pr, idx) => (
                      <option key={`${pr.id}-${idx}`} value={pr.id}>
                        {pr.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              <label className="flex items-center gap-2.5 text-sm text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={getBit(core, 3176, 0) && getBit(core, 1072, 3)}
                  onChange={(e) =>
                    onUpdateCore((d) => {
                      setBit(d, 3176, 0, e.target.checked);
                      setBit(d, 1072, 3, e.target.checked);
                    })
                  }
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-sky-500"
                />
                <span>Learned Jecht Shot (Storyline Boat Challenge)</span>
              </label>
              <label className="flex items-center gap-2.5 text-sm text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={getBit(core, 3164, 0)}
                  onChange={(e) =>
                    onUpdateCore((d) => setBit(d, 3164, 0, e.target.checked))
                  }
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-sky-500"
                />
                <span>Won Luca Storyline Tournament</span>
              </label>
              <label className="flex items-center gap-2.5 text-sm text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={getBit(core, 3189, 0)}
                  onChange={(e) =>
                    onUpdateCore((d) => setBit(d, 3189, 0, e.target.checked))
                  }
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-sky-500"
                />
                <span>World Champion (Wakka Celestial) Unlocked</span>
              </label>
            </div>
          </section>

          {/* Tournament Bracket & Prizes */}
          <section className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                Tournament Bracket &amp; Prizes
              </h3>
              <button
                type="button"
                onClick={() => {
                  onUpdateCore(resetBlitzballTournament);
                  setNotice('Reset Blitzball Tournament to Round 1.');
                }}
                className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Tournament
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="bb-tn-status" className="block text-xs font-medium text-slate-400 mb-1">
                  Tournament Status
                </label>
                <select
                  id="bb-tn-status"
                  value={tournamentStatus}
                  onChange={(e) => onUpdateCore((d) => writeU8(d, 5855, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
                >
                  <option value={0}>No Data (0)</option>
                  <option value={1}>No Tournament (1)</option>
                  <option value={2}>No Tournament (2)</option>
                  <option value={3}>No Tournament (3)</option>
                  <option value={4}>New Tournament (4)</option>
                  <option value={5}>New Tournament (5)</option>
                  <option value={6}>New Tournament (6)</option>
                  <option value={20}>Round 1 (20)</option>
                  <option value={21}>Round 2 (21)</option>
                  <option value={22}>Round 3 (22)</option>
                </select>
              </div>

              {(
                [
                  ['Tournament 1st Prize', 6722],
                  ['Tournament 2nd Prize', 6724],
                  ['Tournament 3rd Prize', 6726],
                  ['Tournament Top Scorer', 6730],
                ] as const
              ).map(([label, offset]) => (
                <div key={offset}>
                  <label
                    htmlFor={`tn-prize-${offset}`}
                    className="block text-xs font-medium text-slate-400 mb-1"
                  >
                    {label}
                  </label>
                  <select
                    id={`tn-prize-${offset}`}
                    value={readU16(core, offset)}
                    onChange={(e) =>
                      onUpdateCore((d) => writeU16(d, offset, Number(e.target.value)))
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
                  >
                    {BLITZBALL_PRIZES.map((pr, idx) => (
                      <option key={`${pr.id}-${idx}`} value={pr.id}>
                        {pr.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {(
                [
                  ['Team 1 (Bye)', 5784],
                  ['Team 2', 5785],
                  ['Team 3', 5786],
                  ['Team 4 (Bye)', 5787],
                  ['Team 5', 5788],
                  ['Team 6', 5789],
                  ['Winner (2 vs 3)', 5790],
                  ['Winner (5 vs 6)', 5791],
                  ['Finalist A', 5792],
                  ['Finalist B', 5793],
                  ['Champions', 5797],
                  ['Consolation Winner', 5796],
                ] as const
              ).map(([label, offset]) => (
                <div key={offset}>
                  <label
                    htmlFor={`tn-team-${offset}`}
                    className="block text-xs font-medium text-slate-400 mb-1"
                  >
                    {label}
                  </label>
                  <select
                    id={`tn-team-${offset}`}
                    value={readU8(core, offset)}
                    onChange={(e) =>
                      onUpdateCore((d) => writeU8(d, offset, Number(e.target.value)))
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm text-slate-100"
                  >
                    {TOURNAMENT_TEAM_OPTIONS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
