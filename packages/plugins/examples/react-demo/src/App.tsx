import React, { useState } from "react";
import "./App.css";
import { PluginManager } from "./components/PluginManager";
import { DataProcessor } from "./components/DataProcessor";
import { ChartVisualization } from "./components/ChartVisualization";
import { LLMIntegration } from "./components/LLMIntegration";
import { SystemMonitor } from "./components/SystemMonitor";
import { usePluginSystem } from "./hooks/usePluginSystem";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { pluginSystem, isInitialized, activePlugins, systemStatus } =
    usePluginSystem();

  const tabs = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "data", label: "Data Processing", icon: "📊" },
    { id: "charts", label: "Visualization", icon: "📈" },
    { id: "llm", label: "LLM Integration", icon: "🤖" },
    { id: "monitor", label: "System Monitor", icon: "🔧" },
    { id: "plugins", label: "Plugin Manager", icon: "🔌" },
  ];

  const renderTabContent = () => {
    if (!isInitialized) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Initializing DataPrism Plugin System...</p>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return (
          <div className="overview-container">
            <h2>🚀 DataPrism Plugin System Demo</h2>
            <div className="overview-grid">
              <div className="overview-card">
                <h3>🔌 Plugin Status</h3>
                <p>
                  <strong>Active Plugins:</strong> {activePlugins.length}
                </p>
                <ul>
                  {activePlugins.map((plugin) => (
                    <li key={plugin}>{plugin}</li>
                  ))}
                </ul>
              </div>
              <div className="overview-card">
                <h3>⚡ System Health</h3>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status ${systemStatus}`}>
                    {systemStatus}
                  </span>
                </p>
                <p>
                  <strong>Memory:</strong> ~{Math.floor(Math.random() * 100)}MB
                </p>
                <p>
                  <strong>Response Time:</strong> ~
                  {Math.floor(Math.random() * 100)}ms
                </p>
              </div>
              <div className="overview-card">
                <h3>📋 Available Features</h3>
                <ul>
                  <li>✅ CSV Data Processing</li>
                  <li>✅ Interactive Charts</li>
                  <li>✅ LLM Analysis</li>
                  <li>✅ Performance Monitoring</li>
                  <li>✅ Plugin Management</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "data":
        return <DataProcessor pluginSystem={pluginSystem} />;
      case "charts":
        return <ChartVisualization pluginSystem={pluginSystem} />;
      case "llm":
        return <LLMIntegration pluginSystem={pluginSystem} />;
      case "monitor":
        return <SystemMonitor pluginSystem={pluginSystem} />;
      case "plugins":
        return <PluginManager pluginSystem={pluginSystem} />;
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🔮 DataPrism Plugin Demo</h1>
          <p>Interactive demonstration of the DataPrism Plugin System</p>
        </div>
      </header>

      <nav className="app-nav">
        <div className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="app-main">
        <div className="main-content">{renderTabContent()}</div>
      </main>

      <footer className="app-footer">
        <p>DataPrism Plugin System • Built with React & TypeScript</p>
      </footer>
    </div>
  );
};

export default App;
