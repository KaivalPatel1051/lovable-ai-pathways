import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SupabaseTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Not tested');

  useEffect(() => {
    // Test connection on component mount
    testConnection();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing Supabase connection...');
    
    try {
      // Test basic connection by fetching from auth
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setResult(`❌ Supabase Connection Failed: ${error.message}`);
        setConnectionStatus('Failed');
      } else {
        setResult('✅ Supabase Connection Successful!');
        setConnectionStatus('Connected');
        
        // Test database connection
        await testDatabase();
      }
    } catch (error: any) {
      setResult(`❌ Supabase Connection Error: ${error.message}`);
      setConnectionStatus('Error');
    }
    setLoading(false);
  };

  const testDatabase = async () => {
    try {
      // Test if we can query the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        setResult(prev => prev + `\n❌ Database Schema Error: ${error.message}\n💡 Make sure you've run the SQL schema in Supabase Dashboard`);
      } else {
        setResult(prev => prev + '\n✅ Database Schema Connected!');
      }
    } catch (error: any) {
      setResult(prev => prev + `\n❌ Database Test Error: ${error.message}`);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setResult('Testing Supabase Auth...');
    
    try {
      // Test sign up with a temporary user
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'testpassword123';
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        setResult(`❌ Auth Test Failed: ${error.message}`);
      } else {
        setResult(`✅ Auth Test Successful! User created: ${data.user?.email}`);
        
        // Clean up - sign out the test user
        await supabase.auth.signOut();
      }
    } catch (error: any) {
      setResult(`❌ Auth Test Error: ${error.message}`);
    }
    setLoading(false);
  };

  const testGoogleAuth = async () => {
    setLoading(true);
    setResult('Testing Google OAuth...\n\n🔍 Checking configuration...');
    
    try {
      // First, let's check the Supabase URL to make sure we're using the right project
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const projectId = supabaseUrl?.split('//')[1]?.split('.')[0];
      
      setResult(prev => prev + `\n📍 Project ID: ${projectId}\n📍 Supabase URL: ${supabaseUrl}\n\n🚀 Attempting Google OAuth...`);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        if (error.message.includes('provider is not enabled')) {
          setResult(prev => prev + `\n\n❌ GOOGLE PROVIDER NOT ENABLED!\n\n🔧 EXACT STEPS TO FIX:\n\n1. Go to: https://supabase.com/dashboard/project/${projectId}\n2. Click: Authentication (left sidebar)\n3. Click: Providers (sub-menu)\n4. Find: Google in the list\n5. Toggle: "Enable sign in with Google" to ON\n6. Add any Client ID (can be "test" for now)\n7. Add any Client Secret (can be "test" for now)\n8. Click: Save\n\n⚠️ Make sure you're in the RIGHT PROJECT: ${projectId}`);
        } else if (error.message.includes('Invalid login credentials')) {
          setResult(prev => prev + `\n\n✅ GOOGLE PROVIDER IS ENABLED!\n❌ But credentials are invalid\n\n🔧 Next step: Set up proper Google OAuth credentials`);
        } else {
          setResult(prev => prev + `\n\n❌ Google OAuth Error: ${error.message}\n\n🔍 Full error details:\n${JSON.stringify(error, null, 2)}`);
        }
      } else {
        setResult(prev => prev + '\n\n✅ Google OAuth initiated successfully! Redirecting...');
      }
    } catch (error: any) {
      setResult(prev => prev + `\n\n❌ Unexpected Error: ${error.message}\n\n🔍 Full error:\n${JSON.stringify(error, null, 2)}`);
    }
    setLoading(false);
  };

  const checkEnvironmentVars = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    let envStatus = '';
    
    if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
      envStatus += '❌ VITE_SUPABASE_URL not set\n';
    } else {
      envStatus += '✅ VITE_SUPABASE_URL configured\n';
    }
    
    if (!supabaseKey || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
      envStatus += '❌ VITE_SUPABASE_ANON_KEY not set\n';
    } else {
      envStatus += '✅ VITE_SUPABASE_ANON_KEY configured\n';
    }
    
    setResult(envStatus);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Supabase Connection Test</h2>
      
      <div className="mb-4">
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          connectionStatus === 'Connected' ? 'bg-green-100 text-green-800' :
          connectionStatus === 'Failed' || connectionStatus === 'Error' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          Status: {connectionStatus}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={checkEnvironmentVars}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Check Environment Variables
        </button>
        
        <button
          onClick={testConnection}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          {loading ? 'Testing...' : 'Test Supabase Connection'}
        </button>
        
        <button
          onClick={testAuth}
          disabled={loading}
          className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Test Email Authentication
        </button>
        
        <button
          onClick={testGoogleAuth}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          🔍 Test Google OAuth
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Test Results:</h3>
        <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-white p-3 rounded border">
          {result || 'No tests run yet...'}
        </pre>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Quick Setup Checklist:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>1. ✅ Create Supabase project at supabase.com</li>
          <li>2. ✅ Copy Project URL and Anon Key from Settings → API</li>
          <li>3. ✅ Add credentials to .env.local file</li>
          <li>4. ✅ Run SQL schema in Supabase SQL Editor</li>
          <li>5. ✅ Test connection with this component</li>
        </ul>
      </div>
    </div>
  );
};

export default SupabaseTest;
