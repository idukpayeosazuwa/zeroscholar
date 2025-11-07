import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyCF1krootJY66uvz8BtF9a9bLzk1fIL6tU",
  authDomain: "note-app-dev-5e0ca.firebaseapp.com",
  projectId: "note-app-dev-5e0ca",
  storageBucket: "note-app-dev-5e0ca.firebasestorage.app",
  messagingSenderId: "863411975839",
  appId: "1:863411975839:web:9c781afa0fd428e23dd4aa",
  measurementId: "G-8HVWL0QT4Y"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };