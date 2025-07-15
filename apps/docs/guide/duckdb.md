# DuckDB Integration

Learn how DataPrism integrates with DuckDB for high-performance analytics.

## Overview

DataPrism uses DuckDB-WASM as its embedded analytical database engine, providing SQL query capabilities with columnar storage and vectorized execution.

## Features

### Columnar Storage

DuckDB stores data in a columnar format, optimized for analytical queries:

```sql
-- Efficient column-wise operations
SELECT 
    AVG(sales) as avg_sales,
    SUM(quantity) as total_quantity,
    COUNT(*) as record_count
FROM sales_data
WHERE date >= '2024-01-01';
```

### Vectorized Execution

Operations are performed on vectors of data rather than individual rows:

```javascript
// Vectorized aggregation example
const result = await engine.query(`
    SELECT 
        category,
        AVG(price) as avg_price,
        STDDEV(price) as price_stddev,
        COUNT(*) as product_count
    FROM products
    GROUP BY category
    ORDER BY avg_price DESC
`);
```

## Data Loading

### CSV Files

```javascript
// Load CSV data
const csvData = await engine.loadCSV('/data/sales.csv', {
    delimiter: ',',
    header: true,
    inferSchema: true
});
```

### JSON Data

```javascript
// Load JSON array
const jsonData = await engine.loadJSON([
    { id: 1, name: 'Product A', price: 29.99 },
    { id: 2, name: 'Product B', price: 49.99 }
]);
```

### Parquet Files

```javascript
// Load Parquet files (most efficient)
const parquetData = await engine.loadParquet('/data/analytics.parquet');
```

## Query Capabilities

### Standard SQL

DuckDB supports standard SQL with analytical extensions:

```sql
-- Window functions
SELECT 
    customer_id,
    order_date,
    amount,
    SUM(amount) OVER (
        PARTITION BY customer_id 
        ORDER BY order_date 
        ROWS UNBOUNDED PRECEDING
    ) as running_total
FROM orders;
```

### Analytical Functions

```sql
-- Statistical functions
SELECT 
    product_category,
    AVG(rating) as avg_rating,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY rating) as median_rating,
    MODE() WITHIN GROUP (ORDER BY rating) as mode_rating,
    CORR(price, rating) as price_rating_correlation
FROM product_reviews
GROUP BY product_category;
```

### Time Series Analysis

```sql
-- Time series operations
SELECT 
    date_trunc('month', order_date) as month,
    COUNT(*) as orders,
    SUM(amount) as revenue,
    LAG(SUM(amount), 1) OVER (ORDER BY date_trunc('month', order_date)) as prev_month_revenue,
    (SUM(amount) - LAG(SUM(amount), 1) OVER (ORDER BY date_trunc('month', order_date))) / 
    LAG(SUM(amount), 1) OVER (ORDER BY date_trunc('month', order_date)) * 100 as growth_rate
FROM orders
GROUP BY date_trunc('month', order_date)
ORDER BY month;
```

## Memory Management

### Configuration

```javascript
// Configure DuckDB memory settings
const engine = new DataPrismEngine({
    duckdb: {
        memory_limit: '1GB',
        threads: 4,
        max_memory: '2GB'
    }
});
```

### Memory Monitoring

```javascript
// Monitor memory usage
const memoryInfo = await engine.getMemoryInfo();
console.log(`Memory used: ${memoryInfo.used_memory}`);
console.log(`Memory limit: ${memoryInfo.memory_limit}`);
```

## Performance Optimization

### Indexing

```sql
-- Create indexes for better query performance
CREATE INDEX idx_customer_id ON orders(customer_id);
CREATE INDEX idx_order_date ON orders(order_date);
```

### Query Optimization

```javascript
// Use prepared statements for repeated queries
const stmt = await engine.prepare(`
    SELECT * FROM products 
    WHERE category = ? AND price BETWEEN ? AND ?
`);

const electronics = await stmt.execute(['Electronics', 100, 1000]);
const clothing = await stmt.execute(['Clothing', 20, 200]);
```

### Bulk Operations

```javascript
// Efficient bulk inserts
await engine.transaction(async (tx) => {
    const stmt = await tx.prepare('INSERT INTO products VALUES (?, ?, ?)');
    
    for (const product of products) {
        await stmt.execute([product.id, product.name, product.price]);
    }
});
```

## Data Types

### Supported Types

```sql
-- Comprehensive type system
CREATE TABLE example (
    id INTEGER,
    name VARCHAR,
    price DECIMAL(10,2),
    created_at TIMESTAMP,
    metadata JSON,
    tags VARCHAR[],
    coordinates STRUCT(lat DOUBLE, lng DOUBLE)
);
```

### Type Conversion

```javascript
// Automatic type inference
const result = await engine.query(`
    SELECT 
        CAST(price AS INTEGER) as price_int,
        CAST(created_at AS DATE) as creation_date,
        CAST(metadata AS VARCHAR) as metadata_str
    FROM products
`);
```

## Advanced Features

### Common Table Expressions (CTEs)

```sql
-- Complex analytical queries with CTEs
WITH monthly_sales AS (
    SELECT 
        DATE_TRUNC('month', order_date) as month,
        SUM(amount) as total_sales
    FROM orders
    GROUP BY DATE_TRUNC('month', order_date)
),
sales_with_growth AS (
    SELECT 
        month,
        total_sales,
        LAG(total_sales, 1) OVER (ORDER BY month) as prev_month_sales
    FROM monthly_sales
)
SELECT 
    month,
    total_sales,
    CASE 
        WHEN prev_month_sales IS NULL THEN NULL
        ELSE (total_sales - prev_month_sales) / prev_month_sales * 100
    END as growth_rate
FROM sales_with_growth;
```

### Regex and Text Functions

```sql
-- Advanced text processing
SELECT 
    customer_name,
    REGEXP_EXTRACT(email, '([^@]+)@([^.]+)\.(.+)') as email_parts,
    LEVENSHTEIN(customer_name, 'John Smith') as name_similarity
FROM customers
WHERE email SIMILAR TO '%@(gmail|yahoo|hotmail)\.com';
```

## Error Handling

### Query Errors

```javascript
try {
    const result = await engine.query('SELECT * FROM nonexistent_table');
} catch (error) {
    if (error.type === 'CATALOG_EXCEPTION') {
        console.error('Table not found:', error.message);
    } else if (error.type === 'SYNTAX_EXCEPTION') {
        console.error('SQL syntax error:', error.message);
    }
}
```

### Connection Management

```javascript
// Automatic connection recovery
const engine = new DataPrismEngine({
    duckdb: {
        auto_reconnect: true,
        max_retries: 3
    }
});
```

## Best Practices

### Query Performance

1. **Use appropriate data types**
2. **Create indexes on frequently queried columns**
3. **Use LIMIT for large result sets**
4. **Avoid SELECT * in production queries**
5. **Use prepared statements for repeated queries**

### Memory Management

1. **Monitor memory usage regularly**
2. **Set appropriate memory limits**
3. **Use transactions for bulk operations**
4. **Clean up temporary tables**

### Data Loading

1. **Use Parquet format for large datasets**
2. **Batch CSV loading for better performance**
3. **Compress data files when possible**
4. **Use appropriate column types**

## Next Steps

- [Performance Optimization](/guide/performance)
- [LLM Integration](/guide/llm)
- [Plugin Development](/plugins/development)
- [API Reference](/api/)