import React, { useState, useEffect } from 'react';

interface LLMIntegrationProps {
  pluginSystem: any;
}

export const LLMIntegration: React.FC<LLMIntegrationProps> = ({ pluginSystem }) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [prompt, setPrompt] = useState('Explain the benefits of data visualization in business analytics.');
  const [completion, setCompletion] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [query, setQuery] = useState('What is the average salary by city?');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  // Sample dataset for analysis and queries
  const sampleDataset = {
    id: 'employee_data',
    name: 'Employee Data',
    data: [
      { name: 'John Doe', age: 30, city: 'New York', salary: 55000, department: 'Engineering' },
      { name: 'Jane Smith', age: 25, city: 'Los Angeles', salary: 66000, department: 'Design' },
      { name: 'Bob Johnson', age: 35, city: 'Chicago', salary: 60500, department: 'Engineering' },
      { name: 'Alice Brown', age: 28, city: 'Houston', salary: 57200, department: 'Marketing' },
      { name: 'Charlie Wilson', age: 32, city: 'New York', salary: 72000, department: 'Engineering' }
    ],
    metadata: { source: 'hr_system', createdAt: new Date().toISOString() }
  };

  useEffect(() => {
    const loadProviders = async () => {
      if (!pluginSystem) return;
      
      try {
        const providerList = await pluginSystem.getPluginManager().executePlugin('llm-integration', 'providers');
        setProviders(providerList);
      } catch (error) {
        console.error('Failed to load providers:', error);
      }
    };

    loadProviders();
  }, [pluginSystem]);


  const handleGenerateCompletion = async () => {
    if (!pluginSystem || !prompt.trim()) return;
    
    setLoading('completion');
    try {
      const result = await pluginSystem.getPluginManager().executePlugin('llm-integration', 'completion', {
        prompt,
        options: {
          provider: selectedProvider,
          maxTokens: 150,
          temperature: 0.7
        }
      });
      setCompletion(result);
    } catch (error) {
      console.error('Completion failed:', error);
      alert('Failed to generate completion');
    } finally {
      setLoading(null);
    }
  };

  const handleAnalyzeDataset = async () => {
    if (!pluginSystem) return;
    
    setLoading('analysis');
    try {
      const result = await pluginSystem.getPluginManager().executePlugin('llm-integration', 'analyze', {
        dataset: sampleDataset,
        options: {
          provider: selectedProvider,
          focus: 'salary analysis and employee demographics'
        }
      });
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze dataset');
    } finally {
      setLoading(null);
    }
  };

  const handleProcessQuery = async () => {
    if (!pluginSystem || !query.trim()) return;
    
    setLoading('query');
    try {
      const result = await pluginSystem.getPluginManager().executePlugin('llm-integration', 'query', {
        query,
        dataset: sampleDataset,
        options: {
          provider: selectedProvider
        }
      });
      setQueryResult(result);
    } catch (error) {
      console.error('Query processing failed:', error);
      alert('Failed to process query');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <div className="component-card">
        <h2>🤖 LLM Integration</h2>
        <p>Leverage AI language models for data analysis and natural language processing.</p>

        <div className="form-group">
          <label htmlFor="provider-select">LLM Provider:</label>
          <select
            id="provider-select"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
          >
            {providers.map(provider => (
              <option key={provider.name} value={provider.name}>
                {provider.name} ({provider.models?.join(', ')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Text Completion */}
      <div className="component-card">
        <h3>💬 Text Completion</h3>
        <div className="form-group">
          <label htmlFor="prompt-input">Prompt:</label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            rows={3}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleGenerateCompletion}
          disabled={loading === 'completion' || !prompt.trim()}
        >
          {loading === 'completion' ? '⏳ Generating...' : '✨ Generate Completion'}
        </button>

        {completion && (
          <div className="result-container">
            <h4>📝 Completion Result:</h4>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
              <p>{completion.text}</p>
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '1rem' }}>
                <strong>Provider:</strong> {completion.provider} | 
                <strong> Model:</strong> {completion.model} | 
                <strong> Tokens:</strong> {completion.tokens}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dataset Analysis */}
      <div className="component-card">
        <h3>📊 Dataset Analysis</h3>
        <div className="grid grid-2">
          <div>
            <p>Analyze the sample employee dataset using AI to generate insights:</p>
            <button
              className="btn btn-success"
              onClick={handleAnalyzeDataset}
              disabled={loading === 'analysis'}
            >
              {loading === 'analysis' ? '⏳ Analyzing...' : '🔍 Analyze Dataset'}
            </button>
          </div>
          <div>
            <h4>Sample Data Preview:</h4>
            <div style={{ fontSize: '0.8rem', background: '#f8f9fa', padding: '1rem', borderRadius: '6px', maxHeight: '200px', overflow: 'auto' }}>
              <pre>{JSON.stringify(sampleDataset.data.slice(0, 3), null, 2)}...</pre>
            </div>
          </div>
        </div>

        {analysis && (
          <div className="result-container">
            <h4>🎯 Analysis Results:</h4>
            <div className="grid grid-2">
              <div>
                <h5>💡 Key Insights:</h5>
                <ul>
                  {analysis.insights.map((insight: string, index: number) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5>📋 Recommendations:</h5>
                <ul>
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '1rem' }}>
              <strong>Analyzed:</strong> {new Date(analysis.metadata.analyzedAt).toLocaleString()} | 
              <strong> Provider:</strong> {analysis.metadata.provider}
            </div>
          </div>
        )}
      </div>

      {/* Natural Language Query */}
      <div className="component-card">
        <h3>💭 Natural Language Query</h3>
        <div className="form-group">
          <label htmlFor="query-input">Natural Language Query:</label>
          <input
            id="query-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about the data..."
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleProcessQuery}
          disabled={loading === 'query' || !query.trim()}
        >
          {loading === 'query' ? '⏳ Processing...' : '🔍 Process Query'}
        </button>

        <div style={{ marginTop: '1rem' }}>
          <h4>Example queries you can try:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {[
              'What is the average salary by department?',
              'Who are the highest paid employees?',
              'How many employees work in each city?',
              'What is the age distribution?'
            ].map(exampleQuery => (
              <button
                key={exampleQuery}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                onClick={() => setQuery(exampleQuery)}
              >
                {exampleQuery}
              </button>
            ))}
          </div>
        </div>

        {queryResult && (
          <div className="result-container">
            <h4>🔍 Query Processing Result:</h4>
            <div className="grid grid-2">
              <div>
                <h5>🎯 Interpretation:</h5>
                <p>{queryResult.interpretation}</p>
                
                <h5>💡 Original Query:</h5>
                <p style={{ fontStyle: 'italic' }}>"{queryResult.originalQuery}"</p>
              </div>
              <div>
                <h5>🗄️ Suggested SQL:</h5>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                  <code>{queryResult.suggestedSQL || 'No SQL generated'}</code>
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '1rem' }}>
              <strong>Processed:</strong> {new Date(queryResult.metadata.processedAt).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      <div className="component-card">
        <h3>ℹ️ About LLM Integration Plugin</h3>
        <div className="grid grid-2">
          <div>
            <h4>Features:</h4>
            <ul>
              <li>✅ Multiple LLM provider support</li>
              <li>✅ Intelligent caching and rate limiting</li>
              <li>✅ Data analysis and insight generation</li>
              <li>✅ Natural language query processing</li>
              <li>✅ Error handling and fallbacks</li>
            </ul>
          </div>
          <div>
            <h4>Supported Operations:</h4>
            <ul>
              <li><code>completion</code> - Generate text completions</li>
              <li><code>analyze</code> - Analyze datasets for insights</li>
              <li><code>query</code> - Process natural language queries</li>
              <li><code>embedding</code> - Generate text embeddings</li>
              <li><code>providers</code> - List available providers</li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <h4>Available Providers:</h4>
          <div className="grid grid-3">
            {providers.map(provider => (
              <div key={provider.name} style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', textTransform: 'capitalize' }}>{provider.name}</h5>
                <p style={{ fontSize: '0.8rem', margin: 0 }}>
                  Models: {provider.models?.join(', ') || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};