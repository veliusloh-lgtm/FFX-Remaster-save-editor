import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Flame,
  HelpCircle,
  Package,
  Play,
  Plug,
  Shield,
  Square,
  Swords,
  Terminal,
  Trophy,
  Unplug,
  Zap,
} from 'lucide-react';
import {
  BattleBatchAction,
  DEFAULT_TRAINER_CONFIG,
  FFX_LIVE_HOOKS,
  LiveBattleEntity,
  LiveBattleState,
  LiveTelemetrySnapshot,
  LiveTrainerConfig,
  TrainerConnectionMode,
  applyBattleBatchAction,
  applyBattleEntityEdit,
  applyLiveEquipmentSnapshot,
  applyTrainerToCore,
  computeTrainerOperations,
  createSimulatedBattle,
  equipGearOnCharacter,
  generateWindowsBridgeScript,
  getBridgeLaunchCommand,
  readTelemetryFromCore,
  simulateActiveGameDrainEvent,
  unequipGearFromCharacter,
  writeEquipmentSlot,
} from '../ffx/liveTrainer';
import { EquipmentSlotData } from '../ffx/saveCodec';
import { LiveBattleEditor } from './LiveBattleEditor';
import { LiveEquipmentPanel } from './LiveEquipmentPanel';

interface LiveTrainerPanelProps {
  core: Uint8Array;
  onUpdateCore: (mutator: (draft: Uint8Array) => void) => void;
}

type LiveHookSubTab = 'cheats' | 'battle' | 'equipment';

