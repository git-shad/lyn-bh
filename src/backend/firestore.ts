import { db as dexie } from './db'
import { Dexie } from 'dexie'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { collection, doc, setDoc, getDoc, getDocs, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDipb6CMvCJxVcENxVoWtWmm70Pb-4VO9A",
  authDomain: "lyn-bh.firebaseapp.com",
  projectId: "lyn-bh",
  storageBucket: "lyn-bh.firebasestorage.app",
  messagingSenderId: "236545334685",
  appId: "1:236545334685:web:ddc227a81b2a04548ba374",
  measurementId: "G-QTGPFEY8KL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Sync a specific table to Firestore
async function syncTable<T extends { [x: string]: any }>(table: Dexie.Table<T, any>, collectionName: string) {
  try {
    const items = await table.toArray();

    for (const item of items) {
      if (!item.id) continue;

      const docRef = doc(db, collectionName, item.id.toString());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await setDoc(docRef, item, { merge: true });
        console.log(`Updated item in ${collectionName}:`, item);
      } else {
        await setDoc(docRef, item);
        console.log(`Added item to ${collectionName}:`, item);
      }
    }
  } catch (error) {
    console.error(`Error syncing data to ${collectionName}:`, error);
  }
 }

 // Sync all tables
async function syncAllTables() {
   await syncTable(dexie.tenants, 'tenants');
   await syncTable(dexie.storage, 'storage');
   await syncTable(dexie.history, 'history');
   await syncTable(dexie.hebills, 'hebills');
   console.log('All tables synced to Firestore');
 }

 // Retrieve all data from a Firestore collection and store it in Dexie
async function getAllDataAndStore<T extends { [x: string]: any }>(collectionName: string, table: Dexie.Table<T, any>) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as unknown as T));

    await table.bulkPut(data);
    console.log(`Data from ${collectionName} stored in Dexie:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching and storing data from ${collectionName}:`, error);
    return [];
  }
}

// Retrieve and store all data from all collections into Dexie
async function syncFirestoreToDexie() {
  await getAllDataAndStore('tenants', dexie.tenants);
  await getAllDataAndStore('storage', dexie.storage);
  await getAllDataAndStore('history', dexie.history);
  await getAllDataAndStore('hebills', dexie.hebills);

  console.log('All data from Firestore synced to Dexie');
}

 
 export {syncAllTables,syncFirestoreToDexie}