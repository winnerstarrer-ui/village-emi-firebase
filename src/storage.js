import * as FB from './firebaseService';

// ============================================================
// STORAGE KEYS
// ============================================================
export const STORAGE_KEYS = {
  OWNERS: 'emi_owners',
  CURRENT_USER: 'emi_current_user',
  VILLAGES: 'emi_villages',
  AGENTS: 'emi_agents',
  PRODUCTS: 'emi_products',
  CUSTOMERS: 'emi_customers',
  SALES: 'emi_sales',
  PAYMENTS: 'emi_payments',
};

// ============================================================
// LOCAL STORAGE LAYER
// ============================================================
// In-memory store (persists across re-renders, resets on page refresh)
const _memStore = {};

export const getLS = (key) => {
  const v = _memStore[key];
  return v !== undefined ? JSON.parse(JSON.stringify(v)) : null;
};

export const setLS = (key, val) => {
  _memStore[key] = JSON.parse(JSON.stringify(val));
  // Don't sync CURRENT_USER, VILLAGES, AGENTS, PRODUCTS, CUSTOMERS, SALES, PAYMENTS to app_state
  // These are stored in their own Firestore collections
  const excludedKeys = [
    STORAGE_KEYS.CURRENT_USER,
    STORAGE_KEYS.VILLAGES,
    STORAGE_KEYS.AGENTS,
    STORAGE_KEYS.PRODUCTS,
    STORAGE_KEYS.CUSTOMERS,
    STORAGE_KEYS.SALES,
    STORAGE_KEYS.PAYMENTS
  ];
  if (!excludedKeys.includes(key)) {
    const owner = _memStore[STORAGE_KEYS.CURRENT_USER] || null;
    const ownerId = owner && owner.id ? owner.id : null;
    const payload = { key, ownerId, data: JSON.parse(JSON.stringify(val)), updatedAt: Date.now() };
    FB.getFilteredFromFirestore('app_state', 'key', '==', key)
      .then((docs) => {
        const existing = ownerId ? docs.find(d => d.ownerId === ownerId) : docs[0];
        if (existing && existing.id) {
          return FB.updateInFirestore('app_state', existing.id, payload);
        }
        return FB.addToFirestore('app_state', payload);
      })
      .catch(() => {});
  }
};

// ============================================================
// SEED DEMO DATA
// ============================================================
export const seedData = () => {
  const u = getLS(STORAGE_KEYS.CURRENT_USER);
  if (!u || u.role !== 'owner') return;
  FB.getFilteredFromFirestore('villages', 'ownerId', '==', u.id)
    .then((list) => { if ((list || []).length === 0) FB.seedDemoData(u.id); })
    .catch(() => {});
};
