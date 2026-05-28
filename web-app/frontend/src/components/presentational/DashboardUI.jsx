/**
 * DashboardUI - Presentational Component (JavaScript Version)
 */
import { useState, useEffect } from 'react';
import { Activity, Camera, Play, Square } from 'lucide-react';
import { motion } from 'motion/react';

export default function DashboardUI({ stats, telemetry, latestLog, videoFrame, isClassifying, onToggleClassification }) {
  if (!stats || !telemetry) return null;

  const categories = [
    { label: 'Ripe', value: stats.counts.Ripe || 0, color: '#22c55e' },
    { label: 'Unripe', value: stats.counts.Unripe || 0, color: '#eab308' },
    { label: 'Overripe', value: stats.counts.Overripe || 0, color: '#f97316' },
    { label: 'Rotten', value: stats.counts.Rotten || 0, color: '#ef4444' },
  ];

  const total = stats.totalInspected || 1; // Prevent division by zero

  const latestClass = latestLog ? latestLog.className : 'WAITING';
  const latestConf = latestLog ? latestLog.confidence : 0;
  
  // Find color for the latest class, default to gray if unknown
  const latestColor = categories.find(c => c.label.toUpperCase() === latestClass.toUpperCase())?.color || '#9ca3af';

  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (latestLog && latestLog.id) {
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [latestLog?.id]);

  // If no video stream is received, show placeholder text or static image
  const imageSource = videoFrame || "https://lh3.googleusercontent.com/aida-public/AB6AXuCApIlBt7WaYKVZ-XDEP-YFuFY3K-yeedOb5dt_zOkoQES_pfWOXdv_mbkL3C5BiAeltdwvWma9UhgOdQ9plu3opvOBsOjBqvndVlqdOJnFnZ5sKczfHqWQfS5fjAd8RoZl6bVuJGaiBxCM-lBQdGR5cVh9IcxPyuhMpTT9HnzXQn6oeXBu8iLMkJAxb4NLT7uvB5WmCGUFR7GD7XjGJkW72G28ESyg9SaB-f1b08EawKm6wRAsiUqkGbOolGfkj6_KC2iuq5PtX2rG";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
            <div className="flex items-center gap-4">
              <h3 className="text-headline-sm text-on-surface">Live Vision Feed</h3>
              <button 
                onClick={onToggleClassification}
                className={`flex items-center px-4 py-1.5 rounded-full text-sm font-bold tracking-wide transition-all ${
                  isClassifying 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' 
                    : 'bg-primary text-on-primary hover:bg-primary-hover shadow-sm'
                }`}
              >
                {isClassifying ? (
                  <>
                    <Square className="w-4 h-4 mr-2 fill-current" />
                    Stop Classification
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Start Classification
                  </>
                )}
              </button>
            </div>
            <span className="flex items-center text-label-bold text-red-600 uppercase text-[10px] tracking-widest">
              <span className={`h-2 w-2 rounded-full mr-2 ${videoFrame ? 'bg-red-600 animate-pulse' : 'bg-gray-400'}`}></span>
              {videoFrame ? 'LIVE' : 'NO STREAM'}
            </span>
          </div>
          <div className="relative flex-1 bg-black aspect-video flex items-center justify-center overflow-hidden">
            <img 
              alt="Camera feed" 
              className={`w-full h-full object-cover ${!videoFrame ? 'opacity-50 grayscale' : ''}`} 
              src={imageSource} 
            />
            <motion.div
              key={latestLog?.id || 'empty'}
              initial={{ opacity: 0 }}
              animate={{ opacity: showFlash ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 border-8 pointer-events-none flex p-4"
              style={{ borderColor: showFlash ? latestColor : 'transparent' }}
            >
              {showFlash && (
                <div 
                  className="absolute top-4 right-4 text-white px-4 py-2 text-sm font-bold tracking-widest uppercase rounded shadow-lg bg-opacity-90"
                  style={{ backgroundColor: latestColor }}
                >
                  {latestClass} - {latestConf}%
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-outline-variant bg-[#fff7ed]">
            <h3 className="text-headline-sm text-[#c2410c]">Current Detection</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="text-display-lg mb-1" style={{ color: latestColor }}>
                {latestClass.toUpperCase()}
              </div>
              <div className="text-lg text-on-surface-variant font-medium">Confidence: {latestConf}%</div>
            </div>
            <div className="space-y-4">
               {categories.map((cat) => {
                  const percent = ((cat.value / total) * 100).toFixed(1);
                  return (
                    <div key={cat.label} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-on-surface-variant uppercase">
                        <span>{cat.label}</span>
                      </div>
                      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                         <div 
                           className="h-full rounded-full transition-all duration-500 ease-out" 
                           style={{ width: `${percent}%`, backgroundColor: cat.color }} 
                         />
                      </div>
                    </div>
                  );
               })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="col-span-2 md:col-span-3 lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Inspected</p>
            <p className="text-display-md text-on-surface">{stats.totalInspected.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Yield Rate</p>
            <p className="text-display-md text-primary">{stats.yieldRate}%</p>
          </div>
        </div>

        {categories.map((cat) => (
          <div 
            key={cat.label} 
            className="bg-surface-container-lowest border-l-4 rounded-xl p-4 shadow-sm"
            style={{ borderLeftColor: cat.color }}
          >
            <p className="text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-widest">{cat.label}</p>
            <p className="text-2xl font-bold text-on-surface">{cat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-8 items-center text-label-bold text-on-surface-variant px-2">
        <div className="flex items-center">
          <Activity className="w-4 h-4 mr-2 text-outline" />
          <span>Inference: <span className="text-on-surface">{telemetry.inferenceTimeMs}ms</span></span>
        </div>
        <div className="flex items-center">
          <Camera className="w-4 h-4 mr-2 text-outline" />
          <span>FPS: <span className="text-on-surface">{telemetry.fps}</span></span>
        </div>
        <div className="flex items-center ml-auto">
          <span className={`h-2 w-2 rounded-full mr-2 ${telemetry.status === 'Nominal' ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-green-700 uppercase text-[10px] tracking-widest font-bold">System {telemetry.status}</span>
        </div>
      </div>
    </div>
  );
}
