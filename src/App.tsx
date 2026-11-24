import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Compass,
  Users,
  Sword,
  Package,
  GitBranch,
  Trophy,
  Skull,
  Sparkles,
  Upload,
  Download,
  Menu,
  X,
  FileCode2,
  AlertCircle,
  CheckCircle2,
  Activity,
  Tag,
} from 'lucide-react';
import {
  DEFAULT_EDITED_SLOT,
  SaveContainer,
  SaveFormat,
  applyEditedSaveMarker,
  createSampleSave,
  formatSaveSlotFileName,
  inspectEditedSaveMarker,
  parseSaveFile,
  parseSaveSlotNumber,
  readU16,
  readU32,
  readU8,
  repairFFXChecksum,
  serializeSaveFile,
  stampPlaytimeSecondsMarker,
  tagHeroNameAsEdited,
  verifyFFXChecksum,
} from './ffx/saveCodec';
import { OverviewWorldPanel } from './components/OverviewWorldPanel';
import { PartyAeonsPanel } from './components/PartyAeonsPanel';
import { EquipmentPanel } from './components/EquipmentPanel';
import { ItemsKeyItemsPanel } from './components/ItemsKeyItemsPanel';
import { SphereGridPanel } from './components/SphereGridPanel';
import { BlitzballPanel } from './components/BlitzballPanel';
import { MonsterArenaPanel } from './components/MonsterArenaPanel';
import { MinigamesPanel } from './components/MinigamesPanel';
import { LiveTrainerPanel } from './components/LiveTrainerPanel';

type NavTabId =
  | 'overview'
  | 'party'
  | 'equipment'
  | 'items'
  | 'sphere-grid'
  | 'blitzball'
  | 'monster-arena'
  | 'minigames'
  | 'live-hook';

const NAV_ITEMS: {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'overview', label: 'Overview & World', icon: Compass },
  { id: 'party', label: 'Party & Aeons', icon: Users },
  { id: 'equipment', label: 'Equipment Forge', icon: Sword },
  { id: 'items', label: 'Items & Primers', icon: Package },
  { id: 'sphere-grid', label: 'Sphere Grid', icon: GitBranch },
  { id: 'blitzball', label: 'Blitzball', icon: Trophy },
  { id: 'monster-arena', label: 'Monster Arena', icon: Skull },
  { id: 'minigames', label: 'Minigames & Quests', icon: Sparkles },
  { id: 'live-hook', label: 'Live Game Hook', icon: Activity },
];

const FORMAT_LABELS: Record<SaveFormat, string> = {
  'pc-steam': 'PC Steam',
  switch: 'Nintendo Switch',
  'ps-vita': 'PS Vita',
  'ps2-raw': 'PS2 Raw',
};

