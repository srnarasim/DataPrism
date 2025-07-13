import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

// Mock interfaces for development
interface MockDataPrismEngine {
  initialize: () => Promise<void>;
  query: (sql: string) => Promise<any>;
  loadData: (data: any[], tableName: string) => Promise<void>;
}

interface MockDataPrismOrchestrator {
  initialize: () => Promise<void>;
  getMetrics: () => Promise<any>;
  clearCache: () => Promise<void>;
}

interface DataPrismContextValue {
  engine: MockDataPrismEngine | null;
  orchestrator: MockDataPrismOrchestrator | null;
  isInitialized: boolean;
  isInitializing: boolean;
  initializationError: Error | null;

  // Core operations
  query: (sql: string) => Promise<any>;
  loadData: (data: any[], tableName?: string) => Promise<void>;
  getTableInfo: (tableName: string) => Promise<any>;
  listTables: () => Promise<string[]>;

  // Performance monitoring
  getPerformanceMetrics: () => Promise<any>;
  clearCache: () => Promise<void>;

  // Utilities
  retry: () => Promise<void>;
}

const DataPrismContext = createContext<DataPrismContextValue | null>(null);

export function useDataPrism() {
  const context = useContext(DataPrismContext);
  if (!context) {
    throw new Error("useDataPrism must be used within a DataPrismProvider");
  }
  return context;
}

interface DataPrismProviderProps {
  children: React.ReactNode;
}

// Mock implementations for development
class MockEngine implements MockDataPrismEngine {
  private tables: Map<string, any[]> = new Map();

  async initialize() {
    console.log("🔧 Mock DataPrism Engine initialized");
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async query(sql: string) {
    console.log("📝 Mock query:", sql);
    
    // Simple mock responses for common queries
    if (sql.includes("SHOW TABLES")) {
      return {
        data: Array.from(this.tables.keys()).map(name => ({ name })),
        rowCount: this.tables.size,
        executionTime: Math.random() * 100
      };
    }
    
    if (sql.includes("DESCRIBE")) {
      const tableName = sql.split(" ")[1];
      if (this.tables.has(tableName)) {
        const sampleRow = this.tables.get(tableName)?.[0] || {};
        return {
          data: Object.keys(sampleRow).map(col => ({
            column_name: col,
            data_type: typeof sampleRow[col] === 'number' ? 'INTEGER' : 'VARCHAR',
            is_nullable: 'YES'
          })),
          rowCount: Object.keys(sampleRow).length,
          executionTime: Math.random() * 50
        };
      }
    }
    
    if (sql.includes("SELECT") || sql.includes("FROM")) {
      // Return sample data for any SELECT query
      const tables = Array.from(this.tables.entries());
      if (tables.length > 0) {
        const [tableName, data] = tables[0];
        return {
          data: data.slice(0, 10), // Return first 10 rows
          rowCount: data.length,
          executionTime: Math.random() * 200
        };
      }
    }
    
    return {
      data: [],
      rowCount: 0,
      executionTime: Math.random() * 100
    };
  }

  async loadData(data: any[], tableName: string) {
    console.log(`📊 Mock loading ${data.length} records into table: ${tableName}`);
    this.tables.set(tableName, data);
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate loading time
  }
}

class MockOrchestrator implements MockDataPrismOrchestrator {
  constructor(private engine: MockEngine) {}

