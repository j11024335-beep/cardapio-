// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// SUBSTITUA PELAS SUAS CONFIGURAÇÕES DO FIREBASE
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAW37sIiJ8WnJNjx8of2klOyToPeh0Bjfk",
  authDomain: "cardapio-bcf38.firebaseapp.com",
  databaseURL: "https://cardapio-bcf38-default-rtdb.firebaseio.com",
  projectId: "cardapio-bcf38",
  storageBucket: "cardapio-bcf38.firebasestorage.app",
  messagingSenderId: "991711198204",
  appId: "1:991711198204:web:ba21d974f5d4d0a21c5079",
  measurementId: "G-QQKN182X35"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };
