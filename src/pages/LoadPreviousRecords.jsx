import { useState } from 'react';
import { STORAGE_KEYS, getLS, setLS } from '../storage';
import { uid, fmt } from '../utils';
import { useToast } from '../hooks';
import { Toast } from '../components/Common';

// ============================================================
// LOAD PREVIOUS RECORDS
// ============================================================
export const LoadPreviousRecords = ({ user }) => {
  const villages = (getLS(STORAGE_KEYS.VILLAGES) || []).filter(v => v.ownerId === user.id);
  const products = (getLS(STORAGE_KEYS.PRODUCTS) || []).filter(p => p.ownerId === user.id);
  
  const [selectedVillage, setSelectedVillage] = useState('');
  const [custForm, setCustForm] = useState({ customerName: '', phone: '', address: '' });
  const [saleForm, setSaleForm] = useState({ 
    productName: '', 
    originalAmount: '', 
    amountPaid: '', 
    saleDate: new Date().toISOString().split('T')[0] 
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentForm, setPaymentForm] = useState({ amountCollected: '', paymentDate: new Date().toISOString().split('T')[0], notes: '' });
  const [showPaymentInput, setShowPaymentInput] = useState(false);
  const { toast, showToast } = useToast();

  const village = villages.find(v => v.id === selectedVillage);
  const originalAmount = Number(saleForm.originalAmount) || 0;
  const totalAmountPaid = paymentHistory.reduce((sum, p) => sum + Number(p.amountCollected || 0), 0) + Number(saleForm.amountPaid || 0);
  const balanceDue = originalAmount - totalAmountPaid;

  const handleAddPayment = () => {
    if (!paymentForm.amountCollected) { 
      showToast('Enter payment amount', 'error'); 
      return; 
    }
    if (Number(paymentForm.amountCollected) <= 0) { 
      showToast('Amount must be greater than 0', 'error'); 
      return; 
    }
    setPaymentHistory([...paymentHistory, { ...paymentForm, id: uid() }]);
    setPaymentForm({ amountCollected: '', paymentDate: new Date().toISOString().split('T')[0], notes: '' });
    setShowPaymentInput(false);
    showToast('Payment added');
  };

  const handleRemovePayment = (id) => {
    setPaymentHistory(paymentHistory.filter(p => p.id !== id));
  };

  const handleSave = () => {
    if (!selectedVillage) { 
      showToast('Select a village', 'error'); 
      return; 
    }
    if (!custForm.customerName.trim()) { 
      showToast('Enter customer name', 'error'); 
      return; 
    }
    if (!saleForm.productName.trim()) { 
      showToast('Enter product name', 'error'); 
      return; 
    }
    if (!saleForm.originalAmount || Number(saleForm.originalAmount) <= 0) { 
      showToast('Enter valid original amount', 'error'); 
      return; 
    }
    if (totalAmountPaid > originalAmount) { 
      showToast('Total paid amount exceeds original amount', 'error'); 
      return; 
    }

    // Create customer
    const allCustomers = getLS(STORAGE_KEYS.CUSTOMERS) || [];
    const currentVillage = (getLS(STORAGE_KEYS.VILLAGES) || []).find(v => v.id === selectedVillage);
    const custNum = currentVillage.nextCustomerId;
    const customerId = `c_${selectedVillage}_${custNum}`;
    allCustomers.push({ 
      id: customerId, 
      ownerId: user.id, 
      villageId: selectedVillage, 
      customerNumber: custNum, 
      customerName: custForm.customerName, 
      phone: custForm.phone || '', 
      address: custForm.address || '' 
    });
    setLS(STORAGE_KEYS.CUSTOMERS, allCustomers);

    // Increment village customer counter
    const allVillages = getLS(STORAGE_KEYS.VILLAGES) || [];
    setLS(STORAGE_KEYS.VILLAGES, allVillages.map(v => v.id === selectedVillage ? { ...v, nextCustomerId: v.nextCustomerId + 1 } : v));

    // Create sale
    const advance = Number(saleForm.amountPaid) || 0;
    const outstanding = originalAmount - advance;
    const sale = {
      id: uid(), 
      ownerId: user.id, 
      villageId: selectedVillage, 
      customerId,
      productName: saleForm.productName, 
      productPrice: originalAmount, 
      advanceAmount: advance,
      outstandingAmount: Math.max(0, originalAmount - totalAmountPaid),
      emiAmount: 0,
      emiFrequency: 'manual',
      status: balanceDue <= 0 ? 'completed' : 'active',
      saleDate: new Date(saleForm.saleDate).getTime(),
      isHistorical: true
    };
    const allSales = getLS(STORAGE_KEYS.SALES) || [];
    allSales.push(sale);
    setLS(STORAGE_KEYS.SALES, allSales);

    // Add all payments
    const allPayments = getLS(STORAGE_KEYS.PAYMENTS) || [];
    
    // Add initial amount paid as payment
    if (advance > 0) {
      allPayments.push({
        id: uid(),
        ownerId: user.id,
        villageId: selectedVillage,
        customerId,
        saleId: sale.id,
        agentId: 'owner',
        amountCollected: advance,
        paymentDate: new Date(saleForm.saleDate).getTime(),
        notes: 'Initial payment'
      });
    }

    // Add all payment history entries
    paymentHistory.forEach(payment => {
      allPayments.push({
        id: uid(),
        ownerId: user.id,
        villageId: selectedVillage,
        customerId,
        saleId: sale.id,
        agentId: 'owner',
        amountCollected: Number(payment.amountCollected),
        paymentDate: new Date(payment.paymentDate).getTime(),
        notes: payment.notes || 'Manual entry'
      });
    });

    setLS(STORAGE_KEYS.PAYMENTS, allPayments);

    showToast('Historical data loaded successfully!');
    
    // Reset
    setSelectedVillage('');
    setCustForm({ customerName: '', phone: '', address: '' });
    setSaleForm({ productName: '', originalAmount: '', amountPaid: '', saleDate: new Date().toISOString().split('T')[0] });
    setPaymentHistory([]);
    setPaymentForm({ amountCollected: '', paymentDate: new Date().toISOString().split('T')[0], notes: '' });
    setShowPaymentInput(false);
  };

  return (
    <div>
      <Toast toast={toast} />
      <div className="page-header">
        <div>
          <h2>Load Previous Records</h2>
          <p>Manually enter historical customer data from your books</p>
        </div>
      </div>
      
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Village Selection */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Select Village</label>
            <select className="input" value={selectedVillage} onChange={e => setSelectedVillage(e.target.value)}>
              <option value="">Choose village...</option>
              {villages.map(v => <option key={v.id} value={v.id}>{v.villageName}</option>)}
            </select>
          </div>
        </div>

        {selectedVillage && (
          <>
            {/* Customer Information */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa', marginBottom: 12 }}>CUSTOMER INFORMATION</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#141620', borderRadius: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>New Customer ID:</span>
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
            </div>

            {/* Sale Information */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa', marginBottom: 12 }}>SALE DETAILS</div>
              <div className="input-group">
                <label className="input-label">Product Name *</label>
                <input className="input" placeholder="e.g. Mixer, Phone, TV" value={saleForm.productName} onChange={e => setSaleForm(p => ({...p, productName: e.target.value}))} />
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label className="input-label">Sale Date *</label>
                  <input className="input" type="date" value={saleForm.saleDate} onChange={e => setSaleForm(p => ({...p, saleDate: e.target.value}))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Original Amount (₹) *</label>
                  <input className="input" type="number" placeholder="3800" value={saleForm.originalAmount} onChange={e => setSaleForm(p => ({...p, originalAmount: e.target.value}))} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Initial Payment (₹)</label>
                <input className="input" type="number" placeholder="0" value={saleForm.amountPaid} onChange={e => setSaleForm(p => ({...p, amountPaid: e.target.value}))} />
              </div>

              {/* Payment History Summary */}
              {(Number(saleForm.originalAmount) > 0) && (
                <div style={{ background: '#141620', borderRadius: 10, padding: 16, marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e2130' }}>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>Original Amount</span>
                    <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{fmt(originalAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e2130' }}>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>Total Paid</span>
                    <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>- {fmt(totalAmountPaid)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0' }}>
                    <span style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 700 }}>Balance Due</span>
                    <span style={{ fontSize: 16, color: balanceDue > 0 ? '#f59e0b' : '#4ade80', fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>{fmt(Math.max(0, balanceDue))}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment History */}
            {(Number(saleForm.originalAmount) > 0) && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa', marginBottom: 12 }}>PAYMENT HISTORY</div>
                
                {paymentHistory.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    {paymentHistory.map((payment, idx) => (
                      <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#141620', borderRadius: 8, marginBottom: 8, fontSize: 13 }}>
                        <div>
                          <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{fmt(Number(payment.amountCollected))}</div>
                          <div style={{ color: '#64748b', fontSize: 12 }}>{payment.paymentDate} {payment.notes ? `• ${payment.notes}` : ''}</div>
                        </div>
                        <button onClick={() => handleRemovePayment(payment.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {showPaymentInput ? (
                  <div style={{ background: '#0f111d', borderRadius: 8, padding: 12, marginBottom: 12, border: '1px solid #1e2130' }}>
                    <div className="input-row" style={{ marginBottom: 8 }}>
                      <div className="input-group">
                        <label className="input-label" style={{ fontSize: 12 }}>Amount (₹)</label>
                        <input className="input" type="number" placeholder="1500" value={paymentForm.amountCollected} onChange={e => setPaymentForm(p => ({...p, amountCollected: e.target.value}))} style={{ fontSize: 13 }} />
                      </div>
                      <div className="input-group">
                        <label className="input-label" style={{ fontSize: 12 }}>Date</label>
                        <input className="input" type="date" value={paymentForm.paymentDate} onChange={e => setPaymentForm(p => ({...p, paymentDate: e.target.value}))} style={{ fontSize: 13 }} />
                      </div>
                    </div>
                    <div className="input-group" style={{ marginBottom: 8 }}>
                      <label className="input-label" style={{ fontSize: 12 }}>Notes (Optional)</label>
                      <input className="input" placeholder="Week 1, 2, 3..." value={paymentForm.notes} onChange={e => setPaymentForm(p => ({...p, notes: e.target.value}))} style={{ fontSize: 13 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={handleAddPayment} style={{ flex: 1, padding: '8px 12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Add</button>
                      <button onClick={() => setShowPaymentInput(false)} style={{ flex: 1, padding: '8px 12px', background: '#2a2d3a', color: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowPaymentInput(true)} style={{ width: '100%', padding: '10px 12px', background: '#1e2130', color: '#a78bfa', border: '1px dashed #3f4654', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>+ Add Payment</button>
                )}
              </div>
            )}

            {/* Save Button */}
            <button className="btn btn-primary btn-lg btn-block" onClick={handleSave}>📥 Load Historical Data</button>
          </>
        )}
      </div>
    </div>
  );
};
