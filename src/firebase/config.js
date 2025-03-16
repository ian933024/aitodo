import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace these values with your actual Firebase config
// You can find these in your Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyACKf6GW_dmbe-o9nc4aikRBQ6pHe7Zcs8",
  authDomain: "todo-294ca.firebaseapp.com",
  projectId: "todo-294ca",
  storageBucket: "todo-294ca.appspot.com",
  messagingSenderId: "351246285296",
  appId: "1:351246285296:web:485bef43002be634014535",
  measurementId: "G-CCVJ588Z1N",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
