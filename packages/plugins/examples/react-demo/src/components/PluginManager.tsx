import React, { useState, useEffect, useMemo } from "react";

interface PluginManagerProps {
  pluginSystem: any;
}

export const PluginManager: React.FC<PluginManagerProps> = ({
  pluginSystem,
}) => {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [, setSelectedPlugin] = useState<string | null>(null);
  const [pluginDetails, setPluginDetails] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  // Mock plugin data for demonstration
  const availablePlugins = useMemo(
    () => [
      {
        name: "csv-processor",
        version: "1.0.0",
        description:
          "Advanced CSV data processing with validation and transformations",
        author: "DataPrism Team",
        category: "data-processing",
        status: "active",
        capabilities: ["parse", "validate", "transform", "batch", "stream"],
        permissions: ["data:read", "data:write"],
        memoryUsage: 15.2,
        lastUsed: new Date(Date.now() - 3600000),
      },
      {
        name: "chart-renderer",
        version: "1.0.0",
        description:
          "Interactive chart rendering with multiple visualization types",
        author: "DataPrism Team",
        category: "visualization",
        status: "active",
        capabilities: ["render", "export", "getTypes", "update"],
        permissions: ["data:read", "dom:write"],
        memoryUsage: 22.8,
        lastUsed: new Date(Date.now() - 1800000),
      },
      {
        name: "llm-integration",
        version: "1.0.0",
        description:
          "LLM integration with multiple providers and intelligent caching",
        author: "DataPrism Team",
        category: "integration",
        status: "active",
        capabilities: ["completion", "analyze", "query", "embedding"],
        permissions: ["network:read", "network:write", "data:read"],
        memoryUsage: 45.1,
        lastUsed: new Date(Date.now() - 900000),
      },
      {
        name: "performance-monitor",
        version: "1.0.0",
        description: "System performance monitoring and security scanning",
        author: "DataPrism Team",
        category: "utility",
        status: "active",
        capabilities: ["getStatus", "healthCheck", "securityScan", "optimize"],
        permissions: ["core:read", "data:read", "storage:write"],
        memoryUsage: 8.7,
        lastUsed: new Date(Date.now() - 300000),
      },
      {
        name: "data-validator",
        version: "0.9.0",
        description: "Advanced data validation and quality assessment",
        author: "Community",
        category: "data-processing",
        status: "inactive",
        capabilities: ["validate", "profile", "clean"],
        permissions: ["data:read"],
        memoryUsage: 0,
        lastUsed: null,
      },
    ],
    [],
  );

  useEffect(() => {
    setPlugins(availablePlugins);
  }, [availablePlugins]);

  const handlePluginAction = async (pluginName: string, action: string) => {
    if (!pluginSystem) return;

    setLoading(`${action}-${pluginName}`);
    try {
      const manager = pluginSystem.getPluginManager();

      switch (action) {
        case "activate":
          await manager.activatePlugin(pluginName);
          break;
        case "deactivate":
          await manager.deactivatePlugin(pluginName);
          break;
        case "load":
          await manager.loadPlugin(pluginName);
          break;
        case "unload":
          await manager.unloadPlugin(pluginName);
          break;
      }

      // Update plugin status
      setPlugins((prev) =>
        prev.map((plugin) =>
          plugin.name === pluginName
            ? {
                ...plugin,
                status:
                  action === "activate" || action === "load"
                    ? "active"
                    : "inactive",
              }
            : plugin,
        ),
      );
    } catch (error) {
      console.error(`${action} failed:`, error);
      alert(`Failed to ${action} plugin: ${pluginName}`);
    } finally {
      setLoading(null);
    }
  };

  const getPluginDetails = (pluginName: string) => {
    const plugin = plugins.find((p) => p.name === pluginName);
    setSelectedPlugin(pluginName);
    setPluginDetails(plugin);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      "data-processing": "📊",
      visualization: "📈",
      integration: "🔗",
      utility: "🔧",
    };
    return icons[category] || "🔌";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#28a745";
      case "inactive":
        return "#6c757d";
      case "error":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getTotalMemoryUsage = () => {
    return plugins
      .filter((p) => p.status === "active")
      .reduce((total, plugin) => total + plugin.memoryUsage, 0);
  };

  return (
    <div>
      <div className="component-card">
        <h2>🔌 Plugin Manager</h2>
        <p>
          Manage and monitor DataPrism plugins, their status, and resource
          usage.
        </p>

        <div className="grid grid-3">
          <div>
            <h4>Plugin Summary</h4>
            <div style={{ fontSize: "0.9rem" }}>
              <div>
                <strong>Total Plugins:</strong> {plugins.length}
              </div>
              <div>
                <strong>Active:</strong>{" "}
                {plugins.filter((p) => p.status === "active").length}
              </div>
              <div>
                <strong>Inactive:</strong>{" "}
                {plugins.filter((p) => p.status === "inactive").length}
              </div>
            </div>
          </div>
          <div>
            <h4>Resource Usage</h4>
            <div style={{ fontSize: "0.9rem" }}>
              <div>
                <strong>Total Memory:</strong>{" "}
                {getTotalMemoryUsage().toFixed(1)} MB
              </div>
              <div>
                <strong>Active Processes:</strong>{" "}
                {plugins.filter((p) => p.status === "active").length}
              </div>
            </div>
          </div>
          <div>
            <h4>Categories</h4>
            <div style={{ fontSize: "0.9rem" }}>
              {[
                "data-processing",
                "visualization",
                "integration",
                "utility",
              ].map((category) => (
                <div key={category}>
                  <strong>
                    {getCategoryIcon(category)} {category.replace("-", " ")}:
                  </strong>{" "}
                  {plugins.filter((p) => p.category === category).length}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="component-card">
        <h3>📋 Plugin List</h3>
        <div
          className="data-table"
          style={{ display: "block", overflowX: "auto" }}
        >
          <table style={{ width: "100%", minWidth: "800px" }}>
            <thead>
              <tr>
                <th>Plugin</th>
                <th>Status</th>
                <th>Category</th>
                <th>Version</th>
                <th>Memory</th>
                <th>Last Used</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plugins.map((plugin) => (
                <tr key={plugin.name}>
                  <td>
                    <div>
                      <div
                        style={{ fontWeight: "bold", cursor: "pointer" }}
                        onClick={() => getPluginDetails(plugin.name)}
                      >
                        {getCategoryIcon(plugin.category)} {plugin.name}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#666" }}>
                        by {plugin.author}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        className="status-indicator"
                        style={{
                          backgroundColor: getStatusColor(plugin.status),
                        }}
                      ></span>
                      <span style={{ textTransform: "capitalize" }}>
                        {plugin.status}
                      </span>
                    </div>
                  </td>
                  <td style={{ textTransform: "capitalize" }}>
                    {plugin.category.replace("-", " ")}
                  </td>
                  <td>{plugin.version}</td>
                  <td>
                    {plugin.status === "active"
                      ? `${plugin.memoryUsage.toFixed(1)} MB`
                      : "-"}
                  </td>
                  <td>
                    {plugin.lastUsed
                      ? new Date(plugin.lastUsed).toLocaleString()
                      : "Never"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {plugin.status === "active" ? (
                        <button
                          className="btn btn-warning"
                          style={{
                            fontSize: "0.8rem",
                            padding: "0.25rem 0.5rem",
                          }}
                          onClick={() =>
                            handlePluginAction(plugin.name, "deactivate")
                          }
                          disabled={loading === `deactivate-${plugin.name}`}
                        >
                          {loading === `deactivate-${plugin.name}`
                            ? "⏳"
                            : "⏸️ Deactivate"}
                        </button>
                      ) : (
                        <button
                          className="btn btn-success"
                          style={{
                            fontSize: "0.8rem",
                            padding: "0.25rem 0.5rem",
                          }}
                          onClick={() =>
                            handlePluginAction(plugin.name, "activate")
                          }
                          disabled={loading === `activate-${plugin.name}`}
                        >
                          {loading === `activate-${plugin.name}`
                            ? "⏳"
                            : "▶️ Activate"}
                        </button>
                      )}
                      <button
                        className="btn btn-primary"
                        style={{
                          fontSize: "0.8rem",
                          padding: "0.25rem 0.5rem",
                        }}
                        onClick={() => getPluginDetails(plugin.name)}
                      >
                        ℹ️ Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plugin Details Modal */}
      {pluginDetails && (
        <div className="component-card">
          <h3>🔍 Plugin Details: {pluginDetails.name}</h3>
          <div className="grid grid-2">
            <div>
              <h4>Basic Information</h4>
              <div style={{ fontSize: "0.9rem" }}>
                <div>
                  <strong>Name:</strong> {pluginDetails.name}
                </div>
                <div>
                  <strong>Version:</strong> {pluginDetails.version}
                </div>
                <div>
                  <strong>Author:</strong> {pluginDetails.author}
                </div>
                <div>
                  <strong>Category:</strong> {pluginDetails.category}
                </div>
                <div>
                  <strong>Status:</strong>
                  <span
                    style={{
                      color: getStatusColor(pluginDetails.status),
                      marginLeft: "0.5rem",
                      textTransform: "capitalize",
                    }}
                  >
                    {pluginDetails.status}
                  </span>
                </div>
              </div>

              <h4 style={{ marginTop: "1rem" }}>Description</h4>
              <p style={{ fontSize: "0.9rem" }}>{pluginDetails.description}</p>
            </div>
            <div>
              <h4>Resource Usage</h4>
              <div style={{ fontSize: "0.9rem" }}>
                <div>
                  <strong>Memory Usage:</strong>{" "}
                  {pluginDetails.memoryUsage.toFixed(1)} MB
                </div>
                <div>
                  <strong>Last Used:</strong>{" "}
                  {pluginDetails.lastUsed
                    ? new Date(pluginDetails.lastUsed).toLocaleString()
                    : "Never"}
                </div>
              </div>

              <h4 style={{ marginTop: "1rem" }}>Permissions</h4>
              <ul
                style={{
                  fontSize: "0.9rem",
                  margin: "0.5rem 0",
                  paddingLeft: "1.5rem",
                }}
              >
                {pluginDetails.permissions.map((permission: string) => (
                  <li key={permission}>{permission}</li>
                ))}
              </ul>

              <h4 style={{ marginTop: "1rem" }}>Capabilities</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {pluginDetails.capabilities.map((capability: string) => (
                  <span
                    key={capability}
                    style={{
                      background: "#e9ecef",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      fontFamily: "monospace",
                    }}
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            {pluginDetails.status === "active" ? (
              <button
                className="btn btn-warning"
                onClick={() =>
                  handlePluginAction(pluginDetails.name, "deactivate")
                }
                disabled={loading === `deactivate-${pluginDetails.name}`}
              >
                {loading === `deactivate-${pluginDetails.name}`
                  ? "⏳ Deactivating..."
                  : "⏸️ Deactivate Plugin"}
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={() =>
                  handlePluginAction(pluginDetails.name, "activate")
                }
                disabled={loading === `activate-${pluginDetails.name}`}
              >
                {loading === `activate-${pluginDetails.name}`
                  ? "⏳ Activating..."
                  : "▶️ Activate Plugin"}
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => setPluginDetails(null)}
            >
              ✖️ Close Details
            </button>
          </div>
        </div>
      )}

      <div className="component-card">
        <h3>ℹ️ About Plugin Management</h3>
        <div className="grid grid-2">
          <div>
            <h4>Plugin Lifecycle:</h4>
            <ol style={{ fontSize: "0.9rem" }}>
              <li>
                <strong>Register:</strong> Add plugin to the system
              </li>
              <li>
                <strong>Load:</strong> Initialize plugin code
              </li>
              <li>
                <strong>Activate:</strong> Start plugin execution
              </li>
              <li>
                <strong>Deactivate:</strong> Stop plugin execution
              </li>
              <li>
                <strong>Unload:</strong> Remove from memory
              </li>
            </ol>
          </div>
          <div>
            <h4>Plugin Categories:</h4>
            <ul style={{ fontSize: "0.9rem" }}>
              <li>
                <strong>📊 Data Processing:</strong> CSV, JSON, data validation
              </li>
              <li>
                <strong>📈 Visualization:</strong> Charts, graphs, dashboards
              </li>
              <li>
                <strong>🔗 Integration:</strong> APIs, LLMs, external services
              </li>
              <li>
                <strong>🔧 Utility:</strong> Monitoring, security, performance
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            background: "#e7f3ff",
            borderRadius: "6px",
          }}
        >
          <strong>💡 Tips:</strong>
          <ul style={{ marginTop: "0.5rem", marginBottom: 0 }}>
            <li>Click on plugin names to view detailed information</li>
            <li>Monitor memory usage to optimize system performance</li>
            <li>Deactivate unused plugins to free up resources</li>
            <li>Check the last used timestamp to identify inactive plugins</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
