import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
const auth = getAuth(app);


export { firebaseConfig, firestore, auth };