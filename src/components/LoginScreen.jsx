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
  const [isRegister, setIsRegister] = useState(false);
  const [regData, setRegData] = useState({ businessName: '', ownerName: '', phone: '' });

  const handleLogin = async (e) => {
    console.log('Button Clicked - Role:', role, 'isRegister:', isRegister);
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    if (role === 'owner' && isRegister) {
      if (!email || !password || !regData.businessName || !regData.ownerName) { setError('Fill all fields'); return; }
      try {
        console.log('Attempting Firebase Auth with:', email);
        const res = await FB.registerUser(email, password, regData);
        if (!res.success) { setError(res.error || 'Registration failed'); return; }
        const ownerUser = { ...res.user, role: 'owner' };
      setLS(STORAGE_KEYS.CURRENT_USER, ownerUser);
        const [vs, ps, as] = await Promise.all([
          FB.getFilteredFromFirestore('villages','ownerId','==',ownerUser.id),
          FB.getFilteredFromFirestore('products','ownerId','==',ownerUser.id),
          FB.getFilteredFromFirestore('agents','ownerId','==',ownerUser.id)
        ]);
        setLS(STORAGE_KEYS.VILLAGES, vs.map(v => ({ id: v.id, ...v })));
        setLS(STORAGE_KEYS.PRODUCTS, ps.map(p => ({ id: p.id, ...p })));
      setLS(STORAGE_KEYS.AGENTS, as.map(a => ({ id: a.id, ...a })));
        onLogin(ownerUser);
        await FB.seedDemoData(res.user.id);
      } catch (e) {
        console.error('Registration flow error:', e);
        setError((e && e.message) || 'Registration failed');
      }
      return;
    }
    try {
      if (!email || !password) { setError('Fill all fields'); return; }
      console.log('Attempting Firebase Auth with:', email);
      const res = await FB.loginUser(email, password);
      if (!res.success) { setError(res.error || 'Invalid email or password'); return; }
      const userWithRole = { ...res.user, role: res.role || role };
      setLS(STORAGE_KEYS.CURRENT_USER, userWithRole);
      const [vs, ps, as] = await Promise.all([
        FB.getFilteredFromFirestore('villages','ownerId','==',userWithRole.id),
        FB.getFilteredFromFirestore('products','ownerId','==',userWithRole.id),
        FB.getFilteredFromFirestore('agents','ownerId','==',userWithRole.id)
      ]);
      setLS(STORAGE_KEYS.VILLAGES, vs.map(v => ({ id: v.id, ...v })));
      setLS(STORAGE_KEYS.PRODUCTS, ps.map(p => ({ id: p.id, ...p })));
      setLS(STORAGE_KEYS.AGENTS, as.map(a => ({ id: a.id, ...a })));
      onLogin(userWithRole);
      if ((userWithRole.role || '') === 'owner') await FB.seedDemoData(userWithRole.id);
    } catch (e) {
      console.error('Login flow error:', e);
      setError((e && e.message) || 'Invalid email or password');
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
          <div className={`role-tab ${role === 'owner' ? 'active' : ''}`} onClick={() => { setRole('owner'); setError(''); setIsRegister(false); }}>👤 Owner</div>
          <div className={`role-tab ${role === 'agent' ? 'active' : ''}`} onClick={() => { setRole('agent'); setError(''); setIsRegister(false); }}>🚶 Agent</div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        {role === 'owner' && isRegister && (
          <>
            <div className="input-group">
              <label className="input-label">Business Name</label>
              <input className="input" placeholder="e.g. Kumar Enterprises" value={regData.businessName} onChange={e => setRegData(p => ({...p, businessName: e.target.value}))} />
            </div>
            <div className="input-group">
              <label className="input-label">Owner Name</label>
              <input className="input" placeholder="e.g. Vikram Kumar" value={regData.ownerName} onChange={e => setRegData(p => ({...p, ownerName: e.target.value}))} />
            </div>
          </>
        )}
        <div className="input-group">
          <label className="input-label">Email</label>
          <input className="input" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>
        <button className="btn btn-primary btn-lg btn-block" onClick={handleLogin}>{isRegister ? 'Register' : 'Login'}</button>
        {role === 'owner' && (
          <div className="login-footer">
            <a href="#" onClick={e => { e.preventDefault(); setIsRegister(!isRegister); setError(''); }}>{isRegister ? 'Already have account? Login' : "Don't have account? Register"}</a>
          </div>
        )}
        <div style={{ marginTop: 24, padding: 14, background: '#141620', borderRadius: 10, border: '1px solid #2a2d3a' }}>
          <p style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>DEMO CREDENTIALS</p>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>Owner: <strong style={{ color: '#a78bfa' }}>owner@demo.com</strong> / demo123</p>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>Agent: <strong style={{ color: '#a78bfa' }}>rajesh@demo.com</strong> / demo123</p>
        </div>
      </div>
    </div>
  );
};
