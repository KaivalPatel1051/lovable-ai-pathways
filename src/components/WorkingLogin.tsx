import React, { useState } from 'react';
import axios from 'axios';
// Beams component removed due to React Three Fiber compatibility issues

const WorkingLogin: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: '', // This is what backend expects
    password: ''
  });

  // Register form state  
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);

    try {
      console.log('🔄 Attempting login with:', { identifier: loginData.identifier });
      
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        identifier: loginData.identifier,
        password: loginData.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Login successful:', response.data);
      
      // Store tokens
      const { token, refreshToken, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setSuccess(true);
      setMessage(`✅ Login successful! Welcome ${user.firstName}!`);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      setMessage(`❌ Login failed: ${error.response?.data?.message || error.message}`);
    }
    
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);

    try {
      console.log('🔄 Attempting registration with:', registerData);
      
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        firstName: registerData.firstName.trim(),
        lastName: registerData.lastName.trim(),
        username: registerData.username.trim(),
        email: registerData.email.trim().toLowerCase(),
        password: registerData.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Registration successful:', response.data);
      
      // Store tokens
      const { token, refreshToken, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setSuccess(true);
      setMessage(`✅ Registration successful! Welcome ${user.firstName}!`);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || error.message;
      const errors = error.response?.data?.errors;
      
      if (errors && Array.isArray(errors)) {
        const errorList = errors.map((err: any) => err.msg).join(', ');
        setMessage(`❌ Registration failed: ${errorList}`);
      } else {
        setMessage(`❌ Registration failed: ${errorMsg}`);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="login-with-beams" style={{ minHeight: '100vh', position: 'relative', backgroundColor: '#0a0a0a' }}>
      {/* 3D Beams Background removed due to React Three Fiber compatibility issues */}
      
      <div className="login-form-container" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '400px',
        padding: '20px',
        zIndex: 2
      }}>
        <div style={{
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          backdropFilter: 'blur(10px)',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
        }}>
          <h1 style={{
            color: '#8b5cf6',
            textAlign: 'center',
            marginBottom: '30px',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            letterSpacing: '2px'
          }}>
            NISCHAY
          </h1>

          {/* Status Message */}
          {message && (
            <div style={{
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px',
              backgroundColor: success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${success ? '#10b981' : '#ef4444'}`,
              color: success ? '#10b981' : '#ef4444',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              {message}
            </div>
          )}

          {isLogin ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Email or Username"
                  value={loginData.identifier}
                  onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: loading ? '#666' : '#8b5cf6',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? '🔄 Logging in...' : '🚀 Log In'}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="First Name"
                  value={registerData.firstName}
                  onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={registerData.lastName}
                  onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Username (3-30 characters, letters/numbers/_)"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[a-zA-Z0-9_]+"
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <input
                  type="password"
                  placeholder="Password (minimum 6 characters)"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: loading ? '#666' : '#10b981',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? '🔄 Creating Account...' : '✨ Sign Up'}
              </button>
            </form>
          )}

          {/* Toggle Button */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage('');
                setSuccess(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#8b5cf6',
                cursor: 'pointer',
                fontSize: '16px',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? '✨ Create new account' : '🔙 Back to login'}
            </button>
          </div>

          {/* Debug Info */}
          <div style={{
            marginTop: '30px',
            padding: '15px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            fontSize: '12px',
            color: '#888'
          }}>
            <p><strong>Backend:</strong> http://localhost:3001</p>
            <p><strong>Test User:</strong> john@example.com / password123</p>
            <p><strong>Mode:</strong> {isLogin ? 'Login' : 'Register'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingLogin;
