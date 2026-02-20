import { useState, useEffect, useRef } from 'react';
import { getLS, STORAGE_KEYS, setLS } from '../storage';
import { uid, fmt, fmtDate, fmtTime, isToday } from '../utils';
import { useToast } from '../hooks';
import { Toast } from '../components/Common';

// ============================================================
// AGENT: FAST COLLECTION SCREEN
// ============================================================
export const AgentFastCollect = ({ user }) => {
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
                    <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterspacing: 0.5 }}>Product</div>
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
