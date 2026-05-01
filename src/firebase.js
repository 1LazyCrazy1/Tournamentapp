import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCnxoShumfv-v1xaebvOJQshXhREUNU9ck",
  authDomain: "kool-aid-commune-cah.firebaseapp.com",
  databaseURL: "https://kool-aid-commune-cah-default-rtdb.firebaseio.com",
  projectId: "kool-aid-commune-cah",
  storageBucket: "kool-aid-commune-cah.firebasestorage.app",
  messagingSenderId: "220931695069",
  appId: "1:220931695069:web:3d4d872e64ba40cca41634"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
