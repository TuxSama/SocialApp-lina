import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js"; // For authentication
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"; // For Firestore

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxHmm4Wxie5qNszvBKeLu6I96sRWYmC6c",
  authDomain: "lina-d0bea.firebaseapp.com",
  projectId: "lina-d0bea",
  storageBucket: "lina-d0bea.firebasestorage.app",
  messagingSenderId: "167689123144",
  appId: "1:167689123144:web:c0b5b3f72ef2cdb4e32f7d",
  measurementId: "G-JH1C67XYPZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { auth };