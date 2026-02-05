import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

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
    
    const ownerData = {
      userId: user.uid,
      email: user.email,
      businessName: userData.businessName || '',
      ownerName: userData.ownerName || '',
      role: 'owner',
      createdAt: Date.now()
    };

    // This sends it to Firestore
    await setDoc(doc(db, 'owners', user.uid), ownerData);
    return { success: true, user: user };
  } catch (error) {
    console.error("Firebase Error:", error.message);
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};