import { getLS, STORAGE_KEYS } from './storage';
import { fmt, fmtTime, fmtDate, isToday } from './utils';

// ============================================================
// OWNER DASHBOARD
// ============================================================
export const OwnerDashboard = ({ user }) => {
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
