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
  serverTimestamp,
  enableIndexedDbPersistence
} from "firebase/firestore";
import bcrypt from 'bcryptjs';

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

// Enable offline persistence (for web)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.log('Persistence failed: multiple tabs open');
  } else if (err.code == 'unimplemented') {
    console.log('Persistence not supported');
  }
});

// Generic Firestore operations
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
    console.log(`Attempting to delete from ${collectionName}:`, docId);
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    console.log(`Successfully deleted from ${collectionName}:`, docId);
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

// ========== OWNER AUTH (unchanged) ==========

export const registerUser = async (email, password, userData) => {
  try {
    console.log("🔵 Starting registration for:", email);
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
    console.log("✅ Owner registered and saved to Firestore:", user.uid);
    
    return { success: true, user: ownerData };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    console.log("🔵 Starting login for:", email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("✅ Firebase Auth successful:", user.uid);
    
    const ownersQuery = query(collection(db, 'owners'), where('id', '==', user.uid));
    const ownersSnapshot = await getDocs(ownersQuery);
    
    if (!ownersSnapshot.empty) {
      const ownerData = ownersSnapshot.docs[0].data();
      console.log("✅ Owner data found in Firestore");
      return { success: true, user: ownerData, role: 'owner' };
    }
    
    const agentsQuery = query(collection(db, 'agents'), where('id', '==', user.uid));
    const agentsSnapshot = await getDocs(agentsQuery);
    
    if (!agentsSnapshot.empty) {
      const agentData = agentsSnapshot.docs[0].data();
      console.log("✅ Agent data found in Firestore");
      return { success: true, user: agentData, role: 'agent' };
    }
    
    console.log("❌ User not found in Firestore");
    return { success: false, error: 'User account not found in database' };
    
  } catch (error) {
    console.error("Login error:", error);
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

// ========== AGENT MANAGEMENT (NO FIREBASE AUTH) ==========

// Register a new agent (owner creates)
export const registerAgent = async (ownerId, agentName, phone, pin, assignedVillages) => {
  try {
    // Check if phone already exists for this owner
    const existing = await getFilteredFromFirestore('agents', 'phone', '==', phone);
    if (existing.length > 0) {
      return { success: false, error: 'Phone number already used' };
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    const agentData = {
      ownerId,
      agentName,
      phone,
      pin: hashedPin,
      assignedVillages,
      role: 'agent',
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, 'agents'), agentData);
    const newAgent = { id: docRef.id, ...agentData, pin: undefined }; // don't return pin
    return { success: true, agent: newAgent };
  } catch (error) {
    console.error('Error registering agent:', error);
    return { success: false, error: error.message };
  }
};

// Update agent PIN (owner can change)
export const updateAgentPin = async (agentId, newPin) => {
  try {
    const hashedPin = await bcrypt.hash(newPin, 10);
    const docRef = doc(db, 'agents', agentId);
    await updateDoc(docRef, { pin: hashedPin, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Verify agent login (phone + pin)
export const verifyAgentLogin = async (phone, pin) => {
  try {
    const q = query(collection(db, 'agents'), where('phone', '==', phone));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { success: false, error: 'Agent not found' };
    }
    const agentDoc = snapshot.docs[0];
    const agentData = agentDoc.data();
    const match = await bcrypt.compare(pin, agentData.pin);
    if (!match) {
      return { success: false, error: 'Invalid PIN' };
    }
    // Return agent without pin
    const { pin: _, ...safeAgent } = agentData;
    safeAgent.id = agentDoc.id;
    safeAgent.role = 'agent';
    return { success: true, user: safeAgent };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Demo data seeding (unchanged)
export const seedDemoData = async (ownerId) => {
  try {
    console.log("🔵 Seeding demo data for owner:", ownerId);
    
    const existingVillages = await getFilteredFromFirestore('villages', 'ownerId', '==', ownerId);
    if (existingVillages.length > 0) {
      console.log("✅ Demo data already exists");
      return { success: true, message: 'Demo data already exists' };
    }
    
    const villages = [
      { villageName: 'Rampur', nextCustomerId: 801 },
      { villageName: 'Sultanpur', nextCustomerId: 901 },
      { villageName: 'Devgarh', nextCustomerId: 1001 }
    ];
    
    const villagePromises = villages.map(village => 
      addToFirestore('villages', { ...village, ownerId })
    );
    
    const products = [
      { productName: 'Mixer Grinder', price: 3500 },
      { productName: 'Pressure Cooker', price: 1200 },
      { productName: 'Electric Kettle', price: 900 },
      { productName: 'Ceiling Fan', price: 2800 },
      { productName: 'LED TV 32"', price: 12500 }
    ];
    
    const productPromises = products.map(product => 
      addToFirestore('products', { ...product, ownerId })
    );
    
    // Create demo agent (Rajesh) – now using phone/PIN
    const agentData = {
      ownerId,
      agentName: 'Rajesh Mehta',
      phone: '9876543210',
      assignedVillages: [], // Will be updated after villages are created
      role: 'agent'
    };
    
    await Promise.all(villagePromises);
    await Promise.all(productPromises);
    
    const createdVillages = await getFilteredFromFirestore('villages', 'ownerId', '==', ownerId);
    const villageIds = createdVillages.map(v => v.id);
    agentData.assignedVillages = villageIds;
    
    // Register agent with phone and PIN (demo PIN = '1234')
    const agentRes = await registerAgent(
      ownerId,
      agentData.agentName,
      agentData.phone,
      '1234',
      agentData.assignedVillages
    );
    
    if (!agentRes.success) {
      throw new Error('Failed to create demo agent');
    }
    
    console.log("✅ Demo data seeded successfully");
    return { success: true, message: 'Demo data seeded' };
    
  } catch (error) {
    console.error("Error seeding demo data:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to get all data for an owner
export const getOwnerData = async (ownerId) => {
  try {
    const [villages, products, agents] = await Promise.all([
      getFilteredFromFirestore('villages', 'ownerId', '==', ownerId),
      getFilteredFromFirestore('products', 'ownerId', '==', ownerId),
      getFilteredFromFirestore('agents', 'ownerId', '==', ownerId)
    ]);
    
    return { villages, products, agents };
  } catch (error) {
    console.error("Error getting owner data:", error);
    return { villages: [], products: [], agents: [] };
  }
};