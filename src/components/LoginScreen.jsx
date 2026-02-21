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
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [regData, setRegData] = useState({ businessName: '', ownerName: '', phone: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (role === 'owner') {
      // Owner login
      if (!email || !password) { setError('Fill all fields'); return; }
      try {
        const res = await FB.loginUser(email, password);
        if (!res.success) { setError(res.error || 'Invalid email or password'); return; }
        const userWithRole = { ...res.user, role: res.role || role };
        setLS(STORAGE_KEYS.CURRENT_USER, userWithRole);
        onLogin(userWithRole);
      } catch (err) {
        setError(err.message || 'Login failed');
      }
    } else {
      // Agent login with phone + PIN
      if (!phone || !pin) { setError('Enter phone and PIN'); return; }
      try {
        const res = await FB.verifyAgentLogin(phone, pin);
        if (!res.success) { setError(res.error || 'Invalid credentials'); return; }
        setLS(STORAGE_KEYS.CURRENT_USER, res.user);
        onLogin(res.user);
      } catch (err) {
        setError(err.message || 'Login failed');
      }
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

        {role === 'owner' ? (
          // Owner login fields
          <>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input className="input" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin(e)} />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin(e)} />
            </div>
          </>
        ) : (
          // Agent login fields
          <>
            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input className="input" type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin(e)} />
            </div>
            <div className="input-group">
              <label className="input-label">PIN</label>
              <input className="input" type="password" placeholder="Enter PIN" value={pin} onChange={e => setPin(e.target.value)} maxLength="6" onKeyDown={e => e.key === 'Enter' && handleLogin(e)} />
            </div>
          </>
        )}

        <button className="btn btn-primary btn-lg btn-block" onClick={handleLogin}>
          {role === 'owner' ? 'Login' : 'Login as Agent'}
        </button>

        {role === 'owner' && (
          <div className="login-footer">
            <a href="#" onClick={e => { e.preventDefault(); setIsRegister(!isRegister); setError(''); }}>{isRegister ? 'Already have account? Login' : "Don't have account? Register"}</a>
          </div>
        )}
        <div style={{ marginTop: 24, padding: 14, background: '#141620', borderRadius: 10, border: '1px solid #2a2d3a' }}>
          <p style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>DEMO CREDENTIALS</p>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>Owner: <strong style={{ color: '#a78bfa' }}>owner@demo.com</strong> / demo123</p>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>Agent: <strong style={{ color: '#a78bfa' }}>Use phone/PIN created by owner</strong> (demo: 9876543210 / 1234)</p>
        </div>
      </div>
    </div>
  );
};