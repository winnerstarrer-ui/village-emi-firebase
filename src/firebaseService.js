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
  serverTimestamp 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7Zn2N8k_ju1Z4crz8a8Uj7wKv5gJ4BpY",
  authDomain: "village-emi-manager.firebaseapp.com",
  projectId: "village-emi-manager",
  storageBucket: "village-emi-manager.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

// Auth operations
export const registerUser = async (email, password, userData) => {
  try {
    console.log("🔵 Starting registration for:", email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store owner data in Firestore
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

export const registerAgentWithAuth = async (ownerId, agentName, email, password, phone, assignedVillages) => {
  try {
    console.log("🔵 Starting agent registration for:", email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const agentData = {
      id: user.uid,
      ownerId,
      agentName,
      email: user.email,
      phone: phone || '',
      assignedVillages,
      role: 'agent',
      createdAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'agents', user.uid), agentData);
    console.log("✅ Agent registered and saved to Firestore:", user.uid);
    
    return { success: true, agent: agentData };
  } catch (error) {
    console.error("Agent registration error:", error);
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    console.log("🔵 Starting login for:", email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("✅ Firebase Auth successful:", user.uid);
    
    // Try to find in owners first
    const ownersQuery = query(collection(db, 'owners'), where('id', '==', user.uid));
    const ownersSnapshot = await getDocs(ownersQuery);
    
    if (!ownersSnapshot.empty) {
      const ownerData = ownersSnapshot.docs[0].data();
      console.log("✅ Owner data found in Firestore");
      return { success: true, user: ownerData, role: 'owner' };
    }
    
    // Try to find in agents
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

// Demo data seeding
export const seedDemoData = async (ownerId) => {
  try {
    console.log("🔵 Seeding demo data for owner:", ownerId);
    
    // Check if villages already exist for this owner
    const existingVillages = await getFilteredFromFirestore('villages', 'ownerId', '==', ownerId);
    if (existingVillages.length > 0) {
      console.log("✅ Demo data already exists");
      return { success: true, message: 'Demo data already exists' };
    }
    
    // Create demo villages
    const villages = [
      { villageName: 'Rampur', nextCustomerId: 801 },
      { villageName: 'Sultanpur', nextCustomerId: 901 },
      { villageName: 'Devgarh', nextCustomerId: 1001 }
    ];
    
    const villagePromises = villages.map(village => 
      addToFirestore('villages', { ...village, ownerId })
    );
    
    // Create demo products
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
    
    // Create demo agent (Rajesh)
    const agentData = {
      ownerId,
      agentName: 'Rajesh Mehta',
      email: 'rajesh@demo.com',
      phone: '9876543210',
      assignedVillages: [], // Will be updated after villages are created
      role: 'agent'
    };
    
    // Wait for villages to be created first
    await Promise.all(villagePromises);
    await Promise.all(productPromises);
    
    // Get the created villages to assign to agent
    const createdVillages = await getFilteredFromFirestore('villages', 'ownerId', '==', ownerId);
    const villageIds = createdVillages.map(v => v.id);
    
    // Update agent with assigned villages
    agentData.assignedVillages = villageIds;
    
    // Register agent with auth
    const agentRes = await registerAgentWithAuth(
      ownerId,
      agentData.agentName,
      agentData.email,
      'demo123',
      agentData.phone,
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