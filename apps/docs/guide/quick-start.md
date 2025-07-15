# Quick Start

Get up and running with DataPrism in minutes.

## 1. Installation

Choose your preferred installation method:

### CDN (Recommended for beginners)

```html
<script type="module">
import { DataPrismEngine } from "https://srnarasim.github.io/DataPrism/dataprism.min.js";
</script>
```

### Package Manager

```bash
npm install @dataprism/core
```

## 2. Initialize DataPrism

```javascript
import { DataPrismEngine } from "@dataprism/core";

const engine = new DataPrismEngine();
await engine.initialize();
```

## 3. Load Your Data

```javascript
// Load CSV data
const data = await engine.loadCSV('/path/to/your/data.csv');

// Or load JSON data
const data = await engine.loadJSON([
  { name: 'Alice', age: 25, city: 'New York' },
  { name: 'Bob', age: 30, city: 'San Francisco' }
]);
```

## 4. Run Analytics

```javascript
// Run SQL queries
const result = await engine.query(`
  SELECT city, COUNT(*) as count, AVG(age) as avg_age
  FROM data
  GROUP BY city
`);

console.log(result);
```

## 5. Visualize Results

```javascript
// Create a simple chart
const chart = await engine.createChart({
  type: 'bar',
  data: result,
  x: 'city',
  y: 'count'
});

// Render to DOM
document.getElementById('chart').appendChild(chart.element);
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>DataPrism Quick Start</title>
</head>
<body>
    <div id="chart"></div>
    
    <script type="module">
    import { DataPrismEngine } from "https://srnarasim.github.io/DataPrism/dataprism.min.js";
    
    async function main() {
        const engine = new DataPrismEngine();
        await engine.initialize();
        
        // Sample data
        const data = [
            { product: 'Laptop', sales: 1200, quarter: 'Q1' },
            { product: 'Phone', sales: 800, quarter: 'Q1' },
            { product: 'Tablet', sales: 600, quarter: 'Q1' }
        ];
        
        await engine.loadJSON(data);
        
        const result = await engine.query(`
            SELECT product, SUM(sales) as total_sales
            FROM data
            GROUP BY product
            ORDER BY total_sales DESC
        `);
        
        console.log('Analytics Results:', result);
    }
    
    main();
    </script>
</body>
</html>
```

## Next Steps

- [Learn about the Architecture](/guide/architecture)
- [Explore Plugin System](/plugins/)
- [Browse Examples](/examples/)
- [API Reference](/api/)