# CSV Importer Plugin

The CSV Importer plugin provides high-performance CSV file import capabilities for DataPrism Core, with support for large files, custom parsing options, and automatic data type detection.

## Features

- **High Performance**: Process large CSV files efficiently using streaming
- **Auto Type Detection**: Automatically detect column data types
- **Custom Delimiters**: Support for comma, tab, pipe, and custom delimiters
- **Header Detection**: Automatic header row detection and configuration
- **Progress Tracking**: Real-time import progress monitoring
- **Error Handling**: Comprehensive error reporting and recovery
- **Memory Efficient**: Streaming processing for large files

## Installation

```bash
npm install @dataprism/plugin-csv-importer
```

## Quick Start

```typescript
import { DataPrismEngine } from "@dataprism/core";
import { createCSVImporterPlugin } from "@dataprism/plugin-csv-importer";

const engine = new DataPrismEngine();
const csvPlugin = await createCSVImporterPlugin();

// Register the plugin
engine.registerPlugin(csvPlugin);

// Import CSV file
const fileInput = document.querySelector('#file-input') as HTMLInputElement;
const file = fileInput.files[0];

const result = await csvPlugin.importFile(file, {
  tableName: "sales_data",
  delimiter: ",",
  hasHeader: true,
  autoDetectTypes: true
});

console.log(`Imported ${result.rowCount} rows`);
```

## Import Methods

### File Import

```typescript
// From file input
const fileResult = await csvPlugin.importFile(file, {
  tableName: "my_table",
  delimiter: ",",
  hasHeader: true,
  autoDetectTypes: true,
  onProgress: (progress) => {
    console.log(`Progress: ${progress.percentage}%`);
  }
});
```

### String Import

```typescript
// From CSV string
const csvString = `name,age,city
John,30,New York
Jane,25,San Francisco`;

const stringResult = await csvPlugin.importString(csvString, {
  tableName: "users",
  delimiter: ",",
  hasHeader: true
});
```

### URL Import

```typescript
// From remote URL
const urlResult = await csvPlugin.importFromURL("https://example.com/data.csv", {
  tableName: "remote_data",
  delimiter: ",",
  hasHeader: true,
  onProgress: (progress) => {
    console.log(`Downloaded: ${progress.loaded}/${progress.total} bytes`);
  }
});
```

## Configuration Options

### Import Configuration

```typescript
interface ImportConfig {
  tableName: string;
  delimiter?: string; // Default: ","
  hasHeader?: boolean; // Default: true
  autoDetectTypes?: boolean; // Default: true
  encoding?: string; // Default: "utf-8"
  skipRows?: number; // Default: 0
  maxRows?: number; // Default: unlimited
  columnNames?: string[]; // Override column names
  columnTypes?: { [key: string]: string }; // Override column types
  nullValues?: string[]; // Default: ["", "null", "NULL", "NA"]
  onProgress?: (progress: ProgressInfo) => void;
  onError?: (error: ImportError) => void;
}
```

### Column Type Mapping

```typescript
const result = await csvPlugin.importFile(file, {
  tableName: "sales",
  columnTypes: {
    "date": "DATE",
    "amount": "DECIMAL",
    "quantity": "INTEGER",
    "description": "VARCHAR"
  }
});
```

## Data Type Detection

### Automatic Detection

The plugin automatically detects column types based on sample data:

- **INTEGER**: Whole numbers
- **DECIMAL**: Floating point numbers
- **DATE**: Date strings (various formats)
- **BOOLEAN**: true/false, yes/no, 1/0
- **VARCHAR**: Text strings

### Manual Override

```typescript
const result = await csvPlugin.importFile(file, {
  tableName: "data",
  autoDetectTypes: false,
  columnTypes: {
    "id": "INTEGER",
    "name": "VARCHAR",
    "created_at": "TIMESTAMP",
    "is_active": "BOOLEAN",
    "score": "DECIMAL"
  }
});
```

## Progress Monitoring

```typescript
interface ProgressInfo {
  percentage: number;
  loaded: number;
  total: number;
  rowsProcessed: number;
  estimatedTimeRemaining: number;
  speed: number; // rows per second
}

const result = await csvPlugin.importFile(file, {
  tableName: "large_dataset",
  onProgress: (progress) => {
    updateProgressBar(progress.percentage);
    updateStats({
      rowsProcessed: progress.rowsProcessed,
      speed: progress.speed,
      timeRemaining: progress.estimatedTimeRemaining
    });
  }
});
```

## Error Handling

### Import Errors

```typescript
interface ImportError {
  type: "parsing" | "type_conversion" | "validation" | "file_read";
  message: string;
  line?: number;
  column?: string;
  value?: string;
  recoverable: boolean;
}

const result = await csvPlugin.importFile(file, {
  tableName: "data",
  onError: (error) => {
    console.error(`Error at line ${error.line}: ${error.message}`);
    
    if (error.recoverable) {
      // Continue processing
      return "continue";
    } else {
      // Abort import
      return "abort";
    }
  }
});
```

