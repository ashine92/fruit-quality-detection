/**
 * DashboardUI — Presentational Component
 * Full redesign: Glassmorphism, count-up, confidence gauge, FPS overlay
 */
import { useState, useEffect, useRef } from 'react';
import { Activity, Camera, Play, Square, Leaf, Zap, CheckCircle, XCircle, AlertCircle, TrendingUp, PictureInPicture2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/* ── Count-Up Hook ── */
function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = Date.now();
    const startVal = 0;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return value;
}

/* ── Confidence Gauge ── */
function ConfidenceGauge({ value = 0, color = '#22c55e' }) {
  const r = 52;
  const circumference = Math.PI * r; // semi-circle arc length
  const offset = circumference - (value / 100) * circumference;

  // Arc: center=(70,72), radius=52, from left to right along top
  const arcD = `M ${70 - r} 72 A ${r} ${r} 0 0 1 ${70 + r} 72`;

  return (
    <svg width="150" height="95" viewBox="0 0 150 95" className="overflow-visible">
      {/* Track */}
      <path
        d={arcD}
        fill="none"
        stroke="#dcfce7"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Progress arc */}
      <path
        d={arcD}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 0.8s ease-out',
          filter: `drop-shadow(0 0 5px ${color}99)`,
        }}
      />
      {/* Center dot */}
      <circle cx="70" cy="72" r="5" fill={color} />
      {/* Percentage text — inside SVG, no overlap */}
      <text
        x="70"
        y="58"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="22"
        fontWeight="900"
        fontFamily="Outfit, sans-serif"
        fill={color}
      >
        {value.toFixed(1)}%
      </text>
    </svg>
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, icon: Icon, color, suffix = '', delay = 0 }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0, 1200);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="glass-card rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '22' }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-on-surface leading-none">
          {typeof value === 'number' ? animated.toLocaleString() : value}
          <span className="text-base font-bold text-on-surface-variant ml-1">{suffix}</span>
        </p>
      </div>
      {/* Decorative bar */}
      <div className="absolute bottom-0 left-0 h-1 rounded-b-2xl w-full" style={{ backgroundColor: color + '44' }}>
        <motion.div
          className="h-full rounded-b-2xl"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: delay + 0.3, duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

/* ── Skeleton ── */
function Skeleton({ className = '' }) {
  return <div className={`animate-shimmer rounded-xl ${className}`} />;
}

