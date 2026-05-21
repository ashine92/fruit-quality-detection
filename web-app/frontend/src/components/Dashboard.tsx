import { Activity, Camera, RotateCcw, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const categories = [
    { label: 'Ripe', value: '11,702', color: '#22c55e' },
    { label: 'Unripe', value: '1,420', color: '#eab308' },
    { label: 'Overripe', value: '854', color: '#f97316', highlight: true },
    { label: 'Rotten', value: '232', color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Vision */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
            <h3 className="text-headline-sm text-on-surface">Live Vision Feed</h3>
            <span className="flex items-center text-label-bold text-red-600">
              <span className="h-2 w-2 rounded-full bg-red-600 mr-2 animate-pulse"></span> REC
            </span>
          </div>
          <div className="relative flex-1 bg-black aspect-video flex items-center justify-center overflow-hidden">
            <img 
              alt="Camera feed" 
              className="w-full h-full object-cover opacity-90" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCApIlBt7WaYKVZ-XDEP-YFuFY3K-yeedOb5dt_zOkoQES_pfWOXdv_mbkL3C5BiAeltdwvWma9UhgOdQ9plu3opvOBsOjBqvndVlqdOJnFnZ5sKczfHqWQfS5fjAd8RoZl6bVuJGaiBxCM-lBQdGR5cVh9IcxPyuhMpTT9HnzXQn6oeXBu8iLMkJAxb4NLT7uvB5WmCGUFR7GD7XjGJkW72G28ESyg9SaB-f1b08EawKm6wRAsiUqkGbOolGfkj6_KC2iuq5PtX2rG" 
            />
            {/* Bounding Box Overlay */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute border-4 border-[#f97316] w-1/3 h-1/2 top-1/4 left-1/3 shadow-[0_0_20px_rgba(249,115,22,0.5)]"
            >
              <div className="absolute -top-8 left-[-4px] bg-[#f97316] text-white px-2 py-1 text-[10px] font-bold tracking-wider uppercase">
                OVERRIPE 99.6%
              </div>
            </motion.div>
          </div>
        </div>

        {/* Real-time Output */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-outline-variant bg-[#fff7ed]">
            <h3 className="text-headline-sm text-[#c2410c]">Current Detection</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="text-display-lg text-[#ea580c] mb-1">OVERRIPE</div>
              <div className="text-lg text-on-surface-variant font-medium">Confidence: 99.6%</div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-label-bold text-on-surface mb-3 uppercase tracking-widest text-xs">Probability Distribution</h4>
              {[
                { label: 'Unripe', val: 0.1, color: '#eab308' },
                { label: 'Ripe', val: 0.2, color: '#22c55e' },
                { label: 'Overripe', val: 99.6, color: '#f97316', active: true },
                { label: 'Rotten', val: 0.1, color: '#ef4444' },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                    <span className={item.active ? 'text-on-surface' : ''}>{item.label}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.val}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full" 
                      style={{ backgroundColor: item.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="col-span-2 md:col-span-3 lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Inspected</p>
            <p className="text-display-md text-on-surface">14,208</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Yield Rate</p>
            <p className="text-display-md text-primary">82.4%</p>
          </div>
        </div>

        {categories.map((cat) => (
          <div 
            key={cat.label} 
            className="bg-surface-container-lowest border-l-4 rounded-xl p-4 shadow-sm"
            style={{ borderLeftColor: cat.color }}
          >
            <p className="text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-tight">{cat.label}</p>
            <p className="text-2xl font-bold text-on-surface">{cat.value}</p>
          </div>
        ))}
      </div>

      {/* Footer / System Status */}
      <div className="flex flex-wrap gap-8 items-center text-label-bold text-on-surface-variant px-2">
        <div className="flex items-center">
          <Activity className="w-4 h-4 mr-2 text-outline" />
          <span>Inference: <span className="text-on-surface">12ms</span></span>
        </div>
        <div className="flex items-center">
          <Camera className="w-4 h-4 mr-2 text-outline" />
          <span>FPS: <span className="text-on-surface">60.2</span></span>
        </div>
        <div className="flex items-center ml-auto">
          <span className="h-2 w-2 rounded-full bg-[#22c55e] mr-2"></span>
          <span className="text-green-700">System Nominal</span>
        </div>
      </div>
    </div>
  );
}
