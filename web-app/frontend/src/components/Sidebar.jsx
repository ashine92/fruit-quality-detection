import { LayoutDashboard, BarChart3, History, Leaf, Moon, Sun, Cpu, Info } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { motion } from 'motion/react';

export default function Sidebar() {
  const { currentView, setView, isDarkMode, toggleDarkMode } = useUIStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history',   label: 'History',   icon: History },
    { id: 'about',     label: 'About',     icon: Info },
  ];

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <nav className="hidden md:flex flex-col h-screen w-60 bg-surface-container-low border-r border-outline-variant py-6 shrink-0 z-20 sticky top-0">
        {/* Logo */}
        <div className="px-5 mb-8">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md glow-green">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-on-surface tracking-tight leading-none">AgriVision</h2>
              <p className="text-[9px] uppercase font-bold text-primary tracking-[0.12em] leading-tight mt-0.5">Edge AI</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`relative w-full flex items-center px-3.5 h-10 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-primary text-white shadow-md glow-green'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gradient-primary"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="mr-3 w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Bottom: System status + dark mode */}
        <div className="px-3 space-y-2">
          {/* System status badge */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant">
            <Cpu className="w-3.5 h-3.5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant truncate">Edge Device</p>
              <p className="text-[11px] font-bold text-primary truncate">QCS6490</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
            <div className={`w-9 h-5 rounded-full transition-colors duration-300 flex items-center px-0.5 ${isDarkMode ? 'bg-primary' : 'bg-outline-variant'}`}>
              <motion.div
                className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center"
                animate={{ x: isDarkMode ? 16 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {isDarkMode
                  ? <Moon className="w-2.5 h-2.5 text-primary" />
                  : <Sun className="w-2.5 h-2.5 text-amber-500" />
                }
              </motion.div>
            </div>
          </button>
        </div>
      </nav>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-low border-t border-outline-variant backdrop-blur-lg flex items-center justify-around h-16 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center justify-center gap-1 px-4 h-full transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-primary/10' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold tracking-wider uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
