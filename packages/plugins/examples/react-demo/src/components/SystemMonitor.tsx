import React, { useState, useEffect } from "react";

interface SystemMonitorProps {
  pluginSystem: any;
}

export const SystemMonitor: React.FC<SystemMonitorProps> = ({
  pluginSystem,
}) => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [healthCheck, setHealthCheck] = useState<any>(null);
  const [securityScan, setSecurityScan] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    const getSystemStatus = async () => {
      if (!pluginSystem) return;

      setLoading("status");
      try {
        const result = await pluginSystem
          .getPluginManager()
          .executePlugin("performance-monitor", "getStatus");
        setSystemStatus(result);
      } catch (error) {
        console.error("Failed to get system status:", error);
      } finally {
        setLoading(null);
      }
    };

    if (pluginSystem) {
      getSystemStatus();
    }
  }, [pluginSystem]);

  useEffect(() => {
    const getSystemStatusForRefresh = async () => {
      if (!pluginSystem) return;

      setLoading("status");
      try {
        const result = await pluginSystem
          .getPluginManager()
          .executePlugin("performance-monitor", "getStatus");
        setSystemStatus(result);
      } catch (error) {
        console.error("Failed to get system status:", error);
      } finally {
        setLoading(null);
      }
    };

    let interval: NodeJS.Timeout;
    if (autoRefresh && pluginSystem) {
      interval = setInterval(() => {
        getSystemStatusForRefresh();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, pluginSystem]);

  const getSystemStatus = async () => {
    if (!pluginSystem) return;

    setLoading("status");
    try {
      const result = await pluginSystem
        .getPluginManager()
        .executePlugin("performance-monitor", "getStatus");
      setSystemStatus(result);
    } catch (error) {
      console.error("Failed to get system status:", error);
    } finally {
      setLoading(null);
    }
  };

  const runHealthCheck = async () => {
    if (!pluginSystem) return;

    setLoading("health");
    try {
      const result = await pluginSystem
        .getPluginManager()
        .executePlugin("performance-monitor", "healthCheck");
      setHealthCheck(result);
    } catch (error) {
      console.error("Health check failed:", error);
      alert("Health check failed");
    } finally {
      setLoading(null);
    }
  };

  const runSecurityScan = async () => {
    if (!pluginSystem) return;

    setLoading("security");
    try {
      const result = await pluginSystem
        .getPluginManager()
        .executePlugin("performance-monitor", "securityScan", {
          options: { type: "quick" },
        });
      setSecurityScan(result);
    } catch (error) {
      console.error("Security scan failed:", error);
      alert("Security scan failed");
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "healthy":
        return "#28a745";
      case "warning":
        return "#ffc107";
      case "critical":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div>
      <div className="component-card">
        <h2>🔧 System Monitor</h2>
        <p>
          Monitor system performance, health, and security using the Performance
          Monitor Plugin.
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={getSystemStatus}
            disabled={loading === "status"}
          >
            {loading === "status" ? "⏳ Checking..." : "📊 Get System Status"}
          </button>

          <button
            className="btn btn-success"
            onClick={runHealthCheck}
            disabled={loading === "health"}
          >
            {loading === "health" ? "⏳ Checking..." : "🏥 Run Health Check"}
          </button>

          <button
            className="btn btn-warning"
            onClick={runSecurityScan}
            disabled={loading === "security"}
          >
            {loading === "security" ? "⏳ Scanning..." : "🔒 Security Scan"}
          </button>

          <label
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto Refresh (5s)
          </label>
        </div>
      </div>

      {/* System Status */}
      {systemStatus && (
        <div className="component-card">
          <h3>📊 System Status</h3>
          <div className="grid grid-2">
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <strong>Overall Status:</strong>{" "}
                  <span
                    style={{
                      color: getStatusColor(systemStatus.overall),
                      fontWeight: "bold",
                      textTransform: "capitalize",
                    }}
                  >
                    {systemStatus.overall}
                  </span>
                </div>
                <div>
                  <strong>Uptime:</strong> {formatUptime(systemStatus.uptime)}
                </div>
              </div>

              <div>
                <strong>Last Updated:</strong>{" "}
                {new Date(systemStatus.timestamp).toLocaleString()}
              </div>
            </div>
            <div>
              <h4>Component Details:</h4>
              <div style={{ fontSize: "0.9rem" }}>
                {Object.entries(systemStatus.components).map(
                  ([component, data]: [string, any]) => (
                    <div key={component} style={{ marginBottom: "0.5rem" }}>
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
                            backgroundColor: getStatusColor(data.status),
                          }}
                        ></span>
                        <strong style={{ textTransform: "capitalize" }}>
                          {component}:
                        </strong>
                        <span>{data.usage?.toFixed(1)}%</span>
                        <span
                          style={{
                            color: getStatusColor(data.status),
                            textTransform: "capitalize",
                          }}
                        >
                          ({data.status})
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div style={{ marginTop: "1.5rem" }}>
            <h4>Performance Metrics:</h4>
            <div className="grid grid-3">
              {Object.entries(systemStatus.components).map(
                ([component, data]: [string, any]) => (
                  <div
                    key={component}
                    style={{
                      padding: "1rem",
                      background: "#f8f9fa",
                      borderRadius: "6px",
                    }}
                  >
                    <h5
                      style={{
                        margin: "0 0 0.5rem 0",
                        textTransform: "capitalize",
                      }}
                    >
                      {component}
                    </h5>
                    <div style={{ fontSize: "0.8rem" }}>
                      <div>
                        <strong>Status:</strong> {data.status}
                      </div>
                      {data.usage !== undefined && (
                        <div>
                          <strong>Usage:</strong> {data.usage.toFixed(1)}%
                        </div>
                      )}
                      {data.responseTime && (
                        <div>
                          <strong>Response Time:</strong>{" "}
                          {data.responseTime.toFixed(0)}ms
                        </div>
                      )}
                      {data.errorRate && (
                        <div>
                          <strong>Error Rate:</strong>{" "}
                          {data.errorRate.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* Health Check Results */}
      {healthCheck && (
        <div className="component-card">
          <h3>🏥 Health Check Results</h3>
          <div className="grid grid-2">
            <div>
              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <strong>Overall Health:</strong>
                  <span
                    style={{
                      color: getStatusColor(healthCheck.overall),
                      fontWeight: "bold",
                      textTransform: "capitalize",
                    }}
                  >
                    {healthCheck.overall}
                  </span>
                </div>
                <div>
                  <strong>Health Score:</strong> {healthCheck.score.toFixed(1)}%
                </div>
                <div>
                  <strong>Checked:</strong>{" "}
                  {new Date(healthCheck.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            <div>
              <h4>Individual Checks:</h4>
              <div>
                {healthCheck.checks.map((check: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      className="status-indicator"
                      style={{
                        backgroundColor:
                          check.status === "passed" ? "#28a745" : "#dc3545",
                      }}
                    ></span>
                    <span style={{ textTransform: "capitalize" }}>
                      {check.name.replace("-", " ")}
                    </span>
                    <span
                      style={{
                        color:
                          check.status === "passed" ? "#28a745" : "#dc3545",
                      }}
                    >
                      ({check.status})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {healthCheck.recommendations &&
            healthCheck.recommendations.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <h4>📋 Recommendations:</h4>
                <ul>
                  {healthCheck.recommendations.map(
                    (rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ),
                  )}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* Security Scan Results */}
      {securityScan && (
        <div className="component-card">
          <h3>🔒 Security Scan Results</h3>
          <div className="grid grid-2">
            <div>
              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <strong>Scan Status:</strong>
                  <span
                    style={{
                      color: getStatusColor(securityScan.status),
                      fontWeight: "bold",
                      textTransform: "capitalize",
                    }}
                  >
                    {securityScan.status}
                  </span>
                </div>
                <div>
                  <strong>Scan Type:</strong> {securityScan.type}
                </div>
                <div>
                  <strong>Completed:</strong>{" "}
                  {new Date(securityScan.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            <div>
              <h4>Findings Summary:</h4>
              <div style={{ fontSize: "0.9rem" }}>
                <div>
                  <strong>Total Findings:</strong> {securityScan.summary.total}
                </div>
                <div style={{ color: "#dc3545" }}>
                  <strong>Critical:</strong> {securityScan.summary.critical}
                </div>
                <div style={{ color: "#fd7e14" }}>
                  <strong>High:</strong> {securityScan.summary.high}
                </div>
                <div style={{ color: "#ffc107" }}>
                  <strong>Medium:</strong> {securityScan.summary.medium}
                </div>
                <div style={{ color: "#28a745" }}>
                  <strong>Low:</strong> {securityScan.summary.low}
                </div>
              </div>
            </div>
          </div>

          {securityScan.findings && securityScan.findings.length > 0 ? (
            <div style={{ marginTop: "1rem" }}>
              <h4>🔍 Security Findings:</h4>
              <div style={{ maxHeight: "200px", overflow: "auto" }}>
                {securityScan.findings.map((finding: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      padding: "0.5rem",
                      marginBottom: "0.5rem",
                      background: "#f8f9fa",
                      borderRadius: "4px",
                      borderLeft: `4px solid ${getStatusColor(finding.severity)}`,
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{finding.title}</div>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>
                      {finding.description}
                    </div>
                    <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                      <strong>Severity:</strong> {finding.severity} |
                      <strong> Component:</strong> {finding.component}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                background: "#d4edda",
                borderRadius: "6px",
                color: "#155724",
              }}
            >
              ✅ No security issues found. Your system appears to be secure.
            </div>
          )}

          {securityScan.recommendations &&
            securityScan.recommendations.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <h4>📋 Security Recommendations:</h4>
                <ul>
                  {securityScan.recommendations.map(
                    (rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ),
                  )}
                </ul>
              </div>
            )}
        </div>
      )}

      <div className="component-card">
        <h3>ℹ️ About Performance Monitor Plugin</h3>
        <div className="grid grid-2">
          <div>
            <h4>Features:</h4>
            <ul>
              <li>✅ Real-time performance monitoring</li>
              <li>✅ Health checks and diagnostics</li>
              <li>✅ Security scanning and vulnerability detection</li>
              <li>✅ Intelligent alerting</li>
              <li>✅ Performance optimization</li>
            </ul>
          </div>
          <div>
            <h4>Supported Operations:</h4>
            <ul>
              <li>
                <code>getStatus</code> - Get current system status
              </li>
              <li>
                <code>healthCheck</code> - Perform comprehensive health check
              </li>
              <li>
                <code>securityScan</code> - Run security vulnerability scan
              </li>
              <li>
                <code>getMetrics</code> - Retrieve performance metrics
              </li>
              <li>
                <code>optimize</code> - Run performance optimizations
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
          <strong>💡 Tip:</strong> Enable auto-refresh to monitor system status
          in real-time. The plugin automatically tracks memory usage, CPU
          performance, response times, and security status.
        </div>
      </div>
    </div>
  );
};
