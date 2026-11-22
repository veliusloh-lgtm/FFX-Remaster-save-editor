import React, { useMemo, useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import {
  MONSTER_ARENA_BASE,
  captureAllMonsterArena,
  readU8,
  writeU8,
} from '../ffx/saveCodec';
import { MONSTER_ARENA_AREAS } from '../ffx/tables';

interface MonsterArenaPanelProps {
  core: Uint8Array;
  onUpdateCore: (mutator: (draft: Uint8Array) => void) => void;
}

export const MonsterArenaPanel: React.FC<MonsterArenaPanelProps> = ({ core, onUpdateCore }) => {
  const [selectedArea, setSelectedArea] = useState(0);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const area = MONSTER_ARENA_AREAS[selectedArea] ?? MONSTER_ARENA_AREAS[0];

  const totalCapturedFiends = useMemo(() => {
    let sum = 0;
    for (let i = 0; i <= 103; i++) {
      sum += readU8(core, MONSTER_ARENA_BASE + i);
    }
    return sum;
  }, [core]);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    const matches: { areaName: string; index: number; name: string }[] = [];
    for (const ar of MONSTER_ARENA_AREAS) {
      for (const m of ar.monsters) {
        if (m.name.toLowerCase().includes(q) || ar.name.toLowerCase().includes(q)) {
          matches.push({ areaName: ar.name, index: m.index, name: m.name });
        }
      }
    }
    return matches;
  }, [search]);

  const renderMonsterRow = (m: { index: number; name: string; areaName?: string }) => {
    const val = readU8(core, MONSTER_ARENA_BASE + m.index);
    const isCreation = m.index >= 104;

    if (isCreation) {
      const unlocked = val > 0;
      return (
        <div
          key={`${m.index}-${m.name}`}
          className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded"
        >
          <div>
            <div className="text-sm font-medium text-slate-100">{m.name}</div>
            <div className="text-xs text-slate-400 font-mono">
              {m.areaName ? `${m.areaName} · ` : ''}Creation Index #{m.index}
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={unlocked}
              onChange={(e) =>
                onUpdateCore((d) => writeU8(d, MONSTER_ARENA_BASE + m.index, e.target.checked ? 1 : 0))
              }
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-sky-500"
            />
            <span>{unlocked ? 'Unlocked' : 'Locked'}</span>
          </label>
        </div>
      );
    }

    return (
      <div
        key={`${m.index}-${m.name}`}
        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded"
      >
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-100 truncate">{m.name}</div>
          <div className="text-xs text-slate-400 font-mono">
            {m.areaName ? `${m.areaName} · ` : ''}Fiend #{m.index}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            aria-label={`Decrease ${m.name} count`}
            onClick={() =>
              onUpdateCore((d) =>
                writeU8(d, MONSTER_ARENA_BASE + m.index, Math.max(0, val - 1))
              )
            }
            className="w-7 h-7 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold cursor-pointer"
          >
            -
          </button>
          <input
            aria-label={`${m.name} Captured`}
            type="number"
            min={0}
            max={10}
            value={val}
            onChange={(e) => {
              const clamped = Math.max(0, Math.min(10, Number(e.target.value) || 0));
              onUpdateCore((d) => writeU8(d, MONSTER_ARENA_BASE + m.index, clamped));
            }}
            className="w-16 bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 text-sm font-mono tabular-nums text-center text-slate-100"
          />
          <button
            type="button"
            aria-label={`Increase ${m.name} count`}
            onClick={() =>
              onUpdateCore((d) =>
                writeU8(d, MONSTER_ARENA_BASE + m.index, Math.min(10, val + 1))
              )
            }
            className="w-7 h-7 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold cursor-pointer"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => onUpdateCore((d) => writeU8(d, MONSTER_ARENA_BASE + m.index, 10))}
            className="px-2 py-1 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-mono cursor-pointer"
          >
            Max 10
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">
            Monster Arena ({totalCapturedFiends} / 1,040 Captures)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Set capture counts (0–10) across all 13 Spira regions and toggle Area, Species, and Original Arena creations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onUpdateCore((d) => captureAllMonsterArena(d, 10));
              setNotice('Captured 10/10 of every fiend across all 13 regions.');
            }}
            className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Capture All Fiends (10/10)
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdateCore((d) => {
                for (let idx = 104; idx <= 138; idx++) {
                  writeU8(d, MONSTER_ARENA_BASE + idx, 1);
                }
              });
              setNotice('Unlocked all Area, Species & Original Arena creations.');
            }}
            className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Unlock All Creations
          </button>
        </div>
      </div>

      {notice && <div className="text-xs font-medium text-sky-400">{notice}</div>}

      <div>
        <label htmlFor="arena-search" className="sr-only">
          Search Monster Arena Fiends
        </label>
        <input
          id="arena-search"
          type="text"
          placeholder="Search any fiend, area, or creation (e.g. Tonberry, One-Eye, Nemesis)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-2 text-sm text-slate-100"
        />
      </div>

      {searchResults ? (
        <div className="bg-slate-900 border border-slate-800 rounded-md p-4 space-y-2">
          <div className="text-xs text-slate-400 mb-2">
            Search matches ({searchResults.length})
          </div>
          {searchResults.length === 0 ? (
            <div className="text-sm text-slate-400 py-6 text-center">No monsters match your search.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {searchResults.map((m) => renderMonsterRow(m))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-md p-2 space-y-1 max-h-[580px] overflow-y-auto">
            {MONSTER_ARENA_AREAS.map((ar, idx) => {
              const active = idx === selectedArea;
              const isCreations = ar.monsters.some((m) => m.index >= 104);
              const total = ar.monsters.reduce(
                (acc, m) => acc + readU8(core, MONSTER_ARENA_BASE + m.index),
                0
              );
              const max = isCreations ? ar.monsters.length : ar.monsters.length * 10;
              return (
                <button
                  key={ar.name}
                  type="button"
                  onClick={() => setSelectedArea(idx)}
                  className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between gap-2 cursor-pointer ${
                    active
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40'
                      : 'text-slate-200 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <span className="truncate font-medium">{ar.name}</span>
                  <span className="text-xs font-mono tabular-nums text-slate-400">
                    {total}/{max}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-100">{area.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {area.monsters.length} entries in this category
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onUpdateCore((d) => {
                    for (const m of area.monsters) {
                      writeU8(d, MONSTER_ARENA_BASE + m.index, m.index >= 104 ? 1 : 10);
                    }
                  });
                  setNotice(`Maxed all entries in ${area.name}.`);
                }}
                className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                Max {area.name}
              </button>
            </div>

            <div className="space-y-2.5">
              {area.monsters.map((m) => renderMonsterRow(m))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
