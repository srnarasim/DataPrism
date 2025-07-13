import React, { useState, useEffect } from "react";

interface ChartVisualizationProps {
  pluginSystem: any;
}

export const ChartVisualization: React.FC<ChartVisualizationProps> = ({
  pluginSystem,
}) => {
  const [chartTypes, setChartTypes] = useState<any[]>([]);
  const [selectedChart, setSelectedChart] = useState("bar");
  const [chartData, setChartData] = useState<any>(null);
  const [exportResult, setExportResult] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [chartKey, setChartKey] = useState<number>(0); // Force re-render
  const [chartSVG, setChartSVG] = useState<string>("");

  // Sample data for visualization
  const sampleData = {
    id: "sample_sales",
    name: "Sales Data",
    data: [
      { product: "Laptop", category: "Electronics", sales: 1200, month: "Jan" },
      { product: "Phone", category: "Electronics", sales: 800, month: "Jan" },
      { product: "Desk", category: "Furniture", sales: 300, month: "Jan" },
      { product: "Chair", category: "Furniture", sales: 250, month: "Jan" },
      { product: "Monitor", category: "Electronics", sales: 600, month: "Jan" },
    ],
    metadata: { source: "sales_system" },
  };

  useEffect(() => {
    const loadChartTypes = async () => {
      if (!pluginSystem) return;

      try {
        const types = await pluginSystem
          .getPluginManager()
          .executePlugin("chart-renderer", "getTypes");
        setChartTypes(types);
      } catch (error) {
        console.error("Failed to load chart types:", error);
      }
    };

    loadChartTypes();
  }, [pluginSystem]);

  const handleRenderChart = async () => {
    if (!pluginSystem) return;

    setLoading("render");
    try {
      const result = await pluginSystem
        .getPluginManager()
        .executePlugin("chart-renderer", "render", {
          container: null, // Not needed for string-based rendering
          data: sampleData,
          config: {
            chartType: selectedChart,
            theme: "light",
            responsive: true,
            animation: true,
          },
        });
      setChartData(result);
      setChartKey((prev) => prev + 1); // Force re-render

      // Create a mock visualization
      const svgString = generateMockChartSVG();
      setChartSVG(svgString);
    } catch (error) {
      console.error("Chart rendering failed:", error);
      alert("Failed to render chart");
    } finally {
      setLoading(null);
    }
  };

  const handleExportChart = async (format: string) => {
    if (!pluginSystem || !chartData) return;

    setLoading("export");
    try {
      const result = await pluginSystem
        .getPluginManager()
        .executePlugin("chart-renderer", "export", {
          format,
        });
      setExportResult(result);
    } catch (error) {
      console.error("Chart export failed:", error);
      alert("Failed to export chart");
    } finally {
      setLoading(null);
    }
  };

  const generateMockChartSVG = (): string => {
    const data = sampleData.data;

    // Mock chart based on selected type
    switch (selectedChart) {
      case "bar":
        return generateMockBarChartSVG(data);
      case "line":
        return generateMockLineChartSVG(data);
      case "pie":
        return generateMockPieChartSVG(data);
      case "scatter":
        return generateMockScatterChartSVG(data);
      default:
        return generateMockBarChartSVG(data);
    }
  };

  const generateMockBarChartSVG = (data: any[]): string => {
    const maxSales = Math.max(...data.map((d) => d.sales));
    const barWidth = 60;
    const spacing = 80;
    const chartHeight = 200;
    const startX = 50;
    const startY = 250;

    let bars = "";
    let labels = "";
    let values = "";

    data.forEach((item, index) => {
      const barHeight = (item.sales / maxSales) * chartHeight;
      const x = startX + index * spacing;
      const y = startY - barHeight;
      const color = `hsl(${200 + index * 30}, 70%, 50%)`;

      bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="4"/>`;
      labels += `<text x="${x + barWidth / 2}" y="${startY + 20}" text-anchor="middle" font-size="12" fill="#666">${item.product}</text>`;
      values += `<text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-size="10" fill="#333">${item.sales}</text>`;
    });

    return `
      <svg width="100%" height="300" viewBox="0 0 500 300" style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px;">
        <text x="250" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">Sales by Product (Bar Chart)</text>
        ${bars}
        ${labels}
        ${values}
      </svg>
    `;
  };

  const generateMockLineChartSVG = (data: any[]): string => {
    const points = data.map((item, index) => ({
      x: 50 + index * 80,
      y: 250 - (item.sales / 1200) * 180,
    }));

    const pathData =
      `M ${points[0].x} ${points[0].y} ` +
      points
        .slice(1)
        .map((p) => `L ${p.x} ${p.y}`)
        .join(" ");

    let circles = "";
    let labels = "";

    points.forEach((point, index) => {
      circles += `<circle cx="${point.x}" cy="${point.y}" r="4" fill="#667eea"/>`;
      labels += `<text x="${point.x}" y="270" text-anchor="middle" font-size="10" fill="#666">${data[index].product}</text>`;
    });

    return `
      <svg width="100%" height="300" viewBox="0 0 500 300" style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px;">
        <text x="250" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">Sales Trend (Line Chart)</text>
        <path d="${pathData}" stroke="#667eea" stroke-width="3" fill="none"/>
        ${circles}
        ${labels}
      </svg>
    `;
  };

  const generateMockPieChartSVG = (data: any[]): string => {
    const total = data.reduce((sum, item) => sum + item.sales, 0);
    const centerX = 250;
    const centerY = 150;
    const radius = 80;

    let paths = "";
    let labels = "";
    let startAngle = 0;

    data.forEach((item, index) => {
      const angle = (item.sales / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArcFlag = angle > Math.PI ? 1 : 0;
      const color = `hsl(${index * 60}, 70%, 60%)`;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      paths += `<path d="${pathData}" fill="${color}" stroke="white" stroke-width="2"/>`;

      const labelAngle = startAngle + angle / 2;
      const labelX = centerX + (radius + 20) * Math.cos(labelAngle);
      const labelY = centerY + (radius + 20) * Math.sin(labelAngle);
      labels += `<text x="${labelX}" y="${labelY}" text-anchor="middle" font-size="10" fill="#333">${item.product}</text>`;

      startAngle = endAngle;
    });

    return `
      <svg width="100%" height="300" viewBox="0 0 500 300" style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px;">
        <text x="250" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">Sales Distribution (Pie Chart)</text>
        ${paths}
        ${labels}
      </svg>
    `;
  };

  const generateMockScatterChartSVG = (data: any[]): string => {
    let circles = "";
    let labels = "";

    data.forEach((item, index) => {
      const x = 50 + Math.random() * 400;
      const y = 50 + Math.random() * 200;
      const size = (item.sales / 1200) * 15 + 5;
      const color = `hsl(${index * 60}, 70%, 60%)`;

      circles += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="0.7"/>`;
      labels += `<text x="${x}" y="${y + size + 15}" text-anchor="middle" font-size="10" fill="#333">${item.product}</text>`;
    });

    return `
      <svg width="100%" height="300" viewBox="0 0 500 300" style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px;">
        <text x="250" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">Sales Scatter Plot</text>
        ${circles}
        ${labels}
      </svg>
    `;
  };

  return (
    <div>
      <div className="component-card">
        <h2>📈 Chart Visualization</h2>
        <p>
          Create interactive visualizations using the DataPrism Chart Renderer
          Plugin.
        </p>

        <div className="grid grid-2">
          <div>
            <div className="form-group">
              <label htmlFor="chart-type">Chart Type:</label>
              <select
                id="chart-type"
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
              >
                {chartTypes.map((type) => (
                  <option key={type.name} value={type.name}>
                    {type.description}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleRenderChart}
              disabled={loading === "render"}
              style={{ marginBottom: "1rem" }}
            >
              {loading === "render" ? "⏳ Rendering..." : "🎨 Render Chart"}
            </button>

            {chartData && (
              <div>
                <h4>Export Options:</h4>
                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleExportChart("svg")}
                    disabled={loading === "export"}
                  >
                    📄 SVG
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleExportChart("png")}
                    disabled={loading === "export"}
                  >
                    🖼️ PNG
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleExportChart("pdf")}
                    disabled={loading === "export"}
                  >
                    📋 PDF
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <h4>Sample Data:</h4>
            <div
              style={{
                fontSize: "0.9rem",
                background: "#f8f9fa",
                padding: "1rem",
                borderRadius: "6px",
              }}
            >
              <pre>{JSON.stringify(sampleData.data, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>

      <div className="component-card">
        <h3>📊 Chart Preview</h3>
        <div key={chartKey} className="chart-container">
          {!chartData ? (
            <div style={{ textAlign: "center", color: "#666" }}>
              <p>
                📈 Select a chart type and click "Render Chart" to generate
                visualization
              </p>
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: chartSVG }} />
          )}
        </div>
      </div>

      {exportResult && (
        <div className="component-card">
          <h3>💾 Export Result</h3>
          <div className="result-container">
            <p>
              <strong>Format:</strong> {exportResult.type}
            </p>
            <p>
              <strong>Size:</strong> {exportResult.size}
            </p>
            <p>
              <strong>Generated:</strong> {new Date().toLocaleString()}
            </p>
            {exportResult.type === "svg" && (
              <div>
                <h4>SVG Preview:</h4>
                <pre style={{ maxHeight: "200px", overflow: "auto" }}>
                  {exportResult.data}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="component-card">
        <h3>ℹ️ About Chart Renderer Plugin</h3>
        <div className="grid grid-2">
          <div>
            <h4>Features:</h4>
            <ul>
              <li>✅ Multiple chart types (bar, line, pie, scatter)</li>
              <li>✅ Interactive features (tooltips, zoom, pan)</li>
              <li>✅ Export capabilities (SVG, PNG, PDF)</li>
              <li>✅ Responsive design and theming</li>
              <li>✅ Real-time updates</li>
            </ul>
          </div>
          <div>
            <h4>Supported Operations:</h4>
            <ul>
              <li>
                <code>render</code> - Render charts in containers
              </li>
              <li>
                <code>getTypes</code> - Get available chart types
              </li>
              <li>
                <code>export</code> - Export charts to various formats
              </li>
              <li>
                <code>update</code> - Update existing charts
              </li>
              <li>
                <code>setConfig</code> - Configure chart settings
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