  async initialize() {
    console.log("🎭 Mock DataPrism Orchestrator initialized");
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  async getMetrics() {
    return {
      queriesExecuted: Math.floor(Math.random() * 100),
      averageQueryTime: Math.floor(Math.random() * 200),
      cacheHitRate: Math.random(),
      memoryUsage: Math.floor(Math.random() * 100),
      tablesLoaded: Math.floor(Math.random() * 10),
    };
  }

  async clearCache() {
    console.log("🧹 Mock cache cleared");
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export function DataPrismProvider({ children }: DataPrismProviderProps) {
  const [engine, setEngine] = useState<MockEngine | null>(null);
  const [orchestrator, setOrchestrator] = useState<MockOrchestrator | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<Error | null>(null);

  const initializeDataPrism = useCallback(async () => {
    if (isInitializing || isInitialized) return;

    setIsInitializing(true);
    setInitializationError(null);

    try {
      console.log("🚀 Initializing Mock DataPrism Core...");

      // Initialize the mock engine
      const engineInstance = new MockEngine();
      await engineInstance.initialize();
      console.log("✅ Mock DataPrism Core engine initialized");

      // Initialize the mock orchestrator
      const orchestratorInstance = new MockOrchestrator(engineInstance);
      await orchestratorInstance.initialize();
      console.log("✅ Mock DataPrism Orchestrator initialized");

      setEngine(engineInstance);
      setOrchestrator(orchestratorInstance);
      setIsInitialized(true);

      // Load sample datasets
      await loadSampleData(engineInstance);
    } catch (error) {
      console.error("❌ Failed to initialize Mock DataPrism:", error);
      setInitializationError(
        error instanceof Error ? error : new Error("Unknown initialization error")
      );
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, isInitialized]);

  const loadSampleData = async (engineInstance: MockEngine) => {
    try {
      // Sample sales data
      const salesData = generateSalesData(1000);
      await engineInstance.loadData(salesData, "sales");
      console.log("📊 Loaded sample sales data (1000 records)");

      // Sample user analytics data
      const analyticsData = generateAnalyticsData(5000);
      await engineInstance.loadData(analyticsData, "analytics");
      console.log("📈 Loaded sample analytics data (5000 records)");

      // Sample product data
      const productData = generateProductData(200);
      await engineInstance.loadData(productData, "products");
      console.log("🛍️ Loaded sample product data (200 records)");
    } catch (error) {
      console.warn("⚠️ Failed to load sample data:", error);
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeDataPrism();
  }, [initializeDataPrism]);

  // Context methods
  const query = useCallback(
    async (sql: string) => {
      if (!engine) throw new Error("Mock DataPrism engine not initialized");
      return await engine.query(sql);
    },
    [engine]
  );

  const loadData = useCallback(
    async (data: any[], tableName = "user_data") => {
      if (!engine) throw new Error("Mock DataPrism engine not initialized");
      return await engine.loadData(data, tableName);
    },
    [engine]
  );

  const getTableInfo = useCallback(
    async (tableName: string) => {
      if (!engine) throw new Error("Mock DataPrism engine not initialized");
      const result = await engine.query(`DESCRIBE ${tableName}`);
      return result.data;
    },
    [engine]
  );

  const listTables = useCallback(async () => {
    if (!engine) throw new Error("Mock DataPrism engine not initialized");
    const result = await engine.query("SHOW TABLES");
    return result.data.map((row: any) => row.name);
  }, [engine]);

  const getPerformanceMetrics = useCallback(async () => {
    if (!orchestrator) throw new Error("Mock DataPrism orchestrator not initialized");
    return await orchestrator.getMetrics();
  }, [orchestrator]);

  const clearCache = useCallback(async () => {
    if (!orchestrator) throw new Error("Mock DataPrism orchestrator not initialized");
    return await orchestrator.clearCache();
  }, [orchestrator]);

  const retry = useCallback(async () => {
    setIsInitialized(false);
    setInitializationError(null);
    await initializeDataPrism();
  }, [initializeDataPrism]);

  const value: DataPrismContextValue = {
    engine,
    orchestrator,
    isInitialized,
    isInitializing,
    initializationError,
    query,
    loadData,
    getTableInfo,
    listTables,
    getPerformanceMetrics,
    clearCache,
    retry,
  };

  return (
    <DataPrismContext.Provider value={value}>
      {children}
    </DataPrismContext.Provider>
  );
}

// Sample data generators (same as original)
function generateSalesData(count: number) {
  const regions = ["North", "South", "East", "West"];
  const products = ["Widget A", "Widget B", "Gadget X", "Gadget Y", "Tool Z"];
  const salespeople = ["Alice", "Bob", "Charlie", "Diana", "Eve"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      .toISOString()
      .split("T")[0],
    region: regions[Math.floor(Math.random() * regions.length)],
    product: products[Math.floor(Math.random() * products.length)],
    salesperson: salespeople[Math.floor(Math.random() * salespeople.length)],
    quantity: Math.floor(Math.random() * 100) + 1,
    unit_price: Math.round((Math.random() * 1000 + 50) * 100) / 100,
    total: 0,
  })).map((row) => ({
    ...row,
    total: Math.round(row.quantity * row.unit_price * 100) / 100,
  }));
}

function generateAnalyticsData(count: number) {
  const sources = ["google", "facebook", "twitter", "linkedin", "direct", "email"];
  const pages = ["/", "/products", "/about", "/contact", "/blog", "/pricing"];
  const devices = ["desktop", "mobile", "tablet"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    user_id: `user_${Math.floor(Math.random() * 1000) + 1}`,
    session_id: `session_${Math.floor(Math.random() * 2000) + 1}`,
    source: sources[Math.floor(Math.random() * sources.length)],
    page: pages[Math.floor(Math.random() * pages.length)],
    device: devices[Math.floor(Math.random() * devices.length)],
    duration: Math.floor(Math.random() * 600) + 10,
    bounce: Math.random() < 0.4,
    conversion: Math.random() < 0.1,
  }));
}

function generateProductData(count: number) {
  const categories = ["Electronics", "Clothing", "Books", "Home & Garden", "Sports", "Toys"];
  const brands = ["BrandA", "BrandB", "BrandC", "BrandD", "BrandE"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    brand: brands[Math.floor(Math.random() * brands.length)],
    price: Math.round((Math.random() * 500 + 10) * 100) / 100,
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
    reviews_count: Math.floor(Math.random() * 1000),
    in_stock: Math.random() < 0.9,
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  }));
}