import { useState } from 'react';
import { getLS, STORAGE_KEYS } from '../storage';
import { fmt, fmtDate, fmtTime } from '../utils';
import { useToast } from '../hooks';
import { Toast } from '../components/Common';

// ============================================================
// CUSTOMER LIST (OWNER)
// ============================================================
export const CustomerList = ({ user }) => {
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
