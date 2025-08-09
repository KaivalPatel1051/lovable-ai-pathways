import React from 'react';
import Particles from '@/components/Particles';
import './LoginPage.css';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Simulate login success (replace with real auth logic)
    onLoginSuccess();
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
          <form onSubmit={handleSubmit}>
            <div className="input-field">
              <input
                type="text"
                placeholder="Phone number, username, or email"
                required
              />
            </div>
            <div className="input-field">
              <input type="password" placeholder="Password" required />
            </div>
            <button className="login-button" type="submit">
              Log In
            </button>
          </form>

          <div className="or-divider">OR</div>

          <div className="login-facebook">Log in with Facebook</div>
          <a href="#" className="forgot-password">
            Forgot password?
          </a>
        </div>
      </div>

      <div className="signup-container">
        Don’t have an account? <a href="#">Sign up</a>
      </div>
    </>
  );
};

export default LoginPage;
