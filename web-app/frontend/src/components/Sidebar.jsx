import { 
  LayoutDashboard, BarChart3, History, Leaf, 
  Moon, Sun, Cpu, Home, ScanLine, ChevronLeft, ChevronRight, Info 
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { motion, AnimatePresence } from 'motion/react';

export default function Sidebar() {
  const { 
    currentView, setView, 
    isDarkMode, toggleDarkMode,
    isSidebarCollapsed, toggleSidebar 
  } = useUIStore();

  const menuItems = [
    { id: 'home',      label: 'Home',      icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'classify',  label: 'Classify',  icon: ScanLine },
    { id: 'history',   label: 'History',   icon: History },
  ];

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <motion.nav 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 88 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col h-screen bg-surface-container-low border-r border-outline-variant py-6 shrink-0 z-20 sticky top-0"
      >
        {/* Toggle Collapse Button */}
        <button 
          onClick={toggleSidebar}
          className="absolute top-7 -right-3 w-6 h-6 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary z-50 transition-colors"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Logo */}
        <div className="px-5 mb-8 flex items-center h-9">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md glow-green shrink-0">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                className="ml-3 whitespace-nowrap"
              >
                <h2 className="text-[15px] font-bold text-on-surface tracking-tight leading-none">AgriVision</h2>
                <p className="text-[9px] uppercase font-bold text-primary tracking-[0.12em] leading-tight mt-0.5">Edge AI</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Menu */}
        <div className="flex-1 space-y-2 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`relative flex items-center px-3.5 h-10 rounded-xl transition-all duration-200 group ${
                  isSidebarCollapsed ? 'w-10 mx-auto justify-center px-0' : 'w-full'
                } ${
                  isActive
                    ? 'bg-gradient-primary text-white shadow-md glow-green'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                {isActive && !isSidebarCollapsed && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gradient-primary"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                
                <Icon className={`w-4 h-4 shrink-0 ${!isSidebarCollapsed ? 'mr-3' : ''}`} />
                
                <AnimatePresence>
                  {!isSidebarCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-[11px] font-bold tracking-wider uppercase whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        {/* Bottom: System status + dark mode */}
        <div className="px-3 space-y-3">
          {/* System status badge */}
          <div className={`flex items-center rounded-xl bg-surface-container border border-outline-variant overflow-hidden transition-all ${
            isSidebarCollapsed ? 'w-10 h-10 mx-auto justify-center px-0' : 'w-full px-3.5 py-2.5 gap-2'
          }`}>
            <Cpu className="w-3.5 h-3.5 text-primary shrink-0" title={isSidebarCollapsed ? "QCS6490 Edge" : undefined} />
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0 whitespace-nowrap"
                >
                  <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant truncate">Edge Device</p>
                  <p className="text-[11px] font-bold text-primary truncate">QCS6490</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!isSidebarCollapsed && <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />}
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            title={isSidebarCollapsed ? (isDarkMode ? 'Light Mode' : 'Dark Mode') : undefined}
            className={`flex items-center rounded-xl bg-surface-container border border-outline-variant hover:bg-surface-container-high transition-colors overflow-hidden ${
              isSidebarCollapsed ? 'w-10 h-10 mx-auto justify-center px-0' : 'w-full px-3.5 py-2.5 justify-between'
            }`}
          >
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                  className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap"
                >
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </motion.span>
              )}
            </AnimatePresence>
            
            <div className={`${isSidebarCollapsed ? 'w-5 h-5 bg-transparent' : 'w-9 h-5 rounded-full px-0.5'} transition-colors duration-300 flex items-center ${
              !isSidebarCollapsed && (isDarkMode ? 'bg-primary' : 'bg-outline-variant')
            }`}>
              <motion.div
                className={`${isSidebarCollapsed ? 'w-full h-full bg-transparent shadow-none' : 'w-4 h-4 rounded-full bg-white shadow-sm'} flex items-center justify-center`}
                animate={{ x: isSidebarCollapsed ? 0 : (isDarkMode ? 16 : 0) }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {isDarkMode
                  ? <Moon className={`${isSidebarCollapsed ? 'w-4 h-4 text-primary' : 'w-2.5 h-2.5 text-primary'}`} />
                  : <Sun className={`${isSidebarCollapsed ? 'w-4 h-4 text-amber-500' : 'w-2.5 h-2.5 text-amber-500'}`} />
                }
              </motion.div>
            </div>
          </button>
        </div>
      </motion.nav>

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
