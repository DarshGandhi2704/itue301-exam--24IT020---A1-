import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, token } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to /events
  useEffect(() => {
    if (token) {
      navigate('/events', { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      // Redirect to /events after login
      navigate('/events');
    } else {
      setErrorMessage(result.message || 'Invalid credentials.');
    }
  };

  // Quick helper to fill demo credentials during viva / testing
  const setDemoCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="brand-badge">🎟️ EventHub</div>
          <h2>Attendee & Organizer Login</h2>
          <p className="login-subtitle">Sign in to book tickets and manage events</p>
        </div>

        {errorMessage && (
          <div className="alert alert-error" id="login-error">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="e.g. rahul@eventhub.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
            id="login-submit-btn"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-accounts-card">
          <p className="demo-title">🎓 Quick Demo Accounts for Viva Evaluation:</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-btn"
              onClick={() => setDemoCredentials('rahul@eventhub.com', 'password123')}
            >
              👤 Attendee: Rahul (Attendee Role)
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => setDemoCredentials('priya@eventhub.com', 'password123')}
            >
              ⭐ Organizer: Priya (Organizer Role)
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => setDemoCredentials('amit@eventhub.com', 'password123')}
            >
              👤 Attendee 2: Amit (Attendee Role)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
