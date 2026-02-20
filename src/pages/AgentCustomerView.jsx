import { useState } from 'react';
import { getLS, STORAGE_KEYS } from '../storage';
import { fmt, fmtDate } from '../utils';

// ============================================================
// AGENT CUSTOMER VIEW
// ============================================================
export const AgentCustomerView = ({ user }) => {
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
