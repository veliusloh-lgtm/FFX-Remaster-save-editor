import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Compass,
  Film,
  Sparkles,
  ShieldAlert,
  Tag,
} from 'lucide-react';
import {
  ChecksumStatus,
  DEFAULT_EDITED_SLOT,
  SaveFormat,
  applyEditedSaveMarker,
  formatSaveSlotFileName,
  getBit,
  inspectEditedSaveMarker,
  readU16,
  readU32,
  readU8,
  resetOmegaRuinsTreasures,
  setBit,
  syncHeaderPartyAndTime,
  unlockAllAirshipDestinations,
  unlockAllLucaTheaterSpheres,
  writeU16,
  writeU32,
  writeU8,
} from '../ffx/saveCodec';
import { CHARACTER_NAMES_DEFAULT } from '../ffx/tables';

interface OverviewWorldPanelProps {
  core: Uint8Array;
  format: SaveFormat;
  fileName: string;
  checksumStatus: ChecksumStatus;
  onUpdateCore: (mutator: (draft: Uint8Array) => void) => void;
  onChangeFileName: (fileName: string) => void;
  onRepairChecksum: () => void;
  onChangeExportFormat: (fmt: SaveFormat) => void;
  onExportSave: () => void;
}

interface BossFlagSpec {
  id: string;
  label: string;
  offset: number;
  bit: number;
  inverted?: boolean; // true means "checked when bit is false"
  extraOffset?: number;
  extraBit?: number;
}

const BOSS_FLAGS: BossFlagSpec[] = [
  { id: 'ochu', label: 'Lord Ochu Defeated', offset: 1004, bit: 2 },
  { id: 'belgemine', label: 'Belgemine Sent', offset: 832, bit: 3 },
  { id: 'geosgaeno', label: 'Geosgaeno Defeated', offset: 954, bit: 0 },
  { id: 'ultima', label: 'Ultima Weapon Defeated', offset: 1022, bit: 1 },
  { id: 'omega', label: 'Omega Weapon Defeated', offset: 1022, bit: 2 },
  {
    id: 'nemesis',
    label: 'Nemesis Disabled',
    offset: 17076,
    bit: 0,
    inverted: true,
    extraOffset: 720,
    extraBit: 7,
  },
  { id: 'dark-valefor', label: 'Dark Valefor Defeated', offset: 3273, bit: 7 },
  { id: 'dark-ifrit', label: 'Dark Ifrit Defeated', offset: 3274, bit: 7 },
  { id: 'dark-ixion', label: 'Dark Ixion Defeated', offset: 3275, bit: 7 },
  { id: 'dark-ixion-2', label: 'Dark Ixion 2 Disabled', offset: 3275, bit: 2, inverted: true },
  { id: 'dark-shiva', label: 'Dark Shiva Defeated', offset: 3276, bit: 7 },
  { id: 'dark-bahamut', label: 'Dark Bahamut Defeated', offset: 3277, bit: 7 },
  { id: 'dark-anima', label: 'Dark Anima Defeated', offset: 3279, bit: 7 },
  { id: 'dark-yojimbo', label: 'Dark Yojimbo Defeated', offset: 3278, bit: 7 },
  { id: 'dark-magus', label: 'Dark Magus Sisters Defeated', offset: 3280, bit: 7 },
  { id: 'penance', label: 'Penance Disabled', offset: 3266, bit: 3, inverted: true },
];

const DARK_VALEFOR_GLITCH_PATCH = [
  16, 1, 13, 1, 2, 1, 20, 13, 20, 1, 1, 3, 19, 6, 1, 22, 2, 1, 1, 1, 21, 19, 15, 2,
];

function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatHex16(n: number): string {
  return `0x${n.toString(16).toUpperCase().padStart(4, '0')}`;
}

