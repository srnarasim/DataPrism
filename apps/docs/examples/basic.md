# Basic Usage Examples

Learn DataPrism Core fundamentals through simple, practical examples.

## Getting Started

### Installation

```bash
npm install @dataprism/core
```

### Basic Engine Setup

```typescript
import { DataPrismEngine } from "@dataprism/core";

const engine = new DataPrismEngine();
await engine.initialize();

console.log("DataPrism Core initialized successfully!");
```

## Loading Data

### From Array of Objects

```typescript
const salesData = [
  { id: 1, product: "Widget A", amount: 1500, date: "2024-01-01" },
  { id: 2, product: "Widget B", amount: 2300, date: "2024-01-02" },
  { id: 3, product: "Widget A", amount: 1800, date: "2024-01-03" }
];

const result = await engine.loadData(salesData, "sales");
console.log(`Loaded ${result.rowCount} rows`);
```

### From CSV String

```typescript
const csvData = `id,name,age,city
1,John,25,New York
2,Jane,30,San Francisco
3,Bob,35,Chicago`;

const result = await engine.loadCSV(csvData, "users");
console.log(`Loaded ${result.rowCount} users`);
```

## Basic Queries

### Simple SELECT

```typescript
const result = await engine.query("SELECT * FROM sales");
console.log("All sales:", result.data);
```

### Filtering Data

```typescript
const highValueSales = await engine.query(
  "SELECT * FROM sales WHERE amount > 1600"
);
console.log(`Found ${highValueSales.rowCount} high-value sales`);
```

### Aggregation

```typescript
const summary = await engine.query(`
  SELECT 
    product,
    COUNT(*) as sales_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
  FROM sales 
  GROUP BY product
`);

console.log("Sales summary:", summary.data);
```

## Data Transformation

### Parameterized Queries

```typescript
const productSales = await engine.query(
  "SELECT * FROM sales WHERE product = ? AND amount > ?",
  ["Widget A", 1000]
);

console.log(`Found ${productSales.rowCount} Widget A sales over $1000`);
```

### Date Operations

```typescript
const recentSales = await engine.query(`
  SELECT 
    product,
    amount,
    date,
    EXTRACT(MONTH FROM date) as month
  FROM sales 
  WHERE date >= '2024-01-01'
  ORDER BY date DESC
`);

console.log("Recent sales:", recentSales.data);
```

## Working with Multiple Tables

### Loading Related Data

```typescript
const products = [
  { id: 1, name: "Widget A", category: "Electronics" },
  { id: 2, name: "Widget B", category: "Home" }
];

const customers = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" }
];

const orders = [
  { id: 1, customer_id: 1, product_id: 1, quantity: 2, date: "2024-01-01" },
  { id: 2, customer_id: 2, product_id: 2, quantity: 1, date: "2024-01-02" }
];

await engine.loadData(products, "products");
await engine.loadData(customers, "customers");
await engine.loadData(orders, "orders");
```

### JOIN Operations

```typescript
const orderDetails = await engine.query(`
  SELECT 
    o.id as order_id,
    c.name as customer_name,
    p.name as product_name,
    o.quantity,
    o.date
  FROM orders o
  JOIN customers c ON o.customer_id = c.id
  JOIN products p ON o.product_id = p.id
  ORDER BY o.date DESC
`);

console.log("Order details:", orderDetails.data);
```

## Error Handling

### Basic Error Handling

```typescript
try {
  const result = await engine.query("SELECT * FROM nonexistent_table");
} catch (error) {
  console.error("Query failed:", error.message);
}
```

### Validating Data Before Loading

```typescript
function validateSalesData(data) {
  const errors = [];
  
  data.forEach((row, index) => {
    if (!row.id || typeof row.id !== 'number') {
      errors.push(`Row ${index}: Invalid ID`);
    }
    if (!row.amount || row.amount <= 0) {
      errors.push(`Row ${index}: Invalid amount`);
    }
    if (!row.date || !Date.parse(row.date)) {
      errors.push(`Row ${index}: Invalid date`);
    }
  });
  
  return errors;
}

const salesData = [
  { id: 1, product: "Widget A", amount: 1500, date: "2024-01-01" },
  { id: "invalid", product: "Widget B", amount: -100, date: "invalid-date" }
];

const errors = validateSalesData(salesData);
if (errors.length > 0) {
  console.error("Data validation errors:", errors);
} else {
  const result = await engine.loadData(salesData, "sales");
  console.log("Data loaded successfully");
}
```

## Performance Tips

### Batch Loading

```typescript
// Load large datasets in batches
const largeDataset = generateLargeDataset(100000);

const result = await engine.loadData(largeDataset, "large_table", {
  batchSize: 5000,
  onProgress: (progress) => {
    console.log(`Loading: ${progress.percentage}%`);
  }
});

console.log(`Loaded ${result.rowCount} rows in ${result.loadTime}ms`);
```

