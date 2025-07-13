import { PluginManifest, PluginPermission } from "../interfaces/plugin.js";

export class SecurityManager {
  private permissions: Map<string, Set<PluginPermission>>;
  private sandboxes: Map<string, PluginSandbox>;
  private auditLogger: AuditLogger;
  private securityPolicies: SecurityPolicySet;
  private initialized = false;

  constructor() {
    this.permissions = new Map();
    this.sandboxes = new Map();
    this.auditLogger = new AuditLogger();
    this.securityPolicies = new SecurityPolicySet();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.auditLogger.initialize();
    await this.securityPolicies.loadDefault();
    this.initialized = true;
  }

  async validatePlugin(manifest: PluginManifest): Promise<void> {
    if (!this.initialized) {
      throw new Error("SecurityManager not initialized");
    }

    // Static security analysis
    await this.performStaticAnalysis(manifest);

    // Validate permissions
    await this.validatePermissions(manifest.permissions);

    // Check for suspicious patterns
    await this.checkSuspiciousPatterns(manifest);

    // Store permissions for later use
    this.permissions.set(manifest.name, new Set(manifest.permissions));

    this.auditLogger.log("security", "plugin_validated", {
      pluginName: manifest.name,
      version: manifest.version,
      permissions: manifest.permissions,
      timestamp: Date.now(),
    });
  }

  async createSandbox(pluginName: string): Promise<PluginSandbox> {
    if (!this.initialized) {
      throw new Error("SecurityManager not initialized");
    }

    const permissions = this.permissions.get(pluginName);
    if (!permissions) {
      throw new SecurityError(`No permissions found for plugin: ${pluginName}`);
    }

    const sandbox = new PluginSandbox(pluginName, {
      allowedAPIs: this.getAllowedAPIs(pluginName),
      memoryLimit: this.getMemoryLimit(pluginName),
      timeoutLimit: this.getTimeoutLimit(pluginName),
      networkAccess: this.hasNetworkPermission(pluginName),
      permissions: Array.from(permissions),
    });

    await sandbox.initialize();
    this.sandboxes.set(pluginName, sandbox);

    this.auditLogger.log("security", "sandbox_created", {
      pluginName,
      config: sandbox.getConfig(),
      timestamp: Date.now(),
    });

    return sandbox;
  }

  async checkPermission(
    pluginName: string,
    operation: string,
    params: any,
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error("SecurityManager not initialized");
    }

    const permissions = this.permissions.get(pluginName);
    if (!permissions) {
      throw new SecurityError(`No permissions found for plugin: ${pluginName}`);
    }

    const requiredPermission = this.getRequiredPermission(operation, params);
    const hasPermission = Array.from(permissions).some((perm) =>
      this.permissionMatches(perm, requiredPermission),
    );

    if (!hasPermission) {
      this.auditLogger.log("security", "permission_denied", {
        pluginName,
        operation,
        params: this.sanitizeParams(params),
        requiredPermission,
        timestamp: Date.now(),
      });
      throw new SecurityError(
        `Permission denied: ${pluginName} cannot perform ${operation}`,
      );
    }

