import { useState } from 'react';
import * as FB from '../firebaseService';
import { STORAGE_KEYS, getLS, setLS } from '../storage';
import { useToast } from '../hooks';
import { Toast, Modal } from '../components/Common';

export const AgentManagement = ({ user }) => {
  const [agents, setAgents] = useState((getLS(STORAGE_KEYS.AGENTS) || []).filter(a => a.ownerId === user.id));
  const villages = (getLS(STORAGE_KEYS.VILLAGES) || []).filter(v => v.ownerId === user.id);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
  const [form, setForm] = useState({ agentName: '', phone: '', pin: '', assignedVillages: [] });
  const { toast, showToast } = useToast();

  const toggleVillage = (vid) => {
    setForm(p => ({
      ...p,
      assignedVillages: p.assignedVillages.includes(vid) ? p.assignedVillages.filter(v => v !== vid) : [...p.assignedVillages, vid]
    }));
  };

  const save = async () => {
    if (!form.agentName.trim() || !form.phone.trim()) { showToast('Fill required fields', 'error'); return; }
    let all = getLS(STORAGE_KEYS.AGENTS) || [];
    if (editAgent) {
      // Update only name and villages (phone cannot be changed)
      all = all.map(a => a.id === editAgent.id ? { ...a, agentName: form.agentName, assignedVillages: form.assignedVillages } : a);
      setLS(STORAGE_KEYS.AGENTS, all);
      setAgents(all.filter(a => a.ownerId === user.id));
      // Update Firestore
      const res = await FB.updateInFirestore('agents', editAgent.id, { agentName: form.agentName, assignedVillages: form.assignedVillages });
      if (!res.success) showToast(res.error, 'error');
      else showToast('Agent updated');
    } else {
      // New agent
      if (!form.pin) { showToast('Set a PIN', 'error'); return; }
      if (all.find(a => a.phone === form.phone)) { showToast('Phone number already exists', 'error'); return; }
      const res = await FB.registerAgent(user.id, form.agentName, form.phone, form.pin, form.assignedVillages);
      if (!res.success) { showToast(res.error || 'Agent creation failed', 'error'); return; }
      const na = res.agent;
      all.push(na);
      setLS(STORAGE_KEYS.AGENTS, all);
      setAgents(all.filter(a => a.ownerId === user.id));
      showToast('Agent added');
    }
    setModalOpen(false);
    setEditAgent(null);
    setForm({ agentName: '', phone: '', pin: '', assignedVillages: [] });
  };

  const del = async (id) => {
    const agentPayments = (getLS(STORAGE_KEYS.PAYMENTS) || []).filter(p => p.agentId === id);
    if (agentPayments.length > 0) {
      showToast('Cannot delete agent with collection history', 'error');
      return;
    }
    const res = await FB.deleteFromFirestore('agents', id);
    if (!res.success) { showToast(res.error || 'Delete failed', 'error'); return; }
    const all = (getLS(STORAGE_KEYS.AGENTS) || []).filter(a => a.id !== id);
    setLS(STORAGE_KEYS.AGENTS, all);
    setAgents(all.filter(a => a.ownerId === user.id));
    showToast('Agent deleted');
  };

  return (
    <div>
      <Toast toast={toast} />
      <div className="page-header">
        <div><h2>Agents</h2><p>Manage your collection agents</p></div>
        <button className="btn btn-primary" onClick={() => { setEditAgent(null); setForm({ agentName: '', phone: '', pin: '', assignedVillages: [] }); setModalOpen(true); }}>+ Add Agent</button>
      </div>
      <div className="card">
        {agents.length === 0 ? <p className="table-empty">No agents yet.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Agent Name</th><th>Phone</th><th>Villages</th><th>Actions</th></tr></thead>
              <tbody>
                {agents.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{a.agentName}</td>
                    <td style={{ color: '#64748b' }}>{a.phone}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {a.assignedVillages.map(vid => {
                          const v = villages.find(v => v.id === vid);
                          return v ? <span key={vid} className="badge badge-active">{v.villageName}</span> : null;
                        })}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => {
                          setEditAgent(a);
                          setForm({ agentName: a.agentName, phone: a.phone, pin: '', assignedVillages: a.assignedVillages });
                          setModalOpen(true);
                        }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(a.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editAgent ? 'Edit Agent' : 'Add New Agent'}>
        <div className="input-group">
          <label className="input-label">Agent Name</label>
          <input className="input" placeholder="e.g. Rajesh Mehta" value={form.agentName} onChange={e => setForm(p => ({...p, agentName: e.target.value}))} autoFocus />
        </div>
        <div className="input-group">
          <label className="input-label">Phone Number (Login ID)</label>
          <input className="input" type="tel" placeholder="9876543210" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} disabled={!!editAgent} />
        </div>
        {!editAgent && (
          <div className="input-group">
            <label className="input-label">PIN</label>
            <input className="input" type="password" placeholder="Enter 4-6 digit PIN" value={form.pin} onChange={e => setForm(p => ({...p, pin: e.target.value}))} maxLength="6" />
          </div>
        )}
        <div className="input-group">
          <label className="input-label">Assign Villages</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            {villages.map(v => (
              <div key={v.id} className={`village-chip ${form.assignedVillages.includes(v.id) ? 'selected' : ''}`} onClick={() => toggleVillage(v.id)}>{v.villageName}</div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>Save</button>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};