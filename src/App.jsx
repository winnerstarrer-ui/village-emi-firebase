import { useState, useEffect, useCallback, useRef } from "react";
import * as FB from './firebaseService';

// ============================================================
// STYLES (Keep this section exactly as is, no changes needed)
// ============================================================
const GlobalStyles = () => (
  <style>{`
    /* ALL YOUR EXISTING CSS STYLES HERE - NO CHANGES NEEDED */
    /* Keep everything from line 7 to line 328 exactly as is */
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
  LAST_SYNC: 'lastSync'
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

// Sync data from cloud to local storage
const syncFromCloud = async (userId) => {
  try {
    console.log('Syncing data from cloud for user:', userId);
    const result = await FB.fetchUserDataFromCloud(userId);
    
    if (result.success) {
      // Update local storage with cloud data
      setLS(STORAGE_KEYS.VILLAGES, result.data.villages || []);
      setLS(STORAGE_KEYS.AGENTS, result.data.agents || []);
      setLS(STORAGE_KEYS.PRODUCTS, result.data.products || []);
      setLS(STORAGE_KEYS.CUSTOMERS, result.data.customers || []);
      setLS(STORAGE_KEYS.SALES, result.data.sales || []);
      setLS(STORAGE_KEYS.COLLECTIONS, result.data.collections || []);
      setLS(STORAGE_KEYS.LAST_SYNC, Date.now());
      
      console.log('Data synced successfully from cloud');
      return { success: true };
    } else {
      console.error('Failed to sync from cloud:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error in syncFromCloud:', error);
    return { success: false, error: error.message };
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
        
        // Initialize empty data for new user
        setLS(STORAGE_KEYS.VILLAGES, []);
        setLS(STORAGE_KEYS.AGENTS, []);
        setLS(STORAGE_KEYS.PRODUCTS, []);
        setLS(STORAGE_KEYS.CUSTOMERS, []);
        setLS(STORAGE_KEYS.SALES, []);
        setLS(STORAGE_KEYS.COLLECTIONS, []);
        
        onLogin(userData);
      } else {
        setError(result.error);
      }
    } else if (mode === 'login') {
      const result = await FB.loginUser(email, password);
      setLoading(false);
      if (result.success) {
        const userData = result.userData || {
          userId: result.user.uid,
          email: result.user.email,
          ownerName: 'Owner',
          businessName: 'My Business',
          role: 'owner'
        };
        
        setLS(STORAGE_KEYS.CURRENT_USER, userData);
        
        // Sync data from cloud on login
        console.log('Logging in, syncing data from cloud...');
        await syncFromCloud(result.user.uid);
        
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
  const [syncing, setSyncing] = useState(false);

  // Sync data from cloud when app loads if user is logged in
  useEffect(() => {
    if (user && user.userId) {
      const syncData = async () => {
        setSyncing(true);
        console.log('App loaded, syncing data from cloud...');
        await syncFromCloud(user.userId);
        setSyncing(false);
      };
      
      syncData();
    }
  }, [user]);

  const handleLogout = () => { 
    setLS(STORAGE_KEYS.CURRENT_USER, null); 
    setUser(null); 
    setPage('dashboard'); 
  };

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
      
      {/* Syncing Banner */}
      {syncing && (
        <div className="offline-banner syncing-banner">
          Syncing data from cloud...
        </div>
      )}
      
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