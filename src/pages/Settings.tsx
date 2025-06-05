import React, { useEffect, useState, useCallback } from 'react'
import { Box,FormControlLabel,Switch, Paper, Alert} from '@mui/material'
import { db as dexie } from '../backend/db'
import { Dexie } from 'dexie'
import { initializeApp } from "firebase/app";
import { collection, doc, setDoc, getDoc, getDocs, getFirestore, deleteDoc } from 'firebase/firestore';
import { isOnline } from '../backend/Online'

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
const firestore = getFirestore(app);

const syncAllTables = async () => {
   const syncTable = async <T extends { [x: string]: any }>(table: Dexie.Table<T, any>, collectionName: string, keyField: string) => {
      try {
         const items = await table.toArray();
   
         for (const item of items) {
            const itemId = item[keyField];
            if (!itemId) continue
   
            const docRef = doc(firestore, collectionName, itemId.toString());
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

   const isConnected = await isOnline();
   if (!isConnected) {
      console.log('No internet connection. Syncing to Firestore is skipped.');
      return;
   }
   
   await syncTable(dexie.tenants, 'tenants', 'id');
   await syncTable(dexie.storage, 'storage', 'key');
   await syncTable(dexie.history, 'history', 'tenant_id');
   await syncTable(dexie.hebills, 'hebills', 'id');   
   console.log('All tables synced to Firestore');
};

const syncFirestoreToDexie = async () => {
   const getAllDataAndStore = async <T extends { [x: string]: any }>( collectionName: string, table: Dexie.Table<T, any>, keyField: string ) => {
      try {
         const querySnapshot = await getDocs(collection(firestore, collectionName))
         const data = querySnapshot.docs.map(doc => ({
            [keyField]: doc.id, 
            ...doc.data()
         } as unknown as T));

         await table.bulkPut(data);
         console.log(`Data from ${collectionName} stored in Dexie:`, data);
         return data;
      } catch (error) {
         console.error(`Error fetching and storing data from ${collectionName}:`, error);
         return [];
      }
   };

   const isConnected = await isOnline();
   if (!isConnected) { 
      console.log('No internet connection. Syncing to Firestore is skipped.');
      return;
   }

   await getAllDataAndStore('tenants', dexie.tenants, 'id');
   await getAllDataAndStore('storage', dexie.storage, 'key');
   await getAllDataAndStore('history', dexie.history, 'tenant_id');
   await getAllDataAndStore('hebills', dexie.hebills, 'id');
   console.log('All data from Firestore synced to Dexie');
};


const deleteTenantAndHistory = async (id: number)=>{
   // Delete from Firestore when data is deleted from Dexie
   const deleteFromFirestore = async (collectionName: string, id: number) => {
      try {
         const docRef = doc(firestore, collectionName, id.toString());
         await deleteDoc(docRef);
         console.log(`Deleted item with id ${id} from ${collectionName}`);
      } catch (error) {
         console.error(`Error deleting item from ${collectionName}:`, error);
      }
   };

   await deleteFromFirestore('tenants', id);

   // To delete tenant's history, you need to find the document(s) in the 'history' collection
   const historyQuery = collection(firestore, 'history');
   const historySnapshot = await getDocs(historyQuery);
   const historyDocs = historySnapshot.docs.filter(doc => doc.data().tenant_id === id);

   for (const doc of historyDocs) {
      await deleteDoc(doc.ref);
   }
}

const handleResetTenantRecord = async ()=>{
   const db = dexie
   const tenants = await db.tenants.toArray();
   const history = await db.history.toArray();
   const rooms = (await db.storage.get('rooms'))?.value;

   for (const tenant of tenants) {
      await db.tenants.update(tenant.id, { balance: 0, coin: 0, rent_bills: [], water_bills: [], electric_bills: [] });
   }

   for (const record of history) {
      await db.history.update(record.tenant_id, { bills: [] });
   }

   rooms?.map((room: string) => {
      db.storage.update(room, { value: 0 });
   });

   await db.hebills.clear();
   console.log('Tenant records reset');
}

const handleDeleteDB = async () => {
   const deleteDb = async () => {
      const db = dexie;
      await db.transaction('rw', db.tenants, db.history, db.storage, db.hebills, async () => {
         await db.tenants.clear();
         await db.history.clear();
         await db.storage.clear();
         await db.hebills.clear();
      });
      console.log('Database cleared');
      console.log('Database cleared and no re-sync performed to avoid restoring deleted data');
   };
   await deleteDb();
}

const Settings = ()=>{
   const [isSync, setIsSync] = useState<boolean>(false);
   const [isRetrieve, setIsRetrieve] = useState<boolean>(false);
   const [isResetRecord, setIsResetRecord] = useState<boolean>(false)
   const [isResetDB, setIsResetDB] = useState(false)
    
   useEffect(() => {
      (async () => {
         const syncdb = await dexie.settings.get('syncdb');
         setIsSync(syncdb?.value ?? false);

         const retrievedb = await dexie.settings.get('retrievedb');
         setIsRetrieve(retrievedb?.value ?? false);

         const resetRecord = await dexie.settings.get('resetrecord');
         setIsResetRecord(resetRecord?.value ?? false);
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

   const handleResetRecord = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target;
      await dexie.settings.update('resetrecord', { value: checked });
      setIsResetRecord(checked);
   }, []);

   const handleResetDBRecord = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target;
      await dexie.settings.update('deletedb', { value: checked });
      setIsResetDB(checked);
   }, []);

   return (
      <Box className='flex flex-col gap-2 p-2'>
         <Paper className='p-2'>
            <Box className='text-sm text-gray-600'>
               Note: Any changes made here will take effect after restarting the application.
            </Box>
         </Paper>
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
         <Paper className='p-2'>
            <FormControlLabel 
               control={<Switch checked={isResetRecord} onChange={handleResetRecord} />} 
               label='Reset Tenant Record' 
               labelPlacement='end'
            />
            { isResetRecord && (
               <Alert severity="warning">WARNING: Permanent reset tenant's data record</Alert>
            )}
         </Paper>
         <Paper className='p-2'>
            <FormControlLabel 
               control={<Switch checked={isResetDB} onChange={handleResetDBRecord} />} 
               label='Delete Intire data' 
               labelPlacement='end'
            />
            { isResetDB && (
               <Alert severity="error">HAZARD: Permanent delete tenant's data loss imminent</Alert>
            )}
         </Paper>
      </Box>
   )
}

export { syncAllTables, syncFirestoreToDexie, deleteTenantAndHistory, handleResetTenantRecord, handleDeleteDB}
export default Settings