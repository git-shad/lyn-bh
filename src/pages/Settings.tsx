import React, { useEffect, useState, useCallback } from 'react'
import { Box,FormControlLabel,Switch, Paper } from '@mui/material'

import { db as dexie } from '../backend/db'
import { Dexie } from 'dexie'
import { initializeApp } from "firebase/app";
import { collection, doc, setDoc, getDoc, getDocs, getFirestore, deleteDoc } from 'firebase/firestore';

interface FirebaseConfig {
   apiKey: string;
   authDomain: string;
   projectId: string;
   storageBucket: string;
   messagingSenderId: string;
   appId: string;
   measurementId: string;
}

const firebaseConfig: FirebaseConfig = {
   apiKey: "AIzaSyDipb6CMvCJxVcENxVoWtWmm70Pb-4VO9A",
   authDomain: "lyn-bh.firebaseapp.com",
   projectId: "lyn-bh",
   storageBucket: "lyn-bh.firebasestorage.app",
   messagingSenderId: "236545334685",
   appId: "1:236545334685:web:ddc227a81b2a04548ba374",
   measurementId: "G-QTGPFEY8KL"
}

const app = initializeApp(firebaseConfig);
const firestoreDB = getFirestore(app);

// Sync a specific table to Firestore
const syncTable = async <T extends { [x: string]: any }>(firestore: any, table: Dexie.Table<T, any>, collectionName: string) => {
   try {
      const items = await table.toArray();

      for (const item of items) {
         if (!item.id) continue;

         const docRef = doc(firestore, collectionName, item.id.toString());
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
};

const syncAllTables = async (firestore: any) => {
   await syncTable(firestore, dexie.tenants, 'tenants');
   await syncTable(firestore, dexie.storage, 'storage');
   await syncTable(firestore, dexie.history, 'history');
   await syncTable(firestore, dexie.hebills, 'hebills');
   console.log('All tables synced to Firestore');
};

const getAllDataAndStore = async <T extends { [x: string]: any }>(firestore: any, collectionName: string, table: Dexie.Table<T, any>) => {
   try {
      const querySnapshot = await getDocs(collection(firestore, collectionName));
      const data = querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as unknown as T));

      await table.bulkPut(data);
      console.log(`Data from ${collectionName} stored in Dexie:`, data);
      return data;
   } catch (error) {
      console.error(`Error fetching and storing data from ${collectionName}:`, error);
      return [];
   }
};

const syncFirestoreToDexie = async (firestore: any) => {
   await getAllDataAndStore(firestore, 'tenants', dexie.tenants);
   await getAllDataAndStore(firestore, 'storage', dexie.storage);
   await getAllDataAndStore(firestore, 'history', dexie.history);
   await getAllDataAndStore(firestore, 'hebills', dexie.hebills);

   console.log('All data from Firestore synced to Dexie');
};

// Delete from Firestore when data is deleted from Dexie
const deleteFromFirestore = async (firestore: any, collectionName: string, id: number) => {
   try {
      const docRef = doc(firestore, collectionName, id.toString());
      await deleteDoc(docRef);
      console.log(`Deleted item with id ${id} from ${collectionName}`);
   } catch (error) {
      console.error(`Error deleting item from ${collectionName}:`, error);
   }
};

const Settings = ()=>{
   const [isSync, setIsSync] = useState<boolean>(false);
   const [isRetrieve, setIsRetrieve] = useState<boolean>(false);

   useEffect(() => {
      (async () => {
         const syncdb = await dexie.settings.get('syncdb');
         setIsSync(syncdb?.value ?? false);

         const retrievedb = await dexie.settings.get('retrievedb');
         setIsRetrieve(retrievedb?.value ?? false);
      })();
   }, []);

   const handleSyncData = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target;
      await dexie.settings.update('syncdb', { value: checked });
      setIsSync(checked);
   }, []);

   const handleRetrieveData = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target;
      await dexie.settings.update('retrievedb', { value: checked });
      setIsRetrieve(checked);
   }, []);

   return (
      <Box className='flex flex-col gap-2 p-2'>
         <Paper className='p-2'>
         <FormControlLabel 
            control={<Switch checked={isSync} onChange={handleSyncData} />} 
            label="Syncing Data Changes" 
            labelPlacement='end'
         />
         </Paper>
         <Paper className='p-2'>
         <FormControlLabel 
            control={<Switch checked={isRetrieve} onChange={handleRetrieveData} />} 
            label='Retrieve Data' 
            labelPlacement='end'
         />
         </Paper>
      </Box>
   )
}

export { syncAllTables, syncFirestoreToDexie, deleteFromFirestore,firestoreDB }
export default Settings