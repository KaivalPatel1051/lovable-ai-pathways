import React from 'react';
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
      <div className="login-container">
        <div className="login-card">
          <h1>FBIOPENUP</h1>
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
