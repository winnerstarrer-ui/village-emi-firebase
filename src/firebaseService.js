// firebaseService.js - Complete Firebase Integration
import { initializeApp, getApps, deleteApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBltf4ue-UxjmRNAYyxHFNXBtOe6bNyuI4",
  authDomain: "village-emi-manager.firebaseapp.com",
  projectId: "village-emi-manager",
  storageBucket: "village-emi-manager.firebasestorage.app",
  messagingSenderId: "1011535673411",
  appId: "1:1011535673411:web:4d20038e67e4ffe33abcf6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ============================================================
// FIRESTORE CRUD OPERATIONS
// ============================================================

export const addToFirestore = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    if (error.code === 'permission-denied' || (error.message || '').toLowerCase().includes('permission')) {
      console.error(`⛔ Permission Denied while adding to ${collectionName}:`, error);
    } else {
      console.error(`Error adding to ${collectionName}:`, error);
    }
    return { success: false, error: error.message };
  }
};

export const getAllFromFirestore = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return data;
  } catch (error) {
    console.error(`Error getting ${collectionName}:`, error);
    return [];
  }
};

export const getFilteredFromFirestore = async (collectionName, field, operator, value) => {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    const data = [];
    querySnapshot.forEach((document) => {
      data.push({ id: document.id, ...document.data() });
    });
    return data;
  } catch (error) {
    console.error(`Error filtering ${collectionName}:`, error);
    return [];
  }
};

export const updateInFirestore = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Date.now()
    });
    return { success: true };
  } catch (error) {
    if (error.code === 'permission-denied' || (error.message || '').toLowerCase().includes('permission')) {
      console.error(`⛔ Permission Denied while updating ${collectionName}:`, error);
    } else {
      console.error(`Error updating ${collectionName}:`, error);
    }
    return { success: false, error: error.message };
  }
};

export const deleteFromFirestore = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return { success: true };
  } catch (error) {
    if (error.code === 'permission-denied' || (error.message || '').toLowerCase().includes('permission')) {
      console.error(`⛔ Permission Denied while deleting from ${collectionName}:`, error);
    } else {
      console.error(`Error deleting from ${collectionName}:`, error);
    }
    return { success: false, error: error.message };
  }
};

export const listenToCollection = (collectionName, callback, filterField = null, filterValue = null) => {
  try {
    let q;
    if (filterField && filterValue) {
      q = query(collection(db, collectionName), where(filterField, '==', filterValue));
    } else {
      q = collection(db, collectionName);
    }
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      callback(data);
    }, (error) => {
      console.error(`Error listening to ${collectionName}:`, error);
      callback([]);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error(`Error setting up listener for ${collectionName}:`, error);
    return () => {};
  }
};

// ============================================================
// AUTHENTICATION OPERATIONS
// ============================================================

export const registerUser = async (email, password, userData) => {
  try {
    console.log('🔵 Starting registration for:', email);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Firebase Auth user created:', user.uid);
    
    const ownerData = {
      userId: user.uid,
      email: user.email,
      businessName: userData.businessName,
      ownerName: userData.ownerName,
      phone: userData.phone || '',
      role: 'owner',
      createdAt: Date.now()
    };
    
    console.log('🔵 Saving to Firestore:', ownerData);
    
    try {
      await setDoc(doc(db, 'owners', user.uid), ownerData);
    } catch (writeError) {
      if (writeError.code === 'permission-denied' || (writeError.message || '').toLowerCase().includes('permission')) {
        console.error('⛔ Permission Denied while writing owner profile:', writeError);
      } else {
        console.error('⛔ Error writing owner profile:', writeError);
      }
      throw writeError;
    }
    console.log('✅ User data saved to Firestore');
    
    return { 
      success: true, 
      user: { 
        id: user.uid, 
        ...ownerData 
      } 
    };
    
  } catch (error) {
    console.error('⛔ Registration error:', error);
    let errorMessage = 'Registration failed';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email already registered';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

export const loginUser = async (email, password) => {
  try {
    console.log('🔵 Starting login for:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Firebase Auth successful:', user.uid);
    
    const ownerDocRef = doc(db, 'owners', user.uid);
    const ownerDoc = await getDoc(ownerDocRef);
    
    if (ownerDoc.exists()) {
      console.log('✅ Owner data found in Firestore');
      const ownerData = { id: user.uid, ...ownerDoc.data() };
      return { success: true, user: ownerData, role: 'owner' };
    }
    
    console.log('🔵 Not an owner, checking agents...');
    
    const agents = await getAllFromFirestore('agents');
    const agent = agents.find(a => a.email === email);
    
    if (agent) {
      console.log('✅ Agent data found');
      return { success: true, user: agent, role: 'agent' };
    }
    
    console.error('⛔ User authenticated but no data found in Firestore');
    return { 
      success: false, 
      error: 'Auth successful, but no database profile found' 
    };
    
  } catch (error) {
    console.error('⛔ Login error:', error);
    let errorMessage = 'Invalid email or password';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export const generateId = () => {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
};

export const seedDemoData = async (ownerId) => {
  try {
    console.log('🔵 Seeding demo data for owner:', ownerId);
    
    const villages = await getFilteredFromFirestore('villages', 'ownerId', '==', ownerId);
    if (villages.length > 0) {
      console.log('✅ Demo data already exists');
      return { success: true, message: 'Data already exists' };
    }
    
    await addToFirestore('villages', {
      ownerId,
      villageName: 'Rampur',
      nextCustomerId: 805
    });
    
    await addToFirestore('villages', {
      ownerId,
      villageName: 'Sundarabad',
      nextCustomerId: 803
    });
    
    await addToFirestore('products', {
      ownerId,
      productName: 'Mixer Grinder',
      price: 3500
    });
    
    await addToFirestore('products', {
      ownerId,
      productName: 'Cooker (3L)',
      price: 2800
    });
    
    console.log('✅ Demo data seeded successfully');
    return { success: true, message: 'Demo data created' };
  } catch (error) {
    console.error('⛔ Error seeding demo data:', error);
    return { success: false, error: error.message };
  }
};

export const registerAgentWithAuth = async (ownerId, agentName, email, password, phone, assignedVillages) => {
  try {
    let secondaryApp;
    try {
      secondaryApp = getApps().find(a => a.name === 'secondary') || initializeApp(firebaseConfig, 'secondary');
    } catch (_) {
      secondaryApp = initializeApp(firebaseConfig, 'secondary');
    }
    const tempAuth = getAuth(secondaryApp);
    const cred = await createUserWithEmailAndPassword(tempAuth, email, password);
    const agentUid = cred.user.uid;
    const agentData = {
      id: agentUid,
      ownerId,
      agentName,
      email,
      phone: phone || '',
      assignedVillages: assignedVillages || [],
      role: 'agent',
      createdAt: Date.now()
    };
    await setDoc(doc(db, 'agents', agentUid), agentData);
    try { await signOut(tempAuth); } catch (_) {}
    try { await deleteApp(secondaryApp); } catch (_) {}
    return { success: true, agent: agentData };
  } catch (error) {
    if (error.code === 'permission-denied' || (error.message || '').toLowerCase().includes('permission')) {
      console.error('⛔ Permission Denied during agent registration:', error);
    } else {
      console.error('⛔ Agent registration error:', error);
    }
    return { success: false, error: error.message };
  }
};

export default {
  db,
  auth,
  addToFirestore,
  getAllFromFirestore,
  getFilteredFromFirestore,
  updateInFirestore,
  deleteFromFirestore,
  listenToCollection,
  registerUser,
  loginUser,
  logoutUser,
  onAuthChange,
  generateId,
  seedDemoData,
  registerAgentWithAuth
};
