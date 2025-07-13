// CSV Parser Web Worker
// This worker handles CPU-intensive CSV parsing operations with built-in CSV parser

self.onmessage = function(event) {
  const { type, task } = event.data;
  
  if (type === 'task' && task.type === 'parse-csv') {
    try {
      const result = parseCSV(task.data);
      self.postMessage({
        type: 'task-complete',
        taskId: task.id,
        result
      });
    } catch (error) {
      self.postMessage({
        type: 'task-complete',
        taskId: task.id,
        error: error.message
      });
    }
  } else if (type === 'terminate') {
    self.postMessage({ type: 'terminated' });
    self.close();
  }
};

function parseCSV(data) {
  const { text, config, columns } = data;
  const parseErrors = [];
  const rows = [];

  // Default configuration
  const delimiter = config.delimiter || ',';
  const quote = config.quote || '"';
  const escape = config.escape || '"';
  const skipRows = config.skipRows || 0;

  try {
    // Parse the CSV text using built-in parser
    const parseResult = parseCSVText(text, {
      delimiter,
      quote,
      escape,
      skipEmptyLines: true
    });

    if (parseResult.errors.length > 0) {
      for (const error of parseResult.errors) {
        parseErrors.push({
          row: error.row || 0,
          column: 0,
          field: '',
          value: null,
          message: error.message,
          severity: 'warning'
        });
      }
    }

    // Skip header rows if specified
    const dataRows = parseResult.data.slice(skipRows);

    // Validate and transform each row
    for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
      const row = dataRows[rowIndex];
      const transformedRow = [];
      
      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        const column = columns[colIndex];
        const rawValue = row[colIndex];
        
        try {
          const transformedValue = transformValue(rawValue, column.inferredType);
          transformedRow.push(transformedValue);
        } catch (error) {
          parseErrors.push({
            row: rowIndex,
            column: colIndex,
            field: column.name,
            value: rawValue,
            message: `Type conversion error: ${error.message}`,
            severity: 'error'
          });
          transformedRow.push(null);
        }
      }
      
      rows.push(transformedRow);
    }

    return {
      rows,
      parseErrors
    };

  } catch (error) {
    throw new Error(`CSV parsing failed: ${error.message}`);
  }
}

function parseCSVText(text, options) {
  const { delimiter, quote, escape, skipEmptyLines } = options;
  const rows = [];
  const errors = [];
  
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (!inQuotes) {
      if (char === quote) {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' || char === '\r') {
        // End of row
        currentRow.push(currentField.trim());
        
        if (!skipEmptyLines || currentRow.some(field => field.length > 0)) {
          rows.push([...currentRow]);
        }
        
        currentRow = [];
        currentField = '';
        
        // Skip \r\n combinations
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
      } else {
        currentField += char;
      }
    } else {
      // Inside quotes
      if (char === escape && nextChar === quote) {
        // Escaped quote
        currentField += quote;
        i++; // Skip next character
      } else if (char === quote) {
        inQuotes = false;
      } else {
        currentField += char;
      }
    }
    
    i++;
  }
  
  // Handle last field and row
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (!skipEmptyLines || currentRow.some(field => field.length > 0)) {
      rows.push(currentRow);
    }
  }
  
  return {
    data: rows,
    errors
  };
}

function transformValue(value, targetType) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const strValue = String(value).trim();
  
  switch (targetType) {
    case 'string':
      return strValue;
      
    case 'number':
      const numValue = Number(strValue);
      if (isNaN(numValue)) {
        throw new Error(`Cannot convert "${strValue}" to number`);
      }
      return numValue;
      
    case 'integer':
      const intValue = parseInt(strValue, 10);
      if (isNaN(intValue)) {
        throw new Error(`Cannot convert "${strValue}" to integer`);
      }
      return intValue;
      
    case 'boolean':
      const lowerValue = strValue.toLowerCase();
      if (['true', 'yes', 'y', '1'].includes(lowerValue)) {
        return true;
      } else if (['false', 'no', 'n', '0'].includes(lowerValue)) {
        return false;
      } else {
        throw new Error(`Cannot convert "${strValue}" to boolean`);
      }
      
    case 'date':
      const dateValue = new Date(strValue);
      if (isNaN(dateValue.getTime())) {
        throw new Error(`Cannot convert "${strValue}" to date`);
      }
      return dateValue.toISOString();
      
    default:
      return strValue;
  }
}

// Error handling for uncaught exceptions
self.onerror = function(error) {
  self.postMessage({
    type: 'error',
    error: error.message
  });
};