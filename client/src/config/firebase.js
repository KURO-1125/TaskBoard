import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCjIyZBws82OW0F78ATxDyFLxrorr4Rg10",
  authDomain: "assignment-28a79.firebaseapp.com",
  projectId: "assignment-28a79",
  storageBucket: "assignment-28a79.firebasestorage.app",
  messagingSenderId: "71408297148",
  appId: "1:71408297148:web:2efb29f6b388414159dcb9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { firebaseConfig };
export default app; 