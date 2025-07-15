# Observable Charts Plugin

The Observable Charts plugin brings the power of Observable Plot and D3.js to DataPrism Core, enabling you to create stunning, interactive visualizations directly from your analytics queries.

## Features

- **Observable Plot Integration**: Full support for Observable Plot grammar
- **D3.js Support**: Access to the complete D3.js ecosystem
- **Interactive Charts**: Hover, zoom, pan, and selection interactions
- **Responsive Design**: Charts adapt to container size changes
- **Real-time Updates**: Charts update automatically when data changes
- **Export Capabilities**: Save charts as PNG, SVG, or PDF

## Installation

```bash
npm install @dataprism/plugin-observable-charts
```

## Quick Start

```typescript
import { DataPrismEngine } from "@dataprism/core";
import { createObservableChartsPlugin } from "@dataprism/plugin-observable-charts";

const engine = new DataPrismEngine();
const chartsPlugin = await createObservableChartsPlugin();

// Register the plugin
engine.registerPlugin(chartsPlugin);

// Create a simple bar chart
const chart = await chartsPlugin.createChart({
  type: "bar",
  data: salesData,
  x: "product",
  y: "revenue",
  title: "Revenue by Product"
});

// Render to DOM
document.getElementById("chart-container").appendChild(chart);
```

## Chart Types

### Bar Charts

```typescript
const barChart = await chartsPlugin.createChart({
  type: "bar",
  data: salesData,
  x: "category",
  y: "sales",
  fill: "steelblue",
  title: "Sales by Category"
});
```

### Line Charts

```typescript
const lineChart = await chartsPlugin.createChart({
  type: "line",
  data: timeSeriesData,
  x: "date",
  y: "value",
  stroke: "red",
  title: "Trend Over Time"
});
```

### Scatter Plots

```typescript
const scatterPlot = await chartsPlugin.createChart({
  type: "scatter",
  data: correlationData,
  x: "variable1",
  y: "variable2",
  fill: "category",
  title: "Correlation Analysis"
});
```

### Heatmaps

```typescript
const heatmap = await chartsPlugin.createChart({
  type: "heatmap",
  data: matrixData,
  x: "x_axis",
  y: "y_axis",
  fill: "value",
  title: "Data Heatmap"
});
```

## Advanced Features

### Faceting

```typescript
const facetedChart = await chartsPlugin.createChart({
  type: "bar",
  data: salesData,
  x: "month",
  y: "revenue",
  facet: "region",
  title: "Revenue by Month and Region"
});
```

### Interactions

```typescript
const interactiveChart = await chartsPlugin.createChart({
  type: "scatter",
  data: customerData,
  x: "age",
  y: "spending",
  interactions: {
    hover: true,
    zoom: true,
    selection: true
  },
  onHover: (point) => {
    console.log("Hovered:", point);
  },
  onSelect: (points) => {
    console.log("Selected:", points);
  }
});
```

### Custom Styling

```typescript
const styledChart = await chartsPlugin.createChart({
  type: "bar",
  data: salesData,
  x: "product",
  y: "revenue",
  style: {
    fill: "#3b82f6",
    stroke: "#1e40af",
    strokeWidth: 2
  },
  theme: "dark"
});
```

## Configuration Options

### Chart Configuration

```typescript
interface ChartConfig {
  type: "bar" | "line" | "scatter" | "heatmap" | "histogram" | "box";
  data: any[];
  x: string;
  y: string;
  fill?: string;
  stroke?: string;
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  theme?: "light" | "dark" | "auto";
  interactions?: {
    hover?: boolean;
    zoom?: boolean;
    pan?: boolean;
    selection?: boolean;
  };
  animations?: {
    enabled?: boolean;
    duration?: number;
    easing?: string;
  };
}
```

### Plugin Options

```typescript
const chartsPlugin = await createObservableChartsPlugin({
  defaultTheme: "light",
  enableAnimations: true,
  exportFormats: ["png", "svg", "pdf"],
  maxDataPoints: 10000,
  cacheSize: 50
});
```

## Integration with DataPrism Queries

```typescript
// Execute query and create chart in one step
const result = await engine.query(`
  SELECT product, SUM(revenue) as total_revenue
  FROM sales
  GROUP BY product
  ORDER BY total_revenue DESC
  LIMIT 10
`);

const chart = await chartsPlugin.createChart({
  type: "bar",
  data: result.data,
  x: "product",
  y: "total_revenue",
  title: "Top 10 Products by Revenue"
});
```

## Performance Considerations

- **Large Datasets**: For datasets > 10,000 points, consider data sampling or aggregation
- **Real-time Updates**: Use incremental updates rather than full redraws
- **Memory Management**: Charts are automatically cleaned up when removed from DOM
- **Rendering Optimization**: SVG for static charts, Canvas for interactive ones

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## API Reference

### Methods

#### `createChart(config: ChartConfig): Promise<HTMLElement>`

Creates a new chart with the specified configuration.

#### `updateChart(chart: HTMLElement, newData: any[]): void`

Updates an existing chart with new data.

#### `exportChart(chart: HTMLElement, format: 'png' | 'svg' | 'pdf'): Promise<Blob>`

Exports a chart in the specified format.

#### `getChartData(chart: HTMLElement): any[]`

Retrieves the current data from a chart.

## Examples

See the [Plugin Examples](/examples/plugins) page for more comprehensive examples and use cases.

## Troubleshooting

### Common Issues

**Chart not rendering**
- Ensure container has non-zero dimensions
- Check data format matches chart type requirements
- Verify Observable Plot is properly loaded

**Performance issues**
- Reduce data points or use sampling
- Disable animations for large datasets
- Use appropriate chart type for data size

**Styling problems**
- Check CSS conflicts with existing styles
- Verify theme compatibility
- Use custom CSS for fine-tuned control

## Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/srnarasim/DataPrism/blob/main/CONTRIBUTING.md) for details.

## License

MIT License. See [LICENSE](https://github.com/srnarasim/DataPrism/blob/main/LICENSE) for details.
