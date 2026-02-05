// firebaseService.js - Cleaned & Corrected Version
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
    
    // 1. Create Auth user
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
    
    // 3. Save to Firestore (Creating the document)
    await setDoc(doc(db, 'owners', user.uid), ownerData);
    console.log('✅ User data saved to Firestore in owners collection');
    
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
    return { success: false, error: 'User data not found.' };
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
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getFilteredFromFirestore = async (collectionName, field, operator, value) => {
  const q = query(collection(db, collectionName), where(field, operator, value));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateInFirestore = async (collectionName, docId, data) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, { ...data, updatedAt: Date.now() });
  return { success: true };
};

export const deleteFromFirestore = async (collectionName, docId) => {
  await deleteDoc(doc(db, collectionName, docId));
  return { success: true };
};

export const listenToCollection = (collectionName, callback) => {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};

export const generateId = () => 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);

export default {
  db, auth, addToFirestore, getAllFromFirestore, getFilteredFromFirestore,
  updateInFirestore, deleteFromFirestore, listenToCollection,
  registerUser, loginUser, logoutUser, onAuthChange, generateId
};