import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardContainer from './components/containers/DashboardContainer';
import AnalyticsContainer from './components/containers/AnalyticsContainer';
import HistoryContainer from './components/containers/HistoryContainer';
import HomeUI from './components/presentational/HomeUI';
import ClassifyUI from './components/presentational/ClassifyUI';
import { StreamProvider } from './context/StreamContext';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from './store/uiStore';

/**
 * Main App Component
 */
export default function App() {
  const { currentView, isDarkMode } = useUIStore();

  // Sync dark mode class on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderView = () => {
    switch (currentView) {
      case 'home':        return <HomeUI />;
      case 'dashboard':   return <DashboardContainer />;
      case 'analytics':   return <AnalyticsContainer />;
      case 'history':     return <HistoryContainer />;
      case 'classify':    return <ClassifyUI />;
      default:            return <HomeUI />;
    }
  };

  return (
    <StreamProvider>
      <div className={`flex min-h-screen bg-surface selection:bg-primary/20 selection:text-primary`}>
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 md:p-8 overflow-auto pb-20 md:pb-8">
            <div className="max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                >
                  {renderView()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </StreamProvider>
  );
}
