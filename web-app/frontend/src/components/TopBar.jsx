import { Activity, Wifi, Clock } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="flex justify-between items-center w-full px-6 h-14 bg-surface-container-highest border-b border-outline-variant shrink-0 z-10 sticky top-0">
      <div className="text-xl font-black text-primary tracking-tight">
        BANANA AI-SCAN v2.0
      </div>
      <div className="flex items-center space-x-2">
        <button className="h-10 w-10 flex items-center justify-center hover:bg-surface-variant transition-colors rounded-full text-on-surface-variant">
          <Activity className="w-5 h-5" />
        </button>
        <button className="h-10 w-10 flex items-center justify-center hover:bg-surface-variant transition-colors rounded-full text-on-surface-variant">
          <Wifi className="w-5 h-5" />
        </button>
        <button className="h-10 w-10 flex items-center justify-center hover:bg-surface-variant transition-colors rounded-full text-on-surface-variant">
          <Clock className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
