import React, { useState } from 'react';
import { Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  getBit,
  readU16,
  readU8,
  setBit,
  unlockAllLightningPrizes,
  writeU16,
  writeU8,
} from '../ffx/saveCodec';

interface MinigamesPanelProps {
  core: Uint8Array;
  onUpdateCore: (mutator: (draft: Uint8Array) => void) => void;
}

const CHOCOBO_TRIALS = [
  {
    id: 'wobbly',
    name: 'Wobbly Chocobo Complete',
    flagOffset: 699,
    flagBit: 1,
    minOffset: 724,
    secOffset: 725,
    csOffset: 726,
  },
  {
    id: 'dodger',
    name: 'Dodger Chocobo Complete',
    flagOffset: 699,
    flagBit: 3,
    minOffset: 727,
    secOffset: 728,
    csOffset: 729,
  },
  {
    id: 'hyper',
    name: 'Hyper Dodger Chocobo Complete',
    flagOffset: 699,
    flagBit: 4,
    minOffset: 730,
    secOffset: 731,
    csOffset: 732,
  },
  {
    id: 'catcher',
    name: 'Catcher Chocobo Complete (Sun Sigil)',
    flagOffset: 699,
    flagBit: 5,
    extraOffset: 698,
    extraBit: 4,
    minOffset: 733,
    secOffset: 734,
    csOffset: 735,
  },
];

const CACTUAR_STATUS_OPTIONS = [
  { id: 0, name: 'Not Started' },
  { id: 1, name: 'Mission 1: Tomay' },
  { id: 2, name: 'Mission 1 Complete' },
  { id: 3, name: 'Mission 2: Rovivea' },
  { id: 4, name: 'Mission 2 Complete' },
  { id: 5, name: 'Mission 3: Chava' },
  { id: 6, name: 'Mission 3 Complete' },
  { id: 7, name: 'Mission 4: Alek & Aloja' },
  { id: 8, name: 'Mission 4 Complete' },
  { id: 9, name: 'Mission 5: Vachella' },
  { id: 10, name: 'Mission 5 Complete' },
  { id: 11, name: 'Mission 6: Robeya' },
  { id: 12, name: 'Mission 6 Complete' },
  { id: 13, name: 'Mission 7: Isrra' },
  { id: 14, name: 'Mission 7 Complete' },
  { id: 15, name: 'Mission 8: Elio' },
  { id: 25, name: 'Mission 8: Elio on Airship' },
  { id: 16, name: 'Mission 8 Complete' },
  { id: 17, name: 'Mission 9 (Flaile) Complete' },
  { id: 18, name: 'Cactuar Village Unlocked' },
];

const ANIMA_CHESTS = [
  { name: 'Besaid Cloister Chest Opened', accessors: [{ offset: 3228, bit: 0 }] },
  {
    name: 'Kilika Cloister Chest Opened',
    accessors: [
      { offset: 3228, bit: 1 },
      { offset: 760, bit: 5 },
    ],
  },
  {
    name: 'Djose Cloister Chest Opened',
    accessors: [
      { offset: 3228, bit: 2 },
      { offset: 1215, bit: 0 },
    ],
  },
  {
    name: 'Macalania Cloister Chest Opened',
    accessors: [
      { offset: 3228, bit: 3 },
      { offset: 1216, bit: 0 },
    ],
  },
  { name: 'Bevelle Cloister Chest Opened', accessors: [{ offset: 3228, bit: 4 }] },
  { name: 'Zanarkand Cloister Chest Opened', accessors: [{ offset: 3228, bit: 5 }] },
  { name: 'Baaj Temple Seal Broken (Anima Unlocked)', accessors: [{ offset: 3228, bit: 6 }] },
];

