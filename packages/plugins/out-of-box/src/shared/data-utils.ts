import { Dataset, DataType } from '@dataprism/plugins';

export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  columnCount: number;
  nullCount: number;
  duplicateCount: number;
}

export interface DataStatistics {
  columnName: string;
  dataType: DataType;
  nullCount: number;
  uniqueCount: number;
  min?: any;
  max?: any;
  mean?: number;
  median?: number;
  mode?: any;
  standardDeviation?: number;
}

export interface TypeInferenceResult {
  suggestedType: DataType;
  confidence: number;
  samples: any[];
  patterns: string[];
}

export class DataUtils {
  /**
   * Infer data types for columns based on sample data
   */
  public static inferDataTypes(samples: any[][], headers: string[]): TypeInferenceResult[] {
    const results: TypeInferenceResult[] = [];
    
    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const columnSamples = samples.map(row => row[colIndex]).filter(val => val != null && val !== '');
      const result = this.inferColumnType(columnSamples);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Validate dataset for common issues
   */
  public static validateDataset(dataset: Dataset): DataValidationResult {
    const result: DataValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      rowCount: dataset.rows.length,
      columnCount: dataset.columns.length,
      nullCount: 0,
      duplicateCount: 0
    };

    // Check for empty dataset
    if (dataset.rows.length === 0) {
      result.errors.push('Dataset is empty');
      result.isValid = false;
      return result;
    }

    // Check for missing column names
    const missingColumns = dataset.columns.filter((col, index) => 
      !col.name || col.name.trim() === '' || col.name === `column_${index}`
    );
    if (missingColumns.length > 0) {
      result.warnings.push(`${missingColumns.length} columns have missing or auto-generated names`);
    }

    // Count nulls and validate data types
    for (let colIndex = 0; colIndex < dataset.columns.length; colIndex++) {
      const column = dataset.columns[colIndex];
      let columnNulls = 0;
      let typeErrors = 0;

      for (const row of dataset.rows) {
        const value = row[colIndex];
        
        if (value == null || value === '') {
          columnNulls++;
          continue;
        }

        // Validate type consistency
        if (!this.isValueOfType(value, column.type)) {
          typeErrors++;
        }
      }

      result.nullCount += columnNulls;

      // Warn about high null percentage
      const nullPercentage = (columnNulls / dataset.rows.length) * 100;
      if (nullPercentage > 50) {
        result.warnings.push(`Column '${column.name}' has ${nullPercentage.toFixed(1)}% null values`);
      }

      // Error on type inconsistencies
      if (typeErrors > 0) {
        const errorPercentage = (typeErrors / dataset.rows.length) * 100;
        if (errorPercentage > 10) {
          result.errors.push(`Column '${column.name}' has ${errorPercentage.toFixed(1)}% type inconsistencies`);
          result.isValid = false;
        } else {
          result.warnings.push(`Column '${column.name}' has ${typeErrors} type inconsistencies`);
        }
      }
    }

    // Check for duplicate rows
    const uniqueRows = new Set(dataset.rows.map(row => JSON.stringify(row)));
    result.duplicateCount = dataset.rows.length - uniqueRows.size;
    
    if (result.duplicateCount > 0) {
      const duplicatePercentage = (result.duplicateCount / dataset.rows.length) * 100;
      if (duplicatePercentage > 25) {
        result.warnings.push(`Dataset has ${duplicatePercentage.toFixed(1)}% duplicate rows`);
      }
    }

    return result;
  }

  /**
   * Generate statistics for dataset columns
   */
  public static generateStatistics(dataset: Dataset): DataStatistics[] {
    const statistics: DataStatistics[] = [];

    for (let colIndex = 0; colIndex < dataset.columns.length; colIndex++) {
      const column = dataset.columns[colIndex];
      const values = dataset.rows.map(row => row[colIndex]).filter(val => val != null && val !== '');
      
      const stats: DataStatistics = {
        columnName: column.name,
        dataType: column.type,
        nullCount: dataset.rows.length - values.length,
        uniqueCount: new Set(values).size
      };

      if (column.type === 'number' || column.type === 'integer') {
        const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
        if (numericValues.length > 0) {
          stats.min = Math.min(...numericValues);
          stats.max = Math.max(...numericValues);
          stats.mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
          stats.median = this.calculateMedian(numericValues);
          stats.standardDeviation = this.calculateStandardDeviation(numericValues, stats.mean);
        }
      }

      // Calculate mode for all types
      if (values.length > 0) {
        stats.mode = this.calculateMode(values);
      }

      statistics.push(stats);
    }

    return statistics;
  }

