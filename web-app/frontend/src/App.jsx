import Sidebar from './components/Sidebar';
import DashboardContainer from './components/containers/DashboardContainer';
import AnalyticsContainer from './components/containers/AnalyticsContainer';
import Configuration from './components/Configuration';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from './store/uiStore';

/**
 * Main App Component (JavaScript Version)
 */
export default function App() {
  const { currentView } = useUIStore();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardContainer />;
      case 'analytics':
        return <AnalyticsContainer />;
      case 'configuration':
        return <Configuration />;
      default:
        return <DashboardContainer />;
    }
  };

  return (
    <div className="flex min-h-screen bg-surface selection:bg-primary selection:text-on-primary">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-10 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
