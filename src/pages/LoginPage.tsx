import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Particles from '@/components/Particles';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(loginData.email, loginData.password);
    
    if (!result.success) {
      setError(result.message || 'Login failed');
    }
    
    setLoading(false);
  };

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(registerData);
    
    if (!result.success) {
      setError(result.message || 'Registration failed');
    }
    
    setLoading(false);
  };

  return (
    <>
      {/* Particles Background for Login Page */}
      <Particles
        particleColors={['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']}
        particleCount={80}
        particleSpread={6}
        speed={0.2}
        particleBaseSize={2}
        moveParticlesOnHover={true}
        alphaParticles={true}
        disableRotation={false}
      />
      
      <div className="login-container">
        <div className="login-card">
          <h1>NISCHAY</h1>
          
          {error && (
            <div className="error-message" style={{ 
              color: '#ef4444', 
              textAlign: 'center', 
              marginBottom: '1rem',
              padding: '0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="input-field">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
              <div className="input-field">
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required 
                />
              </div>
              <button className="login-button" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div className="input-field">
                <input
                  type="text"
                  placeholder="First Name"
                  value={registerData.firstName}
                  onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="input-field">
                <input
                  type="text"
                  placeholder="Last Name"
                  value={registerData.lastName}
                  onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="input-field">
                <input
                  type="text"
                  placeholder="Username"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  required
                />
              </div>
              <div className="input-field">
                <input
                  type="email"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </div>
              <div className="input-field">
                <input
                  type="password"
                  placeholder="Password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                />
              </div>
              <button className="login-button" type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          )}

          <div className="or-divider">OR</div>

          <button 
            className="login-facebook"
            onClick={() => setIsLogin(!isLogin)}
            style={{ cursor: 'pointer', border: 'none', background: 'none' }}
          >
            {isLogin ? 'Create new account' : 'Back to login'}
          </button>
          
          {isLogin && (
            <a href="#" className="forgot-password">
              Forgot password?
            </a>
          )}
        </div>
      </div>

      <div className="signup-container">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}>
          {isLogin ? 'Sign up' : 'Log in'}
        </a>
      </div>
    </>
  );
};

export default LoginPage;
