import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc
} from 'firebase/firestore';
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
    
    // Fetch user data from Firestore
    const userDoc = await getDoc(doc(db, 'owners', res.user.uid));
    const userData = userDoc.exists() ? userDoc.data() : null;
    
    return { 
      success: true, 
      user: res.user,
      userData: userData || {
        userId: res.user.uid,
        email: res.user.email,
        ownerName: 'Owner',
        businessName: 'My Business',
        role: 'owner'
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Fetch data from Firestore for current user
export const fetchUserDataFromCloud = async (userId) => {
  try {
    const data = {};
    
    // Fetch villages
    const villagesQuery = query(collection(db, 'villages'), where('ownerId', '==', userId));
    const villagesSnapshot = await getDocs(villagesQuery);
    data.villages = villagesSnapshot.docs.map(doc => doc.data());
    
    // Fetch agents
    const agentsQuery = query(collection(db, 'agents'), where('ownerId', '==', userId));
    const agentsSnapshot = await getDocs(agentsQuery);
    data.agents = agentsSnapshot.docs.map(doc => doc.data());
    
    // Fetch products
    const productsQuery = query(collection(db, 'products'), where('ownerId', '==', userId));
    const productsSnapshot = await getDocs(productsQuery);
    data.products = productsSnapshot.docs.map(doc => doc.data());
    
    // Fetch customers
    const customersQuery = query(collection(db, 'customers'), where('ownerId', '==', userId));
    const customersSnapshot = await getDocs(customersQuery);
    data.customers = customersSnapshot.docs.map(doc => doc.data());
    
    // Fetch sales
    const salesQuery = query(collection(db, 'sales'), where('ownerId', '==', userId));
    const salesSnapshot = await getDocs(salesQuery);
    data.sales = salesSnapshot.docs.map(doc => doc.data());
    
    // Fetch collections
    const collectionsQuery = query(collection(db, 'collections'), where('ownerId', '==', userId));
    const collectionsSnapshot = await getDocs(collectionsQuery);
    data.collections = collectionsSnapshot.docs.map(doc => doc.data());
    
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching data from cloud:", error);
    return { success: false, error: error.message };
  }
};

// Generic function to add/update documents
export const addToFirestore = async (collectionName, data) => {
  try {
    if (!data.id) {
      return { success: false, error: 'Data must have an id field' };
    }
    
    await setDoc(doc(db, collectionName, data.id), {
      ...data,
      syncedAt: Date.now()
    });
    return { success: true };
  } catch (error) {
    console.error(`Error saving to ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

// Save functions
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
    return { success: false, error: error.message };
  }
};

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
    return { success: false, error: error.message };
  }
};

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
    return { success: false, error: error.message };
  }
};

// Save other data types
export const saveCustomerToCloud = async (customerData, ownerId) => {
  try {
    await setDoc(doc(db, 'customers', customerData.id), {
      ...customerData,
      ownerId: ownerId,
      syncedAt: Date.now()
    });
    return { success: true };
  } catch (error) {
    console.error("Cloud Error saving customer:", error);
    return { success: false, error: error.message };
  }
};

export const saveSaleToCloud = async (saleData, ownerId) => {
  try {
    await setDoc(doc(db, 'sales', saleData.id), {
      ...saleData,
      ownerId: ownerId,
      syncedAt: Date.now()
    });
    return { success: true };
  } catch (error) {
    console.error("Cloud Error saving sale:", error);
    return { success: false, error: error.message };
  }
};

export const saveCollectionToCloud = async (collectionData, ownerId) => {
  try {
    await setDoc(doc(db, 'collections', collectionData.id), {
      ...collectionData,
      ownerId: ownerId,
      syncedAt: Date.now()
    });
    return { success: true };
  } catch (error) {
    console.error("Cloud Error saving collection:", error);
    return { success: false, error: error.message };
  }
};