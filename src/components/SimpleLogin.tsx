import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

const SimpleLogin: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Registration form state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    username: ''
  });

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        setMessage(`❌ Login Error: ${error.message}`);
      } else {
        setMessage('✅ Login Successful!');
        setUser(data.user);
        console.log('Logged in user:', data.user);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            first_name: registerData.firstName,
            last_name: registerData.lastName,
            username: registerData.username,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        setMessage(`❌ Registration Error: ${error.message}`);
      } else {
        setMessage('✅ Registration Successful! Check your email to verify your account.');
        console.log('Registered user:', data.user);
        
        // Show success and switch to login
        setTimeout(() => {
          setIsLogin(true);
          setRegisterData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            username: ''
          });
        }, 2000);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  // Handle Logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setMessage('✅ Logged out successfully');
    }
  };

  // Check current user status
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      setMessage(`✅ Current user: ${user.email}`);
    } else {
      setMessage('❌ No user logged in');
    }
  };

  // If user is logged in, show user info
  if (user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Welcome!</h2>
        <div className="space-y-2 mb-4">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
          <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? '✅ Yes' : '❌ No'}</p>
        </div>
        <div className="space-y-2">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded"
          >
            Logout
          </button>
          <button
            onClick={checkUser}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Check User Status
          </button>
        </div>
        {message && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm">{message}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex mb-6">
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 px-4 rounded-l ${
            isLogin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 px-4 rounded-r ${
            !isLogin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Register
        </button>
      </div>

      {isLogin ? (
        // Login Form
        <form onSubmit={handleLogin} className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="your.email@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      ) : (
        // Registration Form
        <form onSubmit={handleRegister} className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Register</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="your.email@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="At least 6 characters"
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              value={registerData.firstName}
              onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="John"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              type="text"
              value={registerData.lastName}
              onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={registerData.username}
              onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="johndoe"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      )}

      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">{message}</p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t">
        <button
          onClick={checkUser}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded text-sm"
        >
          Check Current User Status
        </button>
      </div>
    </div>
  );
};

export default SimpleLogin;
