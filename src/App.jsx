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
    .role-tabs { display: flex; gap: 8px; margin-bottom: 24px; background: #141620; border-radius: 10px; padding: 4px; }
    .role-tab { flex: 1; padding: 10px; border-radius: 8px; text-align: center; font-size: 13px; font-weight: 600; color: #64748b; transition: all 0.2s; }
    .role-tab.active { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; box-shadow: 0 2px 8px rgba(99,102,241,0.3); }
    .login-footer { text-align: center; margin-top: 20px; }
    .login-footer a { color: #6366f1; font-size: 13px; text-decoration: none; }
    .login-footer a:hover { color: #a78bfa; }
    .error-msg { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }

    /* Page Header */
    .page-header { margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
    .page-header h2 { font-family: 'Sora', sans-serif; font-size: 21px; font-weight: 700; color: #fff; }
    .page-header p { font-size: 13px; color: #64748b; margin-top: 2px; }
    .page-actions { display: flex; gap: 8px; }

    /* Search / Filter Bar */
    .filter-bar { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; align-items: center; }
    .search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 320px; }
    .search-wrap .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 15px; }
    .search-wrap .input { padding-left: 36px; }

    /* Export buttons */
    .export-btns { display: flex; gap: 8px; }

    /* Progress Bar */
    .progress-wrap { background: #141620; border-radius: 6px; height: 6px; overflow: hidden; }
    .progress-bar { height: 100%; border-radius: 6px; transition: width 0.5s; }
    .progress-bar.green { background: linear-gradient(90deg, #16a34a, #22c55e); }
    .progress-bar.blue { background: linear-gradient(90deg, #6366f1, #8b5cf6); }

    /* Quick Buttons (Agent) */
    .quick-btns { display: flex; gap: 8px; flex-wrap: wrap; }
    .quick-btn { background: #141620; border: 1px solid #2a2d3a; color: #e2e8f0; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; transition: all 0.15s; }
    .quick-btn:hover, .quick-btn.selected { border-color: #6366f1; background: rgba(99,102,241,0.1); color: #a78bfa; }

    /* Agent Collection Screen */
    .collect-screen { max-width: 520px; margin: 0 auto; }
    .village-selector { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
    .village-chip { background: #1a1d27; border: 2px solid #2a2d3a; border-radius: 20px; padding: 8px 16px; font-size: 13px; font-weight: 600; color: #94a3b8; transition: all 0.15s; }
    .village-chip:hover, .village-chip.selected { border-color: #6366f1; background: rgba(99,102,241,0.1); color: #a78bfa; }
    .customer-list { max-height: 400px; overflow-y: auto; }
    .customer-card { background: #1a1d27; border: 1px solid #2a2d3a; border-radius: 12px; padding: 14px; }
    .customer-card:hover { border-color: #6366f1; }
    .cust-top { display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; }
    .cust-id { font-size: 14px; font-weight: 700; color: #fff; }
    .cust-details { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: #64748b; }
    .cust-detail { display: flex; align-items: center; gap: 4px; }
    .cust-detail span { color: #94a3b8; }

    .recent-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(30,33,48,0.5); }
    .recent-item:last-child { border-bottom: none; }
    .recent-item .ri-left { display: flex; align-items: center; gap: 10px; }
    .recent-item .ri-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; }
    .recent-item .ri-info .ri-name { font-size: 13px; color: #e2e8f0; font-weight: 500; }
    .recent-item .ri-info .ri-time { font-size: 11px; color: #64748b; }
    .recent-item .ri-amount { font-size: 14px; font-weight: 700; color: #4ade80; }

    /* Reports */
    .report-tabs { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
    .report-tab { padding: 8px 16px; border-radius: 20px; border: 1px solid #2a2d3a; background: #141620; color: #94a3b8; font-size: 12px; font-weight: 600; transition: all 0.15s; }
    .report-tab:hover, .report-tab.active { border-color: #6366f1; background: rgba(99,102,241,0.1); color: #a78bfa; }

    .date-filter { display: flex; gap: 8px; align-items: center; }
    .date-input { background: #141620; border: 1px solid #2a2d3a; border-radius: 8px; padding: 8px 12px; color: #e2e8f0; font-size: 13px; width: 150px; }
    .date-input:focus { border-color: #6366f1; outline: none; }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar { display: none; }
      .main-content { margin-left: 0; padding: 16px; padding-bottom: 80px; }
      .mobile-nav { display: block; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .input-row { grid-template-columns: 1fr; }
      .input-row-3 { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; align-items: flex-start; }
    }
    @media (min-width: 769px) {
      .mobile-nav { display: none; }
    }
  `}</style>
);

// ============================================================
// STORAGE KEYS
// ============================================================
const STORAGE_KEYS = {
  OWNERS: 'emi_owners',
  CURRENT_USER: 'emi_current_user',
  VILLAGES: 'emi_villages',
  AGENTS: 'emi_agents',
  PRODUCTS: 'emi_products',
  CUSTOMERS: 'emi_customers',
  SALES: 'emi_sales',
  PAYMENTS: 'emi_payments',
};

// ============================================================
// DATA STORE - Firestore as Source of Truth
// ============================================================
// In-memory cache only (no persistence to avoid stale data)
const _dataCache = {
  villages: null,
  agents: null,
  products: null,
  customers: null,
  sales: null,
  payments: null,
};

// User is stored separately since it doesn't sync from Firestore collections
let _currentUser = null;

const getCurrentUser = () => _currentUser;
const setCurrentUser = (user) => {
  _currentUser = user ? JSON.parse(JSON.stringify(user)) : null;
};

// Get data from cache (returns null if not loaded)
const getData = (key) => {
  if (!_dataCache[key]) return null;
  return JSON.parse(JSON.stringify(_dataCache[key]));
};

// Set data in cache
const setData = (key, value) => {
  _dataCache[key] = value ? JSON.parse(JSON.stringify(value)) : null;
};

// Clear all cache
const clearCache = () => {
  Object.keys(_dataCache).forEach(key => _dataCache[key] = null);
};

// Seed demo data
const seedData = () => {
  const u = getCurrentUser();
  if (!u || u.role !== 'owner') return;
  FB.getFilteredFromFirestore('villages', 'ownerId', '==', u.id)
    .then((list) => { if ((list || []).length === 0) FB.seedDemoData(u.id); })
    .catch(() => {});
};

// ============================================================
// HELPERS
// ============================================================
const uid = () => 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
const fmt = (n) => {
  if (n === null || n === undefined) return '₹0';
  const num = Math.round(Number(n));
  return '₹' + num.toLocaleString('en-IN');
};
const fmtDate = (ts) => {
  if (!ts) return '-';
  const d = new Date(ts);
  return d.getDate().toString().padStart(2,'0') + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getFullYear();
};
const fmtTime = (ts) => {
  if (!ts) return '-';
  const d = new Date(ts);
  let h = d.getHours(); const m = d.getMinutes().toString().padStart(2,'0');
  const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return h + ':' + m + ' ' + ap;
};
const isToday = (ts) => { if (!ts) return false; const d = new Date(ts); const t = new Date(); return d.getDate()===t.getDate()&&d.getMonth()===t.getMonth()&&d.getFullYear()===t.getFullYear(); };

// ============================================================
// TOAST HOOK
// ============================================================
const useToast = () => {
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const show = useCallback((msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2200);
  }, []);
  return { toast, showToast: show };
};

// ============================================================
// TOAST COMPONENT
// ============================================================
const Toast = ({ toast }) => (
  <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>
    <span className="toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
    {toast.msg}
  </div>
);

// ============================================================
// MODAL
// ============================================================
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

// ============================================================
// DATA SYNC HOOK - Ensures component always has latest Firestore data
// ============================================================
const useFirestoreData = (dataKey, filterField, filterValue) => {
  const [data, setDataState] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (!filterValue) {
        if (mounted) {
          setDataState([]);
          setLoading(false);
        }
        return;
      }

      try {
        const result = await FB.getFilteredFromFirestore(dataKey, filterField, '==', filterValue);
        const safeResult = Array.isArray(result) ? result : [];
        if (mounted) {
          setDataState(safeResult);
          setData(dataKey, safeResult);
          setLoading(false);
        }
      } catch (error) {
        console.error(`Error loading ${dataKey}:`, error);
        if (mounted) {
          setDataState([]);
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [dataKey, filterField, filterValue]);

  const refreshData = useCallback(async () => {
    if (!filterValue) return;
    try {
      const result = await FB.getFilteredFromFirestore(dataKey, filterField, '==', filterValue);
      const safeResult = Array.isArray(result) ? result : [];
      setDataState(safeResult);
      setData(dataKey, safeResult);
    } catch (error) {
      console.error(`Error refreshing ${dataKey}:`, error);
      setDataState([]);
    }
  }, [dataKey, filterField, filterValue]);

  return { data, loading, refreshData };
};

// ============================================================
// LOGIN SCREEN
// ============================================================
const LoginScreen = ({ onLogin }) => {
  const [role, setRole] = useState('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({ ownerName: '', businessName: '', phone: '' });
  const { toast, showToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError('Enter email and password'); return; }
    const res = await FB.loginUser(email, password);
    if (!res.success) { setError(res.error || 'Login failed'); return; }
    setCurrentUser(res.user);
    onLogin(res.user);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim() || !regForm.ownerName.trim() || !regForm.businessName.trim()) {
      setError('Fill all required fields'); return;
    }
    const res = await FB.registerUser(email, password, regForm);
    if (!res.success) { setError(res.error || 'Registration failed'); return; }
    setCurrentUser(res.user);
    onLogin(res.user);
  };

  return (
    <div className="login-screen">
      <Toast toast={toast} />
      <div className="login-bg">
        <div className="login-bg-blob one"></div>
        <div className="login-bg-blob two"></div>
      </div>
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">🏘️</div>
          <h1>Village EMI Manager</h1>
          <p>Manage your business with ease</p>
        </div>
        {!showRegister ? (
          <form onSubmit={handleLogin}>
            <div className="role-tabs">
              <div className={`role-tab ${role === 'owner' ? 'active' : ''}`} onClick={() => setRole('owner')}>Owner</div>
              <div className={`role-tab ${role === 'agent' ? 'active' : ''}`} onClick={() => setRole('agent')}>Agent</div>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <div className="input-group">
              <label className="input-label">Email</label>
              <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">Login</button>
            {role === 'owner' && (
              <div className="login-footer">
                <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(true); setError(''); }}>New owner? Create account</a>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            {error && <div className="error-msg">{error}</div>}
            <div className="input-group">
              <label className="input-label">Your Name</label>
              <input className="input" placeholder="e.g. Rajesh Kumar" value={regForm.ownerName} onChange={e => setRegForm(p => ({...p, ownerName: e.target.value}))} autoFocus />
            </div>
            <div className="input-group">
              <label className="input-label">Business Name</label>
              <input className="input" placeholder="e.g. Kumar Electronics" value={regForm.businessName} onChange={e => setRegForm(p => ({...p, businessName: e.target.value}))} />
            </div>
            <div className="input-group">
              <label className="input-label">Phone (Optional)</label>
              <input className="input" type="tel" placeholder="9876543210" value={regForm.phone} onChange={e => setRegForm(p => ({...p, phone: e.target.value}))} />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">Create Account</button>
            <div className="login-footer">
              <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(false); setError(''); }}>Already have an account? Login</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ============================================================
// OWNER DASHBOARD
// ============================================================
const OwnerDashboard = ({ user }) => {
  const { data: villages } = useFirestoreData('villages', 'ownerId', user.id);
  const { data: agents } = useFirestoreData('agents', 'ownerId', user.id);
  const customers = getData('customers') || [];
  const sales = getData('sales') || [];
  const payments = getData('payments') || [];

  const safeVillages = Array.isArray(villages) ? villages : [];
  const safeAgents = Array.isArray(agents) ? agents : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeSales = Array.isArray(sales) ? sales : [];
  const safePayments = Array.isArray(payments) ? payments : [];

  const totalCustomers = safeCustomers.filter(c => safeSales.some(s => s.customerId === c.id && s.ownerId === user.id)).length;
  const activeSales = safeSales.filter(s => s.ownerId === user.id && !s.completed);
  const totalOutstanding = activeSales.reduce((sum, s) => sum + (s.totalAmount - s.paidAmount), 0);
  const todayPayments = safePayments.filter(p => p.ownerId === user.id && isToday(p.paymentDate));
  const todayCollection = todayPayments.reduce((sum, p) => sum + p.amountCollected, 0);

  const recentPayments = safePayments
    .filter(p => p.ownerId === user.id)
    .sort((a,b) => b.paymentDate - a.paymentDate)
    .slice(0, 10);

  return (
    <div>
      <div className="page-header">
        <div><h2>Dashboard</h2><p>Welcome back, {user.ownerName}</p></div>
      </div>
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{totalCustomers}</div>
          <div className="stat-sub">{activeSales.length} active sales</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value">{fmt(totalOutstanding)}</div>
          <div className="stat-sub">{activeSales.length} EMIs running</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Today Collection</div>
          <div className="stat-value">{fmt(todayCollection)}</div>
          <div className="stat-sub">{todayPayments.length} payments</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Villages</div>
          <div className="stat-value">{safeVillages.length}</div>
          <div className="stat-sub">{safeAgents.length} agents</div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Collections</div>
        </div>
        {recentPayments.length === 0 ? (
          <p className="table-empty">No collections yet</p>
        ) : (
          recentPayments.map(p => {
            const c = safeCustomers.find(ci => ci.id === p.customerId);
            const v = safeVillages.find(vi => vi.id === p.villageId);
            const a = safeAgents.find(ai => ai.id === p.agentId);
            return (
              <div key={p.id} className="recent-item">
                <div className="ri-left">
                  <div className="ri-dot"></div>
                  <div className="ri-info">
                    <div className="ri-name">{v?.villageName || 'Unknown'}-{c?.customerNumber || '?'} {c?.customerName || 'Unknown'}</div>
                    <div className="ri-time">{fmtDate(p.paymentDate)} • {a?.agentName || 'Direct'}</div>
                  </div>
                </div>
                <div className="ri-amount">{fmt(p.amountCollected)}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ============================================================
// VILLAGE MANAGEMENT
// ============================================================
const VillageManagement = ({ user }) => {
  const { data: firestoreVillages, refreshData } = useFirestoreData('villages', 'ownerId', user.id);
  const [villages, setVillages] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editVillage, setEditVillage] = useState(null);
  const [form, setForm] = useState({ villageName: '', startingId: 801 });
  const { toast, showToast } = useToast();

  // Sync with Firestore data - ensure it's always an array
  useEffect(() => {
    const safeData = Array.isArray(firestoreVillages) ? firestoreVillages : [];
    setVillages(safeData);
  }, [firestoreVillages]);

  const save = async () => {
    if (!form.villageName.trim()) { showToast('Enter village name', 'error'); return; }
    
    if (editVillage) {
      const updateData = { villageName: form.villageName };
      const res = await FB.updateInFirestore('villages', editVillage.id, updateData);
      if (!res.success) { showToast(res.error || 'Update failed', 'error'); return; }
      showToast('Village updated');
    } else {
      const safeVillages = Array.isArray(villages) ? villages : [];
      if (safeVillages.find(v => v.villageName.toLowerCase() === form.villageName.toLowerCase())) {
        showToast('Village name already exists', 'error');
        return;
      }
      const nv = {
        ownerId: user.id,
        villageName: form.villageName,
        nextCustomerId: Number(form.startingId) || 801
      };
      const res = await FB.addToFirestore('villages', nv);
      if (!res.success) { showToast(res.error || 'Add failed', 'error'); return; }
      showToast('Village added');
    }
    
    await refreshData();
    setModalOpen(false);
    setEditVillage(null);
    setForm({ villageName: '', startingId: 801 });
  };

  const del = async (id) => {
    if (!id) { showToast('Invalid village ID', 'error'); return; }
    const res = await FB.deleteFromFirestore('villages', id);
    if (!res.success) { showToast(res.error || 'Delete failed', 'error'); return; }
    showToast('Village deleted');
    await refreshData();
  };

  const customers = getData('customers') || [];
  const safeVillages = Array.isArray(villages) ? villages : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];

  return (
    <div>
      <Toast toast={toast} />
      <div className="page-header">
        <div><h2>Villages</h2><p>Manage your villages</p></div>
        <button className="btn btn-primary" onClick={() => { setEditVillage(null); setForm({ villageName: '', startingId: 801 }); setModalOpen(true); }}>+ Add Village</button>
      </div>
      <div className="card">
        {safeVillages.length === 0 ? <p className="table-empty">No villages yet. Add your first village.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Village Name</th><th>Customers</th><th>Next Cust ID</th><th>Actions</th></tr></thead>
              <tbody>
                {safeVillages.map((v, i) => {
                  const custCount = safeCustomers.filter(c => c.villageId === v.id).length;
                  return (
                    <tr key={v.id}>
                      <td style={{ color: '#64748b' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{v.villageName}</td>
                      <td>{custCount}</td>
                      <td style={{ color: '#a78bfa', fontWeight: 600 }}>{v.nextCustomerId}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => { setEditVillage(v); setForm({ villageName: v.villageName, startingId: v.nextCustomerId }); setModalOpen(true); }}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => del(v.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editVillage ? 'Edit Village' : 'Add New Village'}>
        <div className="input-group">
          <label className="input-label">Village Name</label>
          <input className="input" placeholder="e.g. Rampur" value={form.villageName} onChange={e => setForm(p => ({...p, villageName: e.target.value}))} autoFocus />
        </div>
        {!editVillage && (
          <div className="input-group">
            <label className="input-label">Starting Customer ID</label>
            <input className="input" type="number" placeholder="801" value={form.startingId} onChange={e => setForm(p => ({...p, startingId: e.target.value}))} />
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>Save</button>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================
// AGENT MANAGEMENT
// ============================================================
const AgentManagement = ({ user }) => {
  const { data: firestoreAgents, refreshData: refreshAgents } = useFirestoreData('agents', 'ownerId', user.id);
  const { data: villages } = useFirestoreData('villages', 'ownerId', user.id);
  const [agents, setAgents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
  const [form, setForm] = useState({ agentName: '', email: '', password: '', phone: '', assignedVillages: [] });
  const { toast, showToast } = useToast();

  // Sync with Firestore data - ensure it's always an array
  useEffect(() => {
    const safeData = Array.isArray(firestoreAgents) ? firestoreAgents : [];
    setAgents(safeData);
  }, [firestoreAgents]);

  const toggleVillage = (vid) => {
    setForm(p => ({
      ...p,
      assignedVillages: p.assignedVillages.includes(vid) ? p.assignedVillages.filter(v => v !== vid) : [...p.assignedVillages, vid]
    }));
  };

  const save = async () => {
    if (!form.agentName.trim() || !form.email.trim()) { showToast('Fill required fields', 'error'); return; }
    
    if (editAgent) {
      const updateData = {
        agentName: form.agentName,
        phone: form.phone,
        assignedVillages: form.assignedVillages
      };
      const res = await FB.updateInFirestore('agents', editAgent.id, updateData);
      if (!res.success) { showToast(res.error || 'Update failed', 'error'); return; }
      showToast('Agent updated');
    } else {
      if (!form.password) { showToast('Set a password', 'error'); return; }
      const safeAgents = Array.isArray(agents) ? agents : [];
      if (safeAgents.find(a => a.email === form.email)) { showToast('Email already exists', 'error'); return; }
      const res = await FB.registerAgentWithAuth(user.id, form.agentName, form.email, form.password, form.phone, form.assignedVillages);
      if (!res.success) { showToast(res.error || 'Agent creation failed', 'error'); return; }
      showToast('Agent added');
    }
    
    await refreshAgents();
    setModalOpen(false);
    setEditAgent(null);
    setForm({ agentName: '', email: '', password: '', phone: '', assignedVillages: [] });
  };

  const del = async (id) => {
    if (!id) { showToast('Invalid agent ID', 'error'); return; }
    const res = await FB.deleteFromFirestore('agents', id);
    if (!res.success) { showToast(res.error || 'Delete failed', 'error'); return; }
    showToast('Agent deleted');
    await refreshAgents();
  };

  const safeAgents = Array.isArray(agents) ? agents : [];
  const safeVillages = Array.isArray(villages) ? villages : [];

  return (
    <div>
      <Toast toast={toast} />
      <div className="page-header">
        <div><h2>Agents</h2><p>Manage your collection agents</p></div>
        <button className="btn btn-primary" onClick={() => { setEditAgent(null); setForm({ agentName: '', email: '', password: '', phone: '', assignedVillages: [] }); setModalOpen(true); }}>+ Add Agent</button>
      </div>
      <div className="card">
        {safeAgents.length === 0 ? <p className="table-empty">No agents yet.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Agent Name</th><th>Email</th><th>Phone</th><th>Villages</th><th>Actions</th></tr></thead>
              <tbody>
                {safeAgents.map(a => {
                  const agentVillages = Array.isArray(a.assignedVillages) ? a.assignedVillages : [];
                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{a.agentName}</td>
                      <td style={{ color: '#64748b' }}>{a.email}</td>
                      <td style={{ color: '#64748b' }}>{a.phone || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {agentVillages.map(vid => {
                            const v = safeVillages.find(v => v.id === vid);
                            return v ? <span key={vid} className="badge badge-active">{v.villageName}</span> : null;
                          })}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => { setEditAgent(a); setForm({ agentName: a.agentName, email: a.email, password: '', phone: a.phone || '', assignedVillages: agentVillages }); setModalOpen(true); }}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => del(a.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editAgent ? 'Edit Agent' : 'Add New Agent'}>
        <div className="input-group">
          <label className="input-label">Agent Name</label>
          <input className="input" placeholder="e.g. Rajesh Mehta" value={form.agentName} onChange={e => setForm(p => ({...p, agentName: e.target.value}))} autoFocus />
        </div>
        <div className="input-row">
          <div className="input-group">
            <label className="input-label">Email (Login)</label>
            <input className="input" type="email" placeholder="agent@email.com" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} disabled={!!editAgent} />
          </div>
          <div className="input-group">
            <label className="input-label">Phone (Optional)</label>
            <input className="input" type="tel" placeholder="9876543210" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
          </div>
        </div>
        {!editAgent && (
          <div className="input-group">
            <label className="input-label">Password</label>
            <input className="input" type="password" placeholder="Set login password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} />
          </div>
        )}
        <div className="input-group">
          <label className="input-label">Assign Villages</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            {safeVillages.map(v => (
              <div key={v.id} className={`village-chip ${form.assignedVillages.includes(v.id) ? 'selected' : ''}`} onClick={() => toggleVillage(v.id)}>{v.villageName}</div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>Save</button>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================
// PRODUCT MANAGEMENT
// ============================================================
const ProductManagement = ({ user }) => {
  const { data: firestoreProducts, refreshData } = useFirestoreData('products', 'ownerId', user.id);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ productName: '', price: '' });
  const { toast, showToast } = useToast();

  // Sync with Firestore data - ensure it's always an array
  useEffect(() => {
    const safeData = Array.isArray(firestoreProducts) ? firestoreProducts : [];
    setProducts(safeData);
  }, [firestoreProducts]);

  const save = async () => {
    if (!form.productName.trim() || !form.price) { showToast('Fill all fields', 'error'); return; }
    
    if (editProduct) {
      const updateData = {
        productName: form.productName,
        price: Number(form.price)
      };
      const res = await FB.updateInFirestore('products', editProduct.id, updateData);
      if (!res.success) { showToast(res.error || 'Update failed', 'error'); return; }
      showToast('Product updated');
    } else {
      const np = {
        ownerId: user.id,
        productName: form.productName,
        price: Number(form.price)
      };
      const res = await FB.addToFirestore('products', np);
      if (!res.success) { showToast(res.error || 'Add failed', 'error'); return; }
      showToast('Product added');
    }
    
    await refreshData();
    setModalOpen(false);
    setEditProduct(null);
    setForm({ productName: '', price: '' });
  };

  const del = async (id) => {
    if (!id) { showToast('Invalid product ID', 'error'); return; }
    const res = await FB.deleteFromFirestore('products', id);
    if (!res.success) { showToast(res.error || 'Delete failed', 'error'); return; }
    showToast('Product deleted');
    await refreshData();
  };

  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div>
      <Toast toast={toast} />
      <div className="page-header">
        <div><h2>Products</h2><p>Manage your product catalog</p></div>
        <button className="btn btn-primary" onClick={() => { setEditProduct(null); setForm({ productName: '', price: '' }); setModalOpen(true); }}>+ Add Product</button>
      </div>
      <div className="card">
        {safeProducts.length === 0 ? <p className="table-empty">No products yet.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Product Name</th><th>Price</th><th>Actions</th></tr></thead>
              <tbody>
                {safeProducts.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: '#64748b' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{p.productName}</td>
                    <td style={{ color: '#4ade80', fontWeight: 700 }}>{fmt(p.price)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditProduct(p); setForm({ productName: p.productName, price: p.price }); setModalOpen(true); }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editProduct ? 'Edit Product' : 'Add New Product'}>
        <div className="input-group">
          <label className="input-label">Product Name</label>
          <input className="input" placeholder="e.g. Mixer Grinder" value={form.productName} onChange={e => setForm(p => ({...p, productName: e.target.value}))} autoFocus />
        </div>
        <div className="input-group">
          <label className="input-label">Price (₹)</label>
          <input className="input" type="number" placeholder="3500" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>Save</button>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================
// PLACEHOLDER COMPONENTS (keeping structure intact)
// ============================================================
const SalesEntry = ({ user }) => <div><h2>New Sale Entry</h2><p>Feature placeholder</p></div>;
const CustomerList = ({ user }) => <div><h2>Customer List</h2><p>Feature placeholder</p></div>;
const Reports = ({ user }) => <div><h2>Reports</h2><p>Feature placeholder</p></div>;
const AgentFastCollect = ({ user }) => <div><h2>Fast Collect</h2><p>Feature placeholder</p></div>;
const AgentCustomerView = ({ user }) => <div><h2>Agent Customer View</h2><p>Feature placeholder</p></div>;
const AgentHistory = ({ user }) => <div><h2>Collection History</h2><p>Feature placeholder</p></div>;

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [page, setPage] = useState('dashboard');
  
  // Initialize data on mount
  useEffect(() => {
    seedData();
  }, []);

  // Load Firestore data when user logs in
  useEffect(() => {
    if (!user || !user.id) {
      clearCache();
      return;
    }

    const loadData = async () => {
      try {
        const [vs, ps, as] = await Promise.all([
          FB.getFilteredFromFirestore('villages', 'ownerId', '==', user.id),
          FB.getFilteredFromFirestore('products', 'ownerId', '==', user.id),
          FB.getFilteredFromFirestore('agents', 'ownerId', '==', user.id)
        ]);
        
        // Ensure all results are arrays before setting
        const safeVillages = Array.isArray(vs) ? vs : [];
        const safeProducts = Array.isArray(ps) ? ps : [];
        const safeAgents = Array.isArray(as) ? as : [];
        
        setData('villages', safeVillages);
        setData('products', safeProducts);
        setData('agents', safeAgents);
      } catch (error) {
        console.error('Error loading data:', error);
        // Set empty arrays on error
        setData('villages', []);
        setData('products', []);
        setData('agents', []);
      }
    };

    loadData();
  }, [user?.id]);

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    clearCache();
    setPage('dashboard');
  };

  if (!user) return (<><GlobalStyles /><LoginScreen onLogin={setUser} /></>);

  const isOwner = user.role === 'owner';

  const ownerNav = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'sales', icon: '💰', label: 'New Sale' },
    { id: 'customers', icon: '👥', label: 'Customers' },
    { id: 'reports', icon: '📈', label: 'Reports' },
    { id: 'villages', icon: '🏘️', label: 'Villages' },
    { id: 'agents', icon: '🚶', label: 'Agents' },
    { id: 'products', icon: '📦', label: 'Products' },
  ];

  const agentNav = [
    { id: 'dashboard', icon: '💳', label: 'Collect' },
    { id: 'customers', icon: '👥', label: 'Customers' },
    { id: 'history', icon: '📋', label: 'History' },
  ];

  const nav = isOwner ? ownerNav : agentNav;
  const safeNav = Array.isArray(nav) ? nav : [];

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
        <div className="sidebar">
          <div className="sidebar-logo">
            <h1>🏘️ Village EMI</h1>
            <p>Manager</p>
          </div>
          <div className="sidebar-nav">
            {safeNav.map(item => (
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

        <div className="main-content">
          {renderPage()}
        </div>
      </div>

      <div className="mobile-nav">
        <div className="mobile-nav-items">
          {safeNav.map(item => (
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
