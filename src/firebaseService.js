// firebaseService.js - Cleaned & Fixed Version
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, getDocs, updateDoc, 
  deleteDoc, doc, query, where, onSnapshot, setDoc, getDoc 
} from 'firebase/firestore';
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, onAuthStateChanged 
} from 'firebase/auth';

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

// AUTH OPERATIONS
export const registerUser = async (email, password, userData) => {
  try {
    console.log('🔵 Starting registration for:', email);
    
    // 1. Create Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Prepare data
    const ownerData = {
      userId: user.uid,
      email: user.email,
      businessName: userData.businessName || '',
      ownerName: userData.ownerName || '',
      phone: userData.phone || '',
      role: 'owner',
      createdAt: Date.now()
    };
    
    // 3. THE FIX: This sends the data to the "owners" collection
    await setDoc(doc(db, 'owners', user.uid), ownerData);
    console.log('✅ Successfully saved to Firestore');

    return { success: true, user: { id: user.uid, ...ownerData } };
  } catch (error) {
    console.error('❌ Registration error:', error);
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const ownerDoc = await getDoc(doc(db, 'owners', user.uid));
    
    if (ownerDoc.exists()) {
      return { success: true, user: { id: user.uid, ...ownerDoc.data() }, role: 'owner' };
    }
    return { success: true, user: { id: user.uid, email: user.email }, role: 'unknown' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = () => signOut(auth);
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// CRUD OPERATIONS
export const addToFirestore = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllFromFirestore = async (collectionName) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteFromFirestore = async (collectionName, docId) => {
  await deleteDoc(doc(db, collectionName, docId));
  return { success: true };
};

export default {
  db, auth, registerUser, loginUser, logoutUser, onAuthChange, addToFirestore, getAllFromFirestore, deleteFromFirestore
};