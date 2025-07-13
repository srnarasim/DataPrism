import React, { useState } from 'react';

interface DataProcessorProps {
  pluginSystem: any;
}

export const DataProcessor: React.FC<DataProcessorProps> = ({ pluginSystem }) => {
  const [csvData, setCsvData] = useState(`name,age,city,salary
John Doe,30,New York,50000
Jane Smith,25,Los Angeles,60000
Bob Johnson,35,Chicago,55000
Alice Brown,28,Houston,52000`);
  const [parsedData, setParsedData] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [transformedData, setTransformedData] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleParseCSV = async () => {
    if (!pluginSystem) return;
    
    setLoading('parse');
    try {
      const result = await pluginSystem.getPluginManager().executePlugin('csv-processor', 'parse', {
        data: csvData,
        options: { hasHeader: true, delimiter: ',' }
      });
      setParsedData(result);
    } catch (error) {
      console.error('Parse failed:', error);
      alert('Failed to parse CSV data');
    } finally {
      setLoading(null);
    }
  };

  const handleValidateData = async () => {
    if (!pluginSystem || !parsedData) return;
    
    setLoading('validate');
    try {
      const result = await pluginSystem.getPluginManager().executePlugin('csv-processor', 'validate', {
        dataset: parsedData
      });
      setValidationResult(result);
    } catch (error) {
      console.error('Validation failed:', error);
      alert('Failed to validate data');
    } finally {
      setLoading(null);
    }
  };

  const handleTransformData = async () => {
    if (!pluginSystem || !parsedData) return;
    
    setLoading('transform');
    try {
      const result = await pluginSystem.getPluginManager().executePlugin('csv-processor', 'transform', {
        dataset: parsedData,
        rules: [
          { field: 'name', operation: 'uppercase', parameters: {} },
          { field: 'salary', operation: 'multiply', parameters: { factor: 1.1 } }
        ]
      });
      setTransformedData(result);
    } catch (error) {
      console.error('Transform failed:', error);
      alert('Failed to transform data');
    } finally {
      setLoading(null);
    }
  };

  const renderDataTable = (data: any[], title: string) => {
    if (!data || data.length === 0) return null;

    const columns = Object.keys(data[0]);

    return (
      <div className="component-card">
        <h3>{title}</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {columns.map(col => (
                    <td key={col}>{String(row[col])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="component-card">
        <h2>📊 CSV Data Processor</h2>
        <p>Process and transform CSV data using the DataPrism CSV Processor Plugin.</p>

        <div className="form-group">
          <label htmlFor="csv-input">CSV Data:</label>
          <textarea
            id="csv-input"
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder="Enter CSV data here..."
            rows={8}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleParseCSV}
            disabled={loading === 'parse' || !csvData.trim()}
          >
            {loading === 'parse' ? '⏳ Parsing...' : '🔍 Parse CSV'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleValidateData}
            disabled={loading === 'validate' || !parsedData}
          >
            {loading === 'validate' ? '⏳ Validating...' : '✅ Validate Data'}
          </button>

          <button
            className="btn btn-success"
            onClick={handleTransformData}
            disabled={loading === 'transform' || !parsedData}
          >
            {loading === 'transform' ? '⏳ Transforming...' : '🔄 Transform Data'}
          </button>
        </div>
      </div>

      {parsedData && renderDataTable(parsedData.data, `📋 Parsed Data (${parsedData.data.length} rows)`)}

      {validationResult && (
        <div className="component-card">
          <h3>✅ Validation Results</h3>
          <div className="grid grid-2">
            <div>
              <p><strong>Status:</strong> <span className={`status ${validationResult.isValid ? 'healthy' : 'critical'}`}>
                {validationResult.isValid ? 'Valid' : 'Invalid'}
              </span></p>
              <p><strong>Total Rows:</strong> {validationResult.statistics?.totalRows}</p>
              <p><strong>Valid Rows:</strong> {validationResult.statistics?.validRows}</p>
              <p><strong>Error Rows:</strong> {validationResult.statistics?.errorRows}</p>
            </div>
            <div>
              {validationResult.warnings?.length > 0 && (
                <div>
                  <p><strong>Warnings:</strong></p>
                  <ul>
                    {validationResult.warnings.map((warning: string, index: number) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResult.errors?.length > 0 && (
                <div>
                  <p><strong>Errors:</strong></p>
                  <ul>
                    {validationResult.errors.map((error: string, index: number) => (
                      <li key={index} style={{ color: '#dc3545' }}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {transformedData && renderDataTable(transformedData.data, '🔄 Transformed Data')}

      <div className="component-card">
        <h3>ℹ️ About CSV Processor Plugin</h3>
        <div className="grid grid-2">
          <div>
            <h4>Features:</h4>
            <ul>
              <li>✅ CSV parsing with configurable delimiters</li>
              <li>✅ Data validation and quality checks</li>
              <li>✅ Statistical transformations</li>
              <li>✅ Batch and streaming processing</li>
              <li>✅ Error handling and metrics</li>
            </ul>
          </div>
          <div>
            <h4>Supported Operations:</h4>
            <ul>
              <li><code>parse</code> - Parse CSV text into structured data</li>
              <li><code>validate</code> - Validate data quality and integrity</li>
              <li><code>transform</code> - Apply transformation rules</li>
              <li><code>batch</code> - Process multiple datasets</li>
              <li><code>stream</code> - Process data streams</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};