export const MinigamesPanel: React.FC<MinigamesPanelProps> = ({ core, onUpdateCore }) => {
  const [notice, setNotice] = useState<string | null>(null);

  const lightningStruck = readU16(core, 1084);
  const lightningDodges = readU16(core, 1086);
  const lightningConsecutive = readU16(core, 1088);
  const cactuarStatus = readU8(core, 3267);
  const cactuarSuccess = readU8(core, 3269);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">
            Minigames &amp; Sidequests
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Thunder Plains Lightning Dodging, Calm Lands Chocobo Training, Bikanel Cactuar Village, and Baaj Temple Anima Cloister Seals.
          </p>
        </div>
        {notice && <div className="text-xs font-medium text-sky-400">{notice}</div>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Lightning Bolt Dodging */}
        <section className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Thunder Plains — Lightning Bolt Dodging
            </h3>
            <button
              type="button"
              onClick={() => {
                onUpdateCore((d) => {
                  writeU16(d, 1086, Math.max(200, readU16(d, 1086)));
                  writeU16(d, 1088, Math.max(200, readU16(d, 1088)));
                  unlockAllLightningPrizes(d);
                });
                setNotice('Unlocked all Rin Travel Agency Lightning Dodge chest prizes.');
              }}
              className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Get All Dodge Prizes
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="lg-struck" className="block text-xs font-medium text-slate-400 mb-1">
                Total Struck Towards
              </label>
              <input
                id="lg-struck"
                type="number"
                min={0}
                max={65535}
                value={lightningStruck}
                onChange={(e) =>
                  onUpdateCore((d) => writeU16(d, 1084, Number(e.target.value) || 0))
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="lg-total" className="block text-xs font-medium text-slate-400 mb-1">
                Total Dodges
              </label>
              <input
                id="lg-total"
                type="number"
                min={0}
                max={65535}
                value={lightningDodges}
                onChange={(e) =>
                  onUpdateCore((d) => writeU16(d, 1086, Number(e.target.value) || 0))
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="lg-consec" className="block text-xs font-medium text-slate-400 mb-1">
                Consecutive Dodges
              </label>
              <input
                id="lg-consec"
                type="number"
                min={0}
                max={65535}
                value={lightningConsecutive}
                onChange={(e) =>
                  onUpdateCore((d) => writeU16(d, 1088, Number(e.target.value) || 0))
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
              />
            </div>
          </div>
        </section>

        {/* Cactuar Village Sidequest */}
        <section className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Bikanel — Cactuar Village Sidequest
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cactuar-status" className="block text-xs font-medium text-slate-400 mb-1">
                Quest Progression Status
              </label>
              <select
                id="cactuar-status"
                value={cactuarStatus}
                onChange={(e) => onUpdateCore((d) => writeU8(d, 3267, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
              >
                {CACTUAR_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cactuar-wins" className="block text-xs font-medium text-slate-400 mb-1">
                Successful Missions (0–10)
              </label>
              <input
                id="cactuar-wins"
                type="number"
                min={0}
                max={10}
                value={cactuarSuccess}
                onChange={(e) =>
                  onUpdateCore((d) =>
                    writeU8(d, 3269, Math.max(0, Math.min(10, Number(e.target.value) || 0)))
                  )
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
              />
            </div>
          </div>
        </section>

        {/* Chocobo Training */}
        <section className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Calm Lands — Chocobo Training Trials
            </h3>
            <button
              type="button"
              onClick={() => {
                onUpdateCore((d) => {
                  for (const tr of CHOCOBO_TRIALS) {
                    setBit(d, tr.flagOffset, tr.flagBit, true);
                    if (tr.extraOffset !== undefined && tr.extraBit !== undefined) {
                      setBit(d, tr.extraOffset, tr.extraBit, true);
                    }
                    writeU8(d, tr.minOffset, 0);
                    writeU8(d, tr.secOffset, 0);
                    writeU8(d, tr.csOffset, 0);
                  }
                });
                setNotice('Completed all 4 Chocobo Training trials with 0:00.00 record.');
              }}
              className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Complete All 4 Trials
            </button>
          </div>

          <div className="space-y-3">
            {CHOCOBO_TRIALS.map((tr) => {
              const checked =
                getBit(core, tr.flagOffset, tr.flagBit) &&
                (tr.extraOffset === undefined ||
                  tr.extraBit === undefined ||
                  getBit(core, tr.extraOffset, tr.extraBit));
              const mm = readU8(core, tr.minOffset);
              const ss = readU8(core, tr.secOffset);
              const cs = readU8(core, tr.csOffset);
              return (
                <div
                  key={tr.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/60 border border-slate-800 rounded px-3 py-2.5"
                >
                  <label className="flex items-center gap-2.5 text-sm text-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        onUpdateCore((d) => {
                          setBit(d, tr.flagOffset, tr.flagBit, e.target.checked);
                          if (tr.extraOffset !== undefined && tr.extraBit !== undefined) {
                            setBit(d, tr.extraOffset, tr.extraBit, e.target.checked);
                          }
                        })
                      }
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-sky-500"
                    />
                    <span>{tr.name}</span>
                  </label>

                  <div className="flex items-center gap-1 font-mono text-xs tabular-nums">
                    <span className="text-slate-400 mr-1">Best:</span>
                    <input
                      aria-label={`${tr.name} Minutes`}
                      type="number"
                      min={0}
                      max={99}
                      value={mm}
                      onChange={(e) =>
                        onUpdateCore((d) => writeU8(d, tr.minOffset, Number(e.target.value) || 0))
                      }
                      className="w-12 bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-center text-slate-100"
                    />
                    <span className="text-slate-500">:</span>
                    <input
                      aria-label={`${tr.name} Seconds`}
                      type="number"
                      min={0}
                      max={59}
                      value={ss}
                      onChange={(e) =>
                        onUpdateCore((d) => writeU8(d, tr.secOffset, Number(e.target.value) || 0))
                      }
                      className="w-12 bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-center text-slate-100"
                    />
                    <span className="text-slate-500">.</span>
                    <input
                      aria-label={`${tr.name} Centiseconds`}
                      type="number"
                      min={0}
                      max={99}
                      value={cs}
                      onChange={(e) =>
                        onUpdateCore((d) => writeU8(d, tr.csOffset, Number(e.target.value) || 0))
                      }
                      className="w-12 bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-center text-slate-100"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Anima Sidequest */}
        <section className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Baaj Temple — Anima Cloister Destruction Spheres
            </h3>
            <button
              type="button"
              onClick={() => {
                onUpdateCore((d) => {
                  for (const chest of ANIMA_CHESTS) {
                    for (const acc of chest.accessors) {
                      setBit(d, acc.offset, acc.bit, true);
                    }
                  }
                });
                setNotice('Opened all 6 Cloister Destruction chests & broke Baaj Temple seal.');
              }}
              className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Unlock All Anima Seals
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ANIMA_CHESTS.map((chest) => {
              const checked = chest.accessors.every((acc) => getBit(core, acc.offset, acc.bit));
              return (
                <label
                  key={chest.name}
                  className="flex items-center gap-2.5 text-sm text-slate-200 bg-slate-950/60 border border-slate-800 rounded px-3 py-2 cursor-pointer select-none hover:border-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      onUpdateCore((d) => {
                        for (const acc of chest.accessors) {
                          setBit(d, acc.offset, acc.bit, e.target.checked);
                        }
                      })
                    }
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-sky-500 shrink-0"
                  />
                  <span className="truncate">{chest.name}</span>
                </label>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
