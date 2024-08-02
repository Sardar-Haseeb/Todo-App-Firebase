// js/firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCMiqJ5Zlso1bGvDy3L5Na49b2eFzQZZC4",
    authDomain: "smit-learning-22.firebaseapp.com",
    projectId: "smit-learning-22",
    storageBucket: "smit-learning-22.appspot.com",
    messagingSenderId: "19440605166",
    appId: "1:19440605166:web:af0a76492ec2366a8a20ff"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// export { auth, db };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };