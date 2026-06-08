/**
 * AnalyticsUI — Presentational Component
 * KPI cards, live charts, search/filter, CSV export, skeleton loading
 */
import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { RefreshCw, X, Download, Search, Filter, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

const CLASS_COLORS = {
  Ripe:     '#22c55e',
  Unripe:   '#eab308',
  Overripe: '#f97316',
  Rotten:   '#ef4444',
};
const CLASS_LABELS = ['Ripe', 'Unripe', 'Overripe', 'Rotten'];

/* ── Skeleton ── */
function Skeleton({ className = '' }) {
  return <div className={`animate-shimmer rounded-xl ${className}`} />;
}

/* ── KPI Card ── */
function KpiCard({ label, value, sub, icon: Icon, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card rounded-2xl p-5 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '20' }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest truncate">{label}</p>
        <p className="text-2xl font-black text-on-surface leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-on-surface-variant font-medium">{sub}</p>}
      </div>
    </motion.div>
  );
}

/* ── Custom Tooltip ── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl px-4 py-3 text-xs shadow-xl">
      <p className="font-bold text-on-surface mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-on-surface-variant capitalize">{p.dataKey}:</span>
          <span className="font-bold text-on-surface">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ── */
export default function AnalyticsUI({ trendData, logs, onRefresh, onLabelAssign }) {
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('All');

  /* CSV Export */
  const handleExportCSV = () => {
    if (!logs?.length) return;
    const headers = ['ID', 'Timestamp', 'Class', 'Confidence', 'Human Label', 'Corrected'];
    const rows = logs.map(l => [l.id, l.timestamp, l.className, l.confidence + '%', l.humanLabel || '', l.isCorrected ? 'Yes' : 'No']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'inference_logs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  /* Filter */
  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter(l => {
      const matchSearch = l.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.className?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = filterClass === 'All' || l.className === filterClass;
      return matchSearch && matchClass;
    });
  }, [logs, searchQuery, filterClass]);

  /* KPI computation */
  const kpiData = useMemo(() => {
    if (!logs?.length) return { total: 0, ripeRate: 0, rejectedRate: 0, avgConf: 0 };
    const total = logs.length;
    const ripe = logs.filter(l => l.className === 'Ripe' || l.className === 'Unripe').length;
    const rejected = logs.filter(l => l.className === 'Overripe' || l.className === 'Rotten').length;
    const avgConf = (logs.reduce((s, l) => s + parseFloat(l.confidence || 0), 0) / total).toFixed(1);
    return {
      total,
      ripeRate: ((ripe / total) * 100).toFixed(1),
      rejectedRate: ((rejected / total) * 100).toFixed(1),
      avgConf,
    };
  }, [logs]);

  /* Pie data from live logs */
  const pieData = useMemo(() => {
    if (!logs?.length) return CLASS_LABELS.map(l => ({ name: l, value: 0, color: CLASS_COLORS[l] }));
    const counts = {};
    CLASS_LABELS.forEach(l => counts[l] = 0);
    logs.forEach(l => { if (counts[l.className] !== undefined) counts[l.className]++; });
    return CLASS_LABELS.map(name => ({ name, value: counts[name], color: CLASS_COLORS[name] }));
  }, [logs]);

  const totalPie = pieData.reduce((s, d) => s + d.value, 1);
  const passRate = (((pieData[0].value + pieData[1].value) / totalPie) * 100).toFixed(1);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-headline-lg text-on-surface">Analytics & Quality Control</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Monitor performance trends and prediction accuracy</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 rounded-xl glass-card text-[11px] font-bold uppercase tracking-wider text-on-surface hover:bg-surface-container transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
          </button>
          <button
            onClick={onRefresh}
            className="flex items-center px-4 py-2 rounded-xl bg-gradient-primary text-white text-[11px] font-bold uppercase tracking-wider shadow-md glow-green hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Records" value={kpiData.total.toLocaleString()} sub="in database" icon={Award} color="#22c55e" delay={0} />
        <KpiCard label="Pass Rate" value={`${kpiData.ripeRate}%`} sub="Ripe + Unripe" icon={TrendingUp} color="#f59e0b" delay={0.08} />
        <KpiCard label="Rejected" value={`${kpiData.rejectedRate}%`} sub="Overripe + Rotten" icon={TrendingDown} color="#ef4444" delay={0.16} />
        <KpiCard label="Avg Confidence" value={`${kpiData.avgConf}%`} sub="all predictions" icon={AlertTriangle} color="#8b5cf6" delay={0.24} />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="text-headline-sm text-on-surface mb-5">Yield Trend (by Grade)</h3>
          {!trendData ? (
            <Skeleton className="h-[300px]" />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#eab308" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#22c55e22" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#166534', fontSize: 11, fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#166534', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="gradeA" stroke="#22c55e" fill="url(#colorA)" strokeWidth={2.5} name="Ripe" />
                  <Area type="monotone" dataKey="gradeB" stroke="#eab308" fill="url(#colorB)" strokeWidth={2} strokeDasharray="5 4" name="Unripe" />
                  <Area type="monotone" dataKey="rejected" stroke="#ef4444" fill="transparent" strokeWidth={1.5} name="Rejected" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <h3 className="text-headline-sm text-on-surface mb-4">Classification Breakdown</h3>
          <div className="flex-1 relative flex items-center justify-center">
            <div className="absolute text-center pointer-events-none">
              <span className="text-3xl font-black text-on-surface">{passRate}%</span>
              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">Pass Rate</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value" startAngle={90} endAngle={-270}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5 mt-2">
            {pieData.map(item => (
              <div key={item.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-on-surface-variant font-medium text-xs">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-on-surface font-bold text-xs">{item.value.toLocaleString()}</span>
                  <span className="text-on-surface-variant text-[10px]">({((item.value / totalPie) * 100).toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Log Table ── */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="px-5 py-4 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center gap-3 bg-surface-container-low/60">
          <div className="flex-1">
            <h3 className="text-headline-sm text-on-surface">Prediction Logs</h3>
            <p className="text-[10px] text-on-surface-variant mt-0.5">{filteredLogs.length} records · Double-click to review</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search ID or class..."
                className="pl-8 pr-3 py-2 rounded-xl bg-surface-container border border-outline-variant text-[11px] font-medium text-on-surface w-44 outline-none focus:border-primary transition-colors"
              />
            </div>
            {/* Class filter */}
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
              <select
                value={filterClass}
                onChange={e => setFilterClass(e.target.value)}
                className="pl-8 pr-3 py-2 rounded-xl bg-surface-container border border-outline-variant text-[11px] font-bold text-on-surface outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option>All</option>
                {CLASS_LABELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/40 text-[9px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">
                <th className="px-5 py-3.5">Serial ID</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">AI Class</th>
                <th className="px-5 py-3.5">Human Label</th>
                <th className="px-5 py-3.5">Confidence</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredLogs.map((log) => {
                const classColor = CLASS_COLORS[log.className] || '#9ca3af';
                return (
                  <tr
                    key={log.id}
                    onDoubleClick={() => setSelectedLog(log)}
                    className="hover:bg-surface-container/40 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 text-[11px] font-black text-on-surface font-mono">{log.id}</td>
                    <td className="px-5 py-3.5 text-[11px] text-on-surface-variant font-medium">{log.timestamp}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                        style={{ backgroundColor: classColor }}
                      >
                        {log.className}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {log.isCorrected ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                          {log.humanLabel}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant text-xs font-medium">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 rounded-full bg-surface-container overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${log.confidence}%`, backgroundColor: log.confidence < 80 ? '#ef4444' : '#22c55e' }}
                          />
                        </div>
                        <span className={`text-[11px] font-black ${log.confidence < 80 ? 'text-red-500' : 'text-green-600'}`}>
                          {log.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {log.isCorrected ? (
                        <span className="text-[9px] font-bold text-primary px-2.5 py-1.5 bg-primary/10 rounded-lg uppercase">Labelled</span>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                          className="text-[9px] font-black text-white px-3 py-1.5 bg-gradient-primary rounded-lg hover:opacity-90 transition-opacity uppercase shadow-sm"
                        >
                          Label
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-on-surface-variant text-sm font-medium">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          onClick={() => setSelectedLog(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/60 shrink-0">
              <div>
                <h3 className="text-headline-sm text-on-surface">Detection Detail</h3>
                <p className="text-[10px] text-on-surface-variant font-mono">{selectedLog.id}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center overflow-y-auto gap-5">
              {/* Image */}
              {selectedLog.snapshotUrl ? (
                <div className="w-full bg-black rounded-xl overflow-hidden flex justify-center border border-outline-variant">
                  <img
                    src={selectedLog.snapshotUrl}
                    alt={`Snapshot ${selectedLog.id}`}
                    className="max-h-64 object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              ) : (
                <div className="w-full h-40 glass-card rounded-xl flex items-center justify-center border-dashed border-2 border-outline-variant">
                  <p className="text-on-surface-variant text-sm font-medium">No snapshot available</p>
                </div>
              )}

              {/* Meta grid */}
              <div className="w-full grid grid-cols-2 gap-3 text-sm">
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                  <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">AI Classification</p>
                  <p className="font-black text-lg" style={{ color: CLASS_COLORS[selectedLog.className] || '#9ca3af' }}>
                    {selectedLog.className}
                  </p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                  <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Confidence</p>
                  <p className={`font-black text-lg ${selectedLog.confidence < 80 ? 'text-red-500' : 'text-green-600'}`}>
                    {selectedLog.confidence}%
                  </p>
                </div>
                <div className="col-span-2 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                  <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Timestamp</p>
                  <p className="font-bold text-on-surface">{selectedLog.timestamp}</p>
                </div>
              </div>

              {/* Label section */}
              <div className="w-full border-t border-outline-variant pt-4">
                <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-3 text-center">Human Verification</p>
                {selectedLog.isCorrected ? (
                  <div className="bg-primary/10 text-primary p-3 rounded-xl text-center font-bold text-sm border border-primary/20">
                    ✓ Labelled as: {selectedLog.humanLabel}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {CLASS_LABELS.map(label => (
                      <button
                        key={label}
                        onClick={() => {
                          if (onLabelAssign) onLabelAssign(selectedLog.rawId, label);
                          setSelectedLog({ ...selectedLog, isCorrected: 1, humanLabel: label });
                        }}
                        className="py-2.5 text-xs font-black rounded-xl border transition-all hover:scale-105 active:scale-95 text-white"
                        style={{ backgroundColor: CLASS_COLORS[label], borderColor: CLASS_COLORS[label] + '44' }}
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
    </div>
  );
}
