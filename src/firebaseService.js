// firebaseService.js - Fully Fixed & Production Ready
import { initializeApp } from "firebase/app";
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
// AUTHENTICATION OPERATIONS
// ============================================================

export const registerUser = async (email, password, userData) => {
  try {
    console.log('🔵 Starting registration for:', email);
    
    // 1. Create User in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Firebase Auth user created:', user.uid);
    
    // 2. Prepare user data
    const ownerData = {
      userId: user.uid,
      email: user.email,
      businessName: userData.businessName || '',
      ownerName: userData.ownerName || '',
      phone: userData.phone || '',
      role: 'owner',
      createdAt: Date.now()
    };
    
    // 3. Save to Firestore (THIS SAVES THE DATA)
    await setDoc(doc(db, 'owners', user.uid), ownerData);
    console.log('✅ Successfully saved to Firestore');

    return { success: true, user: { id: user.uid, ...ownerData } };
  } catch (error) {
    console.error('❌ Registration error:', error);
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') errorMessage = 'Email already registered';
    return { success: false, error: errorMessage };
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
    return { success: true, user: { email: user.email, uid: user.uid }, role: 'unknown' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = () => signOut(auth);
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

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
    return { success: false, error: error.message };
  }
};

export const getAllFromFirestore = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return [];
  }
};

export const updateInFirestore = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, { ...data, updatedAt: Date.now() });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteFromFirestore = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default {
  db, auth, registerUser, loginUser, logoutUser, onAuthChange,
  addToFirestore, getAllFromFirestore, updateInFirestore, deleteFromFirestore
};