export const LiveTrainerPanel: React.FC<LiveTrainerPanelProps> = ({ core, onUpdateCore }) => {
  const [subTab, setSubTab] = useState<LiveHookSubTab>('cheats');
  const [config, setConfig] = useState<LiveTrainerConfig>(DEFAULT_TRAINER_CONFIG);
  const [mode, setMode] = useState<TrainerConnectionMode>('disconnected');
  const [wsUrl, setWsUrl] = useState('ws://127.0.0.1:28420');
  const [bridgeStatusMsg, setBridgeStatusMsg] = useState<string | null>(null);
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const [liveTelemetry, setLiveTelemetry] = useState<LiveTelemetrySnapshot | null>(null);
  const [simBattle, setSimBattle] = useState<LiveBattleState | null>(null);
  const [liveEquipCore, setLiveEquipCore] = useState<Uint8Array | null>(null);
  const [ticksApplied, setTicksApplied] = useState(0);
  const [showHookTable, setShowHookTable] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(true);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const configRef = useRef<LiveTrainerConfig>(config);
  configRef.current = config;

  const coreTelemetry = useMemo(
    () => readTelemetryFromCore(core, config.blitzInfiniteStamina ? 9999 : 450),
    [core, config.blitzInfiniteStamina]
  );

  const telemetry = mode === 'live-bridge' && liveTelemetry ? liveTelemetry : coreTelemetry;
  const activeOps = useMemo(() => computeTrainerOperations(config), [config]);

  const activeBattleState: LiveBattleState | null = useMemo(() => {
    if (mode === 'live-bridge' && telemetry.inBattle && (telemetry.battleParty.length > 0 || telemetry.battleEnemies.length > 0)) {
      return {
        active: true,
        source: 'live-bridge',
        party: telemetry.battleParty.map((ent) => ({
          ...ent,
          name: telemetry.party[ent.slot]?.name ?? `Ally #${ent.slot}`,
        })),
        enemies: telemetry.battleEnemies.map((ent) => ({
          ...ent,
          name: `Enemy Target #${ent.slot}`,
        })),
      };
    }
    return simBattle;
  }, [mode, telemetry, simBattle]);

  const effectiveEquipCore = mode === 'live-bridge' && liveEquipCore ? liveEquipCore : core;

  // Clean up WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // Push config updates immediately to Live Bridge whenever switches change
  useEffect(() => {
    if (mode === 'live-bridge' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'apply_cheats', ...config }));
    }
  }, [config, mode]);

  // Sandbox Loop interval (runs only when user explicitly activates Sandbox Loop)
  useEffect(() => {
    if (mode !== 'sandbox') return;
    const id = window.setInterval(() => {
      onUpdateCore((d) => {
        applyTrainerToCore(d, configRef.current);
      });
      setTicksApplied((n) => n + 1);
    }, config.tickRateMs);
    return () => window.clearInterval(id);
  }, [mode, config.tickRateMs, onUpdateCore]);

  const handleConnectBridge = () => {
    setBridgeError(null);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setMode('connecting');
    setBridgeStatusMsg(`Connecting to ${wsUrl}...`);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setMode('live-bridge');
        setBridgeStatusMsg('WebSocket connected. Waiting for FFX.exe handshake...');
        ws.send(JSON.stringify({ type: 'apply_cheats', ...configRef.current }));
        ws.send(JSON.stringify({ type: 'request_equipment' }));
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(String(evt.data));
          if (msg.type === 'hello') {
            setBridgeStatusMsg(`Hooked to ${msg.processName ?? 'FFX.exe'} (PID ${msg.pid}).`);
            setLiveTelemetry((prev) => ({
              ...(prev ?? coreTelemetry),
              pid: msg.pid ?? null,
              processName: msg.processName ?? 'FFX.exe',
              lastTickAt: Date.now(),
            }));
          } else if (msg.type === 'equipment_snapshot' && typeof msg.equipB64 === 'string') {
            const rawStr = window.atob(msg.equipB64);
            const equipBytes = new Uint8Array(rawStr.length);
            for (let i = 0; i < rawStr.length; i++) {
              equipBytes[i] = rawStr.charCodeAt(i);
            }
            const nextCore = core.slice();
            applyLiveEquipmentSnapshot(nextCore, equipBytes, msg.partyEquip);
            setLiveEquipCore(nextCore);
          } else if (msg.type === 'telemetry') {
            setTicksApplied((n) => n + 1);
            setLiveTelemetry((prev) => {
              const base = prev ?? coreTelemetry;
              const nextParty = Array.isArray(msg.party)
                ? base.party.map((u) => {
                    const liveU = msg.party.find((p: { index: number }) => p.index === u.index);
                    return liveU ? { ...u, ...liveU } : u;
                  })
                : base.party;
              return {
                ...base,
                pid: msg.pid ?? prev?.pid ?? null,
                processName: 'FFX.exe',
                gil: typeof msg.gil === 'number' ? msg.gil : base.gil,
                inBattle: Boolean(msg.inBattle),
                party: nextParty,
                battleParty: Array.isArray(msg.battleParty) ? msg.battleParty : base.battleParty,
                battleEnemies: Array.isArray(msg.battleEnemies) ? msg.battleEnemies : base.battleEnemies,
                lastTickAt: Date.now(),
              };
            });
          } else if (msg.type === 'error') {
            setBridgeError(msg.message || 'Bridge reported an error.');
          }
        } catch {
          // Ignore malformed bridge frames
        }
      };

      ws.onerror = () => {
        setBridgeError(
          `Unable to reach local bridge at ${wsUrl}. Download and run spira-hook-bridge.ps1 on Windows while FFX.exe is open, or use Sandbox Loop to test trainer locks in-browser.`
        );
        setMode('disconnected');
        wsRef.current = null;
      };

      ws.onclose = () => {
        setMode((prev) => (prev === 'live-bridge' || prev === 'connecting' ? 'disconnected' : prev));
        wsRef.current = null;
      };
    } catch (err) {
      setMode('disconnected');
      setBridgeError(err instanceof Error ? err.message : 'Failed to open WebSocket connection.');
    }
  };

  const handleDisconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setMode('disconnected');
    setBridgeStatusMsg('Hook detached.');
  };

  const handleToggleSandbox = () => {
    setBridgeError(null);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mode === 'sandbox') {
      setMode('disconnected');
      setBridgeStatusMsg('Sandbox freeze loop stopped.');
    } else {
      onUpdateCore((d) => {
        applyTrainerToCore(d, config);
      });
      setTicksApplied((n) => n + 1);
      setMode('sandbox');
      setBridgeStatusMsg(
        `Sandbox loop active (${config.tickRateMs}ms tick) · Testing freeze rules on loaded save buffer.`
      );
    }
  };

  const handleApplyOnce = () => {
    setBridgeError(null);
    if (mode === 'live-bridge' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'apply_cheats', ...config }));
      setTicksApplied((n) => n + 1);
      setBridgeStatusMsg(`Sent ${activeOps.length} active memory writes to FFX.exe.`);
      return;
    }
    let count = 0;
    onUpdateCore((d) => {
      count = applyTrainerToCore(d, config);
    });
    setTicksApplied((n) => n + 1);
    setBridgeStatusMsg(
      `Applied ${count} trainer updates directly to active core (${activeOps.length} rules evaluated).`
    );
  };

  const handleDownloadBridge = () => {
    let port = 28420;
    try {
      const parsed = new URL(wsUrl);
      if (parsed.port) port = Number(parsed.port) || 28420;
    } catch {
      port = 28420;
    }
    const scriptText = generateWindowsBridgeScript(port);
    const blob = new Blob([scriptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'spira-hook-bridge.ps1';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setBridgeStatusMsg('Downloaded spira-hook-bridge.ps1 for Windows FFX.exe.');
  };

  const launchCmd = getBridgeLaunchCommand();

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(launchCmd);
      setCopiedCmd(true);
      window.setTimeout(() => setCopiedCmd(false), 2000);
      setBridgeStatusMsg('Copied Admin PowerShell launch command to clipboard.');
    } catch {
      setBridgeStatusMsg(`Run in Admin PowerShell: ${launchCmd}`);
    }
  };

  const updateConfig = <K extends keyof LiveTrainerConfig>(key: K, value: LiveTrainerConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditBattleEntity = (
    side: 'party' | 'enemy',
    slot: number,
    patch: Partial<Pick<LiveBattleEntity, 'hp' | 'maxHp' | 'mp' | 'maxMp' | 'overdrive' | 'overdriveMax'>>
  ) => {
    if (mode === 'live-bridge' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN && telemetry.inBattle) {
      const current = activeBattleState?.[side === 'party' ? 'party' : 'enemies'].find(
        (e) => e.slot === slot
      );
      if (current) {
        const merged = { ...current, ...patch };
        wsRef.current.send(
          JSON.stringify({
            type: 'edit_battle_entity',
            side,
            slot,
            hp: merged.hp,
            maxHp: merged.maxHp,
            mp: merged.mp,
            maxMp: merged.maxMp,
            overdrive: merged.overdrive,
            overdriveMax: merged.overdriveMax,
          })
        );
        setBridgeStatusMsg(`Updated live ${side} slot #${slot} in FFX.exe battle memory.`);
      }
      return;
    }

    setSimBattle((prev) => (prev ? applyBattleEntityEdit(prev, side, slot, patch) : prev));
  };

  const handleBattleBatchAction = (action: BattleBatchAction) => {
    if (mode === 'live-bridge' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN && telemetry.inBattle) {
      wsRef.current.send(JSON.stringify({ type: 'battle_batch', action }));
      setBridgeStatusMsg(`Sent battle batch override (${action}) to FFX.exe.`);
      return;
    }
    setSimBattle((prev) => (prev ? applyBattleBatchAction(prev, action) : prev));
    setBridgeStatusMsg(`Applied battle override (${action}) to active combat simulation.`);
  };

  const handleWriteLiveEquipmentSlot = (slot: EquipmentSlotData) => {
    if (mode === 'live-bridge' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'write_equipment_slot',
          slot: slot.slot,
          nameId: slot.nameId,
          name2: slot.name2,
          occupied: slot.occupied,
          customizeMode: slot.customizeMode,
          character: slot.character,
          equipType: slot.type,
          equippedBy: slot.equippedBy,
          damageFormula: slot.damageFormula,
          attackPower: slot.attackPower,
          critical: slot.critical,
          abilityCount: slot.abilityCount,
          appearance: slot.appearance,
          ab0: slot.abilities[0],
          ab1: slot.abilities[1],
          ab2: slot.abilities[2],
          ab3: slot.abilities[3],
        })
      );
      setLiveEquipCore((prev) => {
        const next = (prev ?? core).slice();
        writeEquipmentSlot(next, slot);
        return next;
      });
      setBridgeStatusMsg(`Wrote equipment Slot #${slot.slot} to FFX.exe RAM.`);
      return;
    }
    onUpdateCore((d) => writeEquipmentSlot(d, slot));
    setBridgeStatusMsg(`Updated equipment Slot #${slot.slot} in active core.`);
  };

  const handleEquipLiveCharacter = (charIndex: number, slotIndex: number, gearType: 0 | 1) => {
    if (mode === 'live-bridge' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'equip_character',
          charIndex,
          slot: slotIndex,
          equipType: gearType,
        })
      );
      setLiveEquipCore((prev) => {
        const next = (prev ?? core).slice();
        equipGearOnCharacter(next, slotIndex, charIndex);
        return next;
      });
      setBridgeStatusMsg(`Equipped Slot #${slotIndex} onto Unit #${charIndex} in FFX.exe.`);
      return;
    }
    onUpdateCore((d) => {
      equipGearOnCharacter(d, slotIndex, charIndex);
    });
    setBridgeStatusMsg(`Equipped Slot #${slotIndex} onto Unit #${charIndex}.`);
  };

  const handleUnequipLiveCharacter = (charIndex: number, gearType: 0 | 1) => {
    if (mode === 'live-bridge' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'equip_character',
          charIndex,
          slot: 255,
          equipType: gearType,
        })
      );
      setLiveEquipCore((prev) => {
        const next = (prev ?? core).slice();
        unequipGearFromCharacter(next, charIndex, gearType);
        return next;
      });
      setBridgeStatusMsg(`Unequipped ${gearType === 0 ? 'Weapon' : 'Armor'} from Unit #${charIndex} in FFX.exe.`);
      return;
    }
    onUpdateCore((d) => {
      unequipGearFromCharacter(d, charIndex, gearType);
    });
    setBridgeStatusMsg(`Unequipped ${gearType === 0 ? 'Weapon' : 'Armor'} from Unit #${charIndex}.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Live Loop Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">
            Live Game Hook &amp; Trainer
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Attach to an active <code className="font-mono text-slate-200">FFX.exe</code> process to freeze cheats, edit active battle HP/MP/Overdrive, and view or customize equipment on characters and in inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleApplyOnce}
            className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            Apply Active Cheats Now
          </button>
          <button
            type="button"
            onClick={handleToggleSandbox}
            className={`px-3 py-1.5 rounded border text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'sandbox'
                ? 'border-amber-600 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100'
            }`}
          >
            {mode === 'sandbox' ? (
              <>
                <Square className="w-3.5 h-3.5" />
                Stop Sandbox Loop
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Start Sandbox Loop
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Game Hook Sub-navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'cheats' as const, label: 'Cheats & Telemetry', icon: Activity },
          { id: 'battle' as const, label: 'Active Battle Editor', icon: Swords },
          { id: 'equipment' as const, label: 'Live Equipment (Chars & Bag)', icon: Package },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-slate-800 text-sky-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Process Bridge Connection Bar */}
      <section className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            Process Attachment &amp; Companion Bridge
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs font-mono tabular-nums text-slate-300">
              {mode === 'live-bridge' && (
                <span className="text-emerald-400">
                  Hooked to {telemetry.processName} · PID {telemetry.pid ?? '—'} ·{' '}
                  {ticksApplied} sync ticks
                </span>
              )}
              {mode === 'sandbox' && (
                <span className="text-sky-400">
                  Sandbox Loop Active · {config.tickRateMs}ms tick · {ticksApplied} ticks
                </span>
              )}
              {mode === 'connecting' && (
                <span className="text-amber-400">Connecting to {wsUrl}...</span>
              )}
              {mode === 'disconnected' && (
                <span className="text-slate-400">
                  Detached · {activeOps.length} cheat rules armed
                </span>
              )}
            </div>
            {subTab === 'cheats' && (
              <button
                type="button"
                onClick={() => setShowSetupGuide((v) => !v)}
                aria-expanded={showSetupGuide}
                className="px-2.5 py-1 rounded border border-slate-700 bg-slate-950 hover:bg-slate-800 text-xs text-sky-300 font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {showSetupGuide ? 'Hide Setup Guide' : 'Beginner Setup Guide'}
                {showSetupGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-5">
            <label htmlFor="bridge-ws-url" className="block text-xs font-medium text-slate-400 mb-1">
              Local Companion Bridge Endpoint (WebSocket)
            </label>
            <input
              id="bridge-ws-url"
              type="text"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono text-slate-100"
            />
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="trainer-tick-rate" className="block text-xs font-medium text-slate-400 mb-1">
              Freeze Tick
            </label>
            <select
              id="trainer-tick-rate"
              value={config.tickRateMs}
              onChange={(e) =>
                updateConfig('tickRateMs', Number(e.target.value) as LiveTrainerConfig['tickRateMs'])
              }
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
            >
              <option value={100}>100 ms</option>
              <option value={250}>250 ms</option>
              <option value={500}>500 ms</option>
              <option value={1000}>1000 ms</option>
            </select>
          </div>

          <div className="lg:col-span-5 flex flex-wrap items-center gap-2">
            {mode === 'live-bridge' ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3 py-1.5 rounded border border-rose-700 bg-rose-950/60 hover:bg-rose-950 text-rose-200 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Unplug className="w-3.5 h-3.5" />
                Detach FFX.exe
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnectBridge}
                className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plug className="w-3.5 h-3.5 text-sky-400" />
                Connect FFX.exe Bridge
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadBridge}
              className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              Download Bridge (.ps1)
            </button>

            <button
              type="button"
              onClick={handleCopyCommand}
              className="px-3 py-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCmd ? 'Copied Cmd' : 'Copy Run Cmd'}
            </button>
          </div>
        </div>

        {bridgeStatusMsg && (
          <div className="text-xs text-sky-300 pt-1">{bridgeStatusMsg}</div>
        )}
        {bridgeError && (
          <div role="alert" className="text-xs text-amber-300 pt-1">
            {bridgeError}
          </div>
        )}

        {/* Beginner Step-by-Step Setup Guide */}
        {subTab === 'cheats' && showSetupGuide && (
          <div className="border-t border-slate-800 pt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-semibold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-sky-400" />
                  First-Time Setup Guide (Windows Steam · No Prior Experience Needed)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Browsers block web pages from reading Windows game memory directly for security. The tiny companion file runs locally on your own PC (<code className="font-mono text-slate-300">127.0.0.1</code> only, zero internet traffic) using built-in Windows PowerShell—no extra installs needed.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded p-3.5 space-y-1.5">
                <div className="text-xs font-semibold text-sky-400">Step 1 · Open the Game</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Launch <strong className="text-slate-100">FINAL FANTASY X</strong> on Steam (<code className="font-mono text-slate-200">FFX.exe</code>) and load to the title screen or your save.
                </p>
                <p className="text-[11px] text-slate-400">
                  Tip: Use <em>Borderless Windowed</em> display mode so Alt+Tab back to this browser stays instant.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded p-3.5 space-y-1.5">
                <div className="text-xs font-semibold text-sky-400">Step 2 · Save the Bridge</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click <strong className="text-slate-100">Download Bridge (.ps1)</strong> above and save <code className="font-mono text-slate-200">spira-hook-bridge.ps1</code> into your default <strong className="text-slate-100">Downloads</strong> folder.
                </p>
                <p className="text-[11px] text-slate-400">
                  Do <em>not</em> double-click the file—Windows blocks double-clicking unsigned <code className="font-mono">.ps1</code> files by default.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded p-3.5 space-y-2">
                <div className="text-xs font-semibold text-sky-400">Step 3 · Run in PowerShell</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Press the <strong className="text-slate-100">Windows Key</strong>, type <code className="font-mono text-slate-200">PowerShell</code>, right-click <strong className="text-slate-100">Windows PowerShell</strong>, choose <strong className="text-slate-100">Run as Administrator</strong>, then paste &amp; press <strong className="text-slate-100">Enter</strong>:
                </p>
                <div className="bg-slate-900 border border-slate-800 rounded p-2 flex items-center justify-between gap-2">
                  <code className="text-[11px] font-mono text-sky-300 whitespace-nowrap overflow-x-auto select-all py-0.5">
                    {launchCmd}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyCommand}
                    className="px-2 py-1 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {copiedCmd ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded p-3.5 space-y-1.5">
                <div className="text-xs font-semibold text-sky-400">Step 4 · Connect &amp; Play</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Wait ~2 seconds until PowerShell prints <code className="font-mono text-emerald-300">Ready! Listening on ws://127.0.0.1:28420/</code>. <strong className="text-slate-100">Leave that window open</strong>, return here, and click <strong className="text-slate-100">Connect FFX.exe Bridge</strong>.
                </p>
                <p className="text-[11px] text-slate-400">
                  No game open right now? Click <strong className="text-slate-200">Start Sandbox Loop</strong> at top-right to test live locks on your loaded save buffer.
                </p>
              </div>
            </div>

            {/* Common First-Time Troubleshooting */}
            <div className="bg-slate-950/50 border border-slate-800 rounded p-3.5 space-y-2">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                Quick Troubleshooting
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-400 leading-relaxed">
                <div>
                  <span className="text-slate-200 font-medium">&ldquo;Scripts disabled on this system&rdquo;:</span> Make sure you pasted the full command starting with <code className="font-mono text-slate-300">powershell -ExecutionPolicy Bypass -File ...</code> rather than double-clicking the script.
                </div>
                <div>
                  <span className="text-slate-200 font-medium">&ldquo;FFX.exe not found&rdquo; / Access Denied:</span> Start FFX before toggling cheats, and verify the PowerShell title bar says <strong className="text-slate-200">Administrator: Windows PowerShell</strong>.
                </div>
                <div>
                  <span className="text-slate-200 font-medium">Saved outside Downloads folder?</span> Replace <code className="font-mono text-slate-300">$HOME\Downloads\spira-hook-bridge.ps1</code> in the command with the path where you saved the file.
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {subTab === 'battle' && (
        <LiveBattleEditor
          isBridgeConnected={mode === 'live-bridge'}
          inLiveBattle={telemetry.inBattle}
          battleState={activeBattleState}
          onStartSimulatedBattle={() => {
            setSimBattle(createSimulatedBattle(core));
            setBridgeStatusMsg('Simulated active battle encounter started.');
          }}
          onEndSimulatedBattle={() => {
            setSimBattle(null);
            setBridgeStatusMsg('Ended simulated battle encounter.');
          }}
          onEditEntity={handleEditBattleEntity}
          onBatchAction={handleBattleBatchAction}
          statusMessage={bridgeStatusMsg}
        />
      )}

      {subTab === 'equipment' && (
        <LiveEquipmentPanel
          isBridgeConnected={mode === 'live-bridge'}
          equipCore={effectiveEquipCore}
          onRefreshFromBridge={() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'request_equipment' }));
              setBridgeStatusMsg('Requested live equipment snapshot from FFX.exe.');
            }
          }}
          onWriteSlot={handleWriteLiveEquipmentSlot}
          onEquipCharacter={handleEquipLiveCharacter}
          onUnequipCharacter={handleUnequipLiveCharacter}
          statusMessage={bridgeStatusMsg}
        />
      )}

      {/* Live Trainer Cheats Grid */}
      {subTab === 'cheats' && (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Column 1: Economy, Vitals & Limit Break, Combat */}
        <div className="space-y-6">
          {/* Party Vitals & Limit Break */}
          <section className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-400" />
              Party Vitals &amp; Limit Break Locks
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  key: 'infiniteHp' as const,
                  label: 'Infinite HP (Party Invincible)',
                  hint: 'FFX_DebugFlags +0x01 · Locks HP at Max',
                },
                {
                  key: 'infiniteMp' as const,
                  label: 'Infinite MP',
                  hint: 'FFX_DebugFlags +0x09 · Zero spell MP cost',
                },
                {
                  key: 'infiniteOverdrive' as const,
                  label: 'Infinite Limit Break (Overdrive)',
                  hint: 'FFX_DebugFlags +0x14 · Full gauge every turn',
                },
                {
                  key: 'maxSphereLevels' as const,
                  label: 'Lock Sphere Levels = 99',
                  hint: 'FFX_PartyStatBase +0x37 · Unlimited moves',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-2.5 bg-slate-950/60 border border-slate-800 rounded px-3 py-2.5 cursor-pointer select-none hover:border-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={config[item.key]}
                    onChange={(e) => updateConfig(item.key, e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-950 accent-sky-500 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-100">{item.label}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{item.hint}</div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Economy & Combat Overrides */}
          <section className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Swords className="w-4 h-4 text-sky-400" />
              Economy &amp; Combat Modifiers
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-end gap-3 pb-3 border-b border-slate-800">
              <label className="flex items-center gap-2.5 text-sm font-medium text-slate-100 cursor-pointer select-none sm:pb-1.5">
                <input
                  type="checkbox"
                  checked={config.freezeGil}
                  onChange={(e) => updateConfig('freezeGil', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-sky-500"
                />
                <span>Freeze / Infinite Gil</span>
              </label>

              <div className="flex-1">
                <label htmlFor="trainer-target-gil" className="block text-xs font-medium text-slate-400 mb-1">
                  Target Gil Value
                </label>
                <input
                  id="trainer-target-gil"
                  type="number"
                  min={0}
                  max={999999999}
                  value={config.targetGil}
                  onChange={(e) =>
                    updateConfig(
                      'targetGil',
                      Math.max(0, Math.min(999999999, Number(e.target.value) || 0))
                    )
                  }
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(
                [
                  ['alwaysDeal99999', 'Always Deal 99,999 Damage'],
                  ['alwaysCritical', 'Always Critical Hits'],
                  ['enemyAlways1Hp', 'Enemies Always 1 HP'],
                  ['ap100x', '100x AP Gain After Battle'],
                  ['gil100x', '100x Gil After Battle'],
                  ['alwaysRareDrop', 'Always Rare Steal & Drop'],
                  ['permanentSensor', 'Permanent Sensor Scan'],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2.5 text-sm text-slate-200 bg-slate-950/60 border border-slate-800 rounded px-3 py-2 cursor-pointer select-none hover:border-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={config[key]}
                    onChange={(e) => updateConfig(key, e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-sky-500 shrink-0"
                  />
                  <span className="truncate">{label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Column 2: Blitzball Halftime/Match EXP + Live Telemetry + Sandbox Stress Controls */}
        <div className="space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-sky-400" />
              Blitzball Halftime &amp; Full-Game EXP Hook
            </h3>

            <div className="space-y-3">
              <label className="flex items-start gap-2.5 bg-slate-950/60 border border-slate-800 rounded px-3 py-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.maxBlitzballExp}
                  onChange={(e) => updateConfig('maxBlitzballExp', e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-950 accent-sky-500 shrink-0"
                />
                <div>
                  <div className="text-sm font-medium text-slate-100">
                    Max Blitzball EXP at Halftime / Full Game
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Continuously locks player EXP &amp; Level in <code className="font-mono">FFX_BlitzballData</code> so halftime &amp; match-end summaries trigger max level progression.
                  </div>
                </div>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="blitz-target-exp" className="block text-xs font-medium text-slate-400 mb-1">
                    Target Player EXP (0–65,535)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="blitz-target-exp"
                      type="number"
                      min={0}
                      max={65535}
                      value={config.targetBlitzExp}
                      onChange={(e) =>
                        updateConfig(
                          'targetBlitzExp',
                          Math.max(0, Math.min(65535, Number(e.target.value) || 0))
                        )
                      }
                      className="flex-1 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => updateConfig('targetBlitzExp', 65535)}
                      className="px-2.5 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-sky-300 cursor-pointer"
                    >
                      Max
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="blitz-target-lvl" className="block text-xs font-medium text-slate-400 mb-1">
                    Target Player Level (1–99)
                  </label>
                  <input
                    id="blitz-target-lvl"
                    type="number"
                    min={1}
                    max={99}
                    value={config.targetBlitzLevel}
                    onChange={(e) =>
                      updateConfig(
                        'targetBlitzLevel',
                        Math.max(1, Math.min(99, Number(e.target.value) || 1))
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.blitzAurochsOnly}
                    onChange={(e) => updateConfig('blitzAurochsOnly', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-sky-500"
                  />
                  <span>Besaid Aurochs Roster Only</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.blitzInfiniteStamina}
                    onChange={(e) => updateConfig('blitzInfiniteStamina', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-sky-500"
                  />
                  <span>Freeze Match HP / Stamina</span>
                </label>
              </div>
            </div>
          </section>

          {/* Live Readout + Sandbox Verification Events */}
          <section className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-sky-400" />
                Live Process / Core Telemetry
              </h3>
              <span className="text-xs font-mono tabular-nums text-slate-300">
                Gil: <strong className="text-sky-300">{telemetry.gil.toLocaleString()}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="text-left font-medium py-1.5 pr-2">Unit</th>
                    <th className="text-right font-medium py-1.5 px-2">HP</th>
                    <th className="text-right font-medium py-1.5 px-2">MP</th>
                    <th className="text-right font-medium py-1.5 px-2">Overdrive</th>
                    <th className="text-right font-medium py-1.5 pl-2">S.Lv</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 font-mono tabular-nums">
                  {telemetry.party.slice(0, 4).map((u) => (
                    <tr key={u.index}>
                      <td className="py-1.5 pr-2 font-sans text-slate-200 font-medium">
                        {u.name}
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-100">
                        {u.hp.toLocaleString()} / {u.maxHp.toLocaleString()}
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-300">
                        {u.mp.toLocaleString()} / {u.maxMp.toLocaleString()}
                      </td>
                      <td className="py-1.5 px-2 text-right text-sky-300">
                        {u.overdrive} / {u.overdriveMax}
                      </td>
                      <td className="py-1.5 pl-2 text-right text-slate-300">{u.sphereLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs font-medium text-slate-400 mb-2">
                Blitzball Roster Watch (Aurochs)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono tabular-nums text-xs">
                {telemetry.blitzball.slice(0, 6).map((b) => (
                  <div
                    key={b.index}
                    className="bg-slate-950/60 border border-slate-800 rounded px-2.5 py-1.5 flex items-center justify-between gap-2"
                  >
                    <span className="font-sans text-slate-200 truncate">{b.name}</span>
                    <span className="text-sky-300">
                      Lv.{b.level} · {b.exp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="text-xs font-medium text-slate-400">
                Sandbox Loop Verification (Simulate Game Events)
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    let msg = '';
                    onUpdateCore((d) => {
                      msg = simulateActiveGameDrainEvent(d, 'combat-damage');
                    });
                    setBridgeStatusMsg(msg);
                  }}
                  className="px-2.5 py-1 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Simulate Combat Hit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    let msg = '';
                    onUpdateCore((d) => {
                      msg = simulateActiveGameDrainEvent(d, 'spend-gil');
                    });
                    setBridgeStatusMsg(msg);
                  }}
                  className="px-2.5 py-1 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Simulate Shop Spend (-10k Gil)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    let msg = '';
                    onUpdateCore((d) => {
                      msg = simulateActiveGameDrainEvent(d, 'blitz-halftime');
                    });
                    setBridgeStatusMsg(msg);
                  }}
                  className="px-2.5 py-1 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Simulate Blitzball Halftime
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
      )}

      {/* Collapsible Verified Memory Hook & AOB Table */}
      <section className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              FFX.exe Verified AOB Signatures &amp; Active Write Queue ({activeOps.length} armed)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowHookTable((v) => !v)}
            className="px-3 py-1 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium whitespace-nowrap shrink-0 cursor-pointer"
          >
            {showHookTable ? 'Hide Signature Map' : 'Inspect AOB Signatures'}
          </button>
        </div>

        {showHookTable && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400">
                  <th className="text-left font-medium px-4 py-2">Symbol</th>
                  <th className="text-left font-medium px-4 py-2">Static Base</th>
                  <th className="text-left font-medium px-4 py-2">AOB Signature</th>
                  <th className="text-left font-medium px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {FFX_LIVE_HOOKS.map((hook) => (
                  <tr key={hook.id}>
                    <td className="px-4 py-2 font-mono text-sky-300 whitespace-nowrap">
                      {hook.symbol}
                    </td>
                    <td className="px-4 py-2 font-mono tabular-nums text-slate-200 whitespace-nowrap">
                      {hook.staticOffsetHex}
                    </td>
                    <td className="px-4 py-2 font-mono text-slate-400 max-w-xs truncate">
                      {hook.aobPattern}
                    </td>
                    <td className="px-4 py-2 text-slate-300">{hook.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
