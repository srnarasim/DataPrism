import { IPlugin } from './plugin.js';
import { Dataset, DataType } from './data-processor.js';

export interface IVisualizationPlugin extends IPlugin {
  // Rendering Operations
  render(container: Element, data: Dataset, config?: RenderConfig): Promise<void>;
  update(data: Dataset): Promise<void>;
  resize(dimensions: Dimensions): Promise<void>;
  destroy(): Promise<void>;
  
  // Visualization Capabilities
  getVisualizationTypes(): VisualizationType[];
  getSupportedDataTypes(): DataType[];
  getInteractionFeatures(): InteractionFeature[];
  
  // Export and Configuration
  export(format: ExportFormat): Promise<Blob>;
  getConfiguration(): VisualizationConfig;
  setConfiguration(config: VisualizationConfig): Promise<void>;
  
  // Event Handling
  onInteraction(event: InteractionEvent): Promise<void>;
  getSelectionData(): any[];
  clearSelection(): Promise<void>;
}

export interface VisualizationType {
  name: string;
  description: string;
  category: 'chart' | 'table' | 'map' | 'network' | 'tree' | 'custom';
  requiredFields: FieldRequirement[];
  optionalFields: FieldRequirement[];
  preview?: string; // Base64 encoded preview image
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface FieldRequirement {
  name: string;
  types: DataType[];
  multiple: boolean;
  description: string;
}

export interface RenderConfig {
  theme: 'light' | 'dark' | 'auto';
  responsive: boolean;
  animation: boolean;
  interaction: boolean;
  customStyles?: Record<string, any>;
  accessibility?: AccessibilityConfig;
  performance?: PerformanceConfig;
}

export interface AccessibilityConfig {
  enabled: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

export interface PerformanceConfig {
  lazyLoading: boolean;
  virtualization: boolean;
  debounceMs: number;
  maxDataPoints: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface InteractionFeature {
  name: string;
  description: string;
  events: InteractionEventType[];
  configurable: boolean;
}

export type InteractionEventType = 
  | 'click' 
  | 'hover' 
  | 'select' 
  | 'zoom' 
  | 'pan' 
  | 'brush'
  | 'filter'
  | 'sort';

export interface InteractionEvent {
  type: InteractionEventType;
  target: any;
  data: any;
  position?: { x: number; y: number };
  modifiers?: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
  };
}

export type ExportFormat = 'svg' | 'png' | 'jpeg' | 'pdf' | 'html' | 'json' | 'csv';

export interface VisualizationConfig {
  layout: LayoutConfig;
  styling: StylingConfig;
  behavior: BehaviorConfig;
  data: DataConfig;
  [key: string]: any;
}

export interface LayoutConfig {
  margin: { top: number; right: number; bottom: number; left: number };
  padding: { top: number; right: number; bottom: number; left: number };
  orientation: 'horizontal' | 'vertical';
  alignment: 'start' | 'center' | 'end';
}

export interface StylingConfig {
  colors: string[];
  colorScheme: 'categorical' | 'sequential' | 'diverging';
  fonts: FontConfig;
  borders: BorderConfig;
  shadows: boolean;
}

export interface FontConfig {
  family: string;
  size: number;
  weight: 'normal' | 'bold' | 'lighter' | 'bolder';
  style: 'normal' | 'italic';
}

export interface BorderConfig {
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  radius: number;
}

export interface BehaviorConfig {
  interactive: boolean;
  zoomable: boolean;
  pannable: boolean;
  selectable: boolean;
  hoverable: boolean;
  clickable: boolean;
}

export interface DataConfig {
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'none';
  sorting: 'asc' | 'desc' | 'none';
  filtering: FilterConfig[];
  grouping: string[];
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
  active: boolean;
}