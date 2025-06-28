// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

//Local
// const firebaseConfig = {
//   apiKey: "AIzaSyApl7ShTZKCahBSt9sWweYDChLJERiwQ-4",
//   authDomain: "pack-tamam-41980.firebaseapp.com",
//   projectId: "pack-tamam-41980",
//   storageBucket: "pack-tamam-41980.firebasestorage.app",
//   messagingSenderId: "1026708823082",
//   appId: "1:1026708823082:web:064376de43cca352f37753",
//   measurementId: "G-PEKG3GH10Q"
// };

//Server
const firebaseConfig = {
  apiKey: "AIzaSyBbNZrnG0WG7QF1UeEhkKRRGSiq6KGhK78",
  authDomain: "pack-tamam-e06cb.firebaseapp.com",
  projectId: "pack-tamam-e06cb",
  storageBucket: "pack-tamam-e06cb.firebasestorage.app",
  messagingSenderId: "791811808129",
  appId: "1:791811808129:web:50e43826e500dbf80d2680",
  measurementId: "G-99SNEQTEGH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;