### Query Optimization

```typescript
// Use indexes for better performance
const result = await engine.loadData(salesData, "sales", {
  createIndexes: [
    { name: "idx_product", columns: ["product"] },
    { name: "idx_date", columns: ["date"] }
  ]
});

// Query with index
const optimizedQuery = await engine.query(
  "SELECT * FROM sales WHERE product = 'Widget A' AND date >= '2024-01-01'"
);
```

## Complete Example: Sales Analysis

```typescript
import { DataPrismEngine } from "@dataprism/core";

async function salesAnalysis() {
  // Initialize engine
  const engine = new DataPrismEngine();
  await engine.initialize();
  
  // Sample data
  const salesData = [
    { id: 1, product: "Laptop", amount: 1200, date: "2024-01-01", region: "North" },
    { id: 2, product: "Mouse", amount: 25, date: "2024-01-02", region: "South" },
    { id: 3, product: "Keyboard", amount: 80, date: "2024-01-03", region: "East" },
    { id: 4, product: "Laptop", amount: 1100, date: "2024-01-04", region: "West" },
    { id: 5, product: "Mouse", amount: 30, date: "2024-01-05", region: "North" }
  ];
  
  // Load data
  const loadResult = await engine.loadData(salesData, "sales", {
    createIndexes: [
      { name: "idx_product", columns: ["product"] },
      { name: "idx_region", columns: ["region"] }
    ]
  });
  
  console.log(`✓ Loaded ${loadResult.rowCount} sales records`);
  
  // Analysis queries
  const totalSales = await engine.query(
    "SELECT SUM(amount) as total FROM sales"
  );
  
  const salesByProduct = await engine.query(`
    SELECT 
      product,
      COUNT(*) as sales_count,
      SUM(amount) as total_amount,
      AVG(amount) as avg_amount
    FROM sales 
    GROUP BY product 
    ORDER BY total_amount DESC
  `);
  
  const salesByRegion = await engine.query(`
    SELECT 
      region,
      COUNT(*) as sales_count,
      SUM(amount) as total_amount
    FROM sales 
    GROUP BY region 
    ORDER BY total_amount DESC
  `);
  
  // Display results
  console.log("\n📊 Sales Analysis Results:");
  console.log(`Total Sales: $${totalSales.data[0].total}`);
  
  console.log("\nSales by Product:");
  salesByProduct.data.forEach(row => {
    console.log(`- ${row.product}: ${row.sales_count} sales, $${row.total_amount} total (avg: $${row.avg_amount.toFixed(2)})`);
  });
  
  console.log("\nSales by Region:");
  salesByRegion.data.forEach(row => {
    console.log(`- ${row.region}: ${row.sales_count} sales, $${row.total_amount} total`);
  });
  
  // Cleanup
  await engine.shutdown();
}

// Run the analysis
salesAnalysis().catch(console.error);
```

## Next Steps

- Try the [Advanced Examples](/examples/advanced) for more complex use cases
- Learn about [Plugin Examples](/examples/plugins) for extending functionality
- Check out the [API Reference](/api/) for complete documentation

## Common Patterns

### Data Loading Pattern

```typescript
async function loadAndAnalyze(data, tableName) {
  try {
    // Load data with progress tracking
    const result = await engine.loadData(data, tableName, {
      onProgress: (progress) => {
        console.log(`Loading ${tableName}: ${progress.percentage}%`);
      }
    });
    
    console.log(`✓ Loaded ${result.rowCount} rows into ${tableName}`);
    
    // Basic analysis
    const summary = await engine.query(`
      SELECT 
        COUNT(*) as row_count,
        COUNT(DISTINCT *) as unique_rows
      FROM ${tableName}
    `);
    
    console.log(`Summary: ${summary.data[0].row_count} total, ${summary.data[0].unique_rows} unique`);
    
    return result;
  } catch (error) {
    console.error(`Failed to load ${tableName}:`, error.message);
    throw error;
  }
}
```

### Query Pattern

```typescript
async function safeQuery(sql, params = []) {
  try {
    const startTime = Date.now();
    const result = await engine.query(sql, params);
    const endTime = Date.now();
    
    console.log(`✓ Query executed in ${endTime - startTime}ms, returned ${result.rowCount} rows`);
    return result;
  } catch (error) {
    console.error(`Query failed: ${error.message}`);
    console.error(`SQL: ${sql}`);
    console.error(`Params: ${JSON.stringify(params)}`);
    throw error;
  }
}
```

These examples provide a solid foundation for using DataPrism Core. Experiment with your own data and queries to get comfortable with the API!