function formatClock(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function App() {
  const [saveContainer, setSaveContainer] = useState<SaveContainer | null>(null);
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exportBanner, setExportBanner] = useState<string | null>(null);

  // Export & Mark Save dialog state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportSlotNumber, setExportSlotNumber] = useState<number>(DEFAULT_EDITED_SLOT);
  const [markHeroTag, setMarkHeroTag] = useState<boolean>(true);
  const [markPlaytime59, setMarkPlaytime59] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setSaveContainer(createSampleSave());
    }
  }, []);

  const checksumStatus = useMemo(() => {
    if (!saveContainer) return null;
    return verifyFFXChecksum(saveContainer.core);
  }, [saveContainer]);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setExportBanner(null);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseSaveFile(new Uint8Array(buffer), file.name);
      setSaveContainer(parsed);
      setActiveTab('overview');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to parse save file.');
    }
  };

  const handleLoadSample = () => {
    setErrorMsg(null);
    setExportBanner(null);
    setSaveContainer(createSampleSave());
    setActiveTab('overview');
  };

  const handleOpenLiveHook = () => {
    setErrorMsg(null);
    setExportBanner(null);
    setSaveContainer((prev) => prev ?? createSampleSave());
    setActiveTab('live-hook');
  };

  const handleUpdateCore = (mutator: (draft: Uint8Array) => void) => {
    setExportBanner(null);
    setSaveContainer((prev) => {
      if (!prev) return prev;
      const nextCore = prev.core.slice();
      mutator(nextCore);
      return { ...prev, core: nextCore };
    });
  };

  const handleChangeFileName = (fileName: string) => {
    setSaveContainer((prev) => (prev ? { ...prev, fileName } : prev));
  };

  const handleRepairChecksum = () => {
    if (!saveContainer) return;
    handleUpdateCore((d) => {
      repairFFXChecksum(d);
    });
    setExportBanner('Repaired CRC-16-CCITT checksums at 0x001A and 0x64F4.');
  };

  const handleChangeExportFormat = (format: SaveFormat) => {
    setSaveContainer((prev) => (prev ? { ...prev, format } : prev));
  };

  const handleOpenExportModal = () => {
    if (!saveContainer) return;
    const currentSlot = parseSaveSlotNumber(saveContainer.fileName);
    setExportSlotNumber(currentSlot !== null && currentSlot >= 150 ? currentSlot : DEFAULT_EDITED_SLOT);
    setMarkHeroTag(true);
    setMarkPlaytime59(true);
    setExportModalOpen(true);
  };

  const handleConfirmExportSave = () => {
    if (!saveContainer) return;
    const nextFileName = formatSaveSlotFileName(exportSlotNumber);
    const markedCore = saveContainer.core.slice();
    applyEditedSaveMarker(markedCore, {
      tagHeroName: markHeroTag,
      stampPlaytimeSeconds: markPlaytime59,
    });
    const cs = repairFFXChecksum(markedCore);

    const updatedContainer: SaveContainer = {
      ...saveContainer,
      fileName: nextFileName,
      core: markedCore,
    };

    const outBytes = serializeSaveFile(updatedContainer, updatedContainer.format);
    setSaveContainer(updatedContainer);
    setExportModalOpen(false);

    const blobCopy = new Uint8Array(outBytes.length);
    blobCopy.set(outBytes);
    const blob = new Blob([blobCopy.buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nextFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    const markerSummary = [
      markHeroTag ? 'Hero tagged [ED]' : null,
      markPlaytime59 ? 'Playtime :59' : null,
    ]
      .filter(Boolean)
      .join(' · ');

    setExportBanner(
      `Exported ${nextFileName} (${FORMAT_LABELS[updatedContainer.format]}, ${outBytes.length.toLocaleString()} bytes, CRC 0x${cs
        .toString(16)
        .toUpperCase()
        .padStart(4, '0')}${markerSummary ? ` · ${markerSummary}` : ''}).`
    );
  };

  const activeNavLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? 'Overview';
  const loadedMarkerInfo = saveContainer
    ? inspectEditedSaveMarker(saveContainer.core, saveContainer.fileName)
    : null;
  const previewExportFileName = formatSaveSlotFileName(exportSlotNumber);
  const previewHeroName = loadedMarkerInfo
    ? tagHeroNameAsEdited(loadedMarkerInfo.heroName, markHeroTag)
    : 'Tidus [ED]';
  const previewPlaytime = saveContainer
    ? markPlaytime59
      ? stampPlaytimeSecondsMarker(readU32(saveContainer.core, 252), 59)
      : readU32(saveContainer.core, 252)
    : 0;
  const previewRoomId = saveContainer ? readU16(saveContainer.core, 250) : 0;
  const previewSpawn = saveContainer ? readU8(saveContainer.core, 248) : 0;

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        aria-label="Select FFX Save File"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = '';
        }}
      />

      {/* Top Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          {saveContainer && (
            <button
              type="button"
              aria-label="Toggle Navigation Menu"
              onClick={() => setMobileNavOpen((v) => !v)}
              className="lg:hidden p-1.5 rounded border border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800 cursor-pointer"
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <FileCode2 className="w-5 h-5 text-sky-400 shrink-0" />
            <h1 className="text-sm sm:text-base font-semibold tracking-tight text-slate-100 truncate">
              Spira Hook by Velius
            </h1>
            {saveContainer && (
              <span className="hidden sm:inline text-sm text-slate-400 truncate">
                / {activeNavLabel}
              </span>
            )}
          </div>
        </div>

        {/* Center Unboxed Metadata Strip */}
        {saveContainer && checksumStatus && (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
            <span className="text-slate-200">{saveContainer.fileName}</span>
            <span>·</span>
            <span>{FORMAT_LABELS[saveContainer.format]}</span>
            <span>·</span>
            <span className={checksumStatus.valid ? 'text-emerald-400' : 'text-amber-400'}>
              {checksumStatus.valid
                ? `CRC-16 Valid (0x${checksumStatus.expected
                    .toString(16)
                    .toUpperCase()
                    .padStart(4, '0')})`
                : 'Modified · Auto-repairs on export'}
            </span>
          </div>
        )}

        {/* Right Primary Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Open Save"
            className="px-2.5 sm:px-3 py-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">Open</span>
            <span className="hidden sm:inline">Open Save</span>
          </button>

          {saveContainer && (
            <button
              type="button"
              onClick={handleOpenExportModal}
              aria-label="Export Save"
              className="px-2.5 sm:px-3.5 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="sm:hidden">Export</span>
              <span className="hidden sm:inline">Export Save</span>
            </button>
          )}
        </div>
      </header>

      {/* Inline Feedback Banners */}
      {errorMsg && (
        <div
          role="alert"
          className="bg-rose-950/70 border-b border-rose-800 px-6 py-2.5 text-xs text-rose-200 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-300 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {exportBanner && (
        <div className="bg-sky-950/50 border-b border-sky-800/70 px-6 py-2 text-xs text-sky-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{exportBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportBanner(null)}
            className="text-sky-300 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {!saveContainer ? (
        /* Welcome / Dropzone Screen */
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-widest text-sky-400">
                Final Fantasy X HD Remaster · Binary Save Workbench
              </div>
              <h2 className="text-3xl font-semibold text-slate-100 tracking-tight">
                Edit every save system directly in your browser.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Full support for Party &amp; Aeons, 200 Equipment slots, 112 Bag Items, 26 Al Bhed Primers, Sphere Grid nodes &amp; batch unlocks, Blitzball, Monster Arena, and Minigames with automatic CRC-16-CCITT repair. Files stay 100% local in memory.
              </p>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) void handleFile(f);
              }}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-sky-400 bg-sky-500/10'
                  : 'border-slate-700 bg-slate-900/70 hover:border-slate-600'
              }`}
            >
              <Upload className="w-8 h-8 text-sky-400 mx-auto mb-3" />
              <div className="text-base font-medium text-slate-100">
                Drop an FFX save file here (
                <code className="font-mono text-sky-300">ffx_000</code> –{' '}
                <code className="font-mono text-sky-300">ffx_200</code>)
              </div>
              <p className="text-xs text-slate-400 mt-1">
                PC Steam (26,880 B) · Nintendo Switch (26,880 B) · PS Vita (26,872 B) · Raw PS2 (25,848 B)
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Choose Save File
                </button>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-4 py-2 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Load Sample Save
                </button>
                <button
                  type="button"
                  onClick={handleOpenLiveHook}
                  className="px-4 py-2 rounded border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-sm font-medium whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Activity className="w-4 h-4" />
                  Open Live Game Hook
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900 border border-slate-800 rounded p-3.5">
                <div className="font-semibold text-slate-200">Exact CRC-16-CCITT</div>
                <div className="text-slate-400 mt-1">
                  Uses FFX&apos;s exact polynomial &amp; table[255]=0x0000 quirk across 0x001A and 0x64F4.
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded p-3.5">
                <div className="font-semibold text-slate-200">Cross-Platform Export</div>
                <div className="text-slate-400 mt-1">
                  Convert between PC Steam, Nintendo Switch, PS Vita, and Raw PS2 memory saves.
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded p-3.5">
                <div className="font-semibold text-slate-200">Zero Data Loss</div>
                <div className="text-slate-400 mt-1">
                  Preserves unmapped flags, PC Steam trailing bytes, and Switch 8-byte prefixes.
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* Active Editor Workspace */
        <div className="flex-1 flex relative">
          {/* Desktop Sidebar (248px) & Mobile Drawer */}
          {mobileNavOpen && (
            <div
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 bg-slate-950/70 z-20 lg:hidden"
            />
          )}

          <aside
            className={`fixed lg:static inset-y-0 left-0 top-14 lg:top-0 z-20 w-[248px] shrink-0 bg-[#111827] border-r border-slate-800 flex flex-col justify-between transition-transform duration-150 ${
              mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            <nav aria-label="Save Editor Sections" className="p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileNavOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-slate-800 space-y-2 text-xs">
              <div className="text-slate-400">
                Loaded: <span className="font-mono text-slate-200">{saveContainer.fileName}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="flex-1 px-2.5 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium whitespace-nowrap cursor-pointer"
                >
                  Reset Sample
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSaveContainer(null);
                    setExportBanner(null);
                  }}
                  className="px-2.5 py-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium whitespace-nowrap cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Viewport */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1440px]">
            {activeTab === 'overview' && checksumStatus && (
              <OverviewWorldPanel
                core={saveContainer.core}
                format={saveContainer.format}
                fileName={saveContainer.fileName}
                checksumStatus={checksumStatus}
                onUpdateCore={handleUpdateCore}
                onChangeFileName={handleChangeFileName}
                onRepairChecksum={handleRepairChecksum}
                onChangeExportFormat={handleChangeExportFormat}
                onExportSave={handleOpenExportModal}
              />
            )}
            {activeTab === 'party' && (
              <PartyAeonsPanel core={saveContainer.core} onUpdateCore={handleUpdateCore} />
            )}
            {activeTab === 'equipment' && (
              <EquipmentPanel core={saveContainer.core} onUpdateCore={handleUpdateCore} />
            )}
            {activeTab === 'items' && (
              <ItemsKeyItemsPanel core={saveContainer.core} onUpdateCore={handleUpdateCore} />
            )}
            {activeTab === 'sphere-grid' && (
              <SphereGridPanel core={saveContainer.core} onUpdateCore={handleUpdateCore} />
            )}
            {activeTab === 'blitzball' && (
              <BlitzballPanel core={saveContainer.core} onUpdateCore={handleUpdateCore} />
            )}
            {activeTab === 'monster-arena' && (
              <MonsterArenaPanel core={saveContainer.core} onUpdateCore={handleUpdateCore} />
            )}
            {activeTab === 'minigames' && (
              <MinigamesPanel core={saveContainer.core} onUpdateCore={handleUpdateCore} />
            )}
            {activeTab === 'live-hook' && (
              <LiveTrainerPanel core={saveContainer.core} onUpdateCore={handleUpdateCore} />
            )}
          </main>
        </div>
      )}

      {/* Export & Mark Edited Save Modal */}
      {exportModalOpen && saveContainer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80"
        >
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-sky-400 shrink-0" />
                <h2 id="export-modal-title" className="text-base font-semibold text-slate-100">
                  Export &amp; Mark Save for In-Game Loading
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close Export Dialog"
                onClick={() => setExportModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="export-slot-number" className="block text-xs font-medium text-slate-400 mb-1">
                    Save Slot Number (000–200)
                  </label>
                  <input
                    id="export-slot-number"
                    type="number"
                    min={0}
                    max={200}
                    value={exportSlotNumber}
                    onChange={(e) =>
                      setExportSlotNumber(Math.max(0, Math.min(200, Math.trunc(Number(e.target.value) || 0))))
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm font-mono tabular-nums text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="export-modal-format" className="block text-xs font-medium text-slate-400 mb-1">
                    Save Format
                  </label>
                  <select
                    id="export-modal-format"
                    value={saveContainer.format}
                    onChange={(e) => handleChangeExportFormat(e.target.value as SaveFormat)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none rounded px-3 py-1.5 text-sm text-slate-100"
                  >
                    <option value="pc-steam">PC Steam (26,880 B)</option>
                    <option value="switch">Nintendo Switch (26,880 B + 8B)</option>
                    <option value="ps-vita">PS Vita (26,872 B)</option>
                    <option value="ps2-raw">Raw PS2 (25,848 B)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setExportSlotNumber(199)}
                  className={`px-2.5 py-1 rounded border text-xs font-mono cursor-pointer ${
                    exportSlotNumber === 199
                      ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                      : 'border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Recommended: Slot 199 (ffx_199)
                </button>
                <button
                  type="button"
                  onClick={() => setExportSlotNumber(200)}
                  className={`px-2.5 py-1 rounded border text-xs font-mono cursor-pointer ${
                    exportSlotNumber === 200
                      ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                      : 'border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Slot 200 (ffx_200)
                </button>
                {parseSaveSlotNumber(saveContainer.fileName) !== null && (
                  <button
                    type="button"
                    onClick={() =>
                      setExportSlotNumber(parseSaveSlotNumber(saveContainer.fileName) ?? 0)
                    }
                    className="px-2.5 py-1 rounded border border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800 text-xs font-mono cursor-pointer"
                  >
                    Keep Loaded ({saveContainer.fileName})
                  </button>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2.5 bg-slate-950/70 border border-slate-800 rounded p-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={markHeroTag}
                    onChange={(e) => setMarkHeroTag(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-950 accent-sky-500 shrink-0"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-100">
                      Tag Hero Name with [ED] ({previewHeroName})
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Appends <code className="font-mono">[ED]</code> to Tidus&apos;s name so edited runs stand out in party &amp; status menus (reversible anytime).
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 bg-slate-950/70 border border-slate-800 rounded p-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={markPlaytime59}
                    onChange={(e) => setMarkPlaytime59(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-950 accent-sky-500 shrink-0"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-100">
                      Stamp Load-Screen Playtime Seconds to :59 ({formatClock(previewPlaytime)})
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Sets the seconds digit visible on FFX&apos;s Load Game list to <code className="font-mono">:59</code> without changing your hours/minutes or warping your location.
                    </div>
                  </div>
                </label>
              </div>

              {/* In-Game Load Screen Preview */}
              <div className="bg-slate-950 border border-slate-800 rounded p-3.5 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  In-Game Load Menu Preview
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono tabular-nums">
                  <div>
                    <div className="text-slate-500">Save File</div>
                    <div className="text-sky-300 font-semibold">{previewExportFileName}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Load Time</div>
                    <div className="text-slate-100">{formatClock(previewPlaytime)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Party Lead</div>
                    <div className="text-slate-100">{previewHeroName}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Room / Spawn</div>
                    <div className="text-slate-300">
                      {previewRoomId} / {previewSpawn}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 space-y-1">
                  <div>PC Steam save folder:</div>
                  <code className="block font-mono text-slate-300 break-words select-all">
                    %USERPROFILE%\Documents\SQUARE ENIX\FINAL FANTASY X&amp;X-2 HD Remaster\FINAL FANTASY X\{previewExportFileName}
                  </code>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExportSave}
                className="px-4 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Apply Marker &amp; Download Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
