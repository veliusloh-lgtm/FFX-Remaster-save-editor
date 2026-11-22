import React, { useMemo, useState } from 'react';
import { Sparkles, Unlock, CheckCircle2, Eraser, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  batchActivateSphereGridAll,
  batchActivateSphereGridForChar,
  batchClearSphereGridActivation,
  batchMaxSphereGridStatNodes,
  batchRemoveSphereGridLocks,
  getSphereGridMeta,
  readSphereGridNode,
  readU16,
  writeSphereGridNode,
  writeU16,
} from '../ffx/saveCodec';
import { CHARACTER_NAMES_DEFAULT, SPHERE_GRID_NODE_TYPES } from '../ffx/tables';

interface SphereGridPanelProps {
  core: Uint8Array;
  onUpdateCore: (mutator: (draft: Uint8Array) => void) => void;
}

const PAGE_SIZE = 50;

export const SphereGridPanel: React.FC<SphereGridPanelProps> = ({ core, onUpdateCore }) => {
  const [selectedChar, setSelectedChar] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const meta = useMemo(() => getSphereGridMeta(core), [core]);

  const nodeNameMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const nt of SPHERE_GRID_NODE_TYPES) m.set(nt.id, nt.name);
    return m;
  }, []);

  const nodes = useMemo(
    () => Array.from({ length: meta.nodeCount }, (_, idx) => readSphereGridNode(core, idx)),
    [core, meta.nodeCount]
  );

  const filteredNodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return nodes;
    return nodes.filter((n) => {
      const label = (nodeNameMap.get(n.nodeType) ?? '').toLowerCase();
      return label.includes(q) || String(n.index).includes(q);
    });
  }, [nodes, search, nodeNameMap]);

  const totalPages = Math.max(1, Math.ceil(filteredNodes.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageNodes = filteredNodes.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">
            Sphere Grid ({meta.typeLabel} · {meta.nodeCount} Nodes)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Inspect or transform Sphere Grid nodes, character coordinates, lock spheres, and activation bitmasks.
          </p>
        </div>
        {notice && <div className="text-xs font-medium text-sky-400">{notice}</div>}
      </div>

      {/* Character Positions & Batch Grid Operations */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-5 bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Character Grid Node Positions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-3">
            {CHARACTER_NAMES_DEFAULT.slice(0, 7).map((name, idx) => {
              const pos = readU16(core, 12588 + idx * 2);
              return (
                <div key={name}>
                  <label
                    htmlFor={`sg-pos-${idx}`}
                    className="block text-xs font-medium text-slate-400 mb-1"
                  >
                    {name}
                  </label>
                  <input
                    id={`sg-pos-${idx}`}
                    type="number"
                    min={0}
                    max={meta.nodeCount - 1}
                    value={pos}
                    onChange={(e) => {
                      const v = Math.max(
                        0,
                        Math.min(meta.nodeCount - 1, Number(e.target.value) || 0)
                      );
                      onUpdateCore((d) => writeU16(d, 12588 + idx * 2, v));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Batch Grid Transformations
          </h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label htmlFor="sg-target-char" className="block text-xs font-medium text-slate-400 mb-1">
                Target Character for Single-Unit Activation
              </label>
              <select
                id="sg-target-char"
                value={selectedChar}
                onChange={(e) => setSelectedChar(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
              >
                {CHARACTER_NAMES_DEFAULT.slice(0, 7).map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                onUpdateCore((d) => batchActivateSphereGridForChar(d, selectedChar));
                setNotice(
                  `Activated all valid Sphere Grid nodes for ${CHARACTER_NAMES_DEFAULT[selectedChar]}.`
                );
              }}
              className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Activate All for {CHARACTER_NAMES_DEFAULT[selectedChar]}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                onUpdateCore(batchActivateSphereGridAll);
                setNotice('Activated all valid Sphere Grid nodes for all 7 characters.');
              }}
              className="px-3 py-2 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-100 text-xs font-medium text-left flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              Activate All Nodes (All Characters)
            </button>

            <button
              type="button"
              onClick={() => {
                onUpdateCore(batchMaxSphereGridStatNodes);
                setNotice('Upgraded all stat nodes to +4 / HP +300 / MP +40.');
              }}
              className="px-3 py-2 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-100 text-xs font-medium text-left flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
              Max All Stat Nodes (+4 / 300 / 40)
            </button>

            <button
              type="button"
              onClick={() => {
                onUpdateCore(batchRemoveSphereGridLocks);
                setNotice('Cleared all Lv.1–Lv.4 Lock Nodes into Empty Nodes.');
              }}
              className="px-3 py-2 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-100 text-xs font-medium text-left flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Unlock className="w-4 h-4 text-sky-400 shrink-0" />
              Remove All Lock Nodes (Lv.1–4)
            </button>

            <button
              type="button"
              onClick={() => {
                onUpdateCore(batchClearSphereGridActivation);
                setNotice('Cleared activation flags across all Sphere Grid nodes.');
              }}
              className="px-3 py-2 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium text-left flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Eraser className="w-4 h-4 text-amber-400 shrink-0" />
              Clear All Node Activations
            </button>
          </div>
        </section>
      </div>

      {/* Node Inspector & Paginated Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden">
        <div className="p-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label htmlFor="sg-node-search" className="sr-only">
              Filter Sphere Grid Nodes
            </label>
            <input
              id="sg-node-search"
              type="text"
              placeholder="Search node index or type (e.g. Strength +4, Quick Hit, Lv. 4 Lock)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 font-mono tabular-nums">
            <span>
              Page {safePage + 1} / {totalPages} ({filteredNodes.length} nodes)
            </span>
            <button
              type="button"
              aria-label="Previous Sphere Grid Page"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="p-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Next Sphere Grid Page"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="p-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-xs text-slate-400">
                <th className="text-left font-medium px-3 py-2 w-20">Node</th>
                <th className="text-left font-medium px-3 py-2">Node Type</th>
                {CHARACTER_NAMES_DEFAULT.slice(0, 7).map((name) => (
                  <th key={name} className="text-center font-medium px-2 py-2 w-14">
                    {name.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {pageNodes.map((n) => (
                <tr key={n.index} className="hover:bg-slate-800/40">
                  <td className="px-3 py-1.5 font-mono text-xs tabular-nums text-slate-400">
                    #{String(n.index).padStart(3, '0')}
                  </td>
                  <td className="px-3 py-1.5">
                    <select
                      aria-label={`Node ${n.index} Type`}
                      value={n.nodeType}
                      onChange={(e) =>
                        onUpdateCore((d) =>
                          writeSphereGridNode(d, {
                            ...n,
                            nodeType: Number(e.target.value),
                          })
                        )
                      }
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1 text-sm text-slate-100"
                    >
                      {SPHERE_GRID_NODE_TYPES.map((nt, idx) => (
                        <option key={`${nt.id}-${idx}`} value={nt.id}>
                          {nt.name} ({nt.id})
                        </option>
                      ))}
                    </select>
                  </td>
                  {CHARACTER_NAMES_DEFAULT.slice(0, 7).map((name, charIdx) => {
                    const active = ((n.activatedMask >> charIdx) & 1) === 1;
                    return (
                      <td key={name} className="px-2 py-1.5 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Node ${n.index} ${name} activated`}
                          checked={active}
                          onChange={(e) => {
                            const nextMask = e.target.checked
                              ? n.activatedMask | (1 << charIdx)
                              : n.activatedMask & ~(1 << charIdx);
                            onUpdateCore((d) =>
                              writeSphereGridNode(d, { ...n, activatedMask: nextMask })
                            );
                          }}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-sky-500"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
