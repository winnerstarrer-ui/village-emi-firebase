// ============================================================
// STYLES
// ============================================================
export const GlobalStyles = () => (
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
    .sidebar-logo h1 { font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 700; color: #fff; letterSpacing: -0.5px; }
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
    .card-title { font-size: 14px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letterSpacing: 0.5px; }

    /* Stats Grid */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 24px; }
    .stat-card { background: #1a1d27; border: 1px solid #1e2130; border-radius: 14px; padding: 18px; position: relative; overflow: hidden; }
    .stat-card::before { content: ''; position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; border-radius: 50%; opacity: 0.08; }
    .stat-card.blue::before { background: #6366f1; }
    .stat-card.green::before { background: #22c55e; }
    .stat-card.amber::before { background: #f59e0b; }
    .stat-card.red::before { background: #ef4444; }
    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; letterSpacing: 0.8px; font-weight: 600; margin-bottom: 8px; }
    .stat-value { font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 700; color: #fff; letterSpacing: -0.5px; }
    .stat-sub { font-size: 11px; color: #64748b; margin-top: 4px; }
    .stat-sub .up { color: #22c55e; }
    .stat-sub .down { color: #ef4444; }

    /* Tables */
    .table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid #1e2130; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead { background: #141620; }
    th { text-align: left; padding: 12px 16px; color: #64748b; font-weight: 600; font-size: 11px; text-transform: uppercase; letterSpacing: 0.5px; white-space: nowrap; border-bottom: 1px solid #1e2130; }
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
    .input-label { display: block; font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letterSpacing: 0.5px; }
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
    .recent-list h4 { font-size: 12px; color: #64748b; text-transform: uppercase; letterSpacing: 0.5px; margin-bottom: 10px; font-weight: 600; }
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
