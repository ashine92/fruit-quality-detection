import { LayoutDashboard, BarChart3, Settings, LogOut } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export default function Sidebar() {
  const { currentView, setView } = useUIStore();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'configuration', label: 'Configuration', icon: Settings },
  ];

  return (
    <nav className="hidden md:flex flex-col h-screen w-64 bg-surface-container border-r border-outline-variant py-8 shrink-0 z-10 sticky top-0">
      <div className="px-6 mb-8">
        <h2 className="text-headline-sm font-bold text-on-surface tracking-tighter">Node_Alpha_72</h2>
        <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Edge Session 2.0</p>
      </div>

      <div className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-[calc(100%-1.5rem)] flex items-center px-4 h-11 rounded-lg mx-3 text-label-bold transition-all text-xs uppercase tracking-wider ${
                isActive
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              <Icon className="mr-3 w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="px-3 mt-auto">
        <button className="w-full flex items-center px-4 h-11 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-all text-xs font-bold uppercase tracking-wider">
          <LogOut className="mr-3 w-4 h-4" />
          Disconnect
        </button>
      </div>
    </nav>
  );
}
