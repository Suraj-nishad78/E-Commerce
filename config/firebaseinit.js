// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";
import {getAuth} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIR_APIKEY,
  authDomain: import.meta.env.VITE_FIR_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIR_PROJECTID,
  storageBucket: import.meta.env.VITE_FIR_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIR_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIR_APPID,
  measurementId: import.meta.env.VITE_FIR_MEASUREMENTID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app)

export const productRef = collection(db, 'products');
export const userRef = collection(db, 'users')
export const orderRef = collection(db, 'orders')
export const cartRef = collection(db, 'cart')