export const OverviewWorldPanel: React.FC<OverviewWorldPanelProps> = ({
  core,
  format,
  fileName,
  checksumStatus,
  onUpdateCore,
  onChangeFileName,
  onRepairChecksum,
  onChangeExportFormat,
  onExportSave,
}) => {
  const [confirmNgPlus, setConfirmNgPlus] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const gil = readU32(core, 15752);
  const playtime = readU32(core, 252);
  const battlesFought = readU32(core, 15700);
  const oakaGil = readU32(core, 3168);
  const tidusOverdriveCount = readU32(core, 15852);
  const yojimboCompat = readU8(core, 15844);
  const yojimboMode = readU8(core, 15848);
  const lucaChar = readU8(core, 887);
  const roomNumber = readU16(core, 250);
  const spawnPoint = readU8(core, 248);
  const storylineProgress = readU16(core, 3116);
  const markerState = inspectEditedSaveMarker(core, fileName);

  const notify = (msg: string) => {
    setActionNotice(msg);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">
            Overview &amp; World State
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Core economy, coordinates, story progress, optional bosses, and binary integrity for{' '}
            <span className="font-mono text-slate-200">{fileName}</span>.
          </p>
        </div>
        {actionNotice && (
          <div className="text-xs font-medium text-sky-400 tabular-nums">
            {actionNotice}
          </div>
        )}
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-md px-4 py-3">
          <div className="text-xs font-medium text-slate-400">Party Gil</div>
          <div className="text-xl font-semibold text-slate-100 font-mono tabular-nums mt-1">
            {gil.toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-md px-4 py-3">
          <div className="text-xs font-medium text-slate-400">Playtime</div>
          <div className="text-xl font-semibold text-slate-100 font-mono tabular-nums mt-1">
            {formatDuration(playtime)}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-md px-4 py-3">
          <div className="text-xs font-medium text-slate-400">Battles Fought</div>
          <div className="text-xl font-semibold text-slate-100 font-mono tabular-nums mt-1">
            {battlesFought.toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-md px-4 py-3">
          <div className="text-xs font-medium text-slate-400">CRC-16-CCITT Checksum</div>
          <div className="flex items-center gap-2 mt-1">
            {checksumStatus.valid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <span className="text-base font-semibold font-mono tabular-nums text-slate-100">
              {formatHex16(checksumStatus.expected)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Editable Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Economy & World Variables */}
        <section className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Economy, Story &amp; Coordinates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="overview-gil" className="block text-xs font-medium text-slate-400 mb-1">
                Gil (Offset 0x3D88)
              </label>
              <input
                id="overview-gil"
                type="number"
                min={0}
                max={999999999}
                value={gil}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(999999999, Number(e.target.value) || 0));
                  onUpdateCore((d) => writeU32(d, 15752, v));
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="overview-playtime" className="block text-xs font-medium text-slate-400 mb-1">
                Playtime Seconds ({formatDuration(playtime)})
              </label>
              <input
                id="overview-playtime"
                type="number"
                min={0}
                max={3599999}
                value={playtime}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(3599999, Number(e.target.value) || 0));
                  onUpdateCore((d) => {
                    writeU32(d, 252, v);
                    syncHeaderPartyAndTime(d);
                  });
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="overview-battles" className="block text-xs font-medium text-slate-400 mb-1">
                Battles Fought
              </label>
              <input
                id="overview-battles"
                type="number"
                min={0}
                max={65535}
                value={battlesFought}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(65535, Number(e.target.value) || 0));
                  onUpdateCore((d) => writeU32(d, 15700, v));
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="overview-oaka" className="block text-xs font-medium text-slate-400 mb-1">
                Gil Donated to O&apos;aka
              </label>
              <input
                id="overview-oaka"
                type="number"
                min={0}
                max={99999999}
                value={oakaGil}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(99999999, Number(e.target.value) || 0));
                  onUpdateCore((d) => writeU32(d, 3168, v));
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="overview-room" className="block text-xs font-medium text-slate-400 mb-1">
                Room Number
              </label>
              <input
                id="overview-room"
                type="number"
                min={0}
                max={65535}
                value={roomNumber}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(65535, Number(e.target.value) || 0));
                  onUpdateCore((d) => writeU16(d, 250, v));
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="overview-spawn" className="block text-xs font-medium text-slate-400 mb-1">
                Spawn Point
              </label>
              <input
                id="overview-spawn"
                type="number"
                min={0}
                max={255}
                value={spawnPoint}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(255, Number(e.target.value) || 0));
                  onUpdateCore((d) => writeU8(d, 248, v));
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="overview-story" className="block text-xs font-medium text-slate-400 mb-1">
                Storyline Progress
              </label>
              <input
                id="overview-story"
                type="number"
                min={0}
                max={65535}
                value={storylineProgress}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(65535, Number(e.target.value) || 0));
                  onUpdateCore((d) => writeU16(d, 3116, v));
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="overview-tidus-od" className="block text-xs font-medium text-slate-400 mb-1">
                Tidus Overdrive Count
              </label>
              <input
                id="overview-tidus-od"
                type="number"
                min={0}
                max={99999}
                value={tidusOverdriveCount}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(99999, Number(e.target.value) || 0));
                  onUpdateCore((d) => writeU32(d, 15852, v));
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="overview-yojimbo-compat" className="block text-xs font-medium text-slate-400 mb-1">
                Yojimbo Compatibility (0–255)
              </label>
              <input
                id="overview-yojimbo-compat"
                type="number"
                min={0}
                max={255}
                value={yojimboCompat}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(255, Number(e.target.value) || 0));
                  onUpdateCore((d) => writeU8(d, 15844, v));
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="overview-yojimbo-mode" className="block text-xs font-medium text-slate-400 mb-1">
                Yojimbo Compatibility Mode
              </label>
              <select
                id="overview-yojimbo-mode"
                value={yojimboMode}
                onChange={(e) => onUpdateCore((d) => writeU8(d, 15848, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
              >
                <option value={0}>Mode 1 (Defeat Strong Enemies)</option>
                <option value={1}>Mode 2 (Train as Summoner)</option>
                <option value={2}>Mode 3 (Gain Power)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="overview-luca-char" className="block text-xs font-medium text-slate-400 mb-1">
                Overworld Character (Luca)
              </label>
              <select
                id="overview-luca-char"
                value={lucaChar}
                onChange={(e) => onUpdateCore((d) => writeU8(d, 887, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
              >
                {CHARACTER_NAMES_DEFAULT.slice(0, 7).map((name, idx) => (
                  <option key={name} value={idx}>
                    {name} (ID {idx})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { label: 'Rikku Wearing Wetsuit', offset: 273, bit: 0, syncHeader: true },
              { label: 'Wantz in Macalania Forest', offset: 3217, bit: 0 },
              { label: 'Gatta Dies', offset: 3133, bit: 0 },
              { label: "Riding Chocobo on Mi'ihen Highroad", offset: 684, bit: 0 },
            ].map((flag) => {
              const checked = getBit(core, flag.offset, flag.bit);
              return (
                <label
                  key={flag.label}
                  className="flex items-center gap-2.5 text-sm text-slate-200 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      onUpdateCore((d) => {
                        setBit(d, flag.offset, flag.bit, e.target.checked);
                        if (flag.syncHeader) syncHeaderPartyAndTime(d);
                      })
                    }
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-sky-500"
                  />
                  <span>{flag.label}</span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Save Integrity, In-Game Marker & Quick World Actions */}
        <section className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Checksum Inspector &amp; Export Format
            </h3>
            <div className="grid grid-cols-3 gap-3 py-2.5 border-y border-slate-800 text-xs font-mono tabular-nums">
              <div>
                <div className="text-slate-400">Stored 0x001A</div>
                <div className="text-slate-100 mt-0.5">{formatHex16(checksumStatus.storedTop)}</div>
              </div>
              <div>
                <div className="text-slate-400">Stored 0x64F4</div>
                <div className="text-slate-100 mt-0.5">{formatHex16(checksumStatus.storedBottom)}</div>
              </div>
              <div>
                <div className="text-slate-400">Computed CRC-16</div>
                <div
                  className={`mt-0.5 font-semibold ${
                    checksumStatus.valid ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {formatHex16(checksumStatus.expected)}
                </div>
              </div>
            </div>

            {/* In-Game Edited Save Identification */}
            <div className="bg-slate-950/70 border border-slate-800 rounded p-3.5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-semibold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-sky-400" />
                  In-Game Edited Save Identifier
                </div>
                <span className="text-[11px] font-mono tabular-nums text-slate-400">
                  Slot {markerState.slotNumber !== null ? `#${markerState.slotNumber}` : fileName} ·{' '}
                  {markerState.heroName} · {formatDuration(markerState.playtimeSeconds)}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Spot your edited save instantly in FFX&apos;s Load Game menu by exporting to a dedicated high slot (<code className="font-mono text-slate-200">ffx_199</code>), tagging Tidus as <code className="font-mono text-slate-200">Tidus [ED]</code>, and stamping seconds to <code className="font-mono text-slate-200">:59</code> without altering your map coordinates.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onChangeFileName(formatSaveSlotFileName(DEFAULT_EDITED_SLOT));
                    onUpdateCore((d) =>
                      applyEditedSaveMarker(d, {
                        tagHeroName: true,
                        stampPlaytimeSeconds: true,
                      })
                    );
                    notify('Marked save for in-game Load menu: Slot 199 (ffx_199), Tidus [ED], :59.');
                  }}
                  className="px-3 py-1.5 rounded border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Mark Save as Edited (Slot 199 + [ED] + :59)
                </button>
                {markerState.heroTagged && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateCore((d) =>
                        applyEditedSaveMarker(d, {
                          tagHeroName: false,
                          stampPlaytimeSeconds: false,
                        })
                      );
                      notify('Removed [ED] hero name tag.');
                    }}
                    className="px-2.5 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Remove [ED] Tag
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="export-format-select" className="block text-xs font-medium text-slate-400 mb-1">
                  Target Save Format
                </label>
                <select
                  id="export-format-select"
                  value={format}
                  onChange={(e) => onChangeExportFormat(e.target.value as SaveFormat)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
                >
                  <option value="pc-steam">PC Steam HD Remaster (26,880 bytes)</option>
                  <option value="switch">Nintendo Switch HD Remaster (26,880 bytes + 8B prefix)</option>
                  <option value="ps-vita">PS Vita HD Remaster (26,872 bytes)</option>
                  <option value="ps2-raw">PlayStation 2 Raw Core (25,848 bytes)</option>
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={onRepairChecksum}
                  className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-medium whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Repair Checksum
                </button>
                <button
                  type="button"
                  onClick={onExportSave}
                  className="px-3.5 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Configure &amp; Export Save
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              World &amp; Preservation Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onUpdateCore(unlockAllAirshipDestinations);
                  notify('Unlocked all extra Airship destinations.');
                }}
                className="px-3 py-2 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-100 text-xs font-medium text-left flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-sky-400 shrink-0" />
                Unlock Extra Airship Destinations
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateCore(unlockAllLucaTheaterSpheres);
                  notify('Unlocked all Luca Theater Music & Movie Spheres.');
                }}
                className="px-3 py-2 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-100 text-xs font-medium text-left flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Film className="w-4 h-4 text-sky-400 shrink-0" />
                Get All Luca Theater Spheres
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateCore(resetOmegaRuinsTreasures);
                  notify('Reset Omega Ruins treasure chests.');
                }}
                className="px-3 py-2 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-100 text-xs font-medium text-left flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                Reset Omega Ruins Treasures
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateCore((d) => {
                    writeU8(d, 766, 0);
                    setBit(d, 765, 0, false);
                    setBit(d, 765, 1, false);
                  });
                  notify('Reset Bikanel Island Sandragoras.');
                }}
                className="px-3 py-2 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-100 text-xs font-medium text-left flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-sky-400 shrink-0" />
                Reset Bikanel Sandragoras
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateCore((d) => {
                    for (let i = 0; i < DARK_VALEFOR_GLITCH_PATCH.length; i++) {
                      writeU8(d, 837 + i, DARK_VALEFOR_GLITCH_PATCH[i]);
                    }
                  });
                  notify('Applied Besaid Dark Valefor state repair.');
                }}
                className="px-3 py-2 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-100 text-xs font-medium text-left flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                Fix Dark Valefor Glitch
              </button>

              {!confirmNgPlus ? (
                <button
                  type="button"
                  onClick={() => setConfirmNgPlus(true)}
                  className="px-3 py-2 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-100 text-xs font-medium text-left flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
                  Enable New Game+ Coordinates
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-slate-950 border border-amber-700/60 rounded px-2.5 py-1.5">
                  <span className="text-xs text-amber-300 flex-1">Reset to intro (Room 132)?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateCore((d) => {
                        writeU16(d, 250, 132);
                        writeU8(d, 248, 0);
                        writeU16(d, 3116, 0);
                      });
                      setConfirmNgPlus(false);
                      notify('Set coordinates to Room 132 / Storyline 0.');
                    }}
                    className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-xs font-semibold cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmNgPlus(false)}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Optional Bosses & Dark Aeons */}
      <section className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Optional Bosses, Dark Aeons &amp; Penance
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Toggle encounter victory or respawn availability flags cleanly without corrupting story bits.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onUpdateCore((d) => {
                for (const b of BOSS_FLAGS) {
                  setBit(d, b.offset, b.bit, b.inverted ? false : false);
                  if (b.extraOffset !== undefined && b.extraBit !== undefined) {
                    setBit(d, b.extraOffset, b.extraBit, false);
                  }
                }
              });
              notify('Re-enabled all Optional Bosses & Dark Aeons.');
            }}
            className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
          >
            Reset All Bosses (Rematch)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {BOSS_FLAGS.map((b) => {
            const rawVal = getBit(core, b.offset, b.bit);
            const checked = b.inverted ? !rawVal : rawVal;
            return (
              <label
                key={b.id}
                className="flex items-center gap-2.5 text-sm text-slate-200 bg-slate-950/60 border border-slate-800/80 rounded px-3 py-2 cursor-pointer select-none hover:border-slate-700"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const targetBit = b.inverted ? !e.target.checked : e.target.checked;
                    onUpdateCore((d) => {
                      setBit(d, b.offset, b.bit, targetBit);
                      if (b.extraOffset !== undefined && b.extraBit !== undefined) {
                        setBit(d, b.extraOffset, b.extraBit, targetBit);
                      }
                    });
                  }}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-sky-500"
                />
                <span className="truncate">{b.label}</span>
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
};