    this.auditLogger.log("security", "permission_granted", {
      pluginName,
      operation,
      timestamp: Date.now(),
    });
  }

  async destroySandbox(pluginName: string): Promise<void> {
    const sandbox = this.sandboxes.get(pluginName);
    if (sandbox) {
      await sandbox.destroy();
      this.sandboxes.delete(pluginName);

      this.auditLogger.log("security", "sandbox_destroyed", {
        pluginName,
        timestamp: Date.now(),
      });
    }
  }

  async generateSecurityReport(): Promise<SecurityReport> {
    const events = await this.auditLogger.getEvents();
    const violations = events.filter((e) => e.type === "permission_denied");
    const suspiciousActivity = await this.detectSuspiciousActivity(events);

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalPlugins: this.permissions.size,
        activeSandboxes: this.sandboxes.size,
        securityEvents: events.length,
        violations: violations.length,
        suspiciousActivity: suspiciousActivity.length,
      },
      violations: violations.slice(-10), // Last 10 violations
      suspiciousActivity,
      recommendations: this.generateSecurityRecommendations(events),
    };
  }

  private async performStaticAnalysis(manifest: PluginManifest): Promise<void> {
    // Check for dangerous patterns in manifest
    const dangerousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /document\.write/,
      /innerHTML\s*=/,
      /execCommand/,
      /new\s+Function/,
      /setTimeout\s*\(\s*["'`]/,
      /setInterval\s*\(\s*["'`]/,
    ];

    const manifestString = JSON.stringify(manifest);
    for (const pattern of dangerousPatterns) {
      if (pattern.test(manifestString)) {
        throw new SecurityError(
          `Dangerous pattern detected in manifest: ${pattern}`,
        );
      }
    }

    // Check entry point for suspicious extensions
    const suspiciousExtensions = [".exe", ".bat", ".cmd", ".sh", ".ps1"];
    if (
      suspiciousExtensions.some((ext) =>
        manifest.entryPoint.toLowerCase().endsWith(ext),
      )
    ) {
      throw new SecurityError(
        `Suspicious entry point file extension: ${manifest.entryPoint}`,
      );
    }
  }

  private async validatePermissions(
    permissions: PluginPermission[],
  ): Promise<void> {
    for (const permission of permissions) {
      if (!this.isValidPermission(permission)) {
        throw new SecurityError(
          `Invalid permission: ${JSON.stringify(permission)}`,
        );
      }

      // Check against security policies
      if (!this.securityPolicies.isPermissionAllowed(permission)) {
        throw new SecurityError(
          `Permission not allowed by security policy: ${permission.resource}.${permission.access}`,
        );
      }
    }
  }

  private async checkSuspiciousPatterns(
    manifest: PluginManifest,
  ): Promise<void> {
    // Check for suspicious keywords
    const suspiciousKeywords = [
      "crypto",
      "bitcoin",
      "mining",
      "keylogger",
      "password",
      "backdoor",
      "rootkit",
      "virus",
      "malware",
      "trojan",
    ];

    const textToCheck = [
      manifest.name,
      manifest.description,
      ...manifest.keywords,
    ]
      .join(" ")
      .toLowerCase();

    for (const keyword of suspiciousKeywords) {
      if (textToCheck.includes(keyword)) {
        // Log but don't block - might be legitimate
        this.auditLogger.log("security", "suspicious_keyword", {
          pluginName: manifest.name,
          keyword,
          timestamp: Date.now(),
        });
      }
    }
  }

  private isValidPermission(permission: PluginPermission): boolean {
    const validResources = [
      "data",
      "storage",
      "network",
      "ui",
      "core",
      "filesystem",
    ];
    const validAccess = ["read", "write", "execute"];

    return (
      validResources.includes(permission.resource) &&
      validAccess.includes(permission.access)
    );
  }

  private getRequiredPermission(
    operation: string,
    params: any,
  ): PluginPermission {
    // Map operations to required permissions
    const operationMap: Record<string, PluginPermission> = {
      "data.read": { resource: "data", access: "read" },
      "data.write": { resource: "data", access: "write" },
      "data.query": { resource: "data", access: "read" },
      "storage.get": { resource: "storage", access: "read" },
      "storage.set": { resource: "storage", access: "write" },
      "network.fetch": { resource: "network", access: "read" },
      "network.post": { resource: "network", access: "write" },
      "ui.render": { resource: "ui", access: "write" },
      "ui.update": { resource: "ui", access: "write" },
      "core.metrics": { resource: "core", access: "read" },
      "filesystem.read": { resource: "filesystem", access: "read" },
      "filesystem.write": { resource: "filesystem", access: "write" },
    };

    return operationMap[operation] || { resource: "core", access: "execute" };
  }

  private permissionMatches(
    granted: PluginPermission,
    required: PluginPermission,
  ): boolean {
    if (granted.resource !== required.resource) return false;

    // Execute permission includes read and write
    if (granted.access === "execute") return true;

    // Write permission includes read for the same resource
    if (granted.access === "write" && required.access === "read") return true;

    return granted.access === required.access;
  }

  private getAllowedAPIs(pluginName: string): string[] {
    const permissions = this.permissions.get(pluginName);
    if (!permissions) return [];

    const allowedAPIs: string[] = [];

    for (const perm of permissions) {
      switch (perm.resource) {
        case "data":
          allowedAPIs.push("data.query", "data.read");
          if (perm.access === "write" || perm.access === "execute") {
            allowedAPIs.push("data.write", "data.update");
          }
          break;
        case "storage":
          allowedAPIs.push("storage.get");
          if (perm.access === "write" || perm.access === "execute") {
            allowedAPIs.push("storage.set", "storage.remove");
          }
          break;
        case "network":
          if (perm.access === "read" || perm.access === "execute") {
            allowedAPIs.push("network.fetch");
          }
          if (perm.access === "write" || perm.access === "execute") {
            allowedAPIs.push("network.post", "network.put");
          }
          break;
        case "ui":
          if (perm.access === "write" || perm.access === "execute") {
            allowedAPIs.push("ui.render", "ui.update", "ui.notify");
          }
          break;
      }
    }

    return allowedAPIs;
  }

  private getMemoryLimit(pluginName: string): number {
    // Default: 50MB per plugin
    return 50 * 1024 * 1024;
  }

  private getTimeoutLimit(pluginName: string): number {
    // Default: 30 seconds
    return 30000;
  }

  private hasNetworkPermission(pluginName: string): boolean {
    const permissions = this.permissions.get(pluginName);
    if (!permissions) return false;

    return Array.from(permissions).some((perm) => perm.resource === "network");
  }

  private sanitizeParams(params: any): any {
    // Remove sensitive data from audit logs
    if (typeof params !== "object" || params === null) return params;

    const sanitized = { ...params };
    const sensitiveKeys = ["password", "token", "key", "secret", "credential"];

    for (const key of Object.keys(sanitized)) {
      if (
        sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))
      ) {
        sanitized[key] = "[REDACTED]";
      }
    }

    return sanitized;
  }

  private async detectSuspiciousActivity(
    events: AuditEvent[],
  ): Promise<SuspiciousActivity[]> {
    const suspicious: SuspiciousActivity[] = [];
    const now = Date.now();
    const timeWindow = 60000; // 1 minute

    // Detect rapid permission denials
    const recentDenials = events.filter(
      (e) => e.type === "permission_denied" && now - e.timestamp < timeWindow,
    );

    if (recentDenials.length > 10) {
      suspicious.push({
        type: "rapid_permission_denials",
        description: `${recentDenials.length} permission denials in the last minute`,
        severity: "high",
        events: recentDenials.slice(-5).map((e) => e.id),
      });
    }

    // Detect suspicious keyword usage
    const keywordEvents = events.filter((e) => e.type === "suspicious_keyword");
    if (keywordEvents.length > 0) {
      suspicious.push({
        type: "suspicious_keywords",
        description: `Plugins using suspicious keywords detected`,
        severity: "medium",
        events: keywordEvents.map((e) => e.id),
      });
    }

    return suspicious;
  }

  private generateSecurityRecommendations(events: AuditEvent[]): string[] {
    const recommendations: string[] = [];

    const violations = events.filter((e) => e.type === "permission_denied");
    if (violations.length > 100) {
      recommendations.push(
        "High number of permission violations detected. Review plugin permissions.",
      );
    }

    const suspiciousEvents = events.filter(
      (e) => e.type === "suspicious_keyword",
    );
    if (suspiciousEvents.length > 0) {
      recommendations.push(
        "Plugins with suspicious keywords detected. Review manually.",
      );
    }

    if (this.sandboxes.size > 20) {
      recommendations.push(
        "Large number of active sandboxes. Consider resource optimization.",
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("No security issues detected. Continue monitoring.");
    }

    return recommendations;
  }
}

export class PluginSandbox {
  private pluginName: string;
  private config: SandboxConfig;
  private worker: Worker | null = null;
  private messageChannel: MessageChannel | null = null;
  private initialized = false;

  constructor(pluginName: string, config: SandboxConfig) {
    this.pluginName = pluginName;
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create dedicated worker for plugin execution
      const workerCode = this.generateWorkerCode();
      const workerBlob = new Blob([workerCode], {
        type: "application/javascript",
      });
      this.worker = new Worker(URL.createObjectURL(workerBlob));

      this.messageChannel = new MessageChannel();

      // Set up secure communication channel
      this.worker.postMessage(
        {
          type: "initialize",
          config: this.config,
          port: this.messageChannel.port1,
        },
        [this.messageChannel.port1],
      );

      // Wait for initialization confirmation
      await this.waitForInitialization();
      this.initialized = true;
    } catch (error) {
      throw new SecurityError(
        `Failed to initialize sandbox for ${this.pluginName}: ${error}`,
      );
    }
  }

  async execute(code: string, context: any): Promise<any> {
    if (!this.initialized || !this.worker || !this.messageChannel) {
      throw new SecurityError("Sandbox not initialized");
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new SecurityError("Plugin execution timeout"));
      }, this.config.timeoutLimit);

      const messageHandler = (event: MessageEvent) => {
        clearTimeout(timeout);
        this.messageChannel!.port2.removeEventListener(
          "message",
          messageHandler,
        );

        if (event.data.error) {
          reject(new SecurityError(event.data.error));
        } else {
          resolve(event.data.result);
        }
      };

      this.messageChannel?.port2.addEventListener("message", messageHandler);
      this.messageChannel?.port2.start();

      this.messageChannel?.port2.postMessage({
        type: "execute",
        code,
        context,
      });
    });
  }

  getConfig(): SandboxConfig {
    return { ...this.config };
  }

  async destroy(): Promise<void> {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    if (this.messageChannel) {
      this.messageChannel.port1.close();
      this.messageChannel.port2.close();
      this.messageChannel = null;
    }
    this.initialized = false;
  }

  private generateWorkerCode(): string {
    return `
      let port = null;
      let config = null;
      
      self.onmessage = function(event) {
        if (event.data.type === 'initialize') {
          config = event.data.config;
          port = event.data.port;
          port.onmessage = handleMessage;
          port.postMessage({ type: 'initialized' });
        }
      };
      
      function handleMessage(event) {
        if (event.data.type === 'execute') {
          try {
            // Create restricted execution environment
            const restrictedGlobals = createRestrictedEnvironment();
            const result = executeInSandbox(event.data.code, event.data.context, restrictedGlobals);
            port.postMessage({ result });
          } catch (error) {
            port.postMessage({ error: error.message });
          }
        }
      }
      
      function createRestrictedEnvironment() {
        // Create a restricted global environment
        const restricted = {};
        
        // Allow only safe APIs based on permissions
        if (config.allowedAPIs.includes('data.read')) {
          restricted.console = { log: console.log };
        }
        
        // Add other allowed APIs based on permissions
        return restricted;
      }
      
      function executeInSandbox(code, context, globals) {
        // Simple sandbox execution - in production, use a more robust solution
        const func = new Function('context', 'globals', \`
          with (globals) {
            \${code}
          }
        \`);
        return func(context, globals);
      }
    `;
  }

  private async waitForInitialization(): Promise<void> {
    if (!this.messageChannel) {
      throw new SecurityError("Message channel not available");
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new SecurityError("Sandbox initialization timeout"));
      }, 5000);

      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === "initialized") {
          clearTimeout(timeout);
          this.messageChannel?.port2.removeEventListener(
            "message",
            messageHandler,
          );
          resolve();
        }
      };

      this.messageChannel?.port2.addEventListener("message", messageHandler);
      this.messageChannel?.port2.start();
    });
  }
}