  /**
   * Convert dataset to CSV format
   */
  public static toCsv(dataset: Dataset, includeHeaders = true): string {
    const rows: string[] = [];
    
    if (includeHeaders) {
      const headers = dataset.columns.map(col => this.escapeCsvValue(col.name));
      rows.push(headers.join(','));
    }

    for (const row of dataset.rows) {
      const csvRow = row.map(value => this.escapeCsvValue(String(value ?? '')));
      rows.push(csvRow.join(','));
    }

    return rows.join('\n');
  }

  /**
   * Sample rows from dataset
   */
  public static sampleRows(dataset: Dataset, count: number, method: 'first' | 'random' | 'stratified' = 'first'): Dataset {
    let sampledRows: any[][];

    switch (method) {
      case 'first':
        sampledRows = dataset.rows.slice(0, count);
        break;
      case 'random':
        sampledRows = this.shuffleArray([...dataset.rows]).slice(0, count);
        break;
      case 'stratified':
        // Simple stratified sampling - would need more complex logic for real stratification
        const step = Math.floor(dataset.rows.length / count);
        sampledRows = [];
        for (let i = 0; i < dataset.rows.length && sampledRows.length < count; i += step) {
          sampledRows.push(dataset.rows[i]);
        }
        break;
      default:
        sampledRows = dataset.rows.slice(0, count);
    }

    return {
      columns: dataset.columns,
      rows: sampledRows
    };
  }

  private static inferColumnType(samples: any[]): TypeInferenceResult {
    if (samples.length === 0) {
      return {
        suggestedType: 'string',
        confidence: 0,
        samples: [],
        patterns: []
      };
    }

    const patterns: string[] = [];
    let integerCount = 0;
    let numberCount = 0;
    let dateCount = 0;
    let booleanCount = 0;
    let stringCount = 0;

    for (const sample of samples.slice(0, 100)) { // Check first 100 samples
      const str = String(sample).trim();
      
      // Check for boolean
      if (/^(true|false|yes|no|y|n|1|0)$/i.test(str)) {
        booleanCount++;
        patterns.push('boolean');
        continue;
      }

      // Check for integer
      if (/^-?\d+$/.test(str)) {
        integerCount++;
        patterns.push('integer');
        continue;
      }

      // Check for number
      if (/^-?\d*\.?\d+([eE][+-]?\d+)?$/.test(str)) {
        numberCount++;
        patterns.push('number');
        continue;
      }

      // Check for date
      const datePatterns = [
        /^\d{4}-\d{2}-\d{2}$/,        // YYYY-MM-DD
        /^\d{2}\/\d{2}\/\d{4}$/,      // MM/DD/YYYY
        /^\d{2}-\d{2}-\d{4}$/,        // MM-DD-YYYY
        /^\d{4}\/\d{2}\/\d{2}$/       // YYYY/MM/DD
      ];
      
      if (datePatterns.some(pattern => pattern.test(str)) || !isNaN(Date.parse(str))) {
        dateCount++;
        patterns.push('date');
        continue;
      }

      stringCount++;
      patterns.push('string');
    }

    const total = samples.length;
    const results = [
      { type: 'integer' as DataType, count: integerCount },
      { type: 'number' as DataType, count: numberCount },
      { type: 'boolean' as DataType, count: booleanCount },
      { type: 'date' as DataType, count: dateCount },
      { type: 'string' as DataType, count: stringCount }
    ];

    // Sort by count and get the highest
    results.sort((a, b) => b.count - a.count);
    const winner = results[0];

    return {
      suggestedType: winner.type,
      confidence: winner.count / total,
      samples: samples.slice(0, 10),
      patterns: [...new Set(patterns)]
    };
  }

  private static isValueOfType(value: any, type: DataType): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' || !isNaN(Number(value));
      case 'integer':
        return Number.isInteger(Number(value));
      case 'boolean':
        return typeof value === 'boolean' || /^(true|false|yes|no|y|n|1|0)$/i.test(String(value));
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      case 'object':
        return typeof value === 'object';
      default:
        return true;
    }
  }

  private static calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  }

  private static calculateStandardDeviation(values: number[], mean: number): number {
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  private static calculateMode(values: any[]): any {
    const frequency: Record<string, number> = {};
    let maxCount = 0;
    let mode = values[0];

    for (const value of values) {
      const key = String(value);
      frequency[key] = (frequency[key] || 0) + 1;
      
      if (frequency[key] > maxCount) {
        maxCount = frequency[key];
        mode = value;
      }
    }

    return mode;
  }

  private static escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}