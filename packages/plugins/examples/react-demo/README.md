# DataPrism Plugin System - React Demo

A comprehensive React application demonstrating the DataPrism Plugin System with all four plugin categories and their capabilities.

## 🚀 Features

This demo showcases:

- **📊 Data Processing** - CSV parsing, validation, and transformation
- **📈 Visualization** - Interactive charts with multiple types and export options
- **🤖 LLM Integration** - AI-powered data analysis and natural language queries
- **🔧 System Monitoring** - Performance tracking, health checks, and security scanning
- **🔌 Plugin Management** - Dynamic plugin lifecycle and resource management

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## 🛠 Installation

1. **Navigate to the demo directory:**
   ```bash
   cd /path/to/DataPrism/packages/plugins/examples/react-demo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🎯 Demo Sections

### 1. Overview Dashboard
- Plugin system status and health metrics
- Active plugin summary
- System performance indicators

### 2. Data Processing
- **CSV Parser**: Upload and parse CSV data
- **Data Validation**: Check data quality and integrity
- **Transformations**: Apply rules and transformations
- **Real-time Processing**: Stream and batch processing examples

### 3. Chart Visualization
- **Multiple Chart Types**: Bar, line, pie, scatter plots
- **Interactive Features**: Hover effects, tooltips, zoom
- **Export Options**: SVG, PNG, PDF formats
- **Responsive Design**: Mobile-friendly charts

### 4. LLM Integration
- **Text Completion**: Generate content with AI
- **Data Analysis**: AI-powered dataset insights
- **Natural Language Queries**: Ask questions about data
- **Multiple Providers**: OpenAI, Anthropic, local models

### 5. System Monitor
- **Performance Metrics**: CPU, memory, response time tracking
- **Health Checks**: Comprehensive system diagnostics
- **Security Scanning**: Vulnerability detection and assessment
- **Real-time Updates**: Auto-refresh monitoring

### 6. Plugin Manager
- **Plugin Lifecycle**: Activate, deactivate, load, unload
- **Resource Monitoring**: Memory usage and performance tracking
- **Plugin Details**: Capabilities, permissions, metadata
- **Category Management**: Organize by plugin type

## 🔧 Configuration

The demo uses a mock plugin system that simulates real plugin behavior:

- **Realistic Delays**: API calls simulate actual network latency
- **Mock Data**: Pre-populated datasets for testing
- **Error Simulation**: Demonstrates error handling patterns
- **Resource Tracking**: Shows memory usage and performance metrics

## 📚 Code Structure

```
src/
├── components/          # React components for each plugin demo
│   ├── DataProcessor.tsx      # CSV processing demo
│   ├── ChartVisualization.tsx # Chart rendering demo
│   ├── LLMIntegration.tsx     # AI integration demo
│   ├── SystemMonitor.tsx      # Performance monitoring demo
│   └── PluginManager.tsx      # Plugin management interface
├── hooks/              # Custom React hooks
│   └── usePluginSystem.ts     # Plugin system state management
├── utils/              # Utility functions
├── App.tsx             # Main application component
├── App.css             # Application styles
└── index.tsx           # Application entry point
```

## 🎨 Styling

The demo uses a modern, responsive design with:

- **CSS Grid & Flexbox**: Responsive layouts
- **Color-coded Status**: Visual indicators for health and status
- **Interactive Elements**: Hover effects and transitions
- **Mobile-first Design**: Optimized for all screen sizes
- **Accessibility**: Semantic HTML and keyboard navigation

## 📊 Sample Data

The demo includes realistic sample datasets:

### Employee Data
```json
[
  { "name": "John Doe", "age": 30, "city": "New York", "salary": 55000 },
  { "name": "Jane Smith", "age": 25, "city": "Los Angeles", "salary": 66000 }
]
```

### Sales Data
```json
[
  { "product": "Laptop", "category": "Electronics", "sales": 1200 },
  { "product": "Phone", "category": "Electronics", "sales": 800 }
]
```

## 🧪 Testing Features

### Data Processing Tests
- Parse various CSV formats
- Validate data quality
- Apply transformation rules
- Handle malformed data

### Visualization Tests
- Render different chart types
- Export to various formats
- Test responsive behavior
- Interactive features

### LLM Integration Tests
- Generate text completions
- Analyze datasets for insights
- Process natural language queries
- Test multiple AI providers

### System Monitoring Tests
- Real-time performance tracking
- Health check diagnostics
- Security vulnerability scanning
- Resource usage monitoring

## 🔍 Advanced Features

### Plugin Hot-Reload
```typescript
// Dynamic plugin loading
const plugin = await pluginSystem.loadPlugin('new-plugin');
await plugin.activate();
```

### Error Recovery
```typescript
// Graceful error handling
try {
  await plugin.execute('operation', params);
} catch (error) {
  await plugin.recover(error);
}
```

### Performance Optimization
```typescript
// Intelligent caching
const cachedResult = await plugin.executeWithCache('operation', params);
```

## 📈 Performance Metrics

The demo tracks and displays:

- **Memory Usage**: Real-time memory consumption
- **Response Times**: API call latency
- **Plugin Performance**: Individual plugin metrics
- **System Health**: Overall system status

## 🔒 Security Features

Demonstrates security best practices:

- **Permission System**: Plugin-based access control
- **Input Validation**: Sanitize user inputs
- **Error Boundaries**: Prevent system crashes
- **Security Scanning**: Vulnerability detection

## 🤝 Contributing

To extend the demo:

1. **Add New Components**: Create additional demo components
2. **Enhance Styling**: Improve visual design
3. **Add Features**: Implement new plugin capabilities
4. **Improve Performance**: Optimize rendering and state management

## 📄 License

This demo is part of the DataPrism Plugin System and is available under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Plugin Not Loading:**
- Check browser console for errors
- Verify plugin is properly registered
- Ensure all dependencies are installed

**Performance Issues:**
- Monitor memory usage in Plugin Manager
- Deactivate unused plugins
- Check network connectivity for external services

**Styling Problems:**
- Clear browser cache
- Check for CSS conflicts
- Verify responsive breakpoints

### Support

For support and questions:
- Check the main DataPrism documentation
- Review plugin examples and patterns
- Examine component source code for implementation details

---

This demo provides a comprehensive showcase of the DataPrism Plugin System's capabilities and serves as a practical reference for implementing plugin-based applications.