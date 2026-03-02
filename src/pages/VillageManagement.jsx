import { useState } from 'react';
import * as FB from '../firebaseService';
import { STORAGE_KEYS, getLS, setLS } from '../storage';
import { useToast } from '../hooks';
import { Toast, Modal } from '../components/Common';

// ============================================================
// VILLAGE MANAGEMENT (FIXED)
// ============================================================
export const VillageManagement = ({ user }) => {
  const [villages, setVillages] = useState((getLS(STORAGE_KEYS.VILLAGES) || []).filter(v => v.ownerId === user.id));
  const [modalOpen, setModalOpen] = useState(false);
  const [editVillage, setEditVillage] = useState(null);
  const [form, setForm] = useState({ villageName: '', startingId: 801 });
  const { toast, showToast } = useToast();

  const save = async () => {
    if (!form.villageName.trim()) { showToast('Enter village name', 'error'); return; }

    try {
      if (editVillage) {
        // Update existing village in Firestore
        const updatedData = { villageName: form.villageName };
        const res = await FB.updateInFirestore('villages', editVillage.id, updatedData);
        if (!res.success) throw new Error(res.error);

        // Update local storage
        const allVillages = (getLS(STORAGE_KEYS.VILLAGES) || []).map(v =>
          v.id === editVillage.id ? { ...v, villageName: form.villageName } : v
        );
        setLS(STORAGE_KEYS.VILLAGES, allVillages);
        setVillages(allVillages.filter(v => v.ownerId === user.id));
        showToast('Village updated');
      } else {
        // Check for duplicate name (optional, but good)
        const allVillages = getLS(STORAGE_KEYS.VILLAGES) || [];
        if (allVillages.find(v => v.villageName.toLowerCase() === form.villageName.toLowerCase())) {
          showToast('Village name already exists', 'error');
          return;
        }

        // Create new village in Firestore
        const newVillageData = {
          ownerId: user.id,
          villageName: form.villageName,
          nextCustomerId: Number(form.startingId) || 801
        };
        const res = await FB.addToFirestore('villages', newVillageData);
        if (!res.success) throw new Error(res.error);

        // Build village object with Firestore ID
        const newVillage = { id: res.id, ...newVillageData };
        allVillages.push(newVillage);
        setLS(STORAGE_KEYS.VILLAGES, allVillages);
        setVillages(allVillages.filter(v => v.ownerId === user.id));
        showToast('Village added');
      }

      setModalOpen(false);
      setEditVillage(null);
      setForm({ villageName: '', startingId: 801 });
    } catch (error) {
      console.error('Error saving village:', error);
      showToast(error.message || 'Failed to save village', 'error');
    }
  };

  const del = async (id) => {
    // Check if village has customers before deleting
    const villageCustomers = (getLS(STORAGE_KEYS.CUSTOMERS) || []).filter(c => c.villageId === id);
    if (villageCustomers.length > 0) {
      showToast('Cannot delete village with existing customers', 'error');
      return;
    }

    try {
      const res = await FB.deleteFromFirestore('villages', id);
      if (!res.success) throw new Error(res.error);

      const all = (getLS(STORAGE_KEYS.VILLAGES) || []).filter(v => v.id !== id);
      setLS(STORAGE_KEYS.VILLAGES, all);
      setVillages(all.filter(v => v.ownerId === user.id));
      showToast('Village deleted');
    } catch (error) {
      console.error('Error deleting village:', error);
      showToast(error.message || 'Delete failed', 'error');
    }
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