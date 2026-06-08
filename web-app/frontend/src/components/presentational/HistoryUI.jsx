/**
 * HistoryUI — Presentational Component
 * Grid of snapshot cards, filter by class, date search, modal detail view
 */
import { useState, useMemo } from 'react';
import { Search, Filter, X, Camera, Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CLASS_COLORS = {
  Ripe:     '#22c55e',
  Unripe:   '#eab308',
  Overripe: '#f97316',
  Rotten:   '#ef4444',
};
const CLASS_LABELS = ['All', 'Ripe', 'Unripe', 'Overripe', 'Rotten'];

const PAGE_SIZE = 12;

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="animate-shimmer rounded-2xl h-56" />
  );
}

/* ── Snapshot Card ── */
function SnapshotCard({ log, onClick }) {
  const color = CLASS_COLORS[log.className] || '#9ca3af';
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(log)}
      className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
    >
      {/* Image */}
      <div className="relative bg-black h-36 flex items-center justify-center overflow-hidden">
        {log.snapshotUrl && !imgError ? (
          <img
            src={log.snapshotUrl}
            alt={log.id}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <Camera className="w-10 h-10 text-outline-variant opacity-40" />
        )}
        {/* Class badge */}
        <div
          className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-wider shadow-lg"
          style={{ backgroundColor: color }}
        >
          {log.className}
        </div>
        {/* Confidence overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${log.confidence}%`, backgroundColor: color }} />
            </div>
            <span className="text-white text-[10px] font-bold">{log.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[10px] font-black text-on-surface font-mono">{log.id}</p>
        <p className="text-[9px] text-on-surface-variant mt-0.5 truncate">{log.timestamp}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="h-1 flex-1 bg-surface-container rounded-full overflow-hidden mr-2">
            <div className="h-full rounded-full" style={{ width: `${log.confidence}%`, backgroundColor: color }} />
          </div>
          <span className="text-[10px] font-black" style={{ color }}>{log.confidence}%</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Component ── */
export default function HistoryUI({ logs, isLoading, onLabelAssign }) {
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [page, setPage] = useState(1);

  /* Filter */
  const filtered = useMemo(() => {
    if (!logs) return [];
    return logs.filter(l => {
      const matchSearch = !searchQuery ||
        l.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.className?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.timestamp?.includes(searchQuery);
      const matchClass = filterClass === 'All' || l.className === filterClass;
      return matchSearch && matchClass;
    });
  }, [logs, searchQuery, filterClass]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (cls) => {
    setFilterClass(cls);
    setPage(1);
  };

  /* CSV Export */
  const handleExportCSV = () => {
    if (!filtered.length) return;
    const headers = ['ID', 'Timestamp', 'Class', 'Confidence', 'Human Label'];
    const rows = filtered.map(l => [l.id, l.timestamp, l.className, l.confidence + '%', l.humanLabel || '']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'history.csv'; a.click();
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-headline-lg text-on-surface">Snapshot History</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {filtered.length} records · Browse all classification snapshots
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center px-4 py-2 rounded-xl glass-card text-[11px] font-bold uppercase tracking-wider text-on-surface hover:bg-surface-container transition-colors"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search by ID, class, or date..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-card text-sm text-on-surface outline-none focus:border-primary border border-transparent focus:border transition-all"
          />
        </div>

        {/* Class pills */}
        <div className="flex gap-2 flex-wrap">
          {CLASS_LABELS.map(cls => (
            <button
              key={cls}
              onClick={() => handleFilterChange(cls)}
              className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                filterClass === cls
                  ? 'bg-gradient-primary text-white shadow-md glow-green'
                  : 'glass-card text-on-surface-variant hover:bg-surface-container'
              }`}
              style={filterClass === cls && cls !== 'All' ? { backgroundColor: CLASS_COLORS[cls] } : {}}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass-card rounded-2xl">
          <Camera className="w-12 h-12 text-on-surface-variant opacity-30 mb-3" />
          <p className="text-on-surface-variant font-medium">No snapshots found</p>
          <p className="text-on-surface-variant text-sm opacity-70 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {paginated.map((log, i) => (
              <SnapshotCard key={log.id} log={log} onClick={setSelectedLog} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl glass-card disabled:opacity-40 hover:bg-surface-container transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-on-surface" />
          </button>
          <span className="text-sm font-bold text-on-surface-variant">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl glass-card disabled:opacity-40 hover:bg-surface-container transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-on-surface" />
          </button>
        </div>
      )}

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {selectedLog && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setSelectedLog(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-card rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/60">
                <div>
                  <h3 className="text-headline-sm text-on-surface">Snapshot Detail</h3>
                  <p className="text-[10px] text-on-surface-variant font-mono">{selectedLog.id}</p>
                </div>
                <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Image */}
                <div className="w-full bg-black rounded-xl overflow-hidden h-52 flex items-center justify-center">
                  {selectedLog.snapshotUrl ? (
                    <img src={selectedLog.snapshotUrl} alt={selectedLog.id} className="max-h-full object-contain" />
                  ) : (
                    <Camera className="w-12 h-12 text-outline-variant opacity-30" />
                  )}
                </div>

                {/* Meta */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant text-center">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Class</p>
                    <p className="font-black text-sm" style={{ color: CLASS_COLORS[selectedLog.className] }}>{selectedLog.className}</p>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant text-center">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Confidence</p>
                    <p className={`font-black text-sm ${selectedLog.confidence < 80 ? 'text-red-500' : 'text-green-600'}`}>
                      {selectedLog.confidence}%
                    </p>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant text-center">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Status</p>
                    <p className={`font-black text-sm ${selectedLog.isCorrected ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {selectedLog.isCorrected ? 'Verified' : 'Pending'}
                    </p>
                  </div>
                </div>

                {/* Label */}
                <div className="border-t border-outline-variant pt-4">
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-3 text-center">Label This Snapshot</p>
                  {selectedLog.isCorrected ? (
                    <div className="bg-primary/10 text-primary p-3 rounded-xl text-center font-bold text-sm border border-primary/20">
                      ✓ Labelled as: {selectedLog.humanLabel}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {['Ripe', 'Unripe', 'Overripe', 'Rotten'].map(label => (
                        <button
                          key={label}
                          onClick={() => {
                            if (onLabelAssign) onLabelAssign(selectedLog.rawId, label);
                            setSelectedLog({ ...selectedLog, isCorrected: 1, humanLabel: label });
                          }}
                          className="py-2.5 text-[10px] font-black rounded-xl text-white hover:scale-105 active:scale-95 transition-transform"
                          style={{ backgroundColor: CLASS_COLORS[label] }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
