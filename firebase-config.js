import { initializeApp } from 'firebase/app';
import { getFirestore, serverTimestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD4sWIxV-uQBUkIaBY3JcOAgMrmSdDPees",
  authDomain: "quizeguide.firebaseapp.com",
  projectId: "quizeguide",
  storageBucket: "quizeguide.firebasestorage.app",
  messagingSenderId: "688415775599",
  appId: "1:688415775599:web:0c805d3053eef487eca69a",
  measurementId: "G-MWZD22DB5V"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, serverTimestamp, createUserWithEmailAndPassword };