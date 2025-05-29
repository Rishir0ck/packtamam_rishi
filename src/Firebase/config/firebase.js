// config/firebase.js
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyApl7ShTZKCahBSt9sWweYDChLJERiwQ-4",
  authDomain: "pack-tamam-41980.firebaseapp.com",
  projectId: "pack-tamam-41980",
  storageBucket: "pack-tamam-41980.firebasestorage.app",
  messagingSenderId: "1026708823082",
  appId: "1:1026708823082:web:064376de43cca352f37753",
  measurementId: "G-PEKG3GH10Q"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export default app;
export const auth = getAuth(app);