import React, { useMemo, useState } from 'react';
import { Package, RefreshCw, Shield, Sparkles, Swords, Trash2, UserCheck } from 'lucide-react';
import {
  EquipmentSlotData,
  readEquipmentSlot,
  resolveEquipmentLabel,
} from '../ffx/saveCodec';
import { readLiveCharacterLoadouts } from '../ffx/liveTrainer';
import {
  AUTO_ABILITIES_LIST,
  CHARACTER_NAMES_DEFAULT,
  DAMAGE_FORMULAS_LIST,
  EQUIP_APPEARANCES_LIST,
  EQUIP_NAMES_BY_CHAR,
} from '../ffx/tables';

interface LiveEquipmentPanelProps {
  isBridgeConnected: boolean;
  equipCore: Uint8Array;
  onRefreshFromBridge?: () => void;
  onWriteSlot: (slot: EquipmentSlotData) => void;
  onEquipCharacter: (charIndex: number, slotIndex: number, gearType: 0 | 1) => void;
  onUnequipCharacter: (charIndex: number, gearType: 0 | 1) => void;
  statusMessage: string | null;
}

type EquipViewMode = 'characters' | 'inventory';
type InvFilter = 'occupied' | 'equipped' | 'weapons' | 'armor' | 'all';

export const LiveEquipmentPanel: React.FC<LiveEquipmentPanelProps> = ({
  isBridgeConnected,
  equipCore,
  onRefreshFromBridge,
  onWriteSlot,
  onEquipCharacter,
  onUnequipCharacter,
  statusMessage,
}) => {
  const [viewMode, setViewMode] = useState<EquipViewMode>('characters');
  const [showAll18Units, setShowAll18Units] = useState(false);
  const [invFilter, setInvFilter] = useState<InvFilter>('occupied');
  const [search, setSearch] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(0);

  const abilityMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const ab of AUTO_ABILITIES_LIST) map.set(ab.id, ab.name);
    return map;
  }, []);

  const allSlots = useMemo(
    () => Array.from({ length: 200 }, (_, i) => readEquipmentSlot(equipCore, i)),
    [equipCore]
  );

  const loadouts = useMemo(() => readLiveCharacterLoadouts(equipCore), [equipCore]);
  const visibleLoadouts = showAll18Units ? loadouts : loadouts.slice(0, 8);

  const occupiedWeapons = useMemo(
    () => allSlots.filter((s) => s.occupied && s.type === 0),
    [allSlots]
  );
  const occupiedArmor = useMemo(
    () => allSlots.filter((s) => s.occupied && s.type === 1),
    [allSlots]
  );

  const filteredSlots = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allSlots.filter((item) => {
      if (invFilter === 'occupied' && !item.occupied) return false;
      if (invFilter === 'equipped' && item.equippedBy === 0xff) return false;
      if (invFilter === 'weapons' && (!item.occupied || item.type !== 0)) return false;
      if (invFilter === 'armor' && (!item.occupied || item.type !== 1)) return false;
      if (!q) return true;
      const label = resolveEquipmentLabel(item).toLowerCase();
      const owner = (CHARACTER_NAMES_DEFAULT[item.character] ?? '').toLowerCase();
      const abNames = item.abilities.map((id) => (abilityMap.get(id) ?? '').toLowerCase()).join(' ');
      return (
        label.includes(q) ||
        owner.includes(q) ||
        abNames.includes(q) ||
        String(item.slot).includes(q)
      );
    });
  }, [allSlots, invFilter, search, abilityMap]);

  const current = allSlots[selectedSlot] ?? allSlots[0];
  const charEquipNames = current.character <= 6 ? EQUIP_NAMES_BY_CHAR[current.character] ?? [] : [];

  const updateCurrent = (patch: Partial<EquipmentSlotData>) => {
    onWriteSlot({ ...current, ...patch });
  };

  const openSlotEditor = (slotIndex: number) => {
    setSelectedSlot(slotIndex);
    setViewMode('inventory');
  };

  const formatAbilities = (slot: EquipmentSlotData | null) => {
    if (!slot) return [];
    return slot.abilities
      .slice(0, Math.max(0, Math.min(4, slot.abilityCount)))
      .map((id) => (id === 0x00ff ? 'Empty Slot' : abilityMap.get(id) ?? `0x${id.toString(16)}`));
  };

  return (
    <div className="space-y-5">
      <section className="bg-slate-900 border border-slate-800 rounded-md p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-400" />
              Live Equipment Viewer &amp; Editor (Characters &amp; Inventory)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isBridgeConnected
                ? 'Synced with live FFX.exe equipment RAM (FFX_EquipmentBase 0xD30F2C). Changes write directly into the running game.'
                : 'Viewing and editing the loaded save core equipment & character loadouts. Connect the FFX.exe bridge to sync directly with live game RAM.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('characters')}
              className={`px-3 py-1.5 rounded text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'characters'
                  ? 'bg-sky-500 text-slate-950'
                  : 'border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              On Characters (Loadouts)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('inventory')}
              className={`px-3 py-1.5 rounded text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'inventory'
                  ? 'bg-sky-500 text-slate-950'
                  : 'border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Inventory Slots (200)
            </button>
            {isBridgeConnected && onRefreshFromBridge && (
              <button
                type="button"
                onClick={onRefreshFromBridge}
                className="px-3 py-1.5 rounded border border-slate-700 bg-slate-950 hover:bg-slate-800 text-xs text-sky-300 font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sync RAM
              </button>
            )}
          </div>
        </div>

        {viewMode === 'characters' ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-400">
                Inspect equipped Weapons &amp; Armor per unit, swap gear from bag slots, or click Edit to customize auto-abilities immediately.
              </div>
              <button
                type="button"
                onClick={() => setShowAll18Units((v) => !v)}
                className="px-2.5 py-1 rounded border border-slate-700 bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {showAll18Units ? 'Show Party Only (0–7)' : 'Show All 18 Units (+ Aeons)'}
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {visibleLoadouts.map((unit) => {
                const charWeapons = occupiedWeapons.filter(
                  (w) => w.character === unit.characterIndex || w.slot === unit.equippedWeaponSlot
                );
                const charArmors = occupiedArmor.filter(
                  (a) => a.character === unit.characterIndex || a.slot === unit.equippedArmorSlot
                );
                const weaponAbs = formatAbilities(unit.weapon);
                const armorAbs = formatAbilities(unit.armor);

                return (
                  <div
                    key={unit.characterIndex}
                    className="bg-slate-950/60 border border-slate-800 rounded-md p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="font-semibold text-sm text-slate-100">
                        <span className="font-mono text-xs text-slate-400 mr-2">
                          #{unit.characterIndex}
                        </span>
                        {unit.name}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        Wep: {unit.equippedWeaponSlot < 200 ? `#${unit.equippedWeaponSlot}` : 'None'} · Arm:{' '}
                        {unit.equippedArmorSlot < 200 ? `#${unit.equippedArmorSlot}` : 'None'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Weapon Card */}
                      <div className="bg-slate-900/90 border border-slate-800 rounded p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                            <Swords className="w-3 h-3" />
                            Weapon
                          </span>
                          <div className="flex items-center gap-1.5">
                            {unit.weapon && (
                              <button
                                type="button"
                                aria-label={`Edit ${unit.name} Weapon`}
                                onClick={() => openSlotEditor(unit.equippedWeaponSlot)}
                                className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-[11px] text-sky-300 cursor-pointer"
                              >
                                Edit
                              </button>
                            )}
                            {unit.equippedWeaponSlot < 200 && (
                              <button
                                type="button"
                                aria-label={`Unequip ${unit.name} Weapon`}
                                onClick={() => onUnequipCharacter(unit.characterIndex, 0)}
                                className="px-2 py-0.5 rounded border border-slate-700 bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 cursor-pointer"
                              >
                                Unequip
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="text-xs font-medium text-slate-100 truncate">
                          {unit.weapon ? resolveEquipmentLabel(unit.weapon) : 'None Equipped'}
                        </div>
                        {unit.weapon && (
                          <div className="text-[11px] font-mono text-slate-400">
                            ATK {unit.weapon.attackPower} · Crit {unit.weapon.critical}% ·{' '}
                            {unit.weapon.abilityCount} slots
                          </div>
                        )}
                        <div className="text-[11px] text-slate-300 min-h-[16px] truncate">
                          {weaponAbs.length > 0 ? weaponAbs.join(' · ') : 'No auto-abilities'}
                        </div>

                        <select
                          aria-label={`Equip Weapon for ${unit.name}`}
                          value={unit.equippedWeaponSlot < 200 ? unit.equippedWeaponSlot : 0xff}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val === 0xff) {
                              onUnequipCharacter(unit.characterIndex, 0);
                            } else {
                              onEquipCharacter(unit.characterIndex, val, 0);
                            }
                          }}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 text-xs text-slate-200"
                        >
                          <option value={0xff}>-- Unequipped (0xFF) --</option>
                          {(charWeapons.length > 0 ? charWeapons : occupiedWeapons).map((w) => (
                            <option key={w.slot} value={w.slot}>
                              #{w.slot}: {resolveEquipmentLabel(w)} ({w.abilityCount}s)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Armor Card */}
                      <div className="bg-slate-900/90 border border-slate-800 rounded p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Armor
                          </span>
                          <div className="flex items-center gap-1.5">
                            {unit.armor && (
                              <button
                                type="button"
                                aria-label={`Edit ${unit.name} Armor`}
                                onClick={() => openSlotEditor(unit.equippedArmorSlot)}
                                className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-[11px] text-sky-300 cursor-pointer"
                              >
                                Edit
                              </button>
                            )}
                            {unit.equippedArmorSlot < 200 && (
                              <button
                                type="button"
                                aria-label={`Unequip ${unit.name} Armor`}
                                onClick={() => onUnequipCharacter(unit.characterIndex, 1)}
                                className="px-2 py-0.5 rounded border border-slate-700 bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 cursor-pointer"
                              >
                                Unequip
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="text-xs font-medium text-slate-100 truncate">
                          {unit.armor ? resolveEquipmentLabel(unit.armor) : 'None Equipped'}
                        </div>
                        {unit.armor && (
                          <div className="text-[11px] font-mono text-slate-400">
                            Slot #{unit.armor.slot} · {unit.armor.abilityCount} ability slots
                          </div>
                        )}
                        <div className="text-[11px] text-slate-300 min-h-[16px] truncate">
                          {armorAbs.length > 0 ? armorAbs.join(' · ') : 'No auto-abilities'}
                        </div>

                        <select
                          aria-label={`Equip Armor for ${unit.name}`}
                          value={unit.equippedArmorSlot < 200 ? unit.equippedArmorSlot : 0xff}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val === 0xff) {
                              onUnequipCharacter(unit.characterIndex, 1);
                            } else {
                              onEquipCharacter(unit.characterIndex, val, 1);
                            }
                          }}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 text-xs text-slate-200"
                        >
                          <option value={0xff}>-- Unequipped (0xFF) --</option>
                          {(charArmors.length > 0 ? charArmors : occupiedArmor).map((a) => (
                            <option key={a.slot} value={a.slot}>
                              #{a.slot}: {resolveEquipmentLabel(a)} ({a.abilityCount}s)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Inventory Slot List */}
            <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800 rounded-md p-3 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ['occupied', 'Occupied'],
                    ['equipped', 'Equipped'],
                    ['weapons', 'Weapons'],
                    ['armor', 'Armor'],
                    ['all', 'All 200'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setInvFilter(key)}
                    className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                      invFilter === key
                        ? 'bg-sky-500 text-slate-950 font-semibold'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div>
                <label htmlFor="live-equip-search" className="sr-only">
                  Search Live Equipment Inventory
                </label>
                <input
                  id="live-equip-search"
                  type="text"
                  placeholder="Search live weapon, owner, or ability..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
                />
              </div>

              <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
                {filteredSlots.length === 0 ? (
                  <div className="text-xs text-slate-400 py-8 text-center">
                    No inventory equipment slots match this filter.
                  </div>
                ) : (
                  filteredSlots.map((item) => {
                    const active = item.slot === selectedSlot;
                    const eqName = resolveEquipmentLabel(item);
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

            {/* Selected Slot Live Editor */}
            <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800 rounded-md p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">
                    Live Slot #{current.slot} — {resolveEquipmentLabel(current)}
                  </h4>
                  <div className="text-xs text-slate-400 font-mono">
                    {current.slot >= 12 && current.slot <= 33 ? 'Built-in Unit Gear' : 'Bag Inventory'} ·
                    Offset +0x{(current.slot * 22).toString(16).toUpperCase()}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onEquipCharacter(current.character, current.slot, current.type === 1 ? 1 : 0)
                    }
                    className="px-2.5 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                    Equip on {CHARACTER_NAMES_DEFAULT[current.character] ?? 'Owner'}
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
                          ? [32793, 32783, 32772, 32774] // Break Damage Limit, Triple Overdrive, Evade & Counter, Magic Booster
                          : [32791, 32896, 32854, 32853], // Break HP Limit, Ribbon, Auto-Haste, Auto-Protect
                      });
                    }}
                    className="px-2.5 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Endgame Preset
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateCurrent({
                        occupied: false,
                        nameId: 0,
                        name2: 0,
                        equippedBy: 0xff,
                        abilityCount: 1,
                        appearance: 0x00ff,
                        abilities: [0x00ff, 0x00ff, 0x00ff, 0x00ff],
                      })
                    }
                    className="px-2.5 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-rose-950/70 hover:border-rose-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={current.occupied}
                  onChange={(e) => updateCurrent({ occupied: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-sky-500"
                />
                <span>Slot Occupied (Exists in Inventory)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="live-eq-owner" className="block text-xs font-medium text-slate-400 mb-1">
                    Owner Character
                  </label>
                  <select
                    id="live-eq-owner"
                    value={current.character}
                    onChange={(e) => updateCurrent({ character: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-xs text-slate-100"
                  >
                    {CHARACTER_NAMES_DEFAULT.map((name, id) => (
                      <option key={name} value={id}>
                        {name} (ID {id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="live-eq-type" className="block text-xs font-medium text-slate-400 mb-1">
                    Gear Type
                  </label>
                  <select
                    id="live-eq-type"
                    value={current.type}
                    onChange={(e) => updateCurrent({ type: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-xs text-slate-100"
                  >
                    <option value={0}>Weapon (0)</option>
                    <option value={1}>Armor (1)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="live-eq-name" className="block text-xs font-medium text-slate-400 mb-1">
                    Equipment Name
                  </label>
                  {charEquipNames.length > 0 ? (
                    <select
                      id="live-eq-name"
                      value={current.nameId}
                      onChange={(e) => updateCurrent({ nameId: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-xs text-slate-100"
                    >
                      {charEquipNames.map((name, idx) => (
                        <option key={`${idx}-${name}`} value={idx}>
                          {idx}: {name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="live-eq-name"
                      type="number"
                      min={0}
                      max={255}
                      value={current.nameId}
                      onChange={(e) => updateCurrent({ nameId: Number(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-xs font-mono text-slate-100"
                    />
                  )}
                </div>

                <div>
                  <label htmlFor="live-eq-appearance" className="block text-xs font-medium text-slate-400 mb-1">
                    3D Model Appearance
                  </label>
                  <select
                    id="live-eq-appearance"
                    value={current.appearance}
                    onChange={(e) => updateCurrent({ appearance: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-xs text-slate-100"
                  >
                    {EQUIP_APPEARANCES_LIST.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                  <div>
                    <label htmlFor="live-eq-atk" className="block text-xs font-medium text-slate-400 mb-1">
                      Attack Power
                    </label>
                    <input
                      id="live-eq-atk"
                      type="number"
                      min={0}
                      max={255}
                      value={current.attackPower}
                      onChange={(e) =>
                        updateCurrent({
                          attackPower: Math.max(0, Math.min(255, Number(e.target.value) || 0)),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="live-eq-crit" className="block text-xs font-medium text-slate-400 mb-1">
                      Critical %
                    </label>
                    <input
                      id="live-eq-crit"
                      type="number"
                      min={0}
                      max={255}
                      value={current.critical}
                      onChange={(e) =>
                        updateCurrent({
                          critical: Math.max(0, Math.min(255, Number(e.target.value) || 0)),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="live-eq-slots" className="block text-xs font-medium text-slate-400 mb-1">
                      Ability Slots
                    </label>
                    <input
                      id="live-eq-slots"
                      type="number"
                      min={0}
                      max={4}
                      value={current.abilityCount}
                      onChange={(e) =>
                        updateCurrent({
                          abilityCount: Math.max(0, Math.min(4, Number(e.target.value) || 0)),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2 py-1 text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="live-eq-formula" className="block text-xs font-medium text-slate-400 mb-1">
                    Damage Formula
                  </label>
                  <select
                    id="live-eq-formula"
                    value={current.damageFormula}
                    onChange={(e) => updateCurrent({ damageFormula: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-xs text-slate-100"
                  >
                    {DAMAGE_FORMULAS_LIST.map((df) => (
                      <option key={df.id} value={df.id}>
                        {df.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {current.abilities.map((abId, idx) => (
                  <div key={idx}>
                    <label
                      htmlFor={`live-eq-ab-${idx}`}
                      className="block text-xs font-medium text-slate-400 mb-1"
                    >
                      Live Auto-Ability {idx + 1}
                    </label>
                    <select
                      id={`live-eq-ab-${idx}`}
                      value={abId}
                      onChange={(e) => {
                        const next = [...current.abilities] as [number, number, number, number];
                        next[idx] = Number(e.target.value);
                        updateCurrent({ abilities: next });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-2.5 py-1.5 text-xs text-slate-100"
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
        )}
      </section>
    </div>
  );
};
