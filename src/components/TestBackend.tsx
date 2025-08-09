import React, { useState } from 'react';
import { authAPI } from '../services/api';

const TestBackend: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing connection...');
    
    try {
      // Test basic connection
      const response = await fetch('http://localhost:3001/health');
      const data = await response.json();
      setResult(`✅ Backend Connection: ${data.message}`);
    } catch (error) {
      setResult(`❌ Backend Connection Failed: ${error}`);
    }
    setLoading(false);
  };

  const testRegistration = async () => {
    setLoading(true);
    setResult('Testing registration...');
    
    try {
      const testUser = {
        firstName: 'Test',
        lastName: 'User',
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      };
      
      const response = await authAPI.register(testUser);
      setResult(`✅ Registration Success: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Registration Failed: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    
    try {
      const response = await authAPI.login({
        email: 'john@example.com',
        password: 'password123'
      });
      setResult(`✅ Login Success: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Login Failed: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      minHeight: '100vh',
      fontFamily: 'monospace'
    }}>
      <h1>🔧 Backend Connection Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testConnection}
          disabled={loading}
          style={{
            padding: '10px 20px',
            margin: '10px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Connection
        </button>
        
        <button 
          onClick={testRegistration}
          disabled={loading}
          style={{
            padding: '10px 20px',
            margin: '10px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Registration
        </button>
        
        <button 
          onClick={testLogin}
          disabled={loading}
          style={{
            padding: '10px 20px',
            margin: '10px',
            backgroundColor: '#06b6d4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Login
        </button>
      </div>

      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '20px',
        borderRadius: '5px',
        whiteSpace: 'pre-wrap',
        minHeight: '200px'
      }}>
        <h3>Result:</h3>
        {loading ? '⏳ Loading...' : result || 'Click a button to test backend connection'}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#888' }}>
        <p><strong>Backend URL:</strong> http://localhost:3001</p>
        <p><strong>Frontend URL:</strong> {window.location.origin}</p>
        <p><strong>Test User:</strong> john@example.com / password123</p>
      </div>
    </div>
  );
};

export default TestBackend;
