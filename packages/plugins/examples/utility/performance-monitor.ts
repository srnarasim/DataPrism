import {
  IUtilityPlugin,
  ISecurityUtilityPlugin,
  UtilityFeature,
  SystemStatus,
  HealthStatus,
  SecurityScan,
  VulnerabilityReport,
  PluginContext,
  PluginCapability,
  PluginManifest,
  PluginDependency,
} from "../../src/interfaces/index.js";

/**
 * Performance Monitor Plugin
 *
 * This plugin demonstrates utility capabilities including:
 * - System performance monitoring
 * - Resource usage tracking
 * - Health checks and alerts
 * - Security scanning and vulnerability detection
 */
export class PerformanceMonitorPlugin
  implements IUtilityPlugin, ISecurityUtilityPlugin
{
  private context: PluginContext | null = null;
  private initialized = false;
  private active = false;
  private monitoringInterval: any = null;
  private metrics: Map<string, any[]> = new Map();
  private alerts: any[] = [];
  private lastHealthCheck: Date | null = null;
  private thresholds = {
    memory: 85, // 85% memory usage threshold
    cpu: 80, // 80% CPU usage threshold
    responseTime: 2000, // 2 second response time threshold
    errorRate: 5, // 5% error rate threshold
  };

  // Plugin Identity
  getName(): string {
    return "performance-monitor";
  }

  getVersion(): string {
    return "1.0.0";
  }

  getDescription(): string {
    return "Comprehensive performance monitoring and security scanning utility plugin";
  }

  getAuthor(): string {
    return "DataPrism Team";
  }

  getDependencies(): PluginDependency[] {
    return [];
  }

  getManifest(): PluginManifest {
    return {
      name: this.getName(),
      version: this.getVersion(),
      description: this.getDescription(),
      author: this.getAuthor(),
      license: "MIT",
      keywords: ["performance", "monitoring", "security", "health", "utility"],
      category: "utility",
      entryPoint: "./performance-monitor.js",
      dependencies: [],
      permissions: [
        { resource: "core", access: "read" },
        { resource: "data", access: "read" },
        { resource: "storage", access: "write" },
      ],
      configuration: {
        monitoringInterval: {
          type: "number",
          default: 30000,
          description: "Monitoring interval in milliseconds",
        },
        alertThresholds: {
          type: "object",
          default: {
            memory: 85,
            cpu: 80,
            responseTime: 2000,
            errorRate: 5,
          },
          description: "Alert threshold configuration",
        },
        retentionPeriod: {
          type: "number",
          default: 7,
          description: "Data retention period in days",
        },
      },
      compatibility: {
        minCoreVersion: "0.1.0",
        browsers: ["chrome", "firefox", "safari", "edge"],
      },
    };
  }

  getCapabilities(): PluginCapability[] {
    return [
      {
        name: "performance-monitoring",
        description: "Monitor system performance and resource usage",
        type: "utility",
        version: "1.0.0",
        async: true,
      },
      {
        name: "health-checks",
        description: "Perform comprehensive system health checks",
        type: "utility",
        version: "1.0.0",
        async: true,
      },
      {
        name: "security-scanning",
        description: "Scan for security vulnerabilities and threats",
        type: "utility",
        version: "1.0.0",
        async: true,
      },
      {
        name: "alerting",
        description: "Generate alerts based on monitoring thresholds",
        type: "utility",
        version: "1.0.0",
        async: false,
      },
    ];
  }

  isCompatible(coreVersion: string): boolean {
    return coreVersion >= "0.1.0";
  }

  // Lifecycle Management
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.log("info", "Initializing Performance Monitor Plugin");

    // Load configuration
    const config = this.context.config;
    if (config.alertThresholds) {
      this.thresholds = { ...this.thresholds, ...config.alertThresholds };
    }

    // Initialize metrics storage
    this.initializeMetrics();

    this.initialized = true;
    this.log("info", "Performance Monitor Plugin initialized successfully");
  }

  async activate(): Promise<void> {
    if (!this.initialized) {
      throw new Error("Plugin must be initialized before activation");
    }

    this.active = true;
    this.log("info", "Performance Monitor Plugin activated");

    // Start monitoring
    await this.startMonitoring();

    // Register event listeners
    this.context?.eventBus.subscribe(
      "system:error",
      this.handleSystemError.bind(this),
    );
    this.context?.eventBus.subscribe(
      "plugin:*",
      this.handlePluginEvent.bind(this),
    );
  }

  async deactivate(): Promise<void> {
    await this.stopMonitoring();
    this.active = false;
    this.log("info", "Performance Monitor Plugin deactivated");
  }

  async cleanup(): Promise<void> {
    await this.stopMonitoring();
    this.metrics.clear();
    this.alerts = [];
    this.context = null;
    this.initialized = false;
    this.active = false;
    this.log("info", "Performance Monitor Plugin cleaned up");
  }

  // Core Operations
  async execute(operation: string, params: any): Promise<any> {
    if (!this.active) {
      throw new Error("Plugin is not active");
    }

    this.log("debug", `Executing operation: ${operation}`, params);

    switch (operation) {
      case "getStatus":
        return this.getSystemStatus();
      case "healthCheck":
        return this.performHealthCheck();
      case "getMetrics":
        return this.getMetrics(params.timeRange);
      case "getAlerts":
        return this.getAlerts(params.severity);
      case "securityScan":
        return this.performSecurityScan(params.options);
      case "getVulnerabilities":
        return this.getVulnerabilityReport();
      case "optimize":
        return this.optimizePerformance(params.options);
      case "cleanup":
        return this.cleanupOldData();
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async configure(settings: any): Promise<void> {
    this.log("info", "Updating plugin configuration", settings);

    if (settings.alertThresholds) {
      this.thresholds = { ...this.thresholds, ...settings.alertThresholds };
    }

    if (settings.monitoringInterval && this.monitoringInterval) {
      await this.stopMonitoring();
      await this.startMonitoring();
    }
  }

  // Utility Operations
  getUtilityFeatures(): UtilityFeature[] {
    return [
      {
        name: "system-monitoring",
        description: "Real-time system performance monitoring",
        category: "monitoring",
        enabled: this.active,
      },
      {
        name: "health-checks",
        description: "Automated health checks and diagnostics",
        category: "diagnostics",
        enabled: this.active,
      },
      {
        name: "security-scanning",
        description: "Security vulnerability scanning",
        category: "security",
        enabled: this.active,
      },
      {
        name: "performance-optimization",
        description: "Automated performance optimization",
        category: "optimization",
        enabled: this.active,
      },
      {
        name: "alert-management",
        description: "Intelligent alerting and notification system",
        category: "alerting",
        enabled: this.active,
      },
    ];
  }

  async getSystemStatus(): Promise<SystemStatus> {
    this.log("debug", "Getting system status");

    const memoryUsage = this.getMemoryUsage();
    const cpuUsage = await this.getCPUUsage();
    const responseTime = await this.measureResponseTime();
    const errorRate = this.calculateErrorRate();

    const status: SystemStatus = {
      timestamp: new Date(),
      overall: this.determineOverallHealth(
        memoryUsage,
        cpuUsage,
        responseTime,
        errorRate,
      ),
      components: {
        memory: {
          status:
            memoryUsage.percentUsed > this.thresholds.memory
              ? "warning"
              : "healthy",
          usage: memoryUsage.percentUsed,
          details: memoryUsage,
        },
        cpu: {
          status: cpuUsage > this.thresholds.cpu ? "warning" : "healthy",
          usage: cpuUsage,
          details: { averageLoad: cpuUsage },
        },
        performance: {
          status:
            responseTime > this.thresholds.responseTime ? "warning" : "healthy",
          responseTime,
          details: { averageResponseTime: responseTime },
        },
        errors: {
          status:
            errorRate > this.thresholds.errorRate ? "critical" : "healthy",
          errorRate,
          details: { recentErrors: this.getRecentErrors() },
        },
      },
      uptime: this.getUptime(),
      lastUpdate: new Date(),
    };

    this.recordMetric("systemStatus", status);
    return status;
  }

  async performHealthCheck(): Promise<HealthStatus> {
    this.log("info", "Performing comprehensive health check");

    const checks = await Promise.allSettled([
      this.checkCoreServices(),
      this.checkDataIntegrity(),
      this.checkNetworkConnectivity(),
      this.checkDiskSpace(),
      this.checkPluginHealth(),
    ]);

    const results = checks.map((check, index) => ({
      name: [
        "core-services",
        "data-integrity",
        "network",
        "disk-space",
        "plugins",
      ][index],
      status: check.status === "fulfilled" ? "passed" : "failed",
      details: check.status === "fulfilled" ? check.value : check.reason,
      timestamp: new Date(),
    }));

    const healthStatus: HealthStatus = {
      overall: results.every((r) => r.status === "passed")
        ? "healthy"
        : "unhealthy",
      checks: results,
      score:
        (results.filter((r) => r.status === "passed").length / results.length) *
        100,
      timestamp: new Date(),
      recommendations: this.generateHealthRecommendations(results),
    };

    this.lastHealthCheck = new Date();
    this.recordMetric("healthCheck", healthStatus);

    this.log(
      "info",
      `Health check completed: ${healthStatus.overall} (${healthStatus.score}% passed)`,
    );
    return healthStatus;
  }

  async performSecurityScan(options?: any): Promise<SecurityScan> {
    this.log("info", "Performing security scan");

    const scanResults = await Promise.allSettled([
      this.scanForVulnerabilities(),
      this.checkSecurityConfigurations(),
      this.analyzePluginSecurity(),
      this.checkDataAccess(),
      this.scanNetworkSecurity(),
    ]);

    const findings = scanResults
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => (result as any).value);

    const securityScan: SecurityScan = {
      scanId: this.generateScanId(),
      timestamp: new Date(),
      type: options?.type || "comprehensive",
      status: findings.some((f) => f.severity === "critical")
        ? "critical"
        : findings.some((f) => f.severity === "high")
          ? "high"
          : "clean",
      findings,
      summary: this.generateSecuritySummary(findings),
      recommendations: this.generateSecurityRecommendations(findings),
    };

    this.recordMetric("securityScan", securityScan);

    this.log("info", `Security scan completed: ${findings.length} findings`);
    return securityScan;
  }

  async getVulnerabilityReport(): Promise<VulnerabilityReport> {
    this.log("debug", "Generating vulnerability report");

    const recentScans = this.getMetrics("securityScan", 30); // Last 30 days
    const allFindings = recentScans.flatMap((scan) => scan.findings || []);

    const vulnerabilities = allFindings.filter(
      (f) => f.type === "vulnerability",
    );
    const groupedBySeverity = this.groupBySeverity(vulnerabilities);

    const report: VulnerabilityReport = {
      generated: new Date(),
      timeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      summary: {
        total: vulnerabilities.length,
        critical: groupedBySeverity.critical?.length || 0,
        high: groupedBySeverity.high?.length || 0,
        medium: groupedBySeverity.medium?.length || 0,
        low: groupedBySeverity.low?.length || 0,
      },
      vulnerabilities: vulnerabilities.slice(0, 50), // Limit to recent 50
      trends: this.analyzeVulnerabilityTrends(recentScans),
      recommendations:
        this.generateVulnerabilityRecommendations(vulnerabilities),
    };

    return report;
  }

  async optimizePerformance(options?: any): Promise<any> {
    this.log("info", "Starting performance optimization");

    const optimizations = [];
    const systemStatus = await this.getSystemStatus();

    // Memory optimization
    if (systemStatus.components.memory.usage > 70) {
      optimizations.push(await this.optimizeMemory());
    }

    // CPU optimization
    if (systemStatus.components.cpu.usage > 60) {
      optimizations.push(await this.optimizeCPU());
    }

    // Cache optimization
    optimizations.push(await this.optimizeCache());

    // Plugin optimization
    optimizations.push(await this.optimizePlugins());

    const result = {
      timestamp: new Date(),
      optimizations: optimizations.filter(Boolean),
      metrics: {
        before: systemStatus,
        after: await this.getSystemStatus(),
      },
      recommendations: this.generateOptimizationRecommendations(optimizations),
    };

    this.log(
      "info",
      `Performance optimization completed: ${optimizations.length} optimizations applied`,
    );
    return result;
  }

  async cleanupOldData(): Promise<any> {
    this.log("info", "Cleaning up old monitoring data");

    const retentionPeriod = this.context?.config.retentionPeriod || 7;
    const cutoffDate = new Date(
      Date.now() - retentionPeriod * 24 * 60 * 60 * 1000,
    );

    let removedCount = 0;

    for (const [metricName, values] of this.metrics) {
      const filteredValues = values.filter(
        (v) => new Date(v.timestamp) > cutoffDate,
      );
      const removed = values.length - filteredValues.length;

      this.metrics.set(metricName, filteredValues);
      removedCount += removed;
    }

    // Clean up old alerts
    const oldAlerts = this.alerts.filter(
      (a) => new Date(a.timestamp) <= cutoffDate,
    );
    this.alerts = this.alerts.filter((a) => new Date(a.timestamp) > cutoffDate);

    const result = {
      timestamp: new Date(),
      removed: {
        metrics: removedCount,
        alerts: oldAlerts.length,
      },
      retentionPeriod,
      cutoffDate,
    };

    this.log(
      "info",
      `Cleanup completed: removed ${removedCount} metrics, ${oldAlerts.length} alerts`,
    );
    return result;
  }

  // Security Utility Operations
  async scanForVulnerabilities(): Promise<any[]> {
    const vulnerabilities = [];

    // Mock vulnerability scanning
    const commonVulns = [
      {
        id: "CVE-2023-001",
        severity: "medium",
        type: "vulnerability",
        title: "Potential XSS vulnerability in data rendering",
        description: "User input is not properly sanitized before rendering",
        component: "data-renderer",
        found: new Date(),
      },
    ];

    // Simulate scanning delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return commonVulns;
  }

  async checkSecurityConfigurations(): Promise<any[]> {
    const findings = [];

    // Check HTTPS usage
    if (
      typeof window !== "undefined" &&
      window.location.protocol !== "https:"
    ) {
      findings.push({
        severity: "high",
        type: "configuration",
        title: "Insecure connection",
        description: "Application is not using HTTPS",
        component: "transport",
        found: new Date(),
      });
    }

    return findings;
  }

  async analyzePluginSecurity(): Promise<any[]> {
    const findings = [];

    // Check for plugins with excessive permissions
    // This would integrate with the plugin manager to check actual plugin permissions

    return findings;
  }

  async checkDataAccess(): Promise<any[]> {
    const findings = [];

    // Check for potential data access issues
    // This would analyze data access patterns and permissions

    return findings;
  }

  async scanNetworkSecurity(): Promise<any[]> {
    const findings = [];

    // Check network security configurations
    // This would analyze network requests and security headers

    return findings;
  }

  // Helper Methods
  private async startMonitoring(): Promise<void> {
    const interval = this.context?.config.monitoringInterval || 30000;

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
        await this.checkAlerts();
      } catch (error) {
        this.log("error", "Monitoring error", error);
      }
    }, interval);

    this.log("debug", `Monitoring started with ${interval}ms interval`);
  }

  private async stopMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.log("debug", "Monitoring stopped");
    }
  }

  private initializeMetrics(): void {
    const metricTypes = [
      "systemStatus",
      "healthCheck",
      "securityScan",
      "memoryUsage",
      "cpuUsage",
      "responseTime",
      "errorRate",
      "alerts",
    ];

    metricTypes.forEach((type) => {
      this.metrics.set(type, []);
    });
  }

  private async collectMetrics(): Promise<void> {
    const timestamp = new Date();

    // Collect system metrics
    const memoryUsage = this.getMemoryUsage();
    const cpuUsage = await this.getCPUUsage();
    const responseTime = await this.measureResponseTime();
    const errorRate = this.calculateErrorRate();

    this.recordMetric("memoryUsage", { ...memoryUsage, timestamp });
    this.recordMetric("cpuUsage", { value: cpuUsage, timestamp });
    this.recordMetric("responseTime", { value: responseTime, timestamp });
    this.recordMetric("errorRate", { value: errorRate, timestamp });
  }

  private async checkAlerts(): Promise<void> {
    const systemStatus = await this.getSystemStatus();

    // Check memory threshold
    if (systemStatus.components.memory.usage > this.thresholds.memory) {
      this.createAlert(
        "memory",
        "high",
        `Memory usage at ${systemStatus.components.memory.usage}%`,
      );
    }

    // Check CPU threshold
    if (systemStatus.components.cpu.usage > this.thresholds.cpu) {
      this.createAlert(
        "cpu",
        "high",
        `CPU usage at ${systemStatus.components.cpu.usage}%`,
      );
    }

    // Check response time threshold
    if (
      systemStatus.components.performance.responseTime >
      this.thresholds.responseTime
    ) {
      this.createAlert(
        "performance",
        "medium",
        `Response time at ${systemStatus.components.performance.responseTime}ms`,
      );
    }

    // Check error rate threshold
    if (systemStatus.components.errors.errorRate > this.thresholds.errorRate) {
      this.createAlert(
        "errors",
        "critical",
        `Error rate at ${systemStatus.components.errors.errorRate}%`,
      );
    }
  }

  private getMemoryUsage(): any {
    // Mock memory usage data
    if (typeof (performance as any).memory !== "undefined") {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentUsed: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      };
    }

    // Fallback mock data
    return {
      used: Math.random() * 100000000,
      total: 128000000,
      limit: 256000000,
      percentUsed: Math.random() * 100,
    };
  }

  private async getCPUUsage(): Promise<number> {
    // Mock CPU usage calculation
    return Math.random() * 100;
  }

  private async measureResponseTime(): Promise<number> {
    const start = performance.now();

    // Simulate a quick operation
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));

    return performance.now() - start;
  }

  private calculateErrorRate(): number {
    const recentErrors = this.getRecentErrors();
    const totalRequests = 1000; // Mock total requests
    return (recentErrors.length / totalRequests) * 100;
  }

  private getRecentErrors(): any[] {
    // Mock recent errors
    return Array.from({ length: Math.floor(Math.random() * 10) }, (_, i) => ({
      id: `error_${i}`,
      timestamp: new Date(Date.now() - Math.random() * 60000),
      message: `Mock error ${i}`,
      severity: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
    }));
  }

  private getUptime(): number {
    // Mock uptime in milliseconds
    return Date.now() - new Date().setHours(0, 0, 0, 0);
  }

  private determineOverallHealth(
    memory: any,
    cpu: number,
    responseTime: number,
    errorRate: number,
  ): string {
    if (errorRate > this.thresholds.errorRate) return "critical";
    if (
      memory.percentUsed > this.thresholds.memory ||
      cpu > this.thresholds.cpu
    )
      return "warning";
    if (responseTime > this.thresholds.responseTime) return "warning";
    return "healthy";
  }

  private recordMetric(type: string, data: any): void {
    const metrics = this.metrics.get(type) || [];
    metrics.push({ ...data, timestamp: new Date() });

    // Keep only recent metrics (last 1000 entries)
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000);
    }

    this.metrics.set(type, metrics);
  }

  private getMetrics(type?: string, days?: number): any[] {
    if (!type) {
      // Return all metrics
      const allMetrics: any[] = [];
      for (const metrics of this.metrics.values()) {
        allMetrics.push(...metrics);
      }
      return allMetrics;
    }

    const metrics = this.metrics.get(type) || [];

    if (days) {
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      return metrics.filter((m) => new Date(m.timestamp) > cutoff);
    }

    return [...metrics];
  }

  private getAlerts(severity?: string): any[] {
    if (!severity) return [...this.alerts];
    return this.alerts.filter((alert) => alert.severity === severity);
  }

  private createAlert(type: string, severity: string, message: string): void {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      timestamp: new Date(),
      acknowledged: false,
    };

    this.alerts.push(alert);
    this.recordMetric("alerts", alert);

    this.log("warn", `Alert created: ${message}`);
    this.emit("alert:created", alert);
  }

  private async checkCoreServices(): Promise<string> {
    // Mock core services check
    return "All core services operational";
  }

  private async checkDataIntegrity(): Promise<string> {
    // Mock data integrity check
    return "Data integrity verified";
  }

  private async checkNetworkConnectivity(): Promise<string> {
    // Mock network check
    return "Network connectivity normal";
  }

  private async checkDiskSpace(): Promise<string> {
    // Mock disk space check
    return "Sufficient disk space available";
  }

  private async checkPluginHealth(): Promise<string> {
    // Mock plugin health check
    return "All plugins healthy";
  }

  private generateHealthRecommendations(results: any[]): string[] {
    const recommendations = [];

    const failed = results.filter((r) => r.status === "failed");
    if (failed.length > 0) {
      recommendations.push(`Address ${failed.length} failed health checks`);
    }

    if (results.length > 0 && failed.length / results.length > 0.3) {
      recommendations.push("Consider system maintenance");
    }

    return recommendations;
  }

  private generateSecuritySummary(findings: any[]): any {
    const bySeverity = this.groupBySeverity(findings);
    return {
      total: findings.length,
      critical: bySeverity.critical?.length || 0,
      high: bySeverity.high?.length || 0,
      medium: bySeverity.medium?.length || 0,
      low: bySeverity.low?.length || 0,
    };
  }

  private generateSecurityRecommendations(findings: any[]): string[] {
    const recommendations = [];

    const critical = findings.filter((f) => f.severity === "critical");
    if (critical.length > 0) {
      recommendations.push(
        `Address ${critical.length} critical security findings immediately`,
      );
    }

    const high = findings.filter((f) => f.severity === "high");
    if (high.length > 0) {
      recommendations.push(
        `Review ${high.length} high-severity security issues`,
      );
    }

    return recommendations;
  }

  private generateVulnerabilityRecommendations(
    vulnerabilities: any[],
  ): string[] {
    const recommendations = [];

    if (vulnerabilities.length === 0) {
      recommendations.push("Continue regular security monitoring");
    } else {
      recommendations.push(
        "Prioritize patching based on severity and exploitability",
      );
      recommendations.push(
        "Implement additional security controls for high-risk areas",
      );
    }

    return recommendations;
  }

  private generateOptimizationRecommendations(optimizations: any[]): string[] {
    const recommendations = [];

    if (optimizations.length > 0) {
      recommendations.push("Monitor performance after optimizations");
      recommendations.push(
        "Consider additional optimizations if issues persist",
      );
    } else {
      recommendations.push("System performance is optimal");
    }

    return recommendations;
  }

  private groupBySeverity(items: any[]): Record<string, any[]> {
    return items.reduce((groups, item) => {
      const severity = item.severity || "unknown";
      if (!groups[severity]) groups[severity] = [];
      groups[severity].push(item);
      return groups;
    }, {});
  }

  private analyzeVulnerabilityTrends(scans: any[]): any {
    // Mock trend analysis
    return {
      trend: "stable",
      change: 0,
      period: "30 days",
    };
  }

  private async optimizeMemory(): Promise<any> {
    // Mock memory optimization
    return {
      type: "memory",
      description: "Cleared unused caches",
      impact: "15% reduction",
    };
  }

  private async optimizeCPU(): Promise<any> {
    // Mock CPU optimization
    return {
      type: "cpu",
      description: "Optimized processing algorithms",
      impact: "10% reduction",
    };
  }

  private async optimizeCache(): Promise<any> {
    // Mock cache optimization
    return {
      type: "cache",
      description: "Optimized cache policies",
      impact: "20% hit rate improvement",
    };
  }

  private async optimizePlugins(): Promise<any> {
    // Mock plugin optimization
    return {
      type: "plugins",
      description: "Deactivated unused plugins",
      impact: "5% resource reduction",
    };
  }

  private generateScanId(): string {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleSystemError(error: any): void {
    this.log("debug", "System error event received", error);
    this.createAlert("system", "high", `System error: ${error.message}`);
  }

  private handlePluginEvent(event: any): void {
    this.log("debug", "Plugin event received", event);
    // Track plugin events for monitoring
  }

  private log(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    ...args: any[]
  ): void {
    if (this.context?.logger) {
      this.context.logger[level](message, ...args);
    } else {
      console[level](`[${this.getName()}]`, message, ...args);
    }
  }

  private emit(event: string, data: any): void {
    if (this.context?.eventBus) {
      this.context.eventBus.publish(`plugin:${this.getName()}:${event}`, data);
    }
  }
}

// Plugin manifest for auto-discovery
export const manifest: PluginManifest = {
  name: "performance-monitor",
  version: "1.0.0",
  description:
    "Comprehensive performance monitoring and security scanning utility plugin",
  author: "DataPrism Team",
  license: "MIT",
  keywords: ["performance", "monitoring", "security", "health", "utility"],
  category: "utility",
  entryPoint: "./performance-monitor.js",
  dependencies: [],
  permissions: [
    { resource: "core", access: "read" },
    { resource: "data", access: "read" },
    { resource: "storage", access: "write" },
  ],
  configuration: {
    monitoringInterval: {
      type: "number",
      default: 30000,
      description: "Monitoring interval in milliseconds",
    },
  },
  compatibility: {
    minCoreVersion: "0.1.0",
    browsers: ["chrome", "firefox", "safari", "edge"],
  },
};

export default PerformanceMonitorPlugin;
