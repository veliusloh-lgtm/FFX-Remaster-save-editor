import React, { useMemo, useState } from 'react';
import { Copy, ClipboardPaste, Sparkles, Trash2 } from 'lucide-react';
import {
  EquipmentSlotData,
  readEquipmentSlot,
  writeEquipmentSlot,
} from '../ffx/saveCodec';
import {
  AUTO_ABILITIES_LIST,
  CHARACTER_NAMES_DEFAULT,
  DAMAGE_FORMULAS_LIST,
  EQUIP_APPEARANCES_LIST,
  EQUIP_NAMES_BY_CHAR,
} from '../ffx/tables';

interface EquipmentPanelProps {
  core: Uint8Array;
  onUpdateCore: (mutator: (draft: Uint8Array) => void) => void;
}

type EquipFilter = 'all' | 'occupied' | 'equipped' | 'aeon';

function resolveEquipLabel(item: EquipmentSlotData): string {
  if (!item.occupied && item.equippedBy === 0xff) {
    return 'Empty Slot';
  }
  if (item.character <= 6) {
    const names = EQUIP_NAMES_BY_CHAR[item.character];
    if (names && item.nameId < names.length && item.nameId > 0) {
      return names[item.nameId];
    }
  }
  const charName = CHARACTER_NAMES_DEFAULT[item.character] ?? `Unit ${item.character}`;
  return `${charName} ${item.type === 0 ? 'Weapon' : 'Armor'}`;
}

function getSlotScopeTag(slot: number): string {
  if (slot >= 12 && slot <= 33) return 'Built-in (Seymour / Aeon)';
  return 'Bag Inventory';
}

