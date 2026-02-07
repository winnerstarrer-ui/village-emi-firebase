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
    .village-chip { padding: 8px 16px; border-radius: 20px; border: 1px solid #2a2d3a; background: #141620; color: #94a3b8; font-size: 13px; font-weight: 600; transition: all 0.15s; }
    .village-chip:hover, .village-chip.selected { border-color: #6366f1; background: rgba(99,102,241,0.1); color: #a78bfa; }

    .customer-card { background: #141620; border: 1px solid #2a2d3a; border-radius: 12px; padding: 14px 16px; margin-top: 8px; transition: border-color 0.15s; }
    .customer-card:hover { border-color: #6366f1; }
    .customer-card .cust-top { display: flex; justify-content: space-between; align-items: center; }
    .customer-card .cust-id { font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 700; color: #fff; }
    .customer-card .cust-name { font-size: 13px; color: #94a3b8; margin-top: 2px; }
    .customer-card .cust-details { display: flex; gap: 16px; margin-top: 8px; flex-wrap: wrap; }
    .customer-card .cust-detail { font-size: 11px; color: #64748b; }
    .customer-card .cust-detail span { color: #cbd5e1; font-weight: 600; }

    .selected-customer { background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05)); border: 1px solid rgba(99,102,241,0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px; }
    .selected-customer .sc-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .selected-customer .sc-clear { background: none; color: #64748b; font-size: 18px; padding: 0; }
    .selected-customer .sc-clear:hover { color: #f87171; }

    .collect-btn { background: linear-gradient(135deg, #16a34a, #22c55e); color: #fff; width: 100%; padding: 16px; border-radius: 12px; font-size: 16px; font-weight: 700; margin-top: 20px; transition: all 0.15s; box-shadow: 0 4px 14px rgba(34,197,94,0.3); }
    .collect-btn:hover { box-shadow: 0 6px 20px rgba(34,197,94,0.5); transform: translateY(-1px); }
    .collect-btn:disabled { background: #2a2d3a; color: #64748b; box-shadow: none; transform: none; }

    .recent-list { margin-top: 28px; }
    .recent-list h4 { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; font-weight: 600; }
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
// MOCK DATA & LOCAL STORAGE LAYER
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

// In-memory store (persists across re-renders, resets on page refresh)
const _memStore = {};
const getLS = (key) => {
  const v = _memStore[key];
  return v !== undefined ? JSON.parse(JSON.stringify(v)) : null;
};
const setLS = (key, val) => {
  _memStore[key] = JSON.parse(JSON.stringify(val));
  if (key !== STORAGE_KEYS.CURRENT_USER && key !== STORAGE_KEYS.VILLAGES && key !== STORAGE_KEYS.AGENTS && key !== STORAGE_KEYS.PRODUCTS) {
    const owner = _memStore[STORAGE_KEYS.CURRENT_USER] || null;
    const ownerId = owner && owner.id ? owner.id : null;
    const payload = { key, ownerId, data: JSON.parse(JSON.stringify(val)), updatedAt: Date.now() };
    FB.getFilteredFromFirestore('app_state', 'key', '==', key)
      .then((docs) => {
        const existing = ownerId ? docs.find(d => d.ownerId === ownerId) : docs[0];
        if (existing && existing.id) {
          return FB.updateInFirestore('app_state', existing.id, payload);
        }
        return FB.addToFirestore('app_state', payload);
      })
      .catch(() => {});
  }
};

// Seed demo data
const seedData = () => {
  const u = getLS(STORAGE_KEYS.CURRENT_USER);
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
// LOGIN SCREEN
// ============================================================
const LoginScreen = ({ onLogin }) => {
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
        setLS(STORAGE_KEYS.VILLAGES, vs);
        setLS(STORAGE_KEYS.PRODUCTS, ps);
        setLS(STORAGE_KEYS.AGENTS, as);
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
      setLS(STORAGE_KEYS.VILLAGES, vs);
      setLS(STORAGE_KEYS.PRODUCTS, ps);
      setLS(STORAGE_KEYS.AGENTS, as);
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

// ============================================================
// OWNER DASHBOARD
// ============================================================
const OwnerDashboard = ({ user }) => {
  const villages = (getLS(STORAGE_KEYS.VILLAGES) || []).filter(v => v.ownerId === user.id);
  const agents = (getLS(STORAGE_KEYS.AGENTS) || []).filter(a => a.ownerId === user.id);
  const sales = (getLS(STORAGE_KEYS.SALES) || []).filter(s => s.ownerId === user.id);
  const payments = (getLS(STORAGE_KEYS.PAYMENTS) || []).filter(p => p.ownerId === user.id);
  const customers = (getLS(STORAGE_KEYS.CUSTOMERS) || []).filter(c => c.ownerId === user.id);

  const todayPayments = payments.filter(p => isToday(p.paymentDate));
  const todayTotal = todayPayments.reduce((s, p) => s + p.amountCollected, 0);
  const totalOutstanding = sales.filter(s => s.status === 'active').reduce((s, sale) => s + sale.outstandingAmount, 0);
  const activeSales = sales.filter(s => s.status === 'active').length;

  // Village-wise today
  const villageToday = villages.map(v => {
    const vp = todayPayments.filter(p => p.villageId === v.id);
    return { ...v, todayAmount: vp.reduce((s, p) => s + p.amountCollected, 0), todayCount: vp.length };
  });

  // Agent-wise today
  const agentToday = agents.map(a => {
    const ap = todayPayments.filter(p => p.agentId === a.id);
    return { ...a, todayAmount: ap.reduce((s, p) => s + p.amountCollected, 0), todayCount: ap.length };
  });

  // Recent payments (last 5)
  const recentPayments = [...payments].sort((a, b) => b.paymentDate - a.paymentDate).slice(0, 6);

  return (
    <div>
      <div className="page-header">
        <div><h2>Dashboard</h2><p>Welcome back, {user.ownerName}</p></div>
      </div>
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-label">Today's Collection</div>
          <div className="stat-value">{fmt(todayTotal)}</div>
          <div className="stat-sub">{todayPayments.length} payments today</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Total Outstanding</div>
          <div className="stat-value">{fmt(totalOutstanding)}</div>
          <div className="stat-sub">{activeSales} active sales</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{customers.length}</div>
          <div className="stat-sub">Across {villages.length} villages</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Active Agents</div>
          <div className="stat-value">{agents.length}</div>
          <div className="stat-sub">{agents.filter(a => { const ap = todayPayments.filter(p => p.agentId === a.id); return ap.length > 0; }).length} active today</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {/* Village wise today */}
        <div className="card">
          <div className="card-header"><div className="card-title">Village-wise Today</div></div>
          {villageToday.length === 0 ? <p className="table-empty">No villages</p> : (
            <div>
              {villageToday.map(v => (
                <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(30,33,48,0.5)' }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>{v.villageName}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{v.todayCount} payments</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: v.todayAmount > 0 ? '#4ade80' : '#64748b' }}>{fmt(v.todayAmount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agent wise today */}
        <div className="card">
          <div className="card-header"><div className="card-title">Agent Performance Today</div></div>
          {agentToday.length === 0 ? <p className="table-empty">No agents</p> : (
            <div>
              {agentToday.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(30,33,48,0.5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>{a.agentName[0]}</div>
                    <div>
                      <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{a.agentName}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{a.todayCount} collections</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: a.todayAmount > 0 ? '#4ade80' : '#64748b' }}>{fmt(a.todayAmount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header"><div className="card-title">Recent Payments</div></div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th><th>Village</th><th>Customer</th><th>Agent</th><th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map(p => {
                  const village = villages.find(v => v.id === p.villageId);
                  const customer = customers.find(c => c.id === p.customerId);
                  const agent = agents.find(a => a.id === p.agentId);
                  return (
                    <tr key={p.id}>
                      <td>{fmtTime(p.paymentDate)} <span style={{ fontSize: 11, color: '#64748b' }}>{fmtDate(p.paymentDate)}</span></td>
                      <td>{village?.villageName || '-'}</td>
                      <td>{customer ? `${customer.customerNumber} - ${customer.customerName}` : '-'}</td>
                      <td>{agent?.agentName || '-'}</td>
                      <td style={{ color: '#4ade80', fontWeight: 700 }}>{fmt(p.amountCollected)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// VILLAGE MANAGEMENT
// ============================================================
const VillageManagement = ({ user }) => {
  const [villages, setVillages] = useState((getLS(STORAGE_KEYS.VILLAGES) || []).filter(v => v.ownerId === user.id));
  const [modalOpen, setModalOpen] = useState(false);
  const [editVillage, setEditVillage] = useState(null);
  const [form, setForm] = useState({ villageName: '', startingId: 801 });
  const { toast, showToast } = useToast();

  const save = () => {
    if (!form.villageName.trim()) { showToast('Enter village name', 'error'); return; }
    let all = getLS(STORAGE_KEYS.VILLAGES) || [];
    if (editVillage) {
      all = all.map(v => v.id === editVillage.id ? { ...v, villageName: form.villageName } : v);
      showToast('Village updated');
    } else {
      if (villages.find(v => v.villageName.toLowerCase() === form.villageName.toLowerCase())) { showToast('Village name already exists', 'error'); return; }
      const nv = { id: uid(), ownerId: user.id, villageName: form.villageName, nextCustomerId: Number(form.startingId) || 801 };
      all.push(nv);
      FB.addToFirestore('villages', nv);
      showToast('Village added');
    }
    setLS(STORAGE_KEYS.VILLAGES, all);
    setVillages(all.filter(v => v.ownerId === user.id));
    setModalOpen(false);
    setEditVillage(null);
    setForm({ villageName: '', startingId: 801 });
  };

  const del = (id) => {
    const all = (getLS(STORAGE_KEYS.VILLAGES) || []).filter(v => v.id !== id);
    setLS(STORAGE_KEYS.VILLAGES, all);
    setVillages(all.filter(v => v.ownerId === user.id));
    showToast('Village deleted');
  };

  return (
    <div>
      <Toast toast={toast} />
      <div className="page-header">
        <div><h2>Villages</h2><p>Manage your villages</p></div>
        <button className="btn btn-primary" onClick={() => { setEditVillage(null); setForm({ villageName: '', startingId: 801 }); setModalOpen(true); }}>+ Add Village</button>
      </div>
      <div className="card">
        {villages.length === 0 ? <p className="table-empty">No villages yet. Add your first village.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Village Name</th><th>Customers</th><th>Next Cust ID</th><th>Actions</th></tr></thead>
              <tbody>
                {villages.map((v, i) => {
                  const custCount = ((getLS(STORAGE_KEYS.CUSTOMERS) || []).filter(c => c.villageId === v.id)).length;
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
  const [agents, setAgents] = useState((getLS(STORAGE_KEYS.AGENTS) || []).filter(a => a.ownerId === user.id));
  const villages = (getLS(STORAGE_KEYS.VILLAGES) || []).filter(v => v.ownerId === user.id);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
  const [form, setForm] = useState({ agentName: '', email: '', password: '', phone: '', assignedVillages: [] });
  const { toast, showToast } = useToast();

  const toggleVillage = (vid) => {
    setForm(p => ({
      ...p,
      assignedVillages: p.assignedVillages.includes(vid) ? p.assignedVillages.filter(v => v !== vid) : [...p.assignedVillages, vid]
    }));
  };

  const save = async () => {
    if (!form.agentName.trim() || !form.email.trim()) { showToast('Fill required fields', 'error'); return; }
    let all = getLS(STORAGE_KEYS.AGENTS) || [];
    if (editAgent) {
      all = all.map(a => a.id === editAgent.id ? { ...a, agentName: form.agentName, phone: form.phone, assignedVillages: form.assignedVillages } : a);
      showToast('Agent updated');
    } else {
      if (!form.password) { showToast('Set a password', 'error'); return; }
      if (all.find(a => a.email === form.email)) { showToast('Email already exists', 'error'); return; }
      const res = await FB.registerAgentWithAuth(user.id, form.agentName, form.email, form.password, form.phone, form.assignedVillages);
      if (!res.success) { showToast(res.error || 'Agent creation failed', 'error'); return; }
      const na = res.agent; all.push(na); FB.addToFirestore('agents', na);
      showToast('Agent added');
    }
    setLS(STORAGE_KEYS.AGENTS, all);
    setAgents(all.filter(a => a.ownerId === user.id));
    setModalOpen(false);
    setEditAgent(null);
    setForm({ agentName: '', email: '', password: '', phone: '', assignedVillages: [] });
  };

  const del = (id) => {
    const all = (getLS(STORAGE_KEYS.AGENTS) || []).filter(a => a.id !== id);
    setLS(STORAGE_KEYS.AGENTS, all);
    setAgents(all.filter(a => a.ownerId === user.id));
    showToast('Agent deleted');
  };

  return (
    <div>
      <Toast toast={toast} />
      <div className="page-header">
        <div><h2>Agents</h2><p>Manage your collection agents</p></div>
        <button className="btn btn-primary" onClick={() => { setEditAgent(null); setForm({ agentName: '', email: '', password: '', phone: '', assignedVillages: [] }); setModalOpen(true); }}>+ Add Agent</button>
      </div>
      <div className="card">
        {agents.length === 0 ? <p className="table-empty">No agents yet.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Agent Name</th><th>Email</th><th>Phone</th><th>Villages</th><th>Actions</th></tr></thead>
              <tbody>
                {agents.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{a.agentName}</td>
                    <td style={{ color: '#64748b' }}>{a.email}</td>
                    <td style={{ color: '#64748b' }}>{a.phone || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {a.assignedVillages.map(vid => {
                          const v = villages.find(v => v.id === vid);
                          return v ? <span key={vid} className="badge badge-active">{v.villageName}</span> : null;
                        })}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditAgent(a); setForm({ agentName: a.agentName, email: a.email, password: '', phone: a.phone || '', assignedVillages: a.assignedVillages }); setModalOpen(true); }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(a.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            {villages.map(v => (
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
  const [products, setProducts] = useState((getLS(STORAGE_KEYS.PRODUCTS) || []).filter(p => p.ownerId === user.id));
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ productName: '', price: '' });
  const { toast, showToast } = useToast();

  const save = () => {
    if (!form.productName.trim() || !form.price) { showToast('Fill all fields', 'error'); return; }
    let all = getLS(STORAGE_KEYS.PRODUCTS) || [];
    if (editProduct) {
      all = all.map(p => p.id === editProduct.id ? { ...p, productName: form.productName, price: Number(form.price) } : p);
      showToast('Product updated');
    } else {
      const np = { id: uid(), ownerId: user.id, productName: form.productName, price: Number(form.price) };
      all.push(np);
      FB.addToFirestore('products', np);
      showToast('Product added');
    }
    setLS(STORAGE_KEYS.PRODUCTS, all);
    setProducts(all.filter(p => p.ownerId === user.id));
    setModalOpen(false);
    setEditProduct(null);
    setForm({ productName: '', price: '' });
  };

  const del = (id) => {
    const all = (getLS(STORAGE_KEYS.PRODUCTS) || []).filter(p => p.id !== id);
    setLS(STORAGE_KEYS.PRODUCTS, all);
    setProducts(all.filter(p => p.ownerId === user.id));
    showToast('Product deleted');
  };

  return (
    <div>
      <Toast toast={toast} />
      <div className="page-header">
        <div><h2>Products</h2><p>Manage your product catalog</p></div>
        <button className="btn btn-primary" onClick={() => { setEditProduct(null); setForm({ productName: '', price: '' }); setModalOpen(true); }}>+ Add Product</button>
      </div>
      <div className="card">
        {products.length === 0 ? <p className="table-empty">No products yet.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Product Name</th><th>Price</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map((p, i) => (
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
// NEW SALE ENTRY
// ============================================================
const SalesEntry = ({ user }) => {
  const villages = (getLS(STORAGE_KEYS.VILLAGES) || []).filter(v => v.ownerId === user.id);
  const products = (getLS(STORAGE_KEYS.PRODUCTS) || []).filter(p => p.ownerId === user.id);
  const [selectedVillage, setSelectedVillage] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [existingCustomerId, setExistingCustomerId] = useState('');
  const [custForm, setCustForm] = useState({ customerName: '', phone: '', address: '' });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [saleForm, setSaleForm] = useState({ advanceAmount: '0', emiAmount: '', emiFrequency: 'weekly', saleDate: new Date().toISOString().split('T')[0] });
  const { toast, showToast } = useToast();

  const village = villages.find(v => v.id === selectedVillage);
  const product = products.find(p => p.id === selectedProduct);
  const customers = selectedVillage ? (getLS(STORAGE_KEYS.CUSTOMERS) || []).filter(c => c.villageId === selectedVillage) : [];

  const productPrice = product ? product.price : 0;
  const advance = Number(saleForm.advanceAmount) || 0;
  const outstanding = productPrice - advance;

  const handleSave = () => {
    if (!selectedVillage) { showToast('Select a village', 'error'); return; }
    if (!selectedProduct) { showToast('Select a product', 'error'); return; }
    if (!saleForm.emiAmount) { showToast('Enter EMI amount', 'error'); return; }

    let customerId = existingCustomerId;

    if (isNewCustomer) {
      if (!custForm.customerName.trim()) { showToast('Enter customer name', 'error'); return; }
      const allCustomers = getLS(STORAGE_KEYS.CUSTOMERS) || [];
      const currentVillage = (getLS(STORAGE_KEYS.VILLAGES) || []).find(v => v.id === selectedVillage);
      const custNum = currentVillage.nextCustomerId;
      customerId = `c_${selectedVillage}_${custNum}`;
      allCustomers.push({ id: customerId, ownerId: user.id, villageId: selectedVillage, customerNumber: custNum, customerName: custForm.customerName, phone: custForm.phone || '', address: custForm.address || '' });
      setLS(STORAGE_KEYS.CUSTOMERS, allCustomers);
      // Increment village customer counter
      const allVillages = getLS(STORAGE_KEYS.VILLAGES) || [];
      setLS(STORAGE_KEYS.VILLAGES, allVillages.map(v => v.id === selectedVillage ? { ...v, nextCustomerId: v.nextCustomerId + 1 } : v));
    }

    const sale = {
      id: uid(), ownerId: user.id, villageId: selectedVillage, customerId,
      productName: product.productName, productPrice, advanceAmount: advance,
      outstandingAmount: outstanding, emiAmount: Number(saleForm.emiAmount),
      emiFrequency: saleForm.emiFrequency, status: outstanding <= 0 ? 'completed' : 'active',
      saleDate: new Date(saleForm.saleDate).getTime()
    };
    const allSales = getLS(STORAGE_KEYS.SALES) || [];
    allSales.push(sale);
    setLS(STORAGE_KEYS.SALES, allSales);

    // If advance paid, record it as a payment
    if (advance > 0) {
      const advPayment = { id: uid(), ownerId: user.id, villageId: selectedVillage, customerId, saleId: sale.id, agentId: 'owner', amountCollected: advance, paymentDate: Date.now(), notes: 'Advance' };
      const allPayments = getLS(STORAGE_KEYS.PAYMENTS) || [];
      allPayments.push(advPayment);
      setLS(STORAGE_KEYS.PAYMENTS, allPayments);
    }

    showToast('Sale recorded successfully!');
    // Reset
    setSelectedVillage('');
    setSelectedProduct('');
    setIsNewCustomer(true);
    setExistingCustomerId('');
    setCustForm({ customerName: '', phone: '', address: '' });
    setSaleForm({ advanceAmount: '0', emiAmount: '', emiFrequency: 'weekly', saleDate: new Date().toISOString().split('T')[0] });
  };

  return (
    <div>
      <Toast toast={toast} />
      <div className="page-header"><div><h2>New Sale</h2><p>Record a new EMI sale</p></div></div>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Village */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Select Village</label>
            <select className="input" value={selectedVillage} onChange={e => { setSelectedVillage(e.target.value); setExistingCustomerId(''); }}>
              <option value="">Choose village...</option>
              {villages.map(v => <option key={v.id} value={v.id}>{v.villageName}</option>)}
            </select>
          </div>
        </div>

        {/* Customer */}
        {selectedVillage && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <div className={`role-tab ${isNewCustomer ? 'active' : ''}`} style={{ flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer', background: isNewCustomer ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#141620', color: isNewCustomer ? '#fff' : '#94a3b8', border: '1px solid ' + (isNewCustomer ? 'transparent' : '#2a2d3a'), fontSize: 13, fontWeight: 600, textAlign: 'center' }} onClick={() => setIsNewCustomer(true)}>New Customer</div>
              <div className={`role-tab ${!isNewCustomer ? 'active' : ''}`} style={{ flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer', background: !isNewCustomer ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#141620', color: !isNewCustomer ? '#fff' : '#94a3b8', border: '1px solid ' + (!isNewCustomer ? 'transparent' : '#2a2d3a'), fontSize: 13, fontWeight: 600, textAlign: 'center' }} onClick={() => setIsNewCustomer(false)}>Existing Customer</div>
            </div>
            {isNewCustomer ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#141620', borderRadius: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Customer ID will be:</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#a78bfa', fontFamily: 'Sora, sans-serif' }}>{village?.villageName?.charAt(0).toUpperCase()}-{village?.nextCustomerId}</span>
                </div>
                <div className="input-group">
                  <label className="input-label">Customer Name *</label>
                  <input className="input" placeholder="e.g. Ramesh Kumar" value={custForm.customerName} onChange={e => setCustForm(p => ({...p, customerName: e.target.value}))} />
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label className="input-label">Phone (Optional)</label>
                    <input className="input" type="tel" placeholder="9876543210" value={custForm.phone} onChange={e => setCustForm(p => ({...p, phone: e.target.value}))} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Address (Optional)</label>
                    <input className="input" placeholder="Main Street" value={custForm.address} onChange={e => setCustForm(p => ({...p, address: e.target.value}))} />
                  </div>
                </div>
              </>
            ) : (
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Select Existing Customer</label>
                <select className="input" value={existingCustomerId} onChange={e => setExistingCustomerId(e.target.value)}>
                  <option value="">Choose customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.customerNumber} - {c.customerName}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Product & EMI Details */}
        {selectedVillage && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="input-group">
              <label className="input-label">Select Product</label>
              <select className="input" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                <option value="">Choose product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.productName} - {fmt(p.price)}</option>)}
              </select>
            </div>
            {selectedProduct && (
              <>
                <div className="input-group">
                  <label className="input-label">Sale Date</label>
                  <input className="input" type="date" value={saleForm.saleDate} onChange={e => setSaleForm(p => ({...p, saleDate: e.target.value}))} />
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label className="input-label">Advance Amount (₹)</label>
                    <input className="input" type="number" placeholder="0" value={saleForm.advanceAmount} onChange={e => setSaleForm(p => ({...p, advanceAmount: e.target.value}))} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">EMI Amount (₹) *</label>
                    <input className="input" type="number" placeholder="200" value={saleForm.emiAmount} onChange={e => setSaleForm(p => ({...p, emiAmount: e.target.value}))} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">EMI Frequency</label>
                  <select className="input" value={saleForm.emiFrequency} onChange={e => setSaleForm(p => ({...p, emiFrequency: e.target.value}))}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                {/* Summary Box */}
                <div style={{ background: '#141620', borderRadius: 10, padding: 16, marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e2130' }}>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>Product Price</span>
                    <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{fmt(productPrice)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e2130' }}>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>Advance</span>
                    <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>- {fmt(advance)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0' }}>
                    <span style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 700 }}>Outstanding</span>
                    <span style={{ fontSize: 16, color: '#f59e0b', fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>{fmt(outstanding)}</span>
                  </div>
                  {saleForm.emiAmount && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 0' }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Installments needed</span>
                      <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600 }}>{Math.ceil(outstanding / Number(saleForm.emiAmount))} × {fmt(saleForm.emiAmount)} ({saleForm.emiFrequency})</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Save Button */}
        {selectedVillage && selectedProduct && (
          <button className="btn btn-primary btn-lg btn-block" onClick={handleSave}>💰 Record Sale</button>
        )}
      </div>
    </div>
  );
};

// ============================================================
// CUSTOMER LIST (OWNER)
// ============================================================
const CustomerList = ({ user }) => {
  const villages = (getLS(STORAGE_KEYS.VILLAGES) || []).filter(v => v.ownerId === user.id);
  const [filterVillage, setFilterVillage] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { toast, showToast } = useToast();

  const allCustomers = (getLS(STORAGE_KEYS.CUSTOMERS) || []).filter(c => c.ownerId === user.id);
  const allSales = (getLS(STORAGE_KEYS.SALES) || []).filter(s => s.ownerId === user.id);
  const allPayments = (getLS(STORAGE_KEYS.PAYMENTS) || []).filter(p => p.ownerId === user.id);

  let filtered = allCustomers;
  if (filterVillage) filtered = filtered.filter(c => c.villageId === filterVillage);
  if (search) filtered = filtered.filter(c => c.customerNumber.toString().includes(search) || c.customerName.toLowerCase().includes(search.toLowerCase()));

  // Enrich customers with sale/payment data
  const enriched = filtered.map(c => {
    const sales = allSales.filter(s => s.customerId === c.id);
    const payments = allPayments.filter(p => p.customerId === c.id);
    const totalOutstanding = sales.filter(s => s.status === 'active').reduce((sum, s) => sum + s.outstandingAmount, 0);
    const lastPayment = payments.length ? payments.reduce((latest, p) => p.paymentDate > latest.paymentDate ? p : latest, payments[0]) : null;
    return { ...c, sales, payments, totalOutstanding, lastPayment, hasActiveSale: sales.some(s => s.status === 'active') };
  });

  // Detail view
  if (selectedCustomer) {
    const cust = allCustomers.find(c => c.id === selectedCustomer);
    if (!cust) { setSelectedCustomer(null); return null; }
    const village = villages.find(v => v.id === cust.villageId);
    const custSales = allSales.filter(s => s.customerId === cust.id);
    const custPayments = [...allPayments.filter(p => p.customerId === cust.id)].sort((a, b) => b.paymentDate - a.paymentDate);
    const agents = getLS(STORAGE_KEYS.AGENTS) || [];

    return (
      <div>
        <Toast toast={toast} />
        <button className="btn btn-outline" style={{ marginBottom: 16 }} onClick={() => setSelectedCustomer(null)}>← Back to Customers</button>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff' }}>{cust.customerName[0]}</div>
                <div>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', color: '#fff', fontSize: 18 }}>{cust.customerName}</h3>
                  <span style={{ color: '#a78bfa', fontWeight: 600, fontSize: 14 }}>{village?.villageName}-{cust.customerNumber}</span>
                </div>
              </div>
              {cust.phone && <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>📞 {cust.phone}</p>}
              {cust.address && <p style={{ color: '#64748b', fontSize: 13 }}>📍 {cust.address}</p>}
            </div>
          </div>

          {/* Sales */}
          <h4 style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, fontWeight: 600 }}>Sales</h4>
          {custSales.map(s => (
            <div key={s.id} style={{ background: '#141620', borderRadius: 10, padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>{s.productName}</span>
                <span className={`badge ${s.status === 'active' ? 'badge-active' : 'badge-completed'}`}>{s.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Price: <span style={{ color: '#cbd5e1' }}>{fmt(s.productPrice)}</span></span>
                <span style={{ fontSize: 12, color: '#64748b' }}>Advance: <span style={{ color: '#cbd5e1' }}>{fmt(s.advanceAmount)}</span></span>
                <span style={{ fontSize: 12, color: '#64748b' }}>Outstanding: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{fmt(s.outstandingAmount)}</span></span>
                <span style={{ fontSize: 12, color: '#64748b' }}>EMI: <span style={{ color: '#cbd5e1' }}>{fmt(s.emiAmount)}/{s.emiFrequency}</span></span>
              </div>
            </div>
          ))}

          {/* Payment History */}
          <h4 style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, margin: '18px 0 10px', fontWeight: 600 }}>Payment History</h4>
          {custPayments.length === 0 ? <p style={{ color: '#64748b', fontSize: 13 }}>No payments yet</p> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Time</th><th>Amount</th><th>Collected By</th><th>Notes</th></tr></thead>
                <tbody>
                  {custPayments.map(p => {
                    const agent = agents.find(a => a.id === p.agentId);
                    return (
                      <tr key={p.id}>
                        <td>{fmtDate(p.paymentDate)}</td>
                        <td>{fmtTime(p.paymentDate)}</td>
                        <td style={{ color: '#4ade80', fontWeight: 700 }}>{fmt(p.amountCollected)}</td>
                        <td>{p.agentId === 'owner' ? 'Owner' : (agent?.agentName || '-')}</td>
                        <td style={{ color: '#64748b' }}>{p.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Toast toast={toast} />
      <div className="page-header"><div><h2>Customers</h2><p>View all customers across villages</p></div></div>
      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="input" placeholder="Search by ID or name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width: 180 }} value={filterVillage} onChange={e => setFilterVillage(e.target.value)}>
          <option value="">All Villages</option>
          {villages.map(v => <option key={v.id} value={v.id}>{v.villageName}</option>)}
        </select>
      </div>
      <div className="card">
        {enriched.length === 0 ? <p className="table-empty">No customers found</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Village</th><th>Cust ID</th><th>Name</th><th>Phone</th><th>Outstanding</th><th>Last Payment</th><th>Status</th></tr></thead>
              <tbody>
                {enriched.map(c => {
                  const village = villages.find(v => v.id === c.villageId);
                  return (
                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedCustomer(c.id)}>
                      <td style={{ color: '#a78bfa', fontWeight: 600 }}>{village?.villageName}</td>
                      <td style={{ fontWeight: 700, color: '#e2e8f0' }}>{c.customerNumber}</td>
                      <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{c.customerName}</td>
                      <td style={{ color: '#64748b' }}>{c.phone || '-'}</td>
                      <td style={{ color: c.totalOutstanding > 0 ? '#f59e0b' : '#4ade80', fontWeight: 700 }}>{fmt(c.totalOutstanding)}</td>
                      <td style={{ color: '#64748b', fontSize: 12 }}>{c.lastPayment ? fmtDate(c.lastPayment.paymentDate) : '-'}</td>
                      <td><span className={`badge ${c.hasActiveSale ? 'badge-active' : (c.sales.length ? 'badge-completed' : 'badge-pending')}`}>{c.hasActiveSale ? 'Active' : (c.sales.length ? 'Completed' : 'No Sale')}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// REPORTS & EXPORT (OWNER)
// ============================================================
const Reports = ({ user }) => {
  const [tab, setTab] = useState('daily');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; });
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const { toast, showToast } = useToast();

  const villages = (getLS(STORAGE_KEYS.VILLAGES) || []).filter(v => v.ownerId === user.id);
  const agents = (getLS(STORAGE_KEYS.AGENTS) || []).filter(a => a.ownerId === user.id);
  const customers = (getLS(STORAGE_KEYS.CUSTOMERS) || []).filter(c => c.ownerId === user.id);
  const sales = (getLS(STORAGE_KEYS.SALES) || []).filter(s => s.ownerId === user.id);
  const payments = (getLS(STORAGE_KEYS.PAYMENTS) || []).filter(p => p.ownerId === user.id);

  // Filter payments by selected date for daily report
  const dailyPayments = payments.filter(p => {
    const d = new Date(p.paymentDate);
    const rd = new Date(reportDate);
    return d.getDate() === rd.getDate() && d.getMonth() === rd.getMonth() && d.getFullYear() === rd.getFullYear();
  });

  // Range-filtered payments
  const rangePayments = payments.filter(p => {
    const d = new Date(p.paymentDate);
    return d >= new Date(dateFrom) && d <= new Date(dateTo + 'T23:59:59');
  });

  // Village-wise for daily
  const dailyByVillage = villages.map(v => {
    const vp = dailyPayments.filter(p => p.villageId === v.id);
    return { ...v, amount: vp.reduce((s, p) => s + p.amountCollected, 0), count: vp.length, uniqueCustomers: [...new Set(vp.map(p => p.customerId))].length };
  }).filter(v => v.count > 0);

  // Agent-wise for daily
  const dailyByAgent = agents.map(a => {
    const ap = dailyPayments.filter(p => p.agentId === a.id);
    return { ...a, amount: ap.reduce((s, p) => s + p.amountCollected, 0), count: ap.length };
  }).filter(a => a.count > 0);

  // Outstanding by village
  const outstandingByVillage = villages.map(v => {
    const vSales = sales.filter(s => s.villageId === v.id);
    const vActive = vSales.filter(s => s.status === 'active');
    return { ...v, totalSales: vSales.reduce((s, sale) => s + sale.productPrice, 0), outstanding: vActive.reduce((s, sale) => s + sale.outstandingAmount, 0), activeSales: vActive.length, customers: [...new Set(vSales.map(s => s.customerId))].length };
  });

  // PDF generation - downloads as HTML file (open in browser to print as PDF)
  const generatePDF = (title, headers, rows, summary = []) => {
    const tableRows = rows.map(row => '<tr>' + row.map(cell => `<td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:13px;">${cell}</td>`).join('') + '</tr>').join('');
    const summaryHTML = summary.map(s => `<div style="display:flex;justify-content:space-between;padding:6px 0;"><span style="color:#666;">${s[0]}</span><span style="font-weight:700;color:#333;">${s[1]}</span></div>`).join('');
    const html = `<!DOCTYPE html><html><head><title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #333; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 22px; margin-bottom: 4px; color: #1a1a2e; }
        .subtitle { color: #666; font-size: 13px; margin-bottom: 20px; }
        .summary-box { background: #f0f4ff; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1a1a2e; color: #fff; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 13px; }
        .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
        .print-btn { background: #1a1a2e; color: #fff; border: none; padding: 10px 24px; border-radius: 6px; font-size: 15px; cursor: pointer; margin-bottom: 20px; }
        .print-btn:hover { background: #2a2a4e; }
        @media print { .print-btn { display: none; } body { padding: 0; } }
      </style></head><body>
        <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        <h1>🏘️ Village EMI Manager</h1>
        <div class="subtitle">${title} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString()}</div>
        ${summary.length ? `<div class="summary-box">${summaryHTML}</div>` : ''}
        <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${tableRows}</tbody></table>
        <div class="footer">Village EMI Manager &nbsp;|&nbsp; ${new Date().toLocaleDateString()}</div>
      </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('PDF file downloaded! Open it and click Print → Save as PDF');
  };

  // Excel export - downloads as CSV (opens directly in Excel)
  const exportExcel = (title, headers, rows) => {
    const esc = (v) => {
      const s = String(v);
      if (s.indexOf(',') > -1 || s.indexOf('"') > -1) return '"' + s.split('"').join('""') + '"';
      return s;
    };
    const allRows = [headers].concat(rows);
    const csv = allRows.map(function(row) { return row.map(esc).join(','); }).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title.split(' ').join('_') + '_' + new Date().toISOString().split('T')[0] + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Excel file downloaded!');
  };

  // Daily report data
  const dailyHeaders = ['Village', 'Customers', 'Payments', 'Total Amount'];
  const dailyRows = dailyByVillage.map(v => [v.villageName, v.uniqueCustomers, v.count, fmt(v.amount)]);

  const dailyDetailHeaders = ['Time', 'Village', 'Customer ID', 'Customer Name', 'Agent', 'Amount'];
  const dailyDetailRows = dailyPayments.map(p => {
    const v = villages.find(vi => vi.id === p.villageId);
    const c = customers.find(ci => ci.id === p.customerId);
    const a = agents.find(ai => ai.id === p.agentId);
    return [fmtTime(p.paymentDate), v?.villageName || '-', c?.customerNumber || '-', c?.customerName || '-', p.agentId === 'owner' ? 'Owner' : (a?.agentName || '-'), fmt(p.amountCollected)];
  });

  return (
    <div>
      <Toast toast={toast} />
      <div className="page-header"><div><h2>Reports</h2><p>View and export collection reports</p></div></div>
      <div className="report-tabs">
        {['daily', 'outstanding', 'agents', 'sales'].map(t => (
          <div key={t} className={`report-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t === 'daily' ? '📅 Daily' : t === 'outstanding' ? '💰 Outstanding' : t === 'agents' ? '🚶 Agents' : '📊 Sales'}</div>
        ))}
      </div>

      {/* DAILY REPORT */}
      {tab === 'daily' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <label className="input-label" style={{ margin: 0, minWidth: 40 }}>Date:</label>
              <input className="input" type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} style={{ width: 180 }} />
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => generatePDF('Daily Collection Report - ' + reportDate, dailyDetailHeaders, dailyDetailRows, [['Date', reportDate], ['Total Collected', fmt(dailyPayments.reduce((s,p)=>s+p.amountCollected,0))], ['Total Payments', dailyPayments.length]])}>📄 PDF</button>
                <button className="btn btn-outline btn-sm" onClick={() => exportExcel('Daily_Collection_' + reportDate, dailyDetailHeaders, dailyDetailRows)}>📊 Excel</button>
              </div>
            </div>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat-card blue"><div className="stat-label">Total Collected</div><div className="stat-value">{fmt(dailyPayments.reduce((s,p)=>s+p.amountCollected,0))}</div><div className="stat-sub">{dailyPayments.length} payments</div></div>
            <div className="stat-card green"><div className="stat-label">Villages Active</div><div className="stat-value">{dailyByVillage.length}</div><div className="stat-sub">of {villages.length} total</div></div>
            <div className="stat-card amber"><div className="stat-label">Agents Active</div><div className="stat-value">{dailyByAgent.length}</div><div className="stat-sub">of {agents.length} total</div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">By Village</div></div>
              {dailyByVillage.length === 0 ? <p className="table-empty">No collections on this date</p> : (
                <div className="table-wrap"><table>
                  <thead><tr><th>Village</th><th>Customers</th><th>Payments</th><th>Amount</th></tr></thead>
                  <tbody>{dailyByVillage.map(v => (<tr key={v.id}><td style={{ fontWeight: 600, color: '#e2e8f0' }}>{v.villageName}</td><td>{v.uniqueCustomers}</td><td>{v.count}</td><td style={{ color: '#4ade80', fontWeight: 700 }}>{fmt(v.amount)}</td></tr>))}</tbody>
                </table></div>
              )}
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">By Agent</div></div>
              {dailyByAgent.length === 0 ? <p className="table-empty">No agent activity</p> : (
                <div className="table-wrap"><table>
                  <thead><tr><th>Agent</th><th>Collections</th><th>Amount</th></tr></thead>
                  <tbody>{dailyByAgent.map(a => (<tr key={a.id}><td style={{ fontWeight: 600, color: '#e2e8f0' }}>{a.agentName}</td><td>{a.count}</td><td style={{ color: '#4ade80', fontWeight: 700 }}>{fmt(a.amount)}</td></tr>))}</tbody>
                </table></div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header"><div className="card-title">Detailed Transactions</div></div>
            {dailyPayments.length === 0 ? <p className="table-empty">No transactions</p> : (
              <div className="table-wrap"><table>
                <thead><tr><th>Time</th><th>Village</th><th>Customer</th><th>Agent</th><th>Amount</th></tr></thead>
                <tbody>{dailyPayments.map(p => {
                  const v = villages.find(vi => vi.id === p.villageId);
                  const c = customers.find(ci => ci.id === p.customerId);
                  const a = agents.find(ai => ai.id === p.agentId);
                  return (<tr key={p.id}><td>{fmtTime(p.paymentDate)}</td><td>{v?.villageName}</td><td>{c ? `${c.customerNumber} - ${c.customerName}` : '-'}</td><td>{p.agentId==='owner'?'Owner':(a?.agentName||'-')}</td><td style={{ color: '#4ade80', fontWeight: 700 }}>{fmt(p.amountCollected)}</td></tr>);
                })}</tbody>
              </table></div>
            )}
          </div>
        </div>
      )}

      {/* OUTSTANDING REPORT */}
      {tab === 'outstanding' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => {
                const h = ['Village', 'Customers', 'Active Sales', 'Total Sales Value', 'Outstanding'];
                const r = outstandingByVillage.map(v => [v.villageName, v.customers, v.activeSales, fmt(v.totalSales), fmt(v.outstanding)]);
                generatePDF('Outstanding Report', h, r, [['Total Outstanding', fmt(outstandingByVillage.reduce((s,v)=>s+v.outstanding,0))], ['Active Sales', outstandingByVillage.reduce((s,v)=>s+v.activeSales,0)]]);
              }}>📄 PDF</button>
              <button className="btn btn-outline btn-sm" onClick={() => {
                const h = ['Village', 'Customers', 'Active Sales', 'Total Sales Value', 'Outstanding'];
                const r = outstandingByVillage.map(v => [v.villageName, v.customers, v.activeSales, fmt(v.totalSales), fmt(v.outstanding)]);
                exportExcel('Outstanding_Report', h, r);
              }}>📊 Excel</button>
            </div>
          </div>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat-card red"><div className="stat-label">Total Outstanding</div><div className="stat-value">{fmt(outstandingByVillage.reduce((s,v)=>s+v.outstanding,0))}</div><div className="stat-sub">{sales.filter(s=>s.status==='active').length} active sales</div></div>
            <div className="stat-card green"><div className="stat-label">Total Collected</div><div className="stat-value">{fmt(payments.reduce((s,p)=>s+p.amountCollected,0))}</div><div className="stat-sub">{payments.length} payments</div></div>
            <div className="stat-card blue"><div className="stat-label">Completed Sales</div><div className="stat-value">{sales.filter(s=>s.status==='completed').length}</div><div className="stat-sub">of {sales.length} total</div></div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Village-wise Outstanding</div></div>
            <div className="table-wrap"><table>
              <thead><tr><th>Village</th><th>Customers</th><th>Active Sales</th><th>Total Sales</th><th>Outstanding</th><th>Progress</th></tr></thead>
              <tbody>{outstandingByVillage.map(v => {
                const pct = v.totalSales > 0 ? Math.round(((v.totalSales - v.outstanding) / v.totalSales) * 100) : 100;
                return (<tr key={v.id}><td style={{ fontWeight: 600, color: '#e2e8f0' }}>{v.villageName}</td><td>{v.customers}</td><td>{v.activeSales}</td><td>{fmt(v.totalSales)}</td><td style={{ color: v.outstanding > 0 ? '#f59e0b' : '#4ade80', fontWeight: 700 }}>{fmt(v.outstanding)}</td><td style={{ minWidth: 100 }}><div className="progress-wrap"><div className="progress-bar green" style={{ width: pct + '%' }}></div></div><span style={{ fontSize: 11, color: '#64748b' }}>{pct}% collected</span></td></tr>);
              })}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {/* AGENT REPORT */}
      {tab === 'agents' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <label className="input-label" style={{ margin: 0 }}>From:</label>
              <input className="input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 160 }} />
              <label className="input-label" style={{ margin: 0 }}>To:</label>
              <input className="input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 160 }} />
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => {
                  const h = ['Agent', 'Villages', 'Collections', 'Amount'];
                  const r = agents.map(a => {
                    const ap = rangePayments.filter(p => p.agentId === a.id);
                    const vids = [...new Set(ap.map(p => p.villageId))];
                    return [a.agentName, vids.map(vid => villages.find(v=>v.id===vid)?.villageName).filter(Boolean).join(', '), ap.length, fmt(ap.reduce((s,p)=>s+p.amountCollected,0))];
                  });
                  generatePDF('Agent Performance Report', h, r);
                }}>📄 PDF</button>
                <button className="btn btn-outline btn-sm" onClick={() => {
                  const h = ['Agent', 'Villages', 'Collections', 'Amount'];
                  const r = agents.map(a => {
                    const ap = rangePayments.filter(p => p.agentId === a.id);
                    const vids = [...new Set(ap.map(p => p.villageId))];
                    return [a.agentName, vids.map(vid => villages.find(v=>v.id===vid)?.villageName).filter(Boolean).join(', '), ap.length, fmt(ap.reduce((s,p)=>s+p.amountCollected,0))];
                  });
                  exportExcel('Agent_Performance', h, r);
                }}>📊 Excel</button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Agent Performance</div></div>
            <div className="table-wrap"><table>
              <thead><tr><th>Agent</th><th>Assigned Villages</th><th>Collections</th><th>Customers</th><th>Amount</th></tr></thead>
              <tbody>{agents.map(a => {
                const ap = rangePayments.filter(p => p.agentId === a.id);
                return (<tr key={a.id}><td style={{ fontWeight: 600, color: '#e2e8f0' }}>{a.agentName}</td><td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{a.assignedVillages.map(vid => { const v = villages.find(vi=>vi.id===vid); return v ? <span key={vid} className="badge badge-active">{v.villageName}</span> : null; })}</div></td><td>{ap.length}</td><td>{[...new Set(ap.map(p=>p.customerId))].length}</td><td style={{ color: '#4ade80', fontWeight: 700 }}>{fmt(ap.reduce((s,p)=>s+p.amountCollected,0))}</td></tr>);
              })}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {/* SALES REPORT */}
      {tab === 'sales' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => {
                const h = ['Village', 'Customer ID', 'Customer Name', 'Product', 'Price', 'Advance', 'Outstanding', 'Status', 'Date'];
                const r = sales.map(s => {
                  const c = customers.find(ci => ci.id === s.customerId);
                  const v = villages.find(vi => vi.id === s.villageId);
                  return [v?.villageName||'-', c?.customerNumber||'-', c?.customerName||'-', s.productName, fmt(s.productPrice), fmt(s.advanceAmount), fmt(s.outstandingAmount), s.status, fmtDate(s.saleDate)];
                });
                generatePDF('Sales Report', h, r, [['Total Sales', sales.length], ['Active', sales.filter(s=>s.status==='active').length], ['Completed', sales.filter(s=>s.status==='completed').length], ['Total Value', fmt(sales.reduce((sum,s)=>sum+s.productPrice,0))]]);
              }}>📄 PDF</button>
              <button className="btn btn-outline btn-sm" onClick={() => {
                const h = ['Village', 'Customer ID', 'Customer Name', 'Product', 'Price', 'Advance', 'Outstanding', 'Status', 'Date'];
                const r = sales.map(s => {
                  const c = customers.find(ci => ci.id === s.customerId);
                  const v = villages.find(vi => vi.id === s.villageId);
                  return [v?.villageName||'-', c?.customerNumber||'-', c?.customerName||'-', s.productName, fmt(s.productPrice), fmt(s.advanceAmount), fmt(s.outstandingAmount), s.status, fmtDate(s.saleDate)];
                });
                exportExcel('Sales_Report', h, r);
              }}>📊 Excel</button>
            </div>
          </div>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            <div className="stat-card blue"><div className="stat-label">Total Sales</div><div className="stat-value">{sales.length}</div></div>
            <div className="stat-card green"><div className="stat-label">Total Value</div><div className="stat-value">{fmt(sales.reduce((s,sale)=>s+sale.productPrice,0))}</div></div>
            <div className="stat-card amber"><div className="stat-label">Active</div><div className="stat-value">{sales.filter(s=>s.status==='active').length}</div></div>
            <div className="stat-card red"><div className="stat-label">Completed</div><div className="stat-value">{sales.filter(s=>s.status==='completed').length}</div></div>
          </div>
          <div className="card">
            <div className="table-wrap"><table>
              <thead><tr><th>Village</th><th>Cust ID</th><th>Customer</th><th>Product</th><th>Price</th><th>Advance</th><th>Outstanding</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{sales.map(s => {
                const c = customers.find(ci => ci.id === s.customerId);
                const v = villages.find(vi => vi.id === s.villageId);
                return (<tr key={s.id}><td style={{ color: '#a78bfa' }}>{v?.villageName}</td><td style={{ fontWeight: 600 }}>{c?.customerNumber}</td><td style={{ fontWeight: 600, color: '#e2e8f0' }}>{c?.customerName}</td><td>{s.productName}</td><td>{fmt(s.productPrice)}</td><td style={{ color: '#4ade80' }}>{fmt(s.advanceAmount)}</td><td style={{ color: s.outstandingAmount > 0 ? '#f59e0b' : '#4ade80', fontWeight: 700 }}>{fmt(s.outstandingAmount)}</td><td><span className={`badge ${s.status==='active'?'badge-active':'badge-completed'}`}>{s.status}</span></td><td style={{ color: '#64748b' }}>{fmtDate(s.saleDate)}</td></tr>);
              })}</tbody>
            </table></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// AGENT: FAST COLLECTION SCREEN
// ============================================================
const AgentFastCollect = ({ user }) => {
  const villages = (getLS(STORAGE_KEYS.VILLAGES) || []).filter(v => user.assignedVillages.includes(v.id));
  const [selectedVillage, setSelectedVillage] = useState(villages.length === 1 ? villages[0].id : '');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [amount, setAmount] = useState('');
  const [recentCollections, setRecentCollections] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const searchRef = useRef(null);
  const amountRef = useRef(null);
  const { toast, showToast } = useToast();

  // Load today's collections for this agent
  useEffect(() => {
    const payments = (getLS(STORAGE_KEYS.PAYMENTS) || []).filter(p => p.agentId === user.id && isToday(p.paymentDate));
    setRecentCollections(payments.sort((a,b) => b.paymentDate - a.paymentDate).slice(0, 5));
    setTodayTotal(payments.reduce((s, p) => s + p.amountCollected, 0));
  }, [user.id]);

  useEffect(() => {
    if (selectedVillage && !selectedCustomer && searchRef.current) searchRef.current.focus();
  }, [selectedVillage, selectedCustomer]);

  useEffect(() => {
    if (selectedSale && amountRef.current) amountRef.current.focus();
  }, [selectedSale]);

  const customers = selectedVillage ? (getLS(STORAGE_KEYS.CUSTOMERS) || []).filter(c => c.villageId === selectedVillage) : [];
  const allSales = getLS(STORAGE_KEYS.SALES) || [];

  // Search results
  const searchResults = searchTerm.length > 0
    ? customers.filter(c =>
        c.customerNumber.toString().startsWith(searchTerm) ||
        c.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSelectCustomer = (cust) => {
    const custSales = allSales.filter(s => s.customerId === cust.id && s.status === 'active');
    setSelectedCustomer(cust);
    if (custSales.length === 1) {
      setSelectedSale(custSales[0]);
    } else {
      setSelectedSale(null);
    }
    setSearchTerm('');
    setAmount('');
  };

  const handleCollect = () => {
    if (!amount || Number(amount) <= 0) { showToast('Enter valid amount', 'error'); return; }
    if (!selectedSale) { showToast('Select a sale', 'error'); return; }

    const village = villages.find(v => v.id === selectedVillage);
    const payment = {
      id: uid(), ownerId: selectedSale.ownerId, villageId: selectedVillage,
      customerId: selectedCustomer.id, saleId: selectedSale.id, agentId: user.id,
      amountCollected: Number(amount), paymentDate: Date.now()
    };

    // Save payment
    const allPayments = getLS(STORAGE_KEYS.PAYMENTS) || [];
    allPayments.push(payment);
    setLS(STORAGE_KEYS.PAYMENTS, allPayments);

    // Update sale outstanding
    const allSalesArr = getLS(STORAGE_KEYS.SALES) || [];
    const saleIdx = allSalesArr.findIndex(s => s.id === selectedSale.id);
    if (saleIdx !== -1) {
      allSalesArr[saleIdx].outstandingAmount -= Number(amount);
      if (allSalesArr[saleIdx].outstandingAmount <= 0) {
        allSalesArr[saleIdx].outstandingAmount = 0;
        allSalesArr[saleIdx].status = 'completed';
      }
      setLS(STORAGE_KEYS.SALES, allSalesArr);
    }

    showToast(`₹${amount} collected from ${selectedCustomer.customerName}!`);
    setRecentCollections(prev => [payment, ...prev].slice(0, 5));
    setTodayTotal(prev => prev + Number(amount));

    // Reset for next collection
    setSelectedCustomer(null);
    setSelectedSale(null);
    setAmount('');
    setSearchTerm('');
    setTimeout(() => { if (searchRef.current) searchRef.current.focus(); }, 100);
  };

  const clearCustomer = () => { setSelectedCustomer(null); setSelectedSale(null); setAmount(''); setSearchTerm(''); };

  return (
    <div>
      <Toast toast={toast} />
      <div className="collect-screen">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#fff', fontSize: 20, margin: 0 }}>Collect Payment</h2>
            <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0' }}>Today: <span style={{ color: '#4ade80', fontWeight: 700 }}>{fmt(todayTotal)}</span></p>
          </div>
        </div>

        {/* Village Selector */}
        <div style={{ marginBottom: 18 }}>
          <label className="input-label">Select Village</label>
          <div className="village-selector">
            {villages.map(v => (
              <div key={v.id} className={`village-chip ${selectedVillage === v.id ? 'selected' : ''}`} onClick={() => { setSelectedVillage(v.id); clearCustomer(); }}>{v.villageName}</div>
            ))}
          </div>
        </div>

        {selectedVillage && !selectedCustomer && (
          <>
            {/* Search Input */}
            <div className="card">
              <label className="input-label">Customer ID or Name</label>
              <input ref={searchRef} className="input" style={{ fontSize: 18, padding: '12px 16px' }} type="text" inputMode="numeric" placeholder="Type ID or name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoFocus />

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  {searchResults.map(c => {
                    const cSales = allSales.filter(s => s.customerId === c.id && s.status === 'active');
                    const outstanding = cSales.reduce((s, sale) => s + sale.outstandingAmount, 0);
                    const lastPay = (getLS(STORAGE_KEYS.PAYMENTS)||[]).filter(p=>p.customerId===c.id).sort((a,b)=>b.paymentDate-a.paymentDate)[0];
                    return (
                      <div key={c.id} className="customer-card" onClick={() => handleSelectCustomer(c)}>
                        <div className="cust-top">
                          <div>
                            <div className="cust-id">{c.customerNumber} - {c.customerName}</div>
                          </div>
                          <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 15 }}>{fmt(outstanding)}</span>
                        </div>
                        <div className="cust-details">
                          {cSales[0] && <span className="cust-detail">Product: <span>{cSales[0].productName}</span></span>}
                          {cSales[0] && <span className="cust-detail">EMI: <span>{fmt(cSales[0].emiAmount)}/{cSales[0].emiFrequency}</span></span>}
                          {lastPay && <span className="cust-detail">Last: <span>{fmtDate(lastPay.paymentDate)}</span></span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {searchTerm.length > 0 && searchResults.length === 0 && (
                <p style={{ color: '#64748b', fontSize: 13, marginTop: 12, textAlign: 'center' }}>No customer found</p>
              )}
            </div>
          </>
        )}

        {/* Selected Customer + Amount Entry */}
        {selectedCustomer && (
          <>
            <div className="selected-customer">
              <div className="sc-header">
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'Sora, sans-serif' }}>{selectedCustomer.customerName}</div>
                  <div style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600, marginTop: 2 }}>{villages.find(v=>v.id===selectedVillage)?.villageName}-{selectedCustomer.customerNumber}</div>
                </div>
                <button className="sc-clear" onClick={clearCustomer}>×</button>
              </div>
            </div>

            {/* If multiple active sales, pick one */}
            {(() => {
              const custSales = allSales.filter(s => s.customerId === selectedCustomer.id && s.status === 'active');
              if (custSales.length > 1) {
                return (
                  <div className="card" style={{ marginBottom: 16 }}>
                    <label className="input-label">Select Sale</label>
                    {custSales.map(s => (
                      <div key={s.id} style={{ padding: '10px 14px', background: selectedSale?.id === s.id ? 'rgba(99,102,241,0.1)' : '#141620', borderRadius: 8, border: '1px solid ' + (selectedSale?.id === s.id ? 'rgba(99,102,241,0.4)' : '#2a2d3a'), marginBottom: 8, cursor: 'pointer' }} onClick={() => setSelectedSale(s)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>{s.productName}</span>
                          <span style={{ fontSize: 14, color: '#f59e0b', fontWeight: 700 }}>Out: {fmt(s.outstandingAmount)}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>EMI: {fmt(s.emiAmount)}/{s.emiFrequency}</div>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            })()}

            {selectedSale && (
              <div className="card">
                {/* Sale Info */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 100, background: '#141620', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Product</div>
                    <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600, marginTop: 2 }}>{selectedSale.productName}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 100, background: '#141620', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Outstanding</div>
                    <div style={{ fontSize: 16, color: '#f59e0b', fontWeight: 700, marginTop: 2 }}>{fmt(selectedSale.outstandingAmount)}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 100, background: '#141620', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>EMI</div>
                    <div style={{ fontSize: 14, color: '#a78bfa', fontWeight: 600, marginTop: 2 }}>{fmt(selectedSale.emiAmount)}/{selectedSale.emiFrequency}</div>
                  </div>
                </div>

                {/* Amount input */}
                <label className="input-label">Amount to Collect (₹)</label>
                <input ref={amountRef} className="input" type="number" style={{ fontSize: 22, padding: '14px 16px', fontWeight: 700 }} placeholder="Enter amount..." value={amount} onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCollect()} autoFocus />

                {/* Quick amount buttons */}
                <div className="quick-btns" style={{ marginTop: 10 }}>
                  {[50, 100, 200, 500].map(amt => (
                    <div key={amt} className={`quick-btn ${amount === String(amt) ? 'selected' : ''}`} onClick={() => setAmount(String(amt))}>{fmt(amt)}</div>
                  ))}
                  <div className="quick-btn" onClick={() => setAmount(String(selectedSale.emiAmount))} style={{ background: 'rgba(99,102,241,0.1)', borderColor: '#6366f1', color: '#a78bfa' }}>EMI: {fmt(selectedSale.emiAmount)}</div>
                  <div className="quick-btn" onClick={() => setAmount(String(selectedSale.outstandingAmount))} style={{ background: 'rgba(34,197,94,0.1)', borderColor: '#22c55e', color: '#4ade80' }}>Full: {fmt(selectedSale.outstandingAmount)}</div>
                </div>

                {/* Collect Button */}
                <button className="collect-btn" onClick={handleCollect} disabled={!amount || Number(amount) <= 0}>✓ Collect {amount ? fmt(Number(amount)) : ''}</button>
              </div>
            )}
          </>
        )}

        {/* Recent Collections */}
        {recentCollections.length > 0 && (
          <div className="recent-list">
            <h4>Today's Collections</h4>
            {recentCollections.map(p => {
              const c = (getLS(STORAGE_KEYS.CUSTOMERS)||[]).find(c => c.id === p.customerId);
              const v = villages.find(vi => vi.id === p.villageId);
              return (
                <div key={p.id} className="recent-item">
                  <div className="ri-left">
                    <div className="ri-dot"></div>
                    <div className="ri-info">
                      <div className="ri-name">{v?.villageName}-{c?.customerNumber} {c?.customerName}</div>
                      <div className="ri-time">{fmtTime(p.paymentDate)}</div>
                    </div>
                  </div>
                  <div className="ri-amount">{fmt(p.amountCollected)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// AGENT CUSTOMER VIEW
// ============================================================
const AgentCustomerView = ({ user }) => {
  const villages = (getLS(STORAGE_KEYS.VILLAGES) || []).filter(v => user.assignedVillages.includes(v.id));
  const [selectedVillage, setSelectedVillage] = useState(villages.length === 1 ? villages[0].id : '');
  const [search, setSearch] = useState('');

  const customers = selectedVillage ? (getLS(STORAGE_KEYS.CUSTOMERS) || []).filter(c => c.villageId === selectedVillage) : [];
  const allSales = getLS(STORAGE_KEYS.SALES) || [];
  const allPayments = getLS(STORAGE_KEYS.PAYMENTS) || [];

  let filtered = customers;
  if (search) filtered = filtered.filter(c => c.customerNumber.toString().includes(search) || c.customerName.toLowerCase().includes(search.toLowerCase()));

  const enriched = filtered.map(c => {
    const sales = allSales.filter(s => s.customerId === c.id);
    const lastPay = allPayments.filter(p => p.customerId === c.id).sort((a,b) => b.paymentDate - a.paymentDate)[0];
    const outstanding = sales.filter(s => s.status === 'active').reduce((sum, s) => sum + s.outstandingAmount, 0);
    return { ...c, outstanding, lastPay, hasActive: sales.some(s => s.status === 'active') };
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#fff', fontSize: 20, margin: 0 }}>Customers</h2>
      </div>

      {/* Village selector */}
      <div style={{ marginBottom: 14 }}>
        <div className="village-selector">
          {villages.map(v => (
            <div key={v.id} className={`village-chip ${selectedVillage === v.id ? 'selected' : ''}`} onClick={() => setSelectedVillage(v.id)}>{v.villageName}</div>
          ))}
        </div>
      </div>

      {selectedVillage && (
        <>
          <div className="filter-bar">
            <div className="search-wrap" style={{ maxWidth: '100%' }}>
              <span className="search-icon">🔍</span>
              <input className="input" placeholder="Search ID or name..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div>
            {enriched.length === 0 ? <div className="card"><p className="table-empty">No customers found</p></div> : enriched.map(c => (
              <div key={c.id} className="customer-card" style={{ marginBottom: 8 }}>
                <div className="cust-top">
                  <div>
                    <div className="cust-id">{c.customerNumber} - {c.customerName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: c.outstanding > 0 ? '#f59e0b' : '#4ade80' }}>{fmt(c.outstanding)}</div>
                    <span className={`badge ${c.hasActive ? 'badge-active' : 'badge-completed'}`} style={{ fontSize: 10 }}>{c.hasActive ? 'Active' : 'Completed'}</span>
                  </div>
                </div>
                <div className="cust-details">
                  {c.phone && <span className="cust-detail">📞 <span>{c.phone}</span></span>}
                  {c.lastPay && <span className="cust-detail">Last paid: <span>{fmtDate(c.lastPay.paymentDate)}</span></span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================
// AGENT COLLECTION HISTORY
// ============================================================
const AgentHistory = ({ user }) => {
  const villages = (getLS(STORAGE_KEYS.VILLAGES) || []).filter(v => user.assignedVillages.includes(v.id));
  const allPayments = (getLS(STORAGE_KEYS.PAYMENTS) || []).filter(p => p.agentId === user.id);
  const customers = getLS(STORAGE_KEYS.CUSTOMERS) || [];

  const todayPayments = allPayments.filter(p => isToday(p.paymentDate)).sort((a,b) => b.paymentDate - a.paymentDate);
  const todayTotal = todayPayments.reduce((s, p) => s + p.amountCollected, 0);

  // Past 7 days
  const weekPayments = allPayments.filter(p => {
    const d = new Date(p.paymentDate);
    const now = new Date();
    const diff = (now - d) / 86400000;
    return diff <= 7;
  });

  return (
    <div>
      <h2 style={{ fontFamily: 'Sora, sans-serif', color: '#fff', fontSize: 20, marginBottom: 16 }}>My Collections</h2>
      <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="stat-card blue"><div className="stat-label">Today</div><div className="stat-value">{fmt(todayTotal)}</div><div className="stat-sub">{todayPayments.length} payments</div></div>
        <div className="stat-card green"><div className="stat-label">This Week</div><div className="stat-value">{fmt(weekPayments.reduce((s,p)=>s+p.amountCollected,0))}</div><div className="stat-sub">{weekPayments.length} payments</div></div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Today's Collections</div></div>
        {todayPayments.length === 0 ? <p className="table-empty">No collections today</p> : todayPayments.map(p => {
          const c = customers.find(ci => ci.id === p.customerId);
          const v = villages.find(vi => vi.id === p.villageId);
          return (
            <div key={p.id} className="recent-item">
              <div className="ri-left">
                <div className="ri-dot"></div>
                <div className="ri-info">
                  <div className="ri-name">{v?.villageName}-{c?.customerNumber} {c?.customerName}</div>
                  <div className="ri-time">{fmtTime(p.paymentDate)}</div>
                </div>
              </div>
              <div className="ri-amount">{fmt(p.amountCollected)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
      const [vs, ps, as] = await Promise.all([
        FB.getFilteredFromFirestore('villages','ownerId','==',user.id),
        FB.getFilteredFromFirestore('products','ownerId','==',user.id),
        FB.getFilteredFromFirestore('agents','ownerId','==',user.id)
      ]);
      setLS(STORAGE_KEYS.VILLAGES, vs);
      setLS(STORAGE_KEYS.PRODUCTS, ps);
      setLS(STORAGE_KEYS.AGENTS, as);
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
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad: maintain exact line count
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
// pad
