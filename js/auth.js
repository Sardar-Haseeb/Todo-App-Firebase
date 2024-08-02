import { auth, db, storage } from "./firebaseConfig.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

window.signup = async function(event) {
    event.preventDefault();
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const username = document.getElementById("username").value;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const dob = document.getElementById("dob").value;
    const gender = document.getElementById("gender").value;
    const phoneNumber = document.getElementById("phoneNumber").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        localStorage.setItem("userId", user.uid);
        
        // Save additional user information in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email,
            username,
            firstName,
            lastName,
            dob,
            gender,
            phoneNumber
        });

        window.location.href = "index.html";
    } catch (error) {
        console.error("Signup error:", error.message);
    }
};

window.login = async function(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        localStorage.setItem("userId", user.uid);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Login error:", error.message);
    }
};

window.signout = async function() {
    try {
        await signOut(auth);
        localStorage.removeItem("userId");
        window.location.href = "login.html";
    } catch (error) {
        console.error("Signout error:", error.message);
    }
};

window.checkAuth = function() {
    onAuthStateChanged(auth, (user) => {
        if (!user && window.location.pathname !== "/login.html" && window.location.pathname !== "/signup.html") {
            window.location.href = "login.html";
        }
    });
};

window.uploadProfilePic = async function() {
    const userId = localStorage.getItem("userId");
    const fileInput = document.getElementById("profilePicInput");
    const file = fileInput.files[0];

    if (file && userId) {
        try {
            const storageRef = ref(storage, `profile_pictures/${userId}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            
            // Update the user document with the profile picture URL
            await setDoc(doc(db, "users", userId), { profilePic: downloadURL }, { merge: true });
            loadUserProfile();
        } catch (error) {
            console.error("Error uploading profile picture:", error.message);
        }
    }
};