/* ── Main Component ── */
export default function DashboardUI({
  stats, telemetry, latestLog,
  videoRef, isStreamActive,
  isClassifying, onToggleClassification,
  onCaptureSnapshot,
  onTogglePiP, isPiP,
}) {
  if (!stats || !telemetry) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const categories = [
    { label: 'Ripe',     value: stats.counts.Ripe     || 0, color: '#22c55e', icon: CheckCircle },
    { label: 'Unripe',   value: stats.counts.Unripe   || 0, color: '#eab308', icon: AlertCircle },
    { label: 'Overripe', value: stats.counts.Overripe || 0, color: '#f97316', icon: AlertCircle },
    { label: 'Rotten',   value: stats.counts.Rotten   || 0, color: '#ef4444', icon: XCircle },
  ];

  const total = stats.totalInspected || 1;
  const latestClass = latestLog ? latestLog.className : 'WAITING';
  const latestConf  = latestLog ? parseFloat(latestLog.confidence) : 0;
  const latestColor = categories.find(c => c.label.toUpperCase() === latestClass.toUpperCase())?.color || '#9ca3af';

  const [showFlash, setShowFlash] = useState(false);
  useEffect(() => {
    if (latestLog?.id) {
      setShowFlash(true);
      const t = setTimeout(() => setShowFlash(false), 3000);
      return () => clearTimeout(t);
    }
  }, [latestLog?.id]);

  const statusColor = telemetry.status === 'Idle' ? '#22c55e'
    : telemetry.status === 'Classifying' ? '#f59e0b'
    : '#9ca3af';

  const PLACEHOLDER = "https://lh3.googleusercontent.com/aida-public/AB6AXuCApIlBt7WaYKVZ-XDEP-YFuFY3K-yeedOb5dt_zOkoQES_pfWOXdv_mbkL3C5BiAeltdwvWma9UhgOdQ9plu3opvOBsOjBqvndVlqdOJnFnZ5sKczfHqWQfS5fjAd8RoZl6bVuJGaiBxCM-lBQdGR5cVh9IcxPyuhMpTT9HnzXQn6oeXBu8iLMkJAxb4NLT7uvB5WmCGUFR7GD7XjGJkW72G28ESyg9SaB-f1b08EawKm6wRAsiUqkGbOolGfkj6_KC2iuq5PtX2rG";

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-headline-lg text-on-surface flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            Live Dashboard
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Real-time fruit quality monitoring · Edge AI</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-[10px] font-bold uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
            <span style={{ color: statusColor }}>{telemetry.status}</span>
          </div>
          <div className="px-3 py-1.5 rounded-full glass-card text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            <Activity className="w-3 h-3 inline mr-1 text-primary" />
            {telemetry.inferenceTimeMs}ms · {telemetry.fps} FPS
          </div>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Inspected" value={stats.totalInspected} icon={Camera} color="#22c55e" delay={0} />
        <StatCard label="Yield Rate" value={parseFloat(stats.yieldRate)} icon={TrendingUp} color="#f59e0b" suffix="%" delay={0.08} />
        <StatCard label="Ripe · Unripe" value={(stats.counts.Ripe||0) + (stats.counts.Unripe||0)} icon={CheckCircle} color="#16a34a" delay={0.16} />
        <StatCard label="Rejected" value={(stats.counts.Overripe||0) + (stats.counts.Rotten||0)} icon={XCircle} color="#dc2626" delay={0.24} />
      </div>

      {/* ── Main Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Video Feed */}
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/60">
            <div className="flex items-center gap-3">
              <h3 className="text-headline-sm text-on-surface">Live Vision Feed</h3>
              <button
                onClick={onToggleClassification}
                className={`flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all duration-200 ${
                  isClassifying
                    ? 'bg-red-500/10 text-red-500 border border-red-400/30 hover:bg-red-500/20'
                    : 'bg-gradient-primary text-white shadow-md glow-green hover:opacity-90'
                }`}
              >
                {isClassifying
                  ? <><Square className="w-3 h-3 mr-1.5 fill-current" />Stop AI</>
                  : <><Play className="w-3 h-3 mr-1.5 fill-current" />Start AI</>
                }
              </button>
              <button
                onClick={onCaptureSnapshot}
                className="flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high"
              >
                <Camera className="w-3 h-3 mr-1.5" />
                Snapshot
              </button>
              {/* PiP Button */}
              {document.pictureInPictureEnabled && (
                <button
                  onClick={onTogglePiP}
                  title={isPiP ? 'Exit Picture-in-Picture' : 'Picture-in-Picture'}
                  className={`flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all border ${
                    isPiP
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-surface-container border-outline-variant text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <PictureInPicture2 className="w-3 h-3 mr-1.5" />
                  PiP
                </button>
              )}
            </div>
            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${isStreamActive ? 'text-red-500' : 'text-on-surface-variant'}`}>
              <span className={`h-2 w-2 rounded-full ${isStreamActive ? 'bg-red-500 animate-pulse' : 'bg-outline-variant'}`} />
              {isStreamActive ? 'LIVE' : 'NO STREAM'}
            </span>
          </div>

          {/* Video */}
          <div className="relative flex-1 bg-black aspect-video flex items-center justify-center overflow-hidden">
            <img
              ref={videoRef}
              alt="Camera feed"
              className={`w-full h-full object-cover transition-all duration-500 ${!isStreamActive ? 'opacity-30 grayscale' : 'opacity-100'}`}
              src={isStreamActive ? undefined : PLACEHOLDER}
            />

            {/* FPS overlay */}
            {isStreamActive && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[10px] font-bold text-green-400 font-mono tracking-widest">
                {telemetry.fps} FPS
              </div>
            )}

            {/* Detection flash border */}
            <AnimatePresence>
              {showFlash && (
                <motion.div
                  key={latestLog?.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 border-4 pointer-events-none"
                  style={{ borderColor: latestColor, boxShadow: `inset 0 0 40px ${latestColor}44` }}
                >
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-white text-xs font-black uppercase tracking-widest shadow-xl"
                    style={{ backgroundColor: latestColor }}
                  >
                    {latestClass} · {latestConf.toFixed(1)}%
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Detection Panel */}
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-outline-variant bg-surface-container-low/60">
            <h3 className="text-headline-sm text-on-surface">Current Detection</h3>
          </div>
          <div className="p-5 flex-1 flex flex-col">

            {/* Gauge */}
            <div className="flex flex-col items-center mb-4">
              <ConfidenceGauge value={latestConf} color={latestColor} />
              <motion.div
                key={latestClass}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-2xl font-black mt-1 tracking-tight"
                style={{ color: latestColor }}
              >
                {latestClass.toUpperCase()}
              </motion.div>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">Confidence Score</p>
            </div>

            {/* Distribution bars */}
            <div className="space-y-3 mt-auto">
              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Distribution</p>
              {categories.map((cat) => {
                const pct = ((cat.value / total) * 100).toFixed(1);
                return (
                  <div key={cat.label} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase">
                      <span>{cat.label}</span>
                      <span style={{ color: cat.color }}>{pct}%</span>
                    </div>
                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Cards Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="glass-card rounded-2xl p-4 border-l-4"
              style={{ borderLeftColor: cat.color }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{cat.label}</p>
                <Icon className="w-4 h-4" style={{ color: cat.color }} />
              </div>
              <p className="text-2xl font-black text-on-surface">{cat.value.toLocaleString()}</p>
              <p className="text-[10px] text-on-surface-variant mt-1 font-medium">
                {((cat.value / total) * 100).toFixed(1)}% of total
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
