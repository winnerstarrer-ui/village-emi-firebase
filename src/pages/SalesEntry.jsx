import { useState } from 'react';
import { STORAGE_KEYS, getLS, setLS } from './storage';
import { uid, fmt } from './utils';
import { useToast } from './hooks';
import { Toast } from './components/Common';

// ============================================================
// NEW SALE ENTRY
// ============================================================
export const SalesEntry = ({ user }) => {
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
