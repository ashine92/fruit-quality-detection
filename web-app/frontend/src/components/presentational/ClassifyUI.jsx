/**
 * ClassifyUI — Drag & drop image upload + AI classification results
 */
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, X, Loader2, CheckCircle2, AlertTriangle, XCircle,
  HelpCircle, Image as ImageIcon, Zap, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { edgeApi } from '../../services/edgeApi';

import { CLASS_COLORS, CLASS_ICONS, normalizeLabel } from '../../utils/theme';

// ── Constants ──────────────────────────────────────
const MAX_FILES = 10;
const MAX_SIZE_MB = 8;

// ── Helpers ────────────────────────────────────────
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Result Card ────────────────────────────────────
function ResultCard({ result, previewUrl, index }) {
  const [expanded, setExpanded] = useState(false);
  const normalizedClass = normalizeLabel(result.className);
  const colorHex = CLASS_COLORS[normalizedClass] || CLASS_COLORS.Unknown;
  const Icon = CLASS_ICONS[normalizedClass] || CLASS_ICONS.Unknown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card rounded-2xl overflow-hidden border-2"
      style={{ backgroundColor: colorHex + '15', borderColor: colorHex + '50' }}
    >
      {/* Image + badge */}
      <div className="relative h-40 bg-black flex items-center justify-center overflow-hidden">
        {previewUrl ? (
          <img src={previewUrl} alt={result.name} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-10 h-10 text-outline-variant opacity-30" />
        )}
        <div
          className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg"
          style={{ backgroundColor: colorHex }}
        >
          <Icon className="w-3 h-3" />
          {normalizedClass}
        </div>
        {result.error && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <p className="text-white text-xs font-bold px-3 text-center">{result.error}</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[11px] font-black text-on-surface truncate mb-3">{result.name}</p>

        {/* Confidence bar */}
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
            <span>Confidence</span>
            <span style={{ color: colorHex }}>{result.confidence}%</span>
          </div>
          <div className="h-2 bg-surface-container rounded-full overflow-hidden border" style={{ borderColor: colorHex + '30' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: colorHex }}
              initial={{ width: 0 }}
              animate={{ width: `${result.confidence}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.06 + 0.2 }}
            />
          </div>
        </div>

        {/* All predictions toggle */}
        {result.allPredictions?.length > 0 && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant hover:text-primary transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            All predictions
          </button>
        )}

        <AnimatePresence>
          {expanded && result.allPredictions?.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5 mt-2">
                {result.allPredictions.map((p) => {
                  const pNorm = normalizeLabel(p.label);
                  const pc = CLASS_COLORS[pNorm] || CLASS_COLORS.Unknown;
                  return (
                    <div key={p.label} className="space-y-0.5">
                      <div className="flex justify-between text-[9px] font-bold text-on-surface-variant uppercase">
                        <span>{pNorm}</span>
                        <span>{p.probability}%</span>
                      </div>
                      <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${p.probability}%`, backgroundColor: pc }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {result.inferenceMs > 0 && (
          <p className="text-[9px] text-on-surface-variant mt-2 font-medium">
            ⚡ {result.inferenceMs}ms · Saved #{result.savedId}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Preview Thumbnail (before classify) ───────────
function PreviewThumb({ file, dataUrl, onRemove }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative group rounded-xl overflow-hidden bg-surface-container border border-outline-variant"
    >
      <div className="h-24 flex items-center justify-center overflow-hidden bg-black">
        {dataUrl
          ? <img src={dataUrl} alt={file.name} className="w-full h-full object-cover" />
          : <ImageIcon className="w-6 h-6 text-outline-variant opacity-40" />
        }
      </div>
      <div className="p-2">
        <p className="text-[9px] font-bold text-on-surface truncate">{file.name}</p>
        <p className="text-[9px] text-on-surface-variant">{formatBytes(file.size)}</p>
      </div>
      <button
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────
export default function ClassifyUI() {
  const [files, setFiles] = useState([]);         // { file, dataUrl }[]
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle');   // idle | loading | done | error
  const [results, setResults] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  // ── Add files ──────────────────────────────────
  const addFiles = useCallback(async (incoming) => {
    const valid = incoming.filter(f => {
      if (!f.type.startsWith('image/')) return false;
      if (f.size > MAX_SIZE_MB * 1024 * 1024) return false;
      return true;
    });

    const remaining = MAX_FILES - files.length;
    const toAdd = valid.slice(0, remaining);

    const withUrls = await Promise.all(
      toAdd.map(async (file) => ({ file, dataUrl: await readFileAsDataUrl(file) }))
    );
    setFiles(prev => [...prev, ...withUrls]);
  }, [files.length]);

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));
  const clearAll   = () => { setFiles([]); setResults([]); setStatus('idle'); };

  // ── Drag & Drop ────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = ()  => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles([...e.dataTransfer.files]);
  };

  // ── Classify ───────────────────────────────────
  const handleClassify = async () => {
    if (!files.length) return;
    setStatus('loading');
    setResults([]);
    setErrorMsg('');
    try {
      const images = files.map(f => ({ name: f.file.name, dataUrl: f.dataUrl }));
      const data   = await edgeApi.classifyImages(images);
      setResults(data.results || []);
      setStatus('done');
    } catch (err) {
      setErrorMsg(err.message || 'Classification failed');
      setStatus('error');
    }
  };

  const hasFiles = files.length > 0;

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-headline-lg text-on-surface flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Image Classify
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Upload fruit images for AI classification · Max {MAX_FILES} images · {MAX_SIZE_MB}MB/image
          </p>
        </div>
        {hasFiles && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-card text-[11px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear all
          </button>
        )}
      </div>

      {/* ── Drop zone ── */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !hasFiles && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer
          ${isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : hasFiles
              ? 'border-outline-variant bg-surface-container-low cursor-default'
              : 'border-outline-variant hover:border-primary hover:bg-primary/5 bg-surface-container-low'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles([...e.target.files])}
        />

        {!hasFiles ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
            >
              <Upload className="w-8 h-8 text-primary" />
            </motion.div>
            <div className="text-center">
              <p className="text-base font-bold text-on-surface">Drag and drop images here</p>
              <p className="text-sm text-on-surface-variant mt-1">or <span className="text-primary font-bold underline">browse files</span></p>
              <p className="text-[11px] text-on-surface-variant mt-2 opacity-70">JPG, PNG, WEBP · Max {MAX_FILES} images · {MAX_SIZE_MB}MB/image</p>
            </div>
          </div>
        ) : (
          /* Preview grid */
          <div className="p-4">
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 mb-3">
              <AnimatePresence>
                {files.map((f, i) => (
                  <PreviewThumb key={f.file.name + i} file={f.file} dataUrl={f.dataUrl} onRemove={() => removeFile(i)} />
                ))}
              </AnimatePresence>
              {/* Add more button */}
              {files.length < MAX_FILES && (
                <button
                  onClick={() => inputRef.current?.click()}
                  className="h-24 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:text-primary transition-all"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-[9px] font-bold">Add more</span>
                </button>
              )}
            </div>
            <p className="text-[10px] text-on-surface-variant px-1">
              {files.length}/{MAX_FILES} images selected
            </p>
          </div>
        )}

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 rounded-2xl bg-primary/10 flex items-center justify-center pointer-events-none">
            <p className="text-primary font-black text-lg">Drop images here!</p>
          </div>
        )}
      </div>

      {/* ── Classify button ── */}
      {hasFiles && status !== 'done' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
          <button
            onClick={handleClassify}
            disabled={status === 'loading'}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-primary text-white font-black text-sm uppercase tracking-widest shadow-xl glow-green hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing {files.length} images...</>
            ) : (
              <><Zap className="w-5 h-5" /> Classify {files.length} images</>
            )}
          </button>
        </motion.div>
      )}

      {/* ── Error ── */}
      {status === 'error' && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Classification failed</p>
            <p className="text-xs mt-0.5">{errorMsg}</p>
            <p className="text-xs mt-1 opacity-70">Ensure the AI service (mock_ai.py) is running on port 5001.</p>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {status === 'done' && results.length > 0 && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <p className="font-bold text-on-surface text-sm">
                Successfully classified <span className="text-primary">{results.length} images</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Ripe','Unripe','Overripe','Rotten','Unknown'].map(cls => {
                const count = results.filter(r => normalizeLabel(r.className) === cls).length;
                if (!count) return null;
                const c = CLASS_COLORS[cls];
                return (
                  <span key={cls} className="px-2.5 py-1 rounded-full text-[10px] font-black text-white" style={{ backgroundColor: c }}>
                    {cls}: {count}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Result cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {results.map((r, i) => (
              <ResultCard
                key={i}
                result={r}
                previewUrl={files[i]?.dataUrl}
                index={i}
              />
            ))}
          </div>

          {/* Re-classify */}
          <div className="flex justify-center pt-2">
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl glass-card text-[11px] font-bold uppercase tracking-wider text-on-surface hover:bg-surface-container transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Classify new images
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
