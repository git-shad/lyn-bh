import { useEffect, useState, useCallback } from 'react'
import { Box,FormControlLabel,Switch, Paper } from '@mui/material'

import { db as dexie, useLiveQuery } from '../backend/db'
import { Dexie } from 'dexie'
import { initializeApp } from "firebase/app";
import { collection, doc, setDoc, getDoc, getDocs, getFirestore } from 'firebase/firestore';
import axios from 'axios'

interface FirebaseConfig {
   apiKey: string;
   authDomain: string;
   projectId: string;
   storageBucket: string;
   messagingSenderId: string;
   appId: string;
   measurementId: string;
}

const Settings = ()=>{
   const [firestore,setFirestore] = useState<any>()

   useEffect(()=>{
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
      const db = getFirestore(app);
      setFirestore(db);
   })
 
    // Sync a specific table to Firestore
   const syncTable = useCallback(async <T extends { [x: string]: any }>(table: Dexie.Table<T, any>, collectionName: string) => {
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
   }, [firestore]);
   
   const syncAllTables = useCallback(async () => {
     await syncTable(dexie.tenants, 'tenants');
     await syncTable(dexie.storage, 'storage');
     await syncTable(dexie.history, 'history');
     await syncTable(dexie.hebills, 'hebills');
     console.log('All tables synced to Firestore');
   }, [syncTable]);
   
   const getAllDataAndStore = useCallback(async <T extends { [x: string]: any }>(collectionName: string, table: Dexie.Table<T, any>) => {
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
   }, [firestore]);
   
   const syncFirestoreToDexie = useCallback(async () => {
     await getAllDataAndStore('tenants', dexie.tenants);
     await getAllDataAndStore('storage', dexie.storage);
     await getAllDataAndStore('history', dexie.history);
     await getAllDataAndStore('hebills', dexie.hebills);
   
     console.log('All data from Firestore synced to Dexie');
   }, [getAllDataAndStore]);

   return (
      <Box className='flex flex-col gap-2 p-2'>
          <Paper className='p-2'>
            <FormControlLabel 
               value='bottom' 
               control={<Switch onChange={(e) => e.target.checked ? syncAllTables() : ''} />} 
               label="Syncing Data Change's" 
               labelPlacement='end'
            />
          </Paper>
         <Paper className='p-2'>
            <FormControlLabel value='bottom' control={<Switch/>} label='Retrive Data' labelPlacement='end'/>
         </Paper>
      </Box>
   )
}

export default Settings