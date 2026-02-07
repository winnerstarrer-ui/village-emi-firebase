import { useState, useEffect, useCallback, useRef } from "react";
import * as FB from './firebaseService';

// ============================================================
// STYLES
// ============================================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Sora:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, #root { font-family: 'DM Sans', sans-serif; background: #0f1117; color: #e2e8f0; min-height: 100vh; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #2a2d3a; border-radius: 3px; }
    input, select, textarea { font-family: inherit; }
    button { cursor: pointer; border: none; outline: none; }
    input:focus, select:focus, textarea:focus { outline: none; }

    /* Toast */
    .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(120px); background: #1e2130; border: 1px solid #2a2d3a; border-radius: 12px; padding: 14px 24px; color: #e2e8f0; font-size: 14px; font-weight: 500; z-index: 9999; transition: transform 0.3s cubic-bezier(.34,1.56,.64,1); box-shadow: 0 8px 32px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 10px; max-width: 90vw; }
    .toast.show { transform: translateX(-50%) translateY(0); }
    .toast.success { border-color: #22c55e; }
    .toast.error { border-color: #ef4444; }
    .toast.success .toast-icon { color: #22c55e; }
    .toast.error .toast-icon { color: #ef4444; }

    /* Offline Banner */
    .offline-banner { position: fixed; top: 0; left: 0; right: 0; background: #dc2626; color: #fff; text-align: center; padding: 6px; font-size: 13px; font-weight: 600; z-index: 10000; }
    .syncing-banner { background: #d97706; }

    /* Layout */
    .app-shell { display: flex; min-height: 100vh; }
    .sidebar { width: 240px; background: #141620; border-right: 1px solid #1e2130; padding: 20px 12px; display: flex; flex-direction: column; flex-shrink: 0; position: fixed; top: 0; left: 0; bottom: 0; overflow-y: auto; }
    .sidebar-logo { padding: 12px 16px 24px; }
    .sidebar-logo h1 { font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }
    .sidebar-logo p { font-size: 11px; color: #64748b; margin-top: 2px; }
    .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #94a3b8; font-size: 13px; font-weight: 500; transition: all 0.15s; }
    .nav-item:hover { background: #1e2130; color: #e2e8f0; }
    .nav-item.active { background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1)); color: #a78bfa; }
    .nav-item .nav-icon { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 15px; }
    .sidebar-footer { padding-top: 16px; border-top: 1px solid #1e2130; }
    .sidebar-user { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; }
    .sidebar-user:hover { background: #1e2130; }
    .sidebar-avatar { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; }
    .sidebar-user-info { flex: 1; min-width: 0; }
    .sidebar-user-info .name { font-size: 13px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sidebar-user-info .role { font-size: 11px; color: #64748b; }

    .main-content { flex: 1; margin-left: 240px; padding: 28px; min-height: 100vh; }

    /* Mobile bottom nav */
    .mobile-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: #141620; border-top: 1px solid #1e2130; padding: 8px 0 12px; z-index: 100; }
    .mobile-nav-items { display: flex; justify-content: space-around; }
    .mobile-nav-item { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 12px; color: #64748b; font-size: 10px; font-weight: 500; border-radius: 8px; }
    .mobile-nav-item.active { color: #a78bfa; }
    .mobile-nav-item .m-icon { font-size: 18px; }

    /* Cards */
    .card { background: #1a1d27; border: 1px solid #1e2130; border-radius: 14px; padding: 20px; }
    .card-sm { padding: 16px; }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .card-title { font-size: 14px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

    /* Stats Grid */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 24px; }
    .stat-card { background: #1a1d27; border: 1px solid #1e2130; border-radius: 14px; padding: 18px; position: relative; overflow: hidden; }
    .stat-card::before { content: ''; position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; border-radius: 50%; opacity: 0.08; }
    .stat-card.blue::before { background: #6366f1; }
    .stat-card.green::before { background: #22c55e; }
    .stat-card.amber::before { background: #f59e0b; }
    .stat-card.red::before { background: #ef4444; }
    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; margin-bottom: 8px; }
    .stat-value { font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }
    .stat-sub { font-size: 11px; color: #64748b; margin-top: 4px; }
    .stat-sub .up { color: #22c55e; }
    .stat-sub .down { color: #ef4444; }

    /* Tables */
    .table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid #1e2130; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead { background: #141620; }
    th { text-align: left; padding: 12px 16px; color: #64748b; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; border-bottom: 1px solid #1e2130; }
    td { padding: 12px 16px; border-bottom: 1px solid rgba(30,33,48,0.5); color: #cbd5e1; white-space: nowrap; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(30,33,48,0.4); }
    .table-empty { text-align: center; padding: 48px; color: #475569; font-size: 14px; }

    /* Badges */
    .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge-active { background: rgba(34,197,94,0.1); color: #4ade80; }
    .badge-completed { background: rgba(99,102,241,0.1); color: #a78bfa; }
    .badge-overdue { background: rgba(239,68,68,0.1); color: #f87171; }
    .badge-pending { background: rgba(245,158,11,0.1); color: #fbbf24; }

    /* Buttons */
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; transition: all 0.15s; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .btn-primary:hover { background: linear-gradient(135deg, #5457e5, #7c4fe0); box-shadow: 0 4px 14px rgba(99,102,241,0.4); }
    .btn-green { background: linear-gradient(135deg, #16a34a, #22c55e); color: #fff; }
    .btn-green:hover { background: linear-gradient(135deg, #15803d, #16a34a); box-shadow: 0 4px 14px rgba(34,197,94,0.4); }
    .btn-outline { background: transparent; border: 1px solid #2a2d3a; color: #94a3b8; }
    .btn-outline:hover { border-color: #6366f1; color: #a78bfa; background: rgba(99,102,241,0.05); }
    .btn-danger { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
    .btn-danger:hover { background: rgba(239,68,68,0.2); }
    .btn-sm { padding: 5px 10px; font-size: 11px; border-radius: 6px; }
    .btn-lg { padding: 12px 24px; font-size: 15px; border-radius: 10px; width: 100%; }
    .btn-block { width: 100%; }

    /* Inputs */
    .input-group { margin-bottom: 16px; }
    .input-label { display: block; font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .input { width: 100%; background: #141620; border: 1px solid #2a2d3a; border-radius: 8px; padding: 10px 14px; color: #e2e8f0; font-size: 14px; transition: border-color 0.15s; }
    .input:focus { border-color: #6366f1; }
    .input::placeholder { color: #475569; }
    .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .input-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
    select.input { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { background: #1a1d27; border: 1px solid #2a2d3a; border-radius: 18px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
    .modal-header h3 { font-family: 'Sora', sans-serif; font-size: 17px; font-weight: 700; color: #fff; }
    .modal-close { width: 32px; height: 32px; border-radius: 8px; background: #141620; border: 1px solid #2a2d3a; color: #94a3b8; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .modal-close:hover { color: #fff; background: #1e2130; }
    .modal-body { padding: 20px 24px 24px; }

    /* Login */
    .login-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f1117; position: relative; overflow: hidden; }
    .login-bg { position: absolute; inset: 0; }
    .login-bg-blob { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.12; }
    .login-bg-blob.one { width: 500px; height: 500px; background: #6366f1; top: -100px; left: -100px; }
    .login-bg-blob.two { width: 400px; height: 400px; background: #8b5cf6; bottom: -100px; right: -100px; }
    .login-card { position: relative; z-index: 1; background: #1a1d27; border: 1px solid #2a2d3a; border-radius: 24px; padding: 40px; width: 100%; max-width: 400px; }
    .login-logo { text-align: center; margin-bottom: 32px; }
    .login-logo .logo-icon { width: 56px; height: 56px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; font-size: 28px; }
    .login-logo h1 { font-family: 'Sora', sans-serif; font-size: 22px; font-weight: 700; color: #fff; }
    .login-logo p { font-size: 13px; color: #64748b; margin-top: 4px; }
    .login-toggle { display: flex; background: #141620; border: 1px solid #2a2d3a; border-radius: 10px; margin-bottom: 24px; overflow: hidden; }
    .login-toggle-btn { flex: 1; padding: 10px; font-size: 13px; font-weight: 600; color: #64748b; transition: all 0.2s; background: transparent; }
    .login-toggle-btn.active { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .login-tabs { display: flex; gap: 10px; margin-bottom: 24px; }
    .login-tab { flex: 1; padding: 10px; font-size: 13px; font-weight: 600; color: #64748b; background: #141620; border: 1px solid #2a2d3a; border-radius: 8px; text-align: center; }
    .login-tab.active { background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1)); color: #a78bfa; border-color: #6366f1; }
    .login-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 12px; border-radius: 8px; font-size: 12px; margin-bottom: 16px; text-align: center; }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar { display: none; }
      .main-content { margin-left: 0; padding: 20px 16px 80px; }
      .mobile-nav { display: block; }
      .stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
      .stat-value { font-size: 20px; }
      .modal { max-width: 100%; margin: 0 10px; }
      .input-row, .input-row-3 { grid-template-columns: 1fr; }
      th, td { padding: 10px 12px; font-size: 12px; }
    }
  `}</style>
);

// ============================================================
// COMPONENTS
// ============================================================

// Toast Notification
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast show ${type}`}>
      <span className="toast-icon">{type === 'error' ? '⚠️' : '✅'}</span>
      <span>{message}</span>
    </div>
  );
};

// Helper to generate simple IDs
const genID = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================
const STORAGE_KEYS = {
  CURRENT_USER: 'currentUser',
  VILLAGES: 'villages',
  AGENTS: 'agents',
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  SALES: 'sales',
  COLLECTIONS: 'collections',
};

const getLS = (key) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
};

const setLS = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
};

// ============================================================
// LOGIN / REGISTER SCREEN
// ============================================================
function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'register' && role === 'owner') {
      const result = await FB.registerUser(email, password, { ownerName, businessName });
      setLoading(false);
      if (result.success) {
        const userData = {
          userId: result.user.uid,
          email: result.user.email,
          ownerName,
          businessName,
          role: 'owner'
        };
        setLS(STORAGE_KEYS.CURRENT_USER, userData);
        onLogin(userData);
      } else {
        setError(result.error);
      }
    } else if (mode === 'login') {
      const result = await FB.loginUser(email, password);
      setLoading(false);
      if (result.success) {
        const userData = {
          userId: result.user.uid,
          email: result.user.email,
          ownerName: ownerName || 'Owner',
          businessName: businessName || 'My Business',
          role: 'owner'
        };
        setLS(STORAGE_KEYS.CURRENT_USER, userData);
        onLogin(userData);
      } else {
        setError(result.error);
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
          <p>Manage your EMI business with ease</p>
        </div>

        <div className="login-toggle">
          <button className={`login-toggle-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Login</button>
          <button className={`login-toggle-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Register</button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="input-group">
                <label className="input-label">Owner Name</label>
                <input className="input" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Your name" required />
              </div>
              <div className="input-group">
                <label className="input-label">Business Name</label>
                <input className="input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your business name" required />
              </div>
            </>
          )}
          <div className="input-group">
            <label className="input-label">Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// OWNER DASHBOARD
// ============================================================
function OwnerDashboard({ user }) {
  const customers = getLS(STORAGE_KEYS.CUSTOMERS) || [];
  const sales = getLS(STORAGE_KEYS.SALES) || [];
  const collections = getLS(STORAGE_KEYS.COLLECTIONS) || [];

  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const completedCustomers = customers.filter(c => c.status === 'completed').length;
  const overdueCustomers = customers.filter(c => c.status === 'overdue').length;

  const todayCollections = collections.filter(col => {
    const colDate = new Date(col.date).toDateString();
    const today = new Date().toDateString();
    return colDate === today;
  });

  const todayAmount = todayCollections.reduce((sum, col) => sum + (col.amount || 0), 0);
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.balanceAmount || 0), 0);

  const recentSales = sales.slice(-5).reverse();

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#fff' }}>Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-label">Active Customers</div>
          <div className="stat-value">{activeCustomers}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Today's Collection</div>
          <div className="stat-value">₹{todayAmount.toLocaleString()}</div>
          <div className="stat-sub">{todayCollections.length} collections</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value">₹{totalOutstanding.toLocaleString()}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Overdue</div>
          <div className="stat-value">{overdueCustomers}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Sales</div>
        </div>
        {recentSales.length === 0 ? (
          <div className="table-empty">No sales yet. Create your first sale!</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Total</th>
                  <th>EMI</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map(sale => (
                  <tr key={sale.id}>
                    <td>{sale.customerName}</td>
                    <td>{sale.productName}</td>
                    <td>₹{sale.totalAmount?.toLocaleString() || 0}</td>
                    <td>₹{sale.emiAmount?.toLocaleString() || 0}</td>
                    <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${sale.status || 'active'}`}>{sale.status || 'active'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// VILLAGE MANAGEMENT
// ============================================================
function VillageManagement({ user }) {
  const [villages, setVillages] = useState(getLS(STORAGE_KEYS.VILLAGES) || []);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', district: '', pincode: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setLS(STORAGE_KEYS.VILLAGES, villages);
  }, [villages]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSave = async () => {
    if (!form.name || !form.district) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const newVillage = { ...form, id: genID() };
    
    // Save to cloud
    const result = await FB.saveVillageToCloud(newVillage, user.userId);
    
    if (result.success) {
      setVillages([...villages, newVillage]);
      setForm({ name: '', district: '', pincode: '' });
      setShowModal(false);
      showToast('Village saved successfully');
    } else {
      showToast('Failed to save village: ' + result.error, 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>Villages</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Village</button>
      </div>

      <div className="card">
        {villages.length === 0 ? (
          <div className="table-empty">No villages added yet</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Village Name</th>
                  <th>District</th>
                  <th>Pincode</th>
                </tr>
              </thead>
              <tbody>
                {villages.map(v => (
                  <tr key={v.id}>
                    <td>{v.name}</td>
                    <td>{v.district}</td>
                    <td>{v.pincode || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Village</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label className="input-label">Village Name *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Enter village name" />
              </div>
              <div className="input-group">
                <label className="input-label">District *</label>
                <input className="input" value={form.district} onChange={(e) => setForm({...form, district: e.target.value})} placeholder="Enter district" />
              </div>
              <div className="input-group">
                <label className="input-label">Pincode</label>
                <input className="input" value={form.pincode} onChange={(e) => setForm({...form, pincode: e.target.value})} placeholder="Enter pincode" />
              </div>
              <button className="btn btn-green btn-block" onClick={handleSave}>Save Village</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ============================================================
// AGENT MANAGEMENT
// ============================================================
function AgentManagement({ user }) {
  const [agents, setAgents] = useState(getLS(STORAGE_KEYS.AGENTS) || []);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', village: '', commission: '' });
  const [toast, setToast] = useState(null);

  const villages = getLS(STORAGE_KEYS.VILLAGES) || [];

  useEffect(() => {
    setLS(STORAGE_KEYS.AGENTS, agents);
  }, [agents]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.village) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const newAgent = { ...form, id: genID(), status: 'active' };
    
    // Save to cloud
    const result = await FB.saveAgentToCloud(newAgent, user.userId);
    
    if (result.success) {
      setAgents([...agents, newAgent]);
      setForm({ name: '', phone: '', village: '', commission: '' });
      setShowModal(false);
      showToast('Agent saved successfully');
    } else {
      showToast('Failed to save agent: ' + result.error, 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>Agents</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Agent</button>
      </div>

      <div className="card">
        {agents.length === 0 ? (
          <div className="table-empty">No agents added yet</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th>Phone</th>
                  <th>Village</th>
                  <th>Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {agents.map(a => (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td>{a.phone}</td>
                    <td>{a.village}</td>
                    <td>{a.commission ? `${a.commission}%` : '-'}</td>
                    <td><span className="badge badge-active">{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Agent</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label className="input-label">Agent Name *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Enter agent name" />
              </div>
              <div className="input-group">
                <label className="input-label">Phone *</label>
                <input className="input" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="Enter phone number" />
              </div>
              <div className="input-group">
                <label className="input-label">Village *</label>
                <select className="input" value={form.village} onChange={(e) => setForm({...form, village: e.target.value})}>
                  <option value="">Select village</option>
                  {villages.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Commission %</label>
                <input className="input" type="number" value={form.commission} onChange={(e) => setForm({...form, commission: e.target.value})} placeholder="e.g., 5" />
              </div>
              <button className="btn btn-green btn-block" onClick={handleSave}>Save Agent</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ============================================================
// PRODUCT MANAGEMENT
// ============================================================
function ProductManagement({ user }) {
  const [products, setProducts] = useState(getLS(STORAGE_KEYS.PRODUCTS) || []);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', price: '', description: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setLS(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const newProduct = { ...form, id: genID(), price: parseFloat(form.price) };
    
    // Save to cloud
    const result = await FB.saveProductToCloud(newProduct, user.userId);
    
    if (result.success) {
      setProducts([...products, newProduct]);
      setForm({ name: '', category: '', price: '', description: '' });
      setShowModal(false);
      showToast('Product saved successfully');
    } else {
      showToast('Failed to save product: ' + result.error, 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>Products</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Product</button>
      </div>

      <div className="card">
        {products.length === 0 ? (
          <div className="table-empty">No products added yet</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.category || '-'}</td>
                    <td>₹{p.price?.toLocaleString() || 0}</td>
                    <td>{p.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Product</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label className="input-label">Product Name *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Enter product name" />
              </div>
              <div className="input-group">
                <label className="input-label">Category</label>
                <input className="input" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} placeholder="e.g., Electronics, Furniture" />
              </div>
              <div className="input-group">
                <label className="input-label">Price *</label>
                <input className="input" type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} placeholder="Enter price" />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <input className="input" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Product details" />
              </div>
              <button className="btn btn-green btn-block" onClick={handleSave}>Save Product</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// Placeholder components for other pages
function SalesEntry() { return <div className="card"><div className="table-empty">Sales Entry page coming soon</div></div>; }
function CustomerList() { return <div className="card"><div className="table-empty">Customer List page coming soon</div></div>; }
function Reports() { return <div className="card"><div className="table-empty">Reports page coming soon</div></div>; }
function AgentFastCollect() { return <div className="card"><div className="table-empty">Agent Fast Collect page coming soon</div></div>; }
function AgentCustomerView() { return <div className="card"><div className="table-empty">Agent Customer View page coming soon</div></div>; }
function AgentHistory() { return <div className="card"><div className="table-empty">Agent History page coming soon</div></div>; }

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [user, setUser] = useState(getLS(STORAGE_KEYS.CURRENT_USER));
  const [page, setPage] = useState('dashboard');

  const handleLogout = () => { setLS(STORAGE_KEYS.CURRENT_USER, null); setUser(null); setPage('dashboard'); };

  if (!user) return (<><GlobalStyles /><LoginScreen onLogin={setUser} /></>);

  const isOwner = user.role === 'owner';

  // Owner nav
  const ownerNav = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'sales', icon: '💰', label: 'New Sale' },
    { id: 'customers', icon: '👥', label: 'Customers' },
    { id: 'reports', icon: '📈', label: 'Reports' },
    { id: 'villages', icon: '🏘️', label: 'Villages' },
    { id: 'agents', icon: '🚶', label: 'Agents' },
    { id: 'products', icon: '📦', label: 'Products' },
  ];

  // Agent nav
  const agentNav = [
    { id: 'dashboard', icon: '💳', label: 'Collect' },
    { id: 'customers', icon: '👥', label: 'Customers' },
    { id: 'history', icon: '📋', label: 'History' },
  ];

  const nav = isOwner ? ownerNav : agentNav;

  const renderPage = () => {
    if (isOwner) {
      switch (page) {
        case 'dashboard': return <OwnerDashboard user={user} />;
        case 'villages': return <VillageManagement user={user} />;
        case 'agents': return <AgentManagement user={user} />;
        case 'products': return <ProductManagement user={user} />;
        case 'sales': return <SalesEntry user={user} />;
        case 'customers': return <CustomerList user={user} />;
        case 'reports': return <Reports user={user} />;
        default: return <OwnerDashboard user={user} />;
      }
    } else {
      switch (page) {
        case 'dashboard': return <AgentFastCollect user={user} />;
        case 'customers': return <AgentCustomerView user={user} />;
        case 'history': return <AgentHistory user={user} />;
        default: return <AgentFastCollect user={user} />;
      }
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="app-shell">
        {/* Sidebar (Desktop) */}
        <div className="sidebar">
          <div className="sidebar-logo">
            <h1>🏘️ Village EMI</h1>
            <p>Manager</p>
          </div>
          <div className="sidebar-nav">
            {nav.map(item => (
              <div key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="sidebar-footer">
            <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
              <div className="sidebar-avatar">{(isOwner ? user.ownerName : user.agentName)?.[0] || '?'}</div>
              <div className="sidebar-user-info">
                <div className="name">{isOwner ? user.ownerName : user.agentName}</div>
                <div className="role">{isOwner ? 'Owner' : 'Agent'} • Logout</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {renderPage()}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-nav">
        <div className="mobile-nav-items">
          {nav.map(item => (
            <div key={item.id} className={`mobile-nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
              <span className="m-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          <div className="mobile-nav-item" onClick={handleLogout}>
            <span className="m-icon">🚪</span>
            <span>Logout</span>
          </div>
        </div>
      </div>
    </>
  );
}