### Validation Rules

```typescript
const result = await csvPlugin.importFile(file, {
  tableName: "products",
  validationRules: {
    "price": (value) => value > 0,
    "email": (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    "category": (value) => ["A", "B", "C"].includes(value)
  }
});
```

## Performance Optimization

### Streaming Import

```typescript
// For very large files, use streaming
const stream = csvPlugin.createImportStream({
  tableName: "huge_dataset",
  batchSize: 1000,
  delimiter: ",",
  hasHeader: true
});

stream.on('batch', (batch) => {
  console.log(`Processed batch: ${batch.rowCount} rows`);
});

stream.on('complete', (result) => {
  console.log(`Total rows imported: ${result.totalRows}`);
});

stream.on('error', (error) => {
  console.error('Import failed:', error);
});

// Start streaming import
stream.importFile(file);
```

### Memory Management

```typescript
const result = await csvPlugin.importFile(file, {
  tableName: "data",
  batchSize: 5000, // Process in batches
  maxMemoryUsage: 100 * 1024 * 1024, // 100MB limit
  diskSpill: true // Spill to disk if memory limit exceeded
});
```

## Integration with DataPrism

### Query Imported Data

```typescript
// Import CSV
const importResult = await csvPlugin.importFile(file, {
  tableName: "sales"
});

// Query the imported data
const queryResult = await engine.query(`
  SELECT product, SUM(amount) as total_sales
  FROM sales
  GROUP BY product
  ORDER BY total_sales DESC
`);
```

### Multiple File Import

```typescript
const files = [salesFile, inventoryFile, customersFile];

for (const file of files) {
  const tableName = file.name.replace('.csv', '');
  await csvPlugin.importFile(file, {
    tableName,
    hasHeader: true,
    autoDetectTypes: true
  });
}

// Join data from multiple tables
const result = await engine.query(`
  SELECT s.product, s.amount, i.stock_level
  FROM sales s
  JOIN inventory i ON s.product = i.product
`);
```

## Supported Formats

### Delimiters

- Comma (`,`) - Default
- Tab (`\t`)
- Pipe (`|`)
- Semicolon (`;`)
- Custom single character

### Encodings

- UTF-8 (default)
- UTF-16
- ISO-8859-1
- Windows-1252

### Date Formats

Automatically detected formats:
- ISO 8601: `2024-01-15T10:30:00Z`
- US format: `01/15/2024`
- European format: `15/01/2024`
- Custom formats via configuration

## API Reference

### Methods

#### `importFile(file: File, config: ImportConfig): Promise<ImportResult>`

Import data from a File object.

#### `importString(csv: string, config: ImportConfig): Promise<ImportResult>`

Import data from a CSV string.

#### `importFromURL(url: string, config: ImportConfig): Promise<ImportResult>`

Import data from a remote URL.

#### `createImportStream(config: ImportConfig): ImportStream`

Create a streaming import for large files.

#### `detectDelimiter(sample: string): string`

Detect the delimiter used in a CSV sample.

#### `detectEncoding(buffer: ArrayBuffer): string`

Detect the character encoding of a file.

### Types

```typescript
interface ImportResult {
  success: boolean;
  rowCount: number;
  columnCount: number;
  tableName: string;
  columnNames: string[];
  columnTypes: { [key: string]: string };
  errors: ImportError[];
  warnings: string[];
  processingTime: number;
  memoryUsage: number;
}
```

## Examples

### Basic Import

```typescript
const result = await csvPlugin.importFile(file, {
  tableName: "sales_data"
});
```

### Advanced Import with Validation

```typescript
const result = await csvPlugin.importFile(file, {
  tableName: "products",
  delimiter: "|",
  hasHeader: true,
  columnTypes: {
    "id": "INTEGER",
    "name": "VARCHAR",
    "price": "DECIMAL",
    "active": "BOOLEAN"
  },
  validationRules: {
    "price": (value) => value > 0,
    "id": (value) => /^\d+$/.test(value)
  },
  onProgress: (progress) => {
    console.log(`${progress.percentage}% complete`);
  },
  onError: (error) => {
    console.warn(`Skipping invalid row: ${error.message}`);
    return "continue";
  }
});
```

## Troubleshooting

### Common Issues

**Import fails with "Invalid delimiter"**
- Use `detectDelimiter()` to auto-detect
- Verify file format is actually CSV
- Check for mixed delimiters in file

**Memory issues with large files**
- Reduce batch size
- Enable disk spill option
- Use streaming import for very large files

**Data type detection errors**
- Manually specify column types
- Increase sample size for detection
- Check for inconsistent data formats

**Performance is slow**
- Increase batch size for large files
- Disable auto-type detection if not needed
- Use streaming import for very large datasets

## Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/srnarasim/DataPrism/blob/main/CONTRIBUTING.md) for details.

## License

MIT License. See [LICENSE](https://github.com/srnarasim/DataPrism/blob/main/LICENSE) for details.
