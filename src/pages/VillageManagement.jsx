import { useState } from 'react';
import * as FB from '../firebaseService';
import { STORAGE_KEYS, getLS, setLS } from '../storage';
import { useToast } from '../hooks';
import { Toast, Modal } from '../components/Common';

export const VillageManagement = ({ user }) => {
  const [villages, setVillages] = useState((getLS(STORAGE_KEYS.VILLAGES) || []).filter(v => v.ownerId === user.id));
  const [modalOpen, setModalOpen] = useState(false);
  const [editVillage, setEditVillage] = useState(null);
  const [form, setForm] = useState({ villageName: '' });
  const { toast, showToast } = useToast();

  const save = async () => {
    if (!form.villageName.trim()) { showToast('Enter village name', 'error'); return; }

    try {
      if (editVillage) {
        // Update existing village
        const updatedData = { villageName: form.villageName };
        const res = await FB.updateInFirestore('villages', editVillage.id, updatedData);
        if (!res.success) throw new Error(res.error);

        const allVillages = (getLS(STORAGE_KEYS.VILLAGES) || []).map(v =>
          v.id === editVillage.id ? { ...v, ...updatedData } : v
        );
        setLS(STORAGE_KEYS.VILLAGES, allVillages);
        setVillages(allVillages.filter(v => v.ownerId === user.id));
        showToast('Village updated');
      } else {
        // Check for duplicate name
        const allVillages = getLS(STORAGE_KEYS.VILLAGES) || [];
        if (allVillages.some(v => v.villageName && v.villageName.toLowerCase() === form.villageName.toLowerCase())) {
          showToast('Village name already exists', 'error');
          return;
        }

        // New village: nextCustomerId always starts at 1
        const newVillageData = {
          ownerId: user.id,
          villageName: form.villageName,
          nextCustomerId: 1
        };
        const res = await FB.addToFirestore('villages', newVillageData);
        if (!res.success) throw new Error(res.error);

        const newVillage = { id: res.id, ...newVillageData };
        allVillages.push(newVillage);
        setLS(STORAGE_KEYS.VILLAGES, allVillages);
        setVillages(allVillages.filter(v => v.ownerId === user.id));
        showToast('Village added');
      }

      setModalOpen(false);
      setEditVillage(null);
      setForm({ villageName: '' });
    } catch (error) {
      console.error('Error saving village:', error);
      showToast(error.message || 'Failed to save village', 'error');
    }
  };

  const del = async (id) => {
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
        <button className="btn btn-primary" onClick={() => { setEditVillage(null); setForm({ villageName: '' }); setModalOpen(true); }}>+ Add Village</button>
      </div>
      <div className="card">
        {villages.length === 0 ? <p className="table-empty">No villages yet.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Village Name</th><th>Customers</th><th>Next ID</th><th>Actions</th></tr></thead>
              <tbody>
                {villages.map((v, i) => {
                  const custCount = ((getLS(STORAGE_KEYS.CUSTOMERS) || []).filter(c => c.villageId === v.id)).length;
                  return (
                    <tr key={v.id}>
                      <td style={{ color: '#64748b' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{v.villageName}</td>
                      <td>{custCount}</td>
                      <td>{v.nextCustomerId}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => { 
                            setEditVillage(v); 
                            setForm({ villageName: v.villageName }); 
                            setModalOpen(true); 
                          }}>Edit</button>
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
          <input className="input" placeholder="e.g. Rampur" value={form.villageName} onChange={e => setForm({ villageName: e.target.value })} autoFocus />
        </div>
        {!editVillage && (
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Customer IDs will start from 1 and increment automatically.</p>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>Save</button>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};