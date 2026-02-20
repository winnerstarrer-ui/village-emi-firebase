import { useState, useEffect } from 'react';
import * as FB from './firebaseService';

// Styles
import { GlobalStyles } from './styles';

// Storage & Constants
import { STORAGE_KEYS, getLS, setLS, seedData } from './storage';

// Components
import { Toast, Modal } from './components/Common';
import { LoginScreen } from './components/LoginScreen';

// Owner Pages
import { OwnerDashboard } from './pages/OwnerDashboard';
import { VillageManagement } from './pages/VillageManagement';
import { AgentManagement } from './pages/AgentManagement';
import { ProductManagement } from './pages/ProductManagement';
import { SalesEntry } from './pages/SalesEntry';
import { CustomerList } from './pages/CustomerList';
import { Reports } from './pages/Reports';

// Agent Pages
import { AgentFastCollect } from './pages/AgentFastCollect';
import { AgentCustomerView } from './pages/AgentCustomerView';
import { AgentHistory } from './pages/AgentHistory';

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  // Seed demo data on mount
  useEffect(() => { seedData(); }, []);

  const [user, setUser] = useState(() => getLS(STORAGE_KEYS.CURRENT_USER));
  const [page, setPage] = useState('dashboard');
  useEffect(() => {
    if (!user || !user.id) return;
    (async () => {
      const [vs, ps, as, cs, ss, pys] = await Promise.all([
        FB.getFilteredFromFirestore('villages','ownerId','==',user.id),
        FB.getFilteredFromFirestore('products','ownerId','==',user.id),
        FB.getFilteredFromFirestore('agents','ownerId','==',user.id),
        FB.getFilteredFromFirestore('customers','ownerId','==',user.id),
        FB.getFilteredFromFirestore('sales','ownerId','==',user.id),
        FB.getFilteredFromFirestore('payments','ownerId','==',user.id)
      ]);
      setLS(STORAGE_KEYS.VILLAGES, vs.map(v => ({ id: v.id, ...v })));
      setLS(STORAGE_KEYS.PRODUCTS, ps.map(p => ({ id: p.id, ...p })));
      setLS(STORAGE_KEYS.AGENTS, as.map(a => ({ id: a.id, ...a })));
      setLS(STORAGE_KEYS.CUSTOMERS, cs.map(c => ({ id: c.id, ...c })));
      setLS(STORAGE_KEYS.SALES, ss.map(s => ({ id: s.id, ...s })));
      setLS(STORAGE_KEYS.PAYMENTS, pys.map(p => ({ id: p.id, ...p })));
    })();
  }, [user && user.id]);

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
