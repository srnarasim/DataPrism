# LLM Integration

Learn how DataPrism integrates with Large Language Models for intelligent analytics.

## Overview

DataPrism provides built-in LLM integration to enable natural language querying, automated insights generation, and intelligent data analysis.

## Supported Providers

### OpenAI

```javascript
import { DataPrismEngine } from '@dataprism/core';

const engine = new DataPrismEngine({
    llm: {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4'
    }
});
```

### Azure OpenAI

```javascript
const engine = new DataPrismEngine({
    llm: {
        provider: 'azure',
        endpoint: 'https://your-resource.openai.azure.com',
        apiKey: process.env.AZURE_OPENAI_KEY,
        deploymentName: 'gpt-4'
    }
});
```

### Anthropic Claude

```javascript
const engine = new DataPrismEngine({
    llm: {
        provider: 'anthropic',
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: 'claude-3-sonnet-20240229'
    }
});
```

### Local/Self-Hosted

```javascript
const engine = new DataPrismEngine({
    llm: {
        provider: 'local',
        endpoint: 'http://localhost:8080/v1',
        model: 'llama-3-8b'
    }
});
```

## Natural Language Querying

### Basic Queries

```javascript
// Natural language to SQL conversion
const result = await engine.nlQuery(
    "Show me the top 5 products by sales this month"
);

// Equivalent to:
// SELECT product_name, SUM(sales) as total_sales
// FROM sales_data
// WHERE date >= date_trunc('month', current_date)
// GROUP BY product_name
// ORDER BY total_sales DESC
// LIMIT 5
```

### Complex Analysis

```javascript
// Advanced analytics requests
const insights = await engine.nlQuery(
    "Analyze customer churn patterns and identify the main factors contributing to customer loss"
);

// Generates comprehensive analysis including:
// - Churn rate calculations
// - Cohort analysis
// - Feature importance
// - Recommendations
```

## Intelligent Insights

### Automated Insights

```javascript
// Generate insights from data
const insights = await engine.generateInsights({
    dataset: 'sales_data',
    focus: 'performance',
    timeframe: '3_months'
});

console.log(insights.summary);
console.log(insights.key_findings);
console.log(insights.recommendations);
```

### Anomaly Detection

```javascript
// AI-powered anomaly detection
const anomalies = await engine.detectAnomalies({
    dataset: 'metrics_data',
    columns: ['revenue', 'conversion_rate', 'traffic'],
    sensitivity: 'medium'
});

anomalies.forEach(anomaly => {
    console.log(`Anomaly detected: ${anomaly.description}`);
    console.log(`Severity: ${anomaly.severity}`);
    console.log(`Suggested action: ${anomaly.recommendation}`);
});
```

## Data Interpretation

### Visualization Suggestions

```javascript
// AI-suggested visualizations
const suggestions = await engine.suggestVisualizations({
    data: salesData,
    intent: 'trend_analysis'
});

suggestions.forEach(suggestion => {
    console.log(`Chart type: ${suggestion.type}`);
    console.log(`Rationale: ${suggestion.rationale}`);
    console.log(`Configuration: ${JSON.stringify(suggestion.config)}`);
});
```

### Report Generation

```javascript
// Automated report creation
const report = await engine.generateReport({
    dataset: 'quarterly_metrics',
    template: 'executive_summary',
    format: 'markdown'
});

console.log(report.content);
// Outputs structured report with:
// - Executive summary
// - Key metrics
// - Trends and patterns
// - Recommendations
```

## Context Management

### Dataset Context

```javascript
// Provide context about your data
await engine.setDatasetContext({
    name: 'sales_data',
    description: 'E-commerce sales transactions',
    schema: {
        order_id: 'unique identifier',
        customer_id: 'customer reference',
        product_name: 'product description',
        price: 'unit price in USD',
        quantity: 'items ordered',
        order_date: 'purchase timestamp'
    },
    business_context: {
        industry: 'E-commerce',
        key_metrics: ['revenue', 'conversion_rate', 'customer_lifetime_value'],
        seasonal_patterns: 'Higher sales during holidays'
    }
});
```

### Query History

```javascript
// Maintain conversation context
const conversation = await engine.createConversation();

await conversation.query("What are our top products?");
await conversation.query("How do their sales compare to last year?");
await conversation.query("What's driving the increase in Product A?");

// Each query understands the context from previous queries
```

## Custom Prompts

### Query Templates

```javascript
// Define custom prompt templates
engine.addPromptTemplate('revenue_analysis', `
Analyze the revenue data for {timeframe} and provide:
1. Total revenue and growth rate
2. Top performing segments
3. Underperforming areas
4. Specific recommendations for improvement

Focus on actionable insights for {business_unit}.
`);

// Use the template
const analysis = await engine.useTemplate('revenue_analysis', {
    timeframe: 'Q1 2024',
    business_unit: 'Western Region'
});
```

### Custom Instructions

```javascript
// Set system instructions
engine.setSystemInstructions(`
You are a data analyst for an e-commerce company. 
Always provide specific, actionable recommendations.
Focus on revenue growth and customer retention.
Use clear, business-friendly language.
Include confidence levels for your insights.
`);
```

## Performance Optimization

### Caching

```javascript
// Enable intelligent caching
const engine = new DataPrismEngine({
    llm: {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY,
        cache: {
            enabled: true,
            ttl: 3600, // 1 hour
            strategy: 'semantic' // Cache semantically similar queries
        }
    }
});
```

### Batch Processing

```javascript
// Process multiple queries efficiently
const queries = [
    "Top 5 customers by revenue",
    "Monthly sales trend",
    "Product performance analysis"
];

const results = await engine.batchNLQuery(queries);
```

## Error Handling

### Rate Limiting

```javascript
try {
    const result = await engine.nlQuery("Analyze customer behavior");
} catch (error) {
    if (error.type === 'RATE_LIMIT') {
        console.log(`Rate limited. Retry after: ${error.retryAfter}`);
    } else if (error.type === 'QUOTA_EXCEEDED') {
        console.log('API quota exceeded');
    }
}
```

### Fallback Strategies

```javascript
const engine = new DataPrismEngine({
    llm: {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY,
        fallback: {
            provider: 'local',
            endpoint: 'http://localhost:8080/v1'
        },
        retry: {
            maxAttempts: 3,
            backoffStrategy: 'exponential'
        }
    }
});
```

## Security Considerations

### Data Privacy

```javascript
// Configure privacy settings
const engine = new DataPrismEngine({
    llm: {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY,
        privacy: {
            sanitizeData: true,
            excludeColumns: ['email', 'phone', 'ssn'],
            anonymizeCustomers: true
        }
    }
});
```

### Request Filtering

```javascript
// Filter sensitive requests
engine.addRequestFilter((query) => {
    const sensitivePatterns = [
        /password/i,
        /credit.card/i,
        /social.security/i
    ];
    
    return !sensitivePatterns.some(pattern => pattern.test(query));
});
```

## Best Practices

### Query Optimization

1. **Be specific in your requests**
2. **Provide relevant context**
3. **Use consistent terminology**
4. **Break complex requests into smaller parts**

### Context Management

1. **Set dataset context early**
2. **Maintain conversation history**
3. **Use business-friendly language**
4. **Provide domain-specific instructions**

### Performance

1. **Enable caching for repeated queries**
2. **Use batch processing for multiple queries**
3. **Set appropriate timeouts**
4. **Monitor API usage and costs**

## Examples

### Sales Analysis

```javascript
// Comprehensive sales analysis
const analysis = await engine.nlQuery(`
    Analyze our sales performance for Q1 2024:
    1. Overall revenue vs Q1 2023
    2. Top and bottom performing products
    3. Geographic performance breakdown
    4. Customer segment analysis
    5. Recommendations for Q2
`);
```

### Customer Insights

```javascript
// Customer behavior analysis
const insights = await engine.nlQuery(`
    Analyze customer behavior patterns:
    - Purchase frequency by segment
    - Seasonal buying patterns
    - Customer lifetime value trends
    - Churn risk indicators
    - Retention strategies
`);
```

## Next Steps

- [Performance Optimization](/guide/performance)
- [Security Best Practices](/guide/security)
- [Plugin Development](/plugins/development)
- [API Reference](/api/)