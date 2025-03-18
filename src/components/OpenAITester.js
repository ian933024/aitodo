import React, { useState } from 'react';
import testOpenAIService from '../services/openaiService.test';

function OpenAITester() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const runTest = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    
    try {
      // Run the test function
      const testResults = await testOpenAIService();
      setResults(testResults);
    } catch (err) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>OpenAI Service Tester</h2>
      <p>This component tests if the OpenAI service is functioning correctly.</p>
      
      <button 
        onClick={runTest} 
        disabled={loading}
        style={{
          padding: '10px 15px',
          backgroundColor: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Testing...' : 'Run OpenAI Tests'}
      </button>
      
      {loading && <p>Running tests, please wait...</p>}
      
      {error && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fee2e2', borderRadius: '4px', color: '#b91c1c' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {results && (
        <div style={{ marginTop: '20px' }}>
          <h3>Test Results:</h3>
          <pre style={{ 
            backgroundColor: results.success ? '#ecfdf5' : '#fee2e2', 
            padding: '15px', 
            borderRadius: '4px', 
            overflowX: 'auto',
            maxHeight: '400px', 
            overflowY: 'auto' 
          }}>
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
        <h3>Important Note:</h3>
        <p>
          For this test to work, you need to:
        </p>
        <ol>
          <li>Set a valid OpenAI API key in your <code>.env</code> file using <code>REACT_APP_OPENAI_API_KEY</code></li>
          <li>Restart your development server after setting the API key</li>
          <li>Ensure you're connected to the internet</li>
        </ol>
      </div>
    </div>
  );
}

export default OpenAITester;