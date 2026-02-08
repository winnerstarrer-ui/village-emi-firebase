import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
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
  getDoc,
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence (optional but recommended)
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not supported in this browser');
    }
  });
} catch (e) {
  console.warn('Persistence setup error:', e);
}

// Helper to wait for auth
const waitForAuth = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Generic Firestore operations with better error handling
export const addToFirestore = async (collectionName, data) => {
  try {
    console.log(`📝 Adding to ${collectionName}:`, data);
    
    // Wait for auth if needed
    await waitForAuth();
    
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Added to ${collectionName} with ID:`, docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error(`❌ Error adding to ${collectionName}:`, error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return { success: false, error: error.message };
  }
};

export const updateInFirestore = async (collectionName, docId, data) => {
  try {
    console.log(`📝 Updating ${collectionName}/${docId}:`, data);
    
    await waitForAuth();
    
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Updated ${collectionName}/${docId}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error updating ${collectionName}/${docId}:`, error);
    console.error('Error code:', error.code);
    return { success: false, error: error.message };
  }
};

export const deleteFromFirestore = async (collectionName, docId) => {
  try {
    console.log(`🗑️ Deleting from ${collectionName}:`, docId);
    
    await waitForAuth();
    
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    
    console.log(`✅ Deleted from ${collectionName}:`, docId);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error deleting ${collectionName}/${docId}:`, error);
    console.error('Error code:', error.code);
    return { success: false, error: error.message };
  }
};

export const getFilteredFromFirestore = async (collectionName, field, operator, value) => {
  try {
    console.log(`🔍 Fetching from ${collectionName} where ${field} ${operator} ${value}`);
    
    // Wait for auth to be ready
    const user = await waitForAuth();
    
    if (!user && collectionName !== 'owners') {
      console.warn('⚠️ User not authenticated, returning empty array');
      return [];
    }
    
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    
    const results = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    console.log(`✅ Fetched ${results.length} items from ${collectionName}`);
    return results;
    
  } catch (error) {
    console.error(`❌ Error fetching from ${collectionName}:`, error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Return empty array on error to prevent crashes
    return [];
  }
};

// Auth operations
export const registerUser = async (email, password, userData) => {
  try {
    console.log("📝 Starting registration for:", email);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("✅ Firebase Auth user created:", user.uid);
    
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
    console.log("✅ Owner registered and saved to Firestore");
    
    return { success: true, user: { ...ownerData, id: user.uid } };
    
  } catch (error) {
    console.error("❌ Registration error:", error);
    console.error('Error code:', error.code);
    
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const registerAgentWithAuth = async (ownerId, agentName, email, password, phone, assignedVillages) => {
  try {
    console.log("📝 Starting agent registration for:", email);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const agentData = {
      id: user.uid,
      ownerId,
      agentName,
      email: user.email,
      phone: phone || '',
      assignedVillages: assignedVillages || [],
      role: 'agent',
      createdAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'agents', user.uid), agentData);
    console.log("✅ Agent registered and saved to Firestore");
    
    return { success: true, agent: { ...agentData, id: user.uid } };
    
  } catch (error) {
    console.error("❌ Agent registration error:", error);
    console.error('Error code:', error.code);
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    console.log("📝 Starting login for:", email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("✅ Firebase Auth successful:", user.uid);
    
    // Try to find in owners first
    const ownerDoc = await getDoc(doc(db, 'owners', user.uid));
    
    if (ownerDoc.exists()) {
      const ownerData = { id: user.uid, ...ownerDoc.data() };
      console.log("✅ Owner data found");
      return { success: true, user: ownerData, role: 'owner' };
    }
    
    // Try to find in agents
    const agentDoc = await getDoc(doc(db, 'agents', user.uid));
    
    if (agentDoc.exists()) {
      const agentData = { id: user.uid, ...agentDoc.data() };
      console.log("✅ Agent data found");
      return { success: true, user: agentData, role: 'agent' };
    }
    
    console.log("❌ User not found in Firestore");
    return { success: false, error: 'User account not found in database' };
    
  } catch (error) {
    console.error("❌ Login error:", error);
    console.error('Error code:', error.code);
    
    let errorMessage = 'Login failed';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password';
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
    console.log("✅ Logged out successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Logout error:", error);
    return { success: false, error: error.message };
  }
};

// Demo data seeding
export const seedDemoData = async (ownerId) => {
  try {
    console.log("📝 Seeding demo data for owner:", ownerId);
    
    // Check if villages already exist
    const existingVillages = await getFilteredFromFirestore('villages', 'ownerId', '==', ownerId);
    if (existingVillages.length > 0) {
      console.log("✅ Demo data already exists");
      return { success: true, message: 'Demo data already exists' };
    }
    
    // Create demo villages
    const village1 = await addToFirestore('villages', { 
      ownerId, 
      villageName: 'Rampur', 
      nextCustomerId: 801 
    });
    
    const village2 = await addToFirestore('villages', { 
      ownerId, 
      villageName: 'Sultanpur', 
      nextCustomerId: 901 
    });
    
    // Create demo products
    await addToFirestore('products', { 
      ownerId, 
      productName: 'Mixer Grinder', 
      price: 3500 
    });
    
    await addToFirestore('products', { 
      ownerId, 
      productName: 'Pressure Cooker', 
      price: 1200 
    });
    
    console.log("✅ Demo data seeded successfully");
    return { success: true, message: 'Demo data created' };
    
  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
    return { success: false, error: error.message };
  }
};

// Export auth and db for direct access if needed
export { auth, db };