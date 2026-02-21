import { useState } from 'react';
import * as FB from '../firebaseService';
import { STORAGE_KEYS, setLS } from '../storage';

// ============================================================
// LOGIN SCREEN
// ============================================================
export const LoginScreen = ({ onLogin }) => {
  const [role, setRole] = useState('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    try {
      const res = await FB.loginUser(email, password);
      if (!res.success) {
        setError(res.error || 'Invalid email or password');
        return;
      }

      const userWithRole = { ...res.user, role: res.role || role };
      setLS(STORAGE_KEYS.CURRENT_USER, userWithRole);
      onLogin(userWithRole);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-bg">
        <div className="login-bg-blob one"></div>
        <div className="login-bg-blob two"></div>
      </div>
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">🏘️</div>
          <h1>Village EMI Manager</h1>
          <p>EMI Sales & Collection System</p>
        </div>
        <div className="role-tabs">
          <div className={`role-tab ${role === 'owner' ? 'active' : ''}`} onClick={() => { setRole('owner'); setError(''); }}>👤 Owner</div>
          <div className={`role-tab ${role === 'agent' ? 'active' : ''}`} onClick={() => { setRole('agent'); setError(''); }}>🚶 Agent</div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <div className="input-group">
          <label className="input-label">Email</label>
          <input className="input" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin(e)} />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin(e)} />
        </div>
        <button className="btn btn-primary btn-lg btn-block" onClick={handleLogin}>Login</button>
        <div style={{ marginTop: 24, padding: 14, background: '#141620', borderRadius: 10, border: '1px solid #2a2d3a' }}>
          <p style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>DEMO CREDENTIALS</p>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>Owner: <strong style={{ color: '#a78bfa' }}>owner@demo.com</strong> / demo123</p>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>Agent: <strong style={{ color: '#a78bfa' }}>rajesh@demo.com</strong> / demo123</p>
        </div>
      </div>
    </div>
  );
};