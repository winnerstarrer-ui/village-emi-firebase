import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  setDoc,
  getDoc,               // <-- added for direct fetch
  serverTimestamp,
  enableIndexedDbPersistence
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBltf4ue-UxjmRNAYyxHFNXBtOe6bNyuI4",
  authDomain: "village-emi-manager.firebaseapp.com",
  projectId: "village-emi-manager",
  storageBucket: "village-emi-manager.firebasestorage.app",
  messagingSenderId: "1011535673411",
  appId: "1:1011535673411:web:4d20038e67e4ffe33abcf6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.log('Persistence failed: multiple tabs open');
  } else if (err.code == 'unimplemented') {
    console.log('Persistence not supported');
  }
});

// ============================================================
// GENERIC FIRESTORE OPERATIONS
// ============================================================
export const addToFirestore = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error(`Error adding to ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

export const updateInFirestore = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error(`Error updating ${collectionName}/${docId}:`, error);
    return { success: false, error: error.message };
  }
};

export const deleteFromFirestore = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting ${collectionName}/${docId}:`, error);
    return { success: false, error: error.message };
  }
};

export const getFilteredFromFirestore = async (collectionName, field, operator, value) => {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching from ${collectionName}:`, error);
    return [];
  }
};

// ============================================================
// OWNER AUTH (unchanged)
// ============================================================
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const ownerData = {
      id: user.uid,
      email: user.email,
      ownerName: userData.ownerName,
      businessName: userData.businessName,
      phone: userData.phone || '',
      role: 'owner',
      createdAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'owners', user.uid), ownerData);
    return { success: true, user: ownerData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Try owners first
    const ownersQuery = query(collection(db, 'owners'), where('id', '==', user.uid));
    const ownersSnapshot = await getDocs(ownersQuery);
    if (!ownersSnapshot.empty) {
      const ownerData = ownersSnapshot.docs[0].data();
      return { success: true, user: ownerData, role: 'owner' };
    }
    
    // Then agents
    const agentsQuery = query(collection(db, 'agents'), where('id', '==', user.uid));
    const agentsSnapshot = await getDocs(agentsQuery);
    if (!agentsSnapshot.empty) {
      const agentData = agentsSnapshot.docs[0].data();
      return { success: true, user: agentData, role: 'agent' };
    }
    
    return { success: false, error: 'User account not found in database' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================================
// AGENT MANAGEMENT (with Firebase Auth)
// ============================================================

// Register a new agent (owner creates)
export const registerAgent = async (ownerId, agentName, phone, pin, assignedVillages) => {
  try {
    // Check if phone already exists in Firestore (optional but good)
    const existing = await getFilteredFromFirestore('agents', 'phone', '==', phone);
    if (existing.length > 0) {
      return { success: false, error: 'An agent with this phone number already exists.' };
    }

    // Create Firebase Auth user with email = phone@agent.local
    const email = `${phone}@agent.local`;
    const userCredential = await createUserWithEmailAndPassword(auth, email, pin);
    const uid = userCredential.user.uid;

    // Store agent in Firestore with the same UID as document ID
    const agentData = {
      ownerId,
      agentName,
      phone,
      assignedVillages,
      role: 'agent',
      createdAt: serverTimestamp()
    };
    await setDoc(doc(db, 'agents', uid), agentData);

    // Return agent without pin
    return { success: true, agent: { id: uid, ...agentData } };
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, error: 'This phone number is already registered. Use a different number or delete the existing agent first.' };
    }
    return { success: false, error: error.message };
  }
};

// Agent login with phone + pin
export const agentLogin = async (phone, pin) => {
  try {
    const email = `${phone}@agent.local`;
    const userCredential = await signInWithEmailAndPassword(auth, email, pin);
    const uid = userCredential.user.uid;

    // Fetch agent document directly by UID (document ID = uid)
    const agentDocRef = doc(db, 'agents', uid);
    const agentDocSnap = await getDoc(agentDocRef);

    if (!agentDocSnap.exists()) {
      return { success: false, error: 'Agent data not found' };
    }

    const agentData = agentDocSnap.data();
    agentData.id = uid; // add ID to the returned object
    return { success: true, user: agentData };
  } catch (error) {
    console.error('Agent login error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// DEMO DATA SEEDING
// ============================================================
export const seedDemoData = async (ownerId) => {
  try {
    const existingVillages = await getFilteredFromFirestore('villages', 'ownerId', '==', ownerId);
    if (existingVillages.length > 0) {
      return { success: true, message: 'Demo data already exists' };
    }
    
    const villages = [
      { villageName: 'Rampur', nextCustomerId: 801 },
      { villageName: 'Sultanpur', nextCustomerId: 901 },
      { villageName: 'Devgarh', nextCustomerId: 1001 }
    ];
    for (const v of villages) {
      await addToFirestore('villages', { ...v, ownerId });
    }
    
    const products = [
      { productName: 'Mixer Grinder', price: 3500 },
      { productName: 'Pressure Cooker', price: 1200 },
      { productName: 'Electric Kettle', price: 900 },
      { productName: 'Ceiling Fan', price: 2800 },
      { productName: 'LED TV 32"', price: 12500 }
    ];
    for (const p of products) {
      await addToFirestore('products', { ...p, ownerId });
    }
    
    const createdVillages = await getFilteredFromFirestore('villages', 'ownerId', '==', ownerId);
    const villageIds = createdVillages.map(v => v.id);
    
    // Create demo agent with phone and PIN (PIN = 1234)
    await registerAgent(ownerId, 'Rajesh Mehta', '9876543210', '1234', villageIds);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};