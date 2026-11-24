import React from 'react';
import { Flame, Heart, ShieldAlert, Skull, Swords, Zap } from 'lucide-react';
import {
  BattleBatchAction,
  LiveBattleEntity,
  LiveBattleState,
} from '../ffx/liveTrainer';

interface LiveBattleEditorProps {
  isBridgeConnected: boolean;
  inLiveBattle: boolean;
  battleState: LiveBattleState | null;
  onStartSimulatedBattle: () => void;
  onEndSimulatedBattle: () => void;
  onEditEntity: (
    side: 'party' | 'enemy',
    slot: number,
    patch: Partial<Pick<LiveBattleEntity, 'hp' | 'maxHp' | 'mp' | 'maxMp' | 'overdrive' | 'overdriveMax'>>
  ) => void;
  onBatchAction: (action: BattleBatchAction) => void;
  statusMessage: string | null;
}

export const LiveBattleEditor: React.FC<LiveBattleEditorProps> = ({
  isBridgeConnected,
  inLiveBattle,
  battleState,
  onStartSimulatedBattle,
  onEndSimulatedBattle,
  onEditEntity,
  onBatchAction,
  statusMessage,
}) => {
  return (
    <div className="space-y-5">
      <section className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Swords className="w-4 h-4 text-sky-400" />
              Active Battle Memory Editor
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Inspect and modify frontline allies and enemy targets inside active combat (
              <code className="font-mono text-slate-300">FFX_BattlePointerParty 0xD334CC</code> &amp;{' '}
              <code className="font-mono text-slate-300">FFX_BattlePointerEnemy 0xD34460</code>, stride{' '}
              <code className="font-mono text-slate-300">0xF90</code>).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {!battleState ? (
              <button
                type="button"
                onClick={onStartSimulatedBattle}
                className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5" />
                Start Simulated Battle
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onBatchAction('heal_party')}
                  className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5" />
                  Heal All Allies
                </button>
                <button
                  type="button"
                  onClick={() => onBatchAction('fill_overdrive')}
                  className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-sky-400" />
                  Fill Overdrives
                </button>
                <button
                  type="button"
                  onClick={() => onBatchAction('enemies_1hp')}
                  className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Set Enemies 1 HP
                </button>
                <button
                  type="button"
                  onClick={() => onBatchAction('enemies_0hp')}
                  className="px-3 py-1.5 rounded border border-rose-800/80 bg-rose-950/60 hover:bg-rose-950 text-rose-200 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Skull className="w-3.5 h-3.5" />
                  Defeat Enemies (0 HP)
                </button>
                {battleState.source === 'sandbox' && (
                  <button
                    type="button"
                    onClick={onEndSimulatedBattle}
                    className="px-3 py-1.5 rounded border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    End Simulated Battle
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {!battleState ? (
          <div className="bg-slate-950/60 border border-slate-800 rounded p-6 text-center space-y-2">
            <div className="flex justify-center">
              <ShieldAlert className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-sm font-medium text-slate-200">
              {isBridgeConnected && !inLiveBattle
                ? 'Hooked to FFX.exe — Waiting for Active Battle'
                : 'No Active Battle Detected'}
            </div>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              {isBridgeConnected
                ? 'Enter any encounter in FINAL FANTASY X and active ally & fiend HP/MP/Overdrive slots will stream here automatically. Or launch a simulated battle to preview live battle overrides.'
                : 'Connect the Windows Companion Bridge during a battle to edit FFX.exe combat memory live, or click Start Simulated Battle above to test active-encounter HP, MP, Overdrive, and 1-HP enemy overrides.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Allies */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                  Active Party Combatants ({battleState.party.length})
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  {battleState.source === 'live-bridge' ? 'Live FFX.exe RAM' : 'Sandbox Encounter Simulation'}
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400">
                      <th className="text-left font-medium px-3 py-2">Slot / Unit</th>
                      <th className="text-left font-medium px-3 py-2">Current HP</th>
                      <th className="text-left font-medium px-3 py-2">Max HP</th>
                      <th className="text-left font-medium px-3 py-2">Current MP</th>
                      <th className="text-left font-medium px-3 py-2">Max MP</th>
                      <th className="text-left font-medium px-3 py-2">Overdrive</th>
                      <th className="text-left font-medium px-3 py-2">OD Max</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {battleState.party.map((ent) => (
                      <tr key={`party-${ent.slot}`} className="bg-slate-950/30">
                        <td className="px-3 py-2 font-medium text-slate-100 whitespace-nowrap">
                          <span className="font-mono text-slate-400 mr-2">#{ent.slot}</span>
                          {ent.name}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            aria-label={`Ally Slot ${ent.slot} HP`}
                            type="number"
                            min={0}
                            max={ent.maxHp}
                            value={ent.hp}
                            onChange={(e) =>
                              onEditEntity('party', ent.slot, { hp: Number(e.target.value) || 0 })
                            }
                            className="w-24 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 font-mono tabular-nums text-slate-100"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            aria-label={`Ally Slot ${ent.slot} Max HP`}
                            type="number"
                            min={1}
                            max={99999}
                            value={ent.maxHp}
                            onChange={(e) =>
                              onEditEntity('party', ent.slot, { maxHp: Number(e.target.value) || 1 })
                            }
                            className="w-24 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 font-mono tabular-nums text-slate-100"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            aria-label={`Ally Slot ${ent.slot} MP`}
                            type="number"
                            min={0}
                            max={ent.maxMp}
                            value={ent.mp}
                            onChange={(e) =>
                              onEditEntity('party', ent.slot, { mp: Number(e.target.value) || 0 })
                            }
                            className="w-20 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 font-mono tabular-nums text-slate-100"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            aria-label={`Ally Slot ${ent.slot} Max MP`}
                            type="number"
                            min={0}
                            max={9999}
                            value={ent.maxMp}
                            onChange={(e) =>
                              onEditEntity('party', ent.slot, { maxMp: Number(e.target.value) || 0 })
                            }
                            className="w-20 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 font-mono tabular-nums text-slate-100"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            aria-label={`Ally Slot ${ent.slot} Overdrive`}
                            type="number"
                            min={0}
                            max={ent.overdriveMax || 255}
                            value={ent.overdrive}
                            onChange={(e) =>
                              onEditEntity('party', ent.slot, { overdrive: Number(e.target.value) || 0 })
                            }
                            className="w-16 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 font-mono tabular-nums text-sky-300"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            aria-label={`Ally Slot ${ent.slot} Overdrive Max`}
                            type="number"
                            min={1}
                            max={255}
                            value={ent.overdriveMax}
                            onChange={(e) =>
                              onEditEntity('party', ent.slot, { overdriveMax: Number(e.target.value) || 100 })
                            }
                            className="w-16 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 font-mono tabular-nums text-slate-300"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Enemies */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Active Enemy Targets ({battleState.enemies.length})
              </h4>

              <div className="overflow-x-auto border border-slate-800 rounded">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400">
                      <th className="text-left font-medium px-3 py-2">Slot / Target</th>
                      <th className="text-left font-medium px-3 py-2">Current HP</th>
                      <th className="text-left font-medium px-3 py-2">Max HP</th>
                      <th className="text-left font-medium px-3 py-2">Current MP</th>
                      <th className="text-left font-medium px-3 py-2">Max MP</th>
                      <th className="text-right font-medium px-3 py-2">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {battleState.enemies.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-4 text-center text-slate-400">
                          No active enemies detected in battle pointer slots.
                        </td>
                      </tr>
                    ) : (
                      battleState.enemies.map((ent) => (
                        <tr key={`enemy-${ent.slot}`} className="bg-slate-950/30">
                          <td className="px-3 py-2 font-medium text-slate-100 whitespace-nowrap">
                            <span className="font-mono text-slate-400 mr-2">#{ent.slot}</span>
                            {ent.name}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              aria-label={`Enemy Slot ${ent.slot} HP`}
                              type="number"
                              min={0}
                              max={ent.maxHp}
                              value={ent.hp}
                              onChange={(e) =>
                                onEditEntity('enemy', ent.slot, { hp: Number(e.target.value) || 0 })
                              }
                              className="w-28 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 font-mono tabular-nums text-slate-100"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              aria-label={`Enemy Slot ${ent.slot} Max HP`}
                              type="number"
                              min={1}
                              max={99999999}
                              value={ent.maxHp}
                              onChange={(e) =>
                                onEditEntity('enemy', ent.slot, { maxHp: Number(e.target.value) || 1 })
                              }
                              className="w-28 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 font-mono tabular-nums text-slate-100"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              aria-label={`Enemy Slot ${ent.slot} MP`}
                              type="number"
                              min={0}
                              max={ent.maxMp}
                              value={ent.mp}
                              onChange={(e) =>
                                onEditEntity('enemy', ent.slot, { mp: Number(e.target.value) || 0 })
                              }
                              className="w-20 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 font-mono tabular-nums text-slate-100"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              aria-label={`Enemy Slot ${ent.slot} Max MP`}
                              type="number"
                              min={0}
                              max={9999}
                              value={ent.maxMp}
                              onChange={(e) =>
                                onEditEntity('enemy', ent.slot, { maxMp: Number(e.target.value) || 0 })
                              }
                              className="w-20 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 font-mono tabular-nums text-slate-100"
                            />
                          </td>
                          <td className="px-3 py-2 text-right whitespace-nowrap space-x-1.5">
                            <button
                              type="button"
                              aria-label={`Set Enemy Slot ${ent.slot} to 1 HP`}
                              onClick={() => onEditEntity('enemy', ent.slot, { hp: 1 })}
                              className="px-2 py-1 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono cursor-pointer"
                            >
                              1 HP
                            </button>
                            <button
                              type="button"
                              aria-label={`Set Enemy Slot ${ent.slot} to 0 HP`}
                              onClick={() => onEditEntity('enemy', ent.slot, { hp: 0 })}
                              className="px-2 py-1 rounded border border-rose-800/80 bg-rose-950/50 hover:bg-rose-950 text-rose-200 font-mono cursor-pointer"
                            >
                              0 HP
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