export interface SandboxConfig {
  allowedAPIs: string[];
  memoryLimit: number;
  timeoutLimit: number;
  networkAccess: boolean;
  permissions: PluginPermission[];
}

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityError";
  }
}

export class AuditLogger {
  private events: AuditEvent[] = [];
  private maxEvents = 10000;

  async initialize(): Promise<void> {
    // Initialize audit logging
  }

  log(category: string, type: string, data: any): void {
    const event: AuditEvent = {
      id: this.generateEventId(),
      category,
      type,
      data,
      timestamp: Date.now(),
    };

    this.events.push(event);

    // Maintain size limit
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  async getEvents(filter?: EventFilter): Promise<AuditEvent[]> {
    let filtered = [...this.events];

    if (filter) {
      if (filter.category) {
        filtered = filtered.filter((e) => e.category === filter.category);
      }
      if (filter.type) {
        filtered = filtered.filter((e) => e.type === filter.type);
      }
      if (filter.since) {
        filtered = filtered.filter((e) => e.timestamp >= filter.since!);
      }
      if (filter.limit) {
        filtered = filtered.slice(-filter.limit);
      }
    }

    return filtered;
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface AuditEvent {
  id: string;
  category: string;
  type: string;
  data: any;
  timestamp: number;
}

export interface EventFilter {
  category?: string;
  type?: string;
  since?: number;
  limit?: number;
}

export interface SecurityReport {
  timestamp: string;
  summary: {
    totalPlugins: number;
    activeSandboxes: number;
    securityEvents: number;
    violations: number;
    suspiciousActivity: number;
  };
  violations: AuditEvent[];
  suspiciousActivity: SuspiciousActivity[];
  recommendations: string[];
}

export interface SuspiciousActivity {
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
  events: string[];
}

export class SecurityPolicySet {
  private policies: SecurityPolicy[] = [];

  async loadDefault(): Promise<void> {
    this.policies = [
      {
        name: "default",
        allowedResources: ["data", "storage", "ui", "core"],
        blockedResources: ["filesystem"],
        maxMemoryMB: 50,
        maxExecutionTimeMs: 30000,
      },
    ];
  }

  isPermissionAllowed(permission: PluginPermission): boolean {
    return this.policies.some(
      (policy) =>
        policy.allowedResources.includes(permission.resource) &&
        !policy.blockedResources.includes(permission.resource),
    );
  }
}

export interface SecurityPolicy {
  name: string;
  allowedResources: string[];
  blockedResources: string[];
  maxMemoryMB: number;
  maxExecutionTimeMs: number;
}
