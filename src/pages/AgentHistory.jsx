import { getLS, STORAGE_KEYS } from '../storage';
import { fmt, fmtDate, fmtTime, isToday } from '../utils';

// ============================================================
// AGENT COLLECTION HISTORY
// ============================================================
export const AgentHistory = ({ user }) => {
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
