import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { Layout } from './components/Layout';
import { LoadingScreen } from './components/LoadingScreen';
import { useDataPrism } from './contexts/DataPrismContext';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const DataExplorerPage = React.lazy(() => import('./pages/DataExplorerPage'));
const VisualizationPage = React.lazy(() => import('./pages/VisualizationPage'));
const QueryLabPage = React.lazy(() => import('./pages/QueryLabPage'));
const PluginsDemoPage = React.lazy(() => import('./pages/PluginsDemoPage'));
const PerformancePage = React.lazy(() => import('./pages/PerformancePage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));

function App() {
  const { isInitialized, initializationError } = useDataPrism();

  // Show loading screen while DataPrism engine initializes
  if (!isInitialized && !initializationError) {
    return <LoadingScreen />;
  }

  return (
    <Layout>
      <React.Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explorer" element={<DataExplorerPage />} />
          <Route path="/visualizations" element={<VisualizationPage />} />
          <Route path="/query-lab" element={<QueryLabPage />} />
          <Route path="/plugins" element={<PluginsDemoPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/about" element={<AboutPage />} />
          
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </Layout>
  );
}

export default App;