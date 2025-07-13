// Core plugin interfaces
export * from './plugin.js';
export * from './data-processor.js';
export * from './visualization.js';
export * from './integration.js';
export * from './utility.js';

// Re-export commonly used types for convenience
export type { 
  IPlugin,
  PluginManifest,
  PluginContext,
  PluginCapability,
  PluginCategory
} from './plugin.js';

export type {
  IDataProcessorPlugin,
  Dataset,
  ProcessingOptions,
  ValidationResult
} from './data-processor.js';

export type {
  IVisualizationPlugin,
  VisualizationType,
  RenderConfig,
  InteractionEvent
} from './visualization.js';

export type {
  IIntegrationPlugin,
  ILLMIntegrationPlugin,
  Connection,
  SyncResult,
  DataSource
} from './integration.js';

export type {
  IUtilityPlugin,
  ISecurityUtilityPlugin,
  UtilityFeature,
  SystemStatus,
  HealthStatus
} from './utility.js';