// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHTntZT_4QWzrTLo6YMI_zpSamXPcgZJw",
  authDomain: "e-learning-549db.firebaseapp.com",
  projectId: "e-learning-549db",
  storageBucket: "e-learning-549db.firebasestorage.app",
  messagingSenderId: "421378472648",
  appId: "1:421378472648:web:a38c8d1bc2de9fe3f103fd",
  measurementId: "G-GKBZNJ2GXB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
