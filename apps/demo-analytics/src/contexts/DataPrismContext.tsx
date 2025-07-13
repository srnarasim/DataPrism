import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { DataPrismEngine } from "@dataprism/orchestration";

interface DataPrismContextValue {
  engine: DataPrismEngine | null;
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

export function DataPrismProvider({ children }: DataPrismProviderProps) {
  const [engine, setEngine] = useState<DataPrismEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<Error | null>(
    null,
  );

  const initializeDataPrism = useCallback(async () => {
    if (isInitializing || isInitialized) return;

    setIsInitializing(true);
    setInitializationError(null);

    try {
      console.log("🚀 Initializing DataPrism Core...");

      // Initialize the engine
      const engineInstance = new DataPrismEngine({
        maxMemoryMB: 512,
        enableWasmOptimizations: true,
        logLevel: import.meta.env.DEV ? "debug" : "info",
      });

      await engineInstance.initialize();
      console.log("✅ DataPrism engine initialized");

      setEngine(engineInstance);
      setIsInitialized(true);

      // Load sample datasets
      await loadSampleData(engineInstance);
    } catch (error) {
      console.error("❌ Failed to initialize DataPrism:", error);
      setInitializationError(
        error instanceof Error
          ? error
          : new Error("Unknown initialization error"),
      );
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, isInitialized]);

  const loadSampleData = async (engineInstance: DataPrismEngine) => {
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
      // Don't throw - this is not critical for demo functionality
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeDataPrism();
  }, [initializeDataPrism]);

  // Context methods
  const query = useCallback(
    async (sql: string) => {
      if (!engine) throw new Error("DataPrism engine not initialized");
      return await engine.query(sql);
    },
    [engine],
  );

  const loadData = useCallback(
    async (data: any[], tableName = "user_data") => {
      if (!engine) throw new Error("DataPrism engine not initialized");
      return await engine.loadData(data, tableName);
    },
    [engine],
  );

  const getTableInfo = useCallback(
    async (tableName: string) => {
      if (!engine) throw new Error("DataPrism engine not initialized");
      return await engine.getTableInfo(tableName);
    },
    [engine],
  );

  const listTables = useCallback(async () => {
    if (!engine) throw new Error("DataPrism engine not initialized");
    return await engine.listTables();
  }, [engine]);

  const getPerformanceMetrics = useCallback(async () => {
    if (!engine) throw new Error("DataPrism engine not initialized");
    return engine.getMetrics();
  }, [engine]);

  const retry = useCallback(async () => {
    setIsInitialized(false);
    setInitializationError(null);
    await initializeDataPrism();
  }, [initializeDataPrism]);

  const value: DataPrismContextValue = {
    engine,
    isInitialized,
    isInitializing,
    initializationError,
    query,
    loadData,
    getTableInfo,
    listTables,
    getPerformanceMetrics,
    retry,
  };

  return (
    <DataPrismContext.Provider value={value}>
      {children}
    </DataPrismContext.Provider>
  );
}

// Sample data generators
function generateSalesData(count: number) {
  const regions = ["North", "South", "East", "West"];
  const products = ["Widget A", "Widget B", "Gadget X", "Gadget Y", "Tool Z"];
  const salespeople = ["Alice", "Bob", "Charlie", "Diana", "Eve"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    date: new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1,
    )
      .toISOString()
      .split("T")[0],
    region: regions[Math.floor(Math.random() * regions.length)],
    product: products[Math.floor(Math.random() * products.length)],
    salesperson: salespeople[Math.floor(Math.random() * salespeople.length)],
    quantity: Math.floor(Math.random() * 100) + 1,
    unit_price: Math.round((Math.random() * 1000 + 50) * 100) / 100,
    total: 0, // Will be calculated
  })).map((row) => ({
    ...row,
    total: Math.round(row.quantity * row.unit_price * 100) / 100,
  }));
}

function generateAnalyticsData(count: number) {
  const sources = [
    "google",
    "facebook",
    "twitter",
    "linkedin",
    "direct",
    "email",
  ];
  const pages = ["/", "/products", "/about", "/contact", "/blog", "/pricing"];
  const devices = ["desktop", "mobile", "tablet"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    timestamp: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    user_id: `user_${Math.floor(Math.random() * 1000) + 1}`,
    session_id: `session_${Math.floor(Math.random() * 2000) + 1}`,
    source: sources[Math.floor(Math.random() * sources.length)],
    page: pages[Math.floor(Math.random() * pages.length)],
    device: devices[Math.floor(Math.random() * devices.length)],
    duration: Math.floor(Math.random() * 600) + 10, // 10 seconds to 10 minutes
    bounce: Math.random() < 0.4,
    conversion: Math.random() < 0.1,
  }));
}

function generateProductData(count: number) {
  const categories = [
    "Electronics",
    "Clothing",
    "Books",
    "Home & Garden",
    "Sports",
    "Toys",
  ];
  const brands = ["BrandA", "BrandB", "BrandC", "BrandD", "BrandE"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    brand: brands[Math.floor(Math.random() * brands.length)],
    price: Math.round((Math.random() * 500 + 10) * 100) / 100,
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
    reviews_count: Math.floor(Math.random() * 1000),
    in_stock: Math.random() < 0.9,
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  }));
}
