import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBltf4ue-UxjmRNAYyxHFNXBtOe6bNyuI4",
  authDomain: "village-emi-manager.firebaseapp.com",
  projectId: "village-emi-manager",
  storageBucket: "village-emi-manager.firebasestorage.app",
  messagingSenderId: "1011535673411",
  appId: "1:1011535673411:web:4d20038e67e4ffe33abcf6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // This creates the "owners" collection in your database
    await setDoc(doc(db, 'owners', user.uid), {
      userId: user.uid,
      email: user.email,
      businessName: userData.businessName || '',
      ownerName: userData.ownerName || '',
      role: 'owner',
      createdAt: Date.now()
    });
    
    return { success: true, user };
  } catch (error) {
    console.error("Firebase Error:", error.message);
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: res.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
// --- ADD THIS TO THE BOTTOM OF firebaseService.js ---

// Tool to save a Village
export const saveVillageToCloud = async (villageData, ownerId) => {
  try {
    await setDoc(doc(db, 'villages', villageData.id), {
      ...villageData,
      ownerId: ownerId,
      syncedAt: Date.now()
    });
    return { success: true };
  } catch (error) {
    console.error("Cloud Error saving village:", error);
    return { success: false, error };
  }
};

// Tool to save an Agent
export const saveAgentToCloud = async (agentData, ownerId) => {
  try {
    await setDoc(doc(db, 'agents', agentData.id), {
      ...agentData,
      ownerId: ownerId,
      syncedAt: Date.now()
    });
    return { success: true };
  } catch (error) {
    console.error("Cloud Error saving agent:", error);
    return { success: false, error };
  }
};

// Tool to save a Product
export const saveProductToCloud = async (productData, ownerId) => {
  try {
    await setDoc(doc(db, 'products', productData.id), {
      ...productData,
      ownerId: ownerId,
      syncedAt: Date.now()
    });
    return { success: true };
  } catch (error) {
    console.error("Cloud Error saving product:", error);
    return { success: false, error };
  }
};