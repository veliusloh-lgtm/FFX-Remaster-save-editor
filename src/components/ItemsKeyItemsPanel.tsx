import React, { useMemo, useState } from 'react';
import { PackageCheck, BookOpen, Sparkles, Trash2 } from 'lucide-react';
import {
  assignUniqueInventoryItem,
  getBit,
  getUsedInventorySlotMap,
  maxOwnedInventoryItems,
  readInventoryItem,
  readU8,
  setBit,
  syncPrimerCount,
  writeInventoryItem,
} from '../ffx/saveCodec';
import { ITEMS_LIST, KEY_ITEMS_LIST } from '../ffx/tables';

interface ItemsKeyItemsPanelProps {
  core: Uint8Array;
  onUpdateCore: (mutator: (draft: Uint8Array) => void) => void;
}

type ItemsSubTab = 'inventory' | 'key-items';

export const ItemsKeyItemsPanel: React.FC<ItemsKeyItemsPanelProps> = ({ core, onUpdateCore }) => {
  const [subTab, setSubTab] = useState<ItemsSubTab>('inventory');
  const [search, setSearch] = useState('');
  const [hideEmpty, setHideEmpty] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const itemNameMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const it of ITEMS_LIST) m.set(it.id, it.name);
    return m;
  }, []);

  const slots = useMemo(
    () => Array.from({ length: 112 }, (_, slot) => readInventoryItem(core, slot)),
    [core]
  );

  const usedItemSlotMap = useMemo(() => getUsedInventorySlotMap(core), [core]);

  const filteredSlots = useMemo(() => {
    const q = search.trim().toLowerCase();
    return slots.filter((s) => {
      if (hideEmpty && s.id === 0x00ff) return false;
      if (!q) return true;
      const name = (itemNameMap.get(s.id) ?? '').toLowerCase();
      return name.includes(q) || String(s.slot + 1).includes(q);
    });
  }, [slots, hideEmpty, search, itemNameMap]);

  const primerCount = readU8(core, 3212);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">
            Items, Key Items &amp; Al Bhed Primers
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage all 112 bag item slots, Celestial Crests &amp; Sigils, Key Items, and all 26 Al Bhed Primers (auto-syncing primer counter).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('inventory')}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer ${
              subTab === 'inventory'
                ? 'bg-sky-500 text-slate-950'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            Bag Inventory (112)
          </button>
          <button
            type="button"
            onClick={() => setSubTab('key-items')}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer ${
              subTab === 'key-items'
                ? 'bg-sky-500 text-slate-950'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Key Items &amp; Primers ({primerCount}/26)
          </button>
        </div>
      </div>

      {notice && <div className="text-xs font-medium text-sky-400">{notice}</div>}

      {subTab === 'inventory' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-md p-3">
            <div className="flex flex-1 items-center gap-3">
              <label htmlFor="item-search" className="sr-only">
                Search Inventory Slots
              </label>
              <input
                id="item-search"
                type="text"
                placeholder="Search item name or slot number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
              />
              <label className="flex items-center gap-2 text-xs text-slate-300 whitespace-nowrap cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideEmpty}
                  onChange={(e) => setHideEmpty(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 accent-sky-500"
                />
                Hide Empty Slots
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const ownedCount = slots.filter((s) => s.id !== 0x00ff && s.quantity > 0).length;
                  onUpdateCore((d) => {
                    maxOwnedInventoryItems(d, 99);
                  });
                  setNotice(
                    ownedCount > 0
                      ? `Maxed ${ownedCount} items currently in possession to 99x.`
                      : 'No items currently in possession to max.'
                  );
                }}
                className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Max All Owned Items (99x)
              </button>
              <button
                type="button"
                onClick={() => {
                  // Stock essential Spheres & Dark Matter / Elixirs into empty slots
                  const essentials: [number, number][] = [
                    [0x2046, 99], // Power Sphere
                    [0x2047, 99], // Mana Sphere
                    [0x2048, 99], // Speed Sphere
                    [0x2049, 99], // Ability Sphere
                    [0x2055, 99], // Warp Sphere
                    [0x2053, 99], // Lv. 4 Key Sphere
                    [0x206f, 99], // Dark Matter
                    [0x2004, 99], // Elixir
                    [0x2005, 99], // Megalixir
                  ];
                  onUpdateCore((d) => {
                    for (const [id, qty] of essentials) {
                      let targetSlot = -1;
                      for (let i = 0; i < 112; i++) {
                        const existing = readInventoryItem(d, i);
                        if (existing.id === id) {
                          targetSlot = i;
                          break;
                        }
                        if (targetSlot === -1 && existing.id === 0x00ff) {
                          targetSlot = i;
                        }
                      }
                      if (targetSlot !== -1) {
                        writeInventoryItem(d, { slot: targetSlot, id, quantity: qty });
                      }
                    }
                  });
                  setNotice('Added 99x Core Spheres, Dark Matter & Elixirs to bag.');
                }}
                className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
              >
                Add Sphere &amp; Endgame Kit (99x)
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden">
            <div className="max-h-[560px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-xs text-slate-400">
                  <tr>
                    <th className="text-left font-medium px-3 py-2 w-20">Slot</th>
                    <th className="text-left font-medium px-3 py-2">Item</th>
                    <th className="text-left font-medium px-3 py-2 w-28">Quantity</th>
                    <th className="text-right font-medium px-3 py-2 w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredSlots.map((slotData) => (
                    <tr key={slotData.slot} className="hover:bg-slate-800/40">
                      <td className="px-3 py-1.5 font-mono text-xs tabular-nums text-slate-400">
                        #{String(slotData.slot + 1).padStart(3, '0')}
                      </td>
                      <td className="px-3 py-1.5">
                        <select
                          aria-label={`Item Slot ${slotData.slot + 1}`}
                          value={slotData.id}
                          onChange={(e) => {
                            const nextId = Number(e.target.value);
                            const existingOwners = (usedItemSlotMap.get(nextId) ?? []).filter(
                              (s) => s !== slotData.slot
                            );
                            if (nextId !== 0x00ff && existingOwners.length > 0) {
                              setNotice(
                                `${itemNameMap.get(nextId) ?? 'Item'} is already listed in Slot #${String(
                                  existingOwners[0] + 1
                                ).padStart(3, '0')}.`
                              );
                              return;
                            }
                            onUpdateCore((d) => {
                              assignUniqueInventoryItem(d, {
                                slot: slotData.slot,
                                id: nextId,
                                quantity:
                                  nextId === 0x00ff
                                    ? 0
                                    : slotData.quantity > 0
                                    ? slotData.quantity
                                    : 1,
                              });
                            });
                          }}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1 text-sm text-slate-100"
                        >
                          {ITEMS_LIST.map((opt) => {
                            const otherOwners =
                              opt.id === 0x00ff
                                ? []
                                : (usedItemSlotMap.get(opt.id) ?? []).filter(
                                    (s) => s !== slotData.slot
                                  );
                            const isListedElsewhere = otherOwners.length > 0;
                            return (
                              <option
                                key={opt.id}
                                value={opt.id}
                                disabled={isListedElsewhere}
                                className={
                                  isListedElsewhere ? 'text-slate-500 bg-slate-900' : 'text-slate-100'
                                }
                              >
                                {isListedElsewhere
                                  ? `${opt.name} (Listed in #${String(otherOwners[0] + 1).padStart(
                                      3,
                                      '0'
                                    )})`
                                  : opt.name}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td className="px-3 py-1.5">
                        <input
                          aria-label={`Quantity Slot ${slotData.slot + 1}`}
                          type="number"
                          min={0}
                          max={99}
                          disabled={slotData.id === 0x00ff}
                          value={slotData.quantity}
                          onChange={(e) => {
                            const q = Math.max(0, Math.min(99, Number(e.target.value) || 0));
                            onUpdateCore((d) =>
                              writeInventoryItem(d, {
                                slot: slotData.slot,
                                id: slotData.id,
                                quantity: q,
                              })
                            );
                          }}
                          className="w-20 bg-slate-950 border border-slate-800 disabled:opacity-40 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1 text-sm font-mono tabular-nums text-slate-100"
                        />
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        <button
                          type="button"
                          aria-label={`Clear Item Slot ${slotData.slot + 1}`}
                          disabled={slotData.id === 0x00ff}
                          onClick={() =>
                            onUpdateCore((d) =>
                              writeInventoryItem(d, { slot: slotData.slot, id: 0x00ff, quantity: 0 })
                            )
                          }
                          className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-md p-4">
            <div>
              <div className="text-sm font-semibold text-slate-100">
                Al Bhed Primers Sync Counter: <span className="font-mono text-sky-400 tabular-nums">{primerCount} / 26</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Toggling any Primer updates both Key Item bitfields (17612 &amp; 15696) and byte 3212.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateCore((d) => {
                    for (const ki of KEY_ITEMS_LIST) {
                      if (ki.category === 'Al Bhed Primers') {
                        for (const acc of ki.accessors) setBit(d, acc.offset, acc.bit, true);
                      }
                    }
                    syncPrimerCount(d);
                  });
                  setNotice('Unlocked all 26 Al Bhed Primers.');
                }}
                className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                Unlock All 26 Primers
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateCore((d) => {
                    for (const ki of KEY_ITEMS_LIST) {
                      for (const acc of ki.accessors) setBit(d, acc.offset, acc.bit, true);
                    }
                    syncPrimerCount(d);
                  });
                  setNotice('Unlocked all Key Items, Crests, Sigils & Al Bhed Primers.');
                }}
                className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
              >
                Unlock All Key Items &amp; Sigils
              </button>
            </div>
          </div>

          {(['Celestial', 'Key Items', 'Al Bhed Primers'] as const).map((cat) => {
            const list = KEY_ITEMS_LIST.filter((k) => k.category === cat);
            return (
              <section key={cat} className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                  {cat} ({list.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {list.map((ki) => {
                    const checked = ki.accessors.every((acc) => getBit(core, acc.offset, acc.bit));
                    return (
                      <label
                        key={ki.name}
                        className="flex items-center gap-2.5 text-sm text-slate-200 bg-slate-950/60 border border-slate-800 rounded px-3 py-2 cursor-pointer select-none hover:border-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            onUpdateCore((d) => {
                              for (const acc of ki.accessors) {
                                setBit(d, acc.offset, acc.bit, e.target.checked);
                              }
                              if (ki.category === 'Al Bhed Primers') {
                                syncPrimerCount(d);
                              }
                            })
                          }
                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-sky-500 shrink-0"
                        />
                        <span className="truncate">{ki.name}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
