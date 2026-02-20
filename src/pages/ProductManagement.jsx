import { useState } from 'react';
import * as FB from '../firebaseService';
import { STORAGE_KEYS, getLS, setLS } from '../storage';
import { uid, fmt } from '../utils';
import { useToast } from '../hooks';
import { Toast, Modal } from '../components/Common';

// ============================================================
// PRODUCT MANAGEMENT
// ============================================================
export const ProductManagement = ({ user }) => {
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

  const del = async (id) => {
    // Check if product has sales before deleting
    const product = products.find(p => p.id === id);
    const productSales = (getLS(STORAGE_KEYS.SALES) || []).filter(s => s.productName === product?.productName);
    if (productSales.length > 0) {
      showToast('Cannot delete product with existing sales', 'error');
      return;
    }

    const res = await FB.deleteFromFirestore('products', id);
    if (!res.success) { showToast(res.error || 'Delete failed', 'error'); return; }
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
