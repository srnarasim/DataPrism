import { IPlugin } from './plugin.js';

export interface IUtilityPlugin extends IPlugin {
  // Core Utility Operations
  configure(settings: UtilitySettings): Promise<void>;
  monitor(metrics: UtilityMetrics): Promise<void>;
  log(level: LogLevel, message: string, context?: LogContext): Promise<void>;
  
  // Utility Features
  getUtilityFeatures(): UtilityFeature[];
  getSystemStatus(): Promise<SystemStatus>;
  performMaintenance(): Promise<MaintenanceResult>;
  
  // Health and Monitoring
  healthCheck(): Promise<HealthStatus>;
  getPerformanceReport(): Promise<PerformanceReport>;
  getResourceUsage(): Promise<ResourceUsage>;
}

export interface UtilitySettings {
  enabled: boolean;
  level: 'basic' | 'standard' | 'advanced';
  autoStart: boolean;
  configuration: Record<string, any>;
  schedule?: ScheduleConfig;
}

export interface ScheduleConfig {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: string; // HH:MM format
  timezone?: string;
  dayOfWeek?: number; // 0-6, Sunday = 0
  dayOfMonth?: number; // 1-31
}

export interface UtilityMetrics {
  timestamp: string;
  system: SystemMetrics;
  application: ApplicationMetrics;
  custom: Record<string, any>;
}

export interface SystemMetrics {
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  network: NetworkMetrics;
  storage: StorageMetrics;
}

export interface CPUMetrics {
  usage: number; // percentage
  cores: number;
  frequency: number; // MHz
  temperature?: number; // Celsius
}

export interface MemoryMetrics {
  total: number; // bytes
  used: number; // bytes
  free: number; // bytes
  cached: number; // bytes
}

export interface NetworkMetrics {
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  errors: number;
}

export interface StorageMetrics {
  total: number; // bytes
  used: number; // bytes
  free: number; // bytes
  iops: number; // operations per second
}

export interface ApplicationMetrics {
  uptime: number; // milliseconds
  requests: number;
  errors: number;
  responseTime: number; // milliseconds
  activeConnections: number;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  component?: string;
  operation?: string;
  user?: string;
  session?: string;
  metadata?: Record<string, any>;
}

export interface UtilityFeature {
  name: string;
  description: string;
  category: UtilityCategory;
  enabled: boolean;
  dependencies: string[];
  configuration: Record<string, any>;
}

export type UtilityCategory = 
  | 'monitoring' 
  | 'logging' 
  | 'security' 
  | 'performance'
  | 'backup'
  | 'validation'
  | 'automation'
  | 'reporting';

export interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical' | 'unknown';
  components: ComponentStatus[];
  lastCheck: string;
  uptime: number;
}

export interface ComponentStatus {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  message?: string;
  metrics?: Record<string, any>;
  lastCheck: string;
}

export interface MaintenanceResult {
  success: boolean;
  tasksPerformed: MaintenanceTask[];
  errors: MaintenanceError[];
  duration: number;
  nextScheduled?: string;
}

export interface MaintenanceTask {
  name: string;
  description: string;
  status: 'completed' | 'failed' | 'skipped';
  duration: number;
  result?: any;
}

export interface MaintenanceError {
  task: string;
  error: string;
  code: string;
  recoverable: boolean;
}

export interface HealthStatus {
  healthy: boolean;
  score: number; // 0-100
  checks: HealthCheck[];
  recommendations: string[];
  lastCheck: string;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  value?: any;
  threshold?: any;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceReport {
  period: {
    start: string;
    end: string;
    duration: number;
  };
  summary: PerformanceSummary;
  details: PerformanceDetail[];
  trends: PerformanceTrend[];
  recommendations: string[];
}

export interface PerformanceSummary {
  averageResponseTime: number;
  peakResponseTime: number;
  throughput: number;
  errorRate: number;
  availability: number; // percentage
}

export interface PerformanceDetail {
  metric: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  comparison: {
    previousPeriod: number;
    change: number;
    changePercent: number;
  };
}

export interface PerformanceTrend {
  metric: string;
  direction: 'improving' | 'degrading' | 'stable';
  confidence: number; // 0-1
  prediction: {
    nextPeriod: number;
    confidence: number;
  };
}

export interface ResourceUsage {
  timestamp: string;
  cpu: number; // percentage
  memory: number; // bytes
  storage: number; // bytes
  network: number; // bytes/second
  handles: number;
  threads: number;
}

// Specialized Utility Plugin Types

export interface ISecurityUtilityPlugin extends IUtilityPlugin {
  // Security-specific operations
  scanForVulnerabilities(): Promise<SecurityScanResult>;
  enforceSecurityPolicy(policy: SecurityPolicy): Promise<void>;
  auditSecurityEvents(): Promise<SecurityAuditResult>;
  generateSecurityReport(): Promise<SecurityReport>;
}

export interface SecurityScanResult {
  vulnerabilities: SecurityVulnerability[];
  riskScore: number; // 0-100
  recommendations: string[];
  scanDate: string;
}

export interface SecurityVulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  affected: string[];
  remediation: string;
}

export interface SecurityPolicy {
  authentication: AuthenticationPolicy;
  authorization: AuthorizationPolicy;
  encryption: EncryptionPolicy;
  compliance: CompliancePolicy;
}

export interface AuthenticationPolicy {
  required: boolean;
  methods: string[];
  sessionTimeout: number;
  maxAttempts: number;
}

export interface AuthorizationPolicy {
  model: 'rbac' | 'abac' | 'custom';
  defaultDeny: boolean;
  rules: AuthorizationRule[];
}

export interface AuthorizationRule {
  resource: string;
  actions: string[];
  subjects: string[];
  conditions?: string;
}

export interface EncryptionPolicy {
  atRest: boolean;
  inTransit: boolean;
  algorithm: string;
  keyRotation: number; // days
}

export interface CompliancePolicy {
  frameworks: string[];
  requirements: ComplianceRequirement[];
  auditFrequency: number; // days
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  controls: string[];
  automated: boolean;
}

export interface SecurityAuditResult {
  events: SecurityEvent[];
  anomalies: SecurityAnomaly[];
  summary: SecuritySummary;
  period: {
    start: string;
    end: string;
  };
}

export interface SecurityEvent {
  timestamp: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user?: string;
  resource: string;
  action: string;
  result: 'success' | 'failure';
  details: Record<string, any>;
}

export interface SecurityAnomaly {
  type: string;
  description: string;
  confidence: number; // 0-1
  risk: 'low' | 'medium' | 'high';
  events: string[]; // event IDs
}

export interface SecuritySummary {
  totalEvents: number;
  successfulAuthentications: number;
  failedAuthentications: number;
  accessViolations: number;
  anomaliesDetected: number;
  riskScore: number; // 0-100
}

export interface SecurityReport {
  executive: {
    summary: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    keyFindings: string[];
    recommendations: string[];
  };
  technical: {
    vulnerabilities: SecurityVulnerability[];
    incidents: SecurityEvent[];
    metrics: SecurityMetrics;
  };
  compliance: {
    status: 'compliant' | 'non-compliant' | 'partial';
    frameworks: ComplianceFramework[];
    gaps: ComplianceGap[];
  };
}

export interface SecurityMetrics {
  authenticationFailureRate: number;
  averageSessionDuration: number;
  privilegedAccessCount: number;
  dataAccessVolume: number;
}

export interface ComplianceFramework {
  name: string;
  version: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  coverage: number; // percentage
  lastAssessment: string;
}

export interface ComplianceGap {
  requirement: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  remediation: string;
  timeline: string;
}