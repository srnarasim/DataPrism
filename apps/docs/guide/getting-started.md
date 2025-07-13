# Getting Started

This guide will help you set up DataPrism Core and build your first analytics application in under 10 minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** (for development)
- A **modern browser** with WebAssembly support
- Basic knowledge of **JavaScript/TypeScript**

::: tip
You can also use DataPrism Core via CDN without any build tools. [Skip to CDN usage](#cdn-usage) if you prefer a no-build approach.
:::

## Installation

Choose your preferred installation method:

### Method 1: NPM Package

Install DataPrism Core from NPM:

```bash
npm install @dataprism/core
```

For TypeScript projects, types are included automatically.

### Method 2: DataPrism CLI

Use our CLI for quick project scaffolding:

```bash
# Install CLI globally
npm install -g @dataprism/cli

# Create new project
dataprism init my-analytics-app
cd my-analytics-app
npm run dev
```

### Method 3: CDN

Include DataPrism Core directly from our CDN:

```html
<script type="module">
  import { DataPrismEngine } from "https://cdn.dataprism.dev/v1.0.0/core.min.js";

  // Your code here
</script>
```

## Your First Application

Let's build a simple analytics application that loads CSV data and runs queries.

### Step 1: Initialize the Engine

```typescript
import { DataPrismEngine } from "@dataprism/core";

async function initializeApp() {
  // Create and initialize the engine
  const engine = new DataPrismEngine({
    memoryLimit: "512MB",
    enableOptimizations: true,
  });

  await engine.initialize();
  console.log("✅ DataPrism Core initialized!");

  return engine;
}
```

### Step 2: Load Sample Data

```typescript
async function loadSampleData(engine) {
  // Sample sales data
  const salesData = [
    {
      date: "2024-01-01",
      product: "Widget A",
      region: "North",
      revenue: 1500,
      quantity: 10,
    },
    {
      date: "2024-01-01",
      product: "Widget B",
      region: "South",
      revenue: 2300,
      quantity: 15,
    },
    {
      date: "2024-01-02",
      product: "Widget A",
      region: "East",
      revenue: 1800,
      quantity: 12,
    },
    {
      date: "2024-01-02",
      product: "Widget C",
      region: "West",
      revenue: 2100,
      quantity: 14,
    },
    {
      date: "2024-01-03",
      product: "Widget B",
      region: "North",
      revenue: 1900,
      quantity: 13,
    },
  ];

  // Load data into DuckDB table
  await engine.loadData(salesData, "sales");
  console.log("📊 Sample data loaded!");
}
```

### Step 3: Run Analytics Queries

```typescript
async function runQueries(engine) {
  // Query 1: Total revenue by region
  const regionStats = await engine.query(`
    SELECT 
      region,
      SUM(revenue) as total_revenue,
      SUM(quantity) as total_quantity,
      COUNT(*) as transaction_count
    FROM sales 
    GROUP BY region 
    ORDER BY total_revenue DESC
  `);

  console.log("Revenue by Region:", regionStats.data);

  // Query 2: Daily trends
  const dailyTrends = await engine.query(`
    SELECT 
      date,
      SUM(revenue) as daily_revenue,
      AVG(revenue) as avg_transaction_value
    FROM sales 
    GROUP BY date 
    ORDER BY date
  `);

  console.log("Daily Trends:", dailyTrends.data);

  // Query 3: Product performance
  const productPerformance = await engine.query(`
    SELECT 
      product,
      SUM(revenue) as total_revenue,
      ROUND(AVG(revenue), 2) as avg_revenue,
      COUNT(DISTINCT region) as regions_sold
    FROM sales 
    GROUP BY product 
    ORDER BY total_revenue DESC
  `);

  console.log("Product Performance:", productPerformance.data);
}
```

### Step 4: Complete Application

Here's the complete application:

```typescript
import { DataPrismEngine } from "@dataprism/core";

async function main() {
  try {
    // Initialize engine
    const engine = await initializeApp();

    // Load sample data
    await loadSampleData(engine);

    // Run analytics queries
    await runQueries(engine);

    // Display results in the browser
    displayResults(engine);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

async function displayResults(engine) {
  // Create a simple HTML dashboard
  const dashboard = document.createElement("div");
  dashboard.innerHTML = `
    <h1>DataPrism Analytics Dashboard</h1>
    <div id="results"></div>
    <button id="refresh">Refresh Data</button>
  `;

  document.body.appendChild(dashboard);

  // Add refresh functionality
  document.getElementById("refresh").addEventListener("click", async () => {
    const newResults = await engine.query(
      "SELECT COUNT(*) as total_records FROM sales",
    );
    document.getElementById("results").innerHTML =
      `<p>Total Records: ${newResults.data[0].total_records}</p>`;
  });
}

// Start the application
main();
```

## Adding Visualizations

Enhance your application with charts and visualizations:

```typescript
import { Chart } from "chart.js/auto";

async function createCharts(engine) {
  // Get data for visualization
  const chartData = await engine.query(`
    SELECT region, SUM(revenue) as revenue 
    FROM sales 
    GROUP BY region
  `);

  // Create a bar chart
  const ctx = document.getElementById("revenueChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: chartData.data.map((row) => row.region),
      datasets: [
        {
          label: "Revenue by Region",
          data: chartData.data.map((row) => row.revenue),
          backgroundColor: "rgba(54, 162, 235, 0.8)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Revenue by Region",
        },
      },
    },
  });
}
```

## File Upload Support

Add CSV file upload functionality:

```typescript
function setupFileUpload(engine) {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".csv";

  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
      const text = await file.text();

      // Parse CSV and load into DataPrism
      await engine.loadCSV(text, "uploaded_data");

      // Show success message
      console.log(`✅ Loaded ${file.name} successfully!`);

      // Run a quick analysis
      const summary = await engine.query(`
        SELECT COUNT(*) as rows, 
               COUNT(DISTINCT *) as unique_rows
        FROM uploaded_data
      `);

      console.log("Data Summary:", summary.data[0]);
    }
  });

  document.body.appendChild(fileInput);
}
```

## Performance Monitoring

Monitor your application's performance:

```typescript
async function setupMonitoring(engine) {
  // Get performance metrics
  const metrics = await engine.getMetrics();
  console.log("Performance Metrics:", {
    memoryUsage: metrics.memoryUsage,
    queryCount: metrics.queryCount,
    avgQueryTime: metrics.avgQueryTime,
  });

  // Set up real-time monitoring
  setInterval(async () => {
    const currentMetrics = await engine.getMetrics();
    updateDashboard(currentMetrics);
  }, 5000);
}

function updateDashboard(metrics) {
  const dashboardElement = document.getElementById("metrics-dashboard");
  if (dashboardElement) {
    dashboardElement.innerHTML = `
      <div class="metrics">
        <div class="metric">
          <h3>Memory Usage</h3>
          <p>${metrics.memoryUsage}MB</p>
        </div>
        <div class="metric">
          <h3>Queries Executed</h3>
          <p>${metrics.queryCount}</p>
        </div>
        <div class="metric">
          <h3>Avg Query Time</h3>
          <p>${metrics.avgQueryTime}ms</p>
        </div>
      </div>
    `;
  }
}
```

## Next Steps

Congratulations! You've built your first DataPrism Core application. Here's what to explore next:

### Learn Core Concepts

- **[Architecture](/guide/architecture)** - Understand how DataPrism Core works under the hood
- **[Data Loading](/guide/data-loading)** - Learn about different data input methods
- **[Query Engine](/guide/query-engine)** - Master SQL queries and optimizations

### Build Advanced Features

- **[Custom Plugins](/guide/plugins)** - Extend functionality with plugins
- **[Performance Optimization](/guide/performance)** - Optimize for large datasets
- **[Memory Management](/guide/memory-management)** - Handle memory efficiently

### Explore Examples

- **[React Integration](/examples/react)** - Build React applications with DataPrism
- **[Real-time Analytics](/examples/realtime)** - Process streaming data
- **[Complex Queries](/examples/aggregations)** - Advanced SQL examples

### Join the Community

- **[GitHub Discussions](https://github.com/dataprism/core/discussions)** - Ask questions and share ideas
- **[Examples Repository](https://github.com/dataprism/examples)** - Community-contributed examples
- **[Newsletter](https://dataprism.dev/newsletter)** - Stay updated with latest features

## Troubleshooting

### Common Issues

**WebAssembly not supported**

```javascript
if (!("WebAssembly" in window)) {
  console.error("WebAssembly not supported in this browser");
  // Show fallback message to user
}
```

**Memory limit exceeded**

```javascript
try {
  await engine.loadData(largeDataset, "table");
} catch (error) {
  if (error.message.includes("memory")) {
    // Reduce dataset size or increase memory limit
    const engine = new DataPrismEngine({ memoryLimit: "1GB" });
  }
}
```

**Cross-origin issues**
Ensure your server sends the required headers:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

Need help? [Open an issue](https://github.com/dataprism/core/issues) or [start a discussion](https://github.com/dataprism/core/discussions).