export const EquipmentPanel: React.FC<EquipmentPanelProps> = ({ core, onUpdateCore }) => {
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [filter, setFilter] = useState<EquipFilter>('occupied');
  const [search, setSearch] = useState('');
  const [clipboard, setClipboard] = useState<EquipmentSlotData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const allSlots = useMemo(
    () => Array.from({ length: 200 }, (_, i) => readEquipmentSlot(core, i)),
    [core]
  );

  const abilityNameMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const a of AUTO_ABILITIES_LIST) map.set(a.id, a.name);
    return map;
  }, []);

  const filteredSlots = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allSlots.filter((item) => {
      if (filter === 'occupied' && !item.occupied) return false;
      if (filter === 'equipped' && item.equippedBy === 0xff) return false;
      if (filter === 'aeon' && (item.slot < 12 || item.slot > 33)) return false;
      if (!q) return true;
      const label = resolveEquipLabel(item).toLowerCase();
      const owner = (CHARACTER_NAMES_DEFAULT[item.character] ?? '').toLowerCase();
      const abNames = item.abilities
        .map((id) => (abilityNameMap.get(id) ?? '').toLowerCase())
        .join(' ');
      return (
        label.includes(q) ||
        owner.includes(q) ||
        abNames.includes(q) ||
        String(item.slot).includes(q)
      );
    });
  }, [allSlots, filter, search, abilityNameMap]);

  const current = allSlots[selectedSlot] ?? allSlots[0];

  const updateCurrent = (patch: Partial<EquipmentSlotData>) => {
    onUpdateCore((d) => {
      const prev = readEquipmentSlot(d, selectedSlot);
      writeEquipmentSlot(d, { ...prev, ...patch });
    });
  };

  const charEquipNames =
    current.character <= 6 ? EQUIP_NAMES_BY_CHAR[current.character] ?? [] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">
            Equipment Forge (200 Slots)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Inspect and customize weapons &amp; armors across bag slots and Seymour/Aeon built-in gear (slots 12–33).
          </p>
        </div>
        {notice && <div className="text-xs font-medium text-sky-400">{notice}</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Slot List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-md p-3 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ['occupied', 'Occupied'],
                ['equipped', 'Equipped'],
                ['aeon', 'Built-In (12–33)'],
                ['all', 'All 200'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                  filter === key
                    ? 'bg-sky-500 text-slate-950 font-semibold'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="equip-search" className="sr-only">
              Search Equipment Slots
            </label>
            <input
              id="equip-search"
              type="text"
              placeholder="Search weapon, owner, or auto-ability..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
            />
          </div>

          <div className="space-y-1 max-h-[540px] overflow-y-auto pr-1">
            {filteredSlots.length === 0 ? (
              <div className="text-xs text-slate-400 py-8 text-center">
                No equipment slots match this filter.
              </div>
            ) : (
              filteredSlots.map((item) => {
                const active = item.slot === selectedSlot;
                const eqName = resolveEquipLabel(item);
                const eqBy =
                  item.equippedBy !== 0xff
                    ? CHARACTER_NAMES_DEFAULT[item.equippedBy] ?? `Unit ${item.equippedBy}`
                    : null;
                return (
                  <button
                    key={item.slot}
                    type="button"
                    onClick={() => setSelectedSlot(item.slot)}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between gap-2 cursor-pointer ${
                      active
                        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40'
                        : 'text-slate-200 hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        <span className="font-mono text-xs text-slate-400 mr-2 tabular-nums">
                          #{String(item.slot).padStart(3, '0')}
                        </span>
                        {eqName}
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {CHARACTER_NAMES_DEFAULT[item.character] ?? `Unit ${item.character}`} ·{' '}
                        {item.type === 0 ? 'Weapon' : 'Armor'} · {item.abilityCount} slots
                        {eqBy ? ` · Equipped: ${eqBy}` : ''}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Slot Editor */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-md p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Slot #{current.slot} — {resolveEquipLabel(current)}
              </h3>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {getSlotScopeTag(current.slot)} · Offset 0x
                {(17628 + current.slot * 22).toString(16).toUpperCase()}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setClipboard({ ...current, abilities: [...current.abilities] as [number, number, number, number] });
                  setNotice(`Copied Slot #${current.slot} to clipboard.`);
                }}
                className="px-2.5 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
              <button
                type="button"
                disabled={!clipboard}
                onClick={() => {
                  if (!clipboard) return;
                  onUpdateCore((d) =>
                    writeEquipmentSlot(d, {
                      ...clipboard,
                      slot: selectedSlot,
                      abilities: [...clipboard.abilities] as [number, number, number, number],
                    })
                  );
                  setNotice(`Pasted gear template into Slot #${selectedSlot}.`);
                }}
                className="px-2.5 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-100 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                Paste
              </button>
              <button
                type="button"
                onClick={() => {
                  const isWeapon = current.type === 0;
                  updateCurrent({
                    occupied: true,
                    abilityCount: 4,
                    attackPower: isWeapon ? 255 : 0,
                    critical: isWeapon ? 25 : 0,
                    abilities: isWeapon
                      ? [0x801a, 0x801b, 0x800f, 0x8074] // Break Damage Limit, Triple Overdrive, Evade & Counter, Magic Booster
                      : [0x805e, 0x805d, 0x8056, 0x8055], // Break HP Limit, Ribbon, Auto-Haste, Auto-Protect
                  });
                  setNotice(
                    isWeapon
                      ? `Applied Ultimate Weapon preset to Slot #${selectedSlot}.`
                      : `Applied Ribbon + BHPL Armor preset to Slot #${selectedSlot}.`
                  );
                }}
                className="px-2.5 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Apply Endgame Preset
              </button>
              <button
                type="button"
                onClick={() => {
                  updateCurrent({
                    occupied: false,
                    nameId: 0,
                    name2: 0,
                    equippedBy: 0xff,
                    abilityCount: 1,
                    appearance: 0x00ff,
                    abilities: [0x00ff, 0x00ff, 0x00ff, 0x00ff],
                  });
                  setNotice(`Cleared Slot #${selectedSlot}.`);
                }}
                className="px-2.5 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-rose-950/70 hover:border-rose-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-100 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={current.occupied}
                onChange={(e) => updateCurrent({ occupied: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-sky-500"
              />
              <span>Slot Occupied (Exists in Inventory)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="eq-owner" className="block text-xs font-medium text-slate-400 mb-1">
                Owner Character
              </label>
              <select
                id="eq-owner"
                value={current.character}
                onChange={(e) => updateCurrent({ character: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
              >
                {CHARACTER_NAMES_DEFAULT.map((name, id) => (
                  <option key={name} value={id}>
                    {name} (ID {id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="eq-type" className="block text-xs font-medium text-slate-400 mb-1">
                Gear Type
              </label>
              <select
                id="eq-type"
                value={current.type}
                onChange={(e) => updateCurrent({ type: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
              >
                <option value={0}>Weapon (0)</option>
                <option value={1}>Armor (1)</option>
              </select>
            </div>

            <div>
              <label htmlFor="eq-name-id" className="block text-xs font-medium text-slate-400 mb-1">
                Equipment Name ({current.character <= 6 ? CHARACTER_NAMES_DEFAULT[current.character] : 'Name ID'})
              </label>
              {charEquipNames.length > 0 ? (
                <select
                  id="eq-name-id"
                  value={current.nameId}
                  onChange={(e) => updateCurrent({ nameId: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
                >
                  {charEquipNames.map((name, idx) => (
                    <option key={`${idx}-${name}`} value={idx}>
                      {idx}: {name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="eq-name-id"
                  type="number"
                  min={0}
                  max={255}
                  value={current.nameId}
                  onChange={(e) => updateCurrent({ nameId: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                />
              )}
            </div>

            <div>
              <label htmlFor="eq-equipped-by" className="block text-xs font-medium text-slate-400 mb-1">
                Equipped By
              </label>
              <select
                id="eq-equipped-by"
                value={current.equippedBy}
                onChange={(e) => updateCurrent({ equippedBy: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
              >
                <option value={0xff}>Not Equipped (0xFF)</option>
                {CHARACTER_NAMES_DEFAULT.map((name, id) => (
                  <option key={name} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="eq-appearance" className="block text-xs font-medium text-slate-400 mb-1">
                3D Model Appearance
              </label>
              <select
                id="eq-appearance"
                value={current.appearance}
                onChange={(e) => updateCurrent({ appearance: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
              >
                {EQUIP_APPEARANCES_LIST.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} (0x{app.id.toString(16).toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="eq-formula" className="block text-xs font-medium text-slate-400 mb-1">
                Damage Formula
              </label>
              <select
                id="eq-formula"
                value={current.damageFormula}
                onChange={(e) => updateCurrent({ damageFormula: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
              >
                {DAMAGE_FORMULAS_LIST.map((df) => (
                  <option key={df.id} value={df.id}>
                    {df.name} ({df.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <div>
                <label htmlFor="eq-atk" className="block text-xs font-medium text-slate-400 mb-1">
                  Attack Power
                </label>
                <input
                  id="eq-atk"
                  type="number"
                  min={0}
                  max={255}
                  value={current.attackPower}
                  onChange={(e) =>
                    updateCurrent({ attackPower: Math.max(0, Math.min(255, Number(e.target.value) || 0)) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="eq-crit" className="block text-xs font-medium text-slate-400 mb-1">
                  Critical %
                </label>
                <input
                  id="eq-crit"
                  type="number"
                  min={0}
                  max={255}
                  value={current.critical}
                  onChange={(e) =>
                    updateCurrent({ critical: Math.max(0, Math.min(255, Number(e.target.value) || 0)) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="eq-slots" className="block text-xs font-medium text-slate-400 mb-1">
                  Ability Slots (1–4)
                </label>
                <input
                  id="eq-slots"
                  type="number"
                  min={0}
                  max={4}
                  value={current.abilityCount}
                  onChange={(e) =>
                    updateCurrent({ abilityCount: Math.max(0, Math.min(4, Number(e.target.value) || 0)) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* 4 Auto-Ability Slots */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Auto-Abilities (4 Slots)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.abilities.map((abId, idx) => (
                <div key={idx}>
                  <label
                    htmlFor={`eq-ab-${idx}`}
                    className="block text-xs font-medium text-slate-400 mb-1"
                  >
                    Ability Slot {idx + 1}
                  </label>
                  <select
                    id={`eq-ab-${idx}`}
                    value={abId}
                    onChange={(e) => {
                      const next = [...current.abilities] as [number, number, number, number];
                      next[idx] = Number(e.target.value);
                      updateCurrent({ abilities: next });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
                  >
                    {AUTO_ABILITIES_LIST.map((ab) => (
                      <option key={ab.id} value={ab.id}>
                        {ab.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
