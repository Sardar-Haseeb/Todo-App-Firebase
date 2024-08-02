import { auth, db, storage } from "./firebaseConfig.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getDownloadURL, ref, uploadBytes, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

async function resizeImage(file, maxSizeKB) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const maxWidth = 800;
                const maxHeight = 800;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const aspectRatio = width / height;
                    if (width > height) {
                        width = maxWidth;
                        height = Math.round(width / aspectRatio);
                    } else {
                        height = maxHeight;
                        width = Math.round(height * aspectRatio);
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(function(blob) {
                    if (blob.size / 1024 > maxSizeKB) {
                        const scaleFactor = maxSizeKB / (blob.size / 1024);
                        resizeImage(blob, scaleFactor * 100).then(resolve).catch(reject);
                    } else {
                        resolve(blob);
                    }
                }, 'image/jpeg', 0.7);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

window.loadUserProfile = async function() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        window.location.href = "login.html";
        return;
    }

    try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            document.getElementById("profileEmail").textContent = userData.email || 'N/A';
            document.getElementById("profileUsername").textContent = userData.username || '';
            document.getElementById("profileFirstName").textContent = userData.firstName || '';
            document.getElementById("profileLastName").textContent = userData.lastName || '';
            document.getElementById("profileDOB").textContent = userData.dob || '';
            document.getElementById("profileGender").textContent = userData.gender || '';
            document.getElementById("profilePhoneNumber").textContent = userData.phoneNumber || '';

            if (userData.profilePic) {
                const profilePicRef = ref(storage, userData.profilePic);
                const profilePicURL = await getDownloadURL(profilePicRef);
                document.getElementById("profilePic").src = profilePicURL;
            }
        }
    } catch (error) {
        console.error("Error loading user profile:", error.message);
    }
};

window.uploadProfilePic = async function() {
    const userId = localStorage.getItem("userId");
    const fileInput = document.getElementById("profilePicInput");
    const file = fileInput.files[0];

    if (file && userId) {
        try {
            // Resize the image if necessary
            const maxSizeKB = 100;
            const resizedBlob = await resizeImage(file, maxSizeKB);

            // Retrieve the current profile picture URL from Firestore
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.data();
            
            if (userData.profilePic) {
                // Delete the previous profile picture from Storage
                const oldProfilePicRef = ref(storage, userData.profilePic);
                await deleteObject(oldProfilePicRef);
            }
            
            // Upload the new profile picture
            const storageRef = ref(storage, `profile_pictures/${userId}`);
            await uploadBytes(storageRef, resizedBlob);
            const downloadURL = await getDownloadURL(storageRef);
            
            // Update the user document with the new profile picture URL
            await updateDoc(userDocRef, { profilePic: downloadURL });
            loadUserProfile();
        } catch (error) {
            console.error("Error uploading profile picture:", error.message);
        }
    }
};

window.editProfile = function() {
    // Switch to edit mode
    document.getElementById("viewMode").style.display = "none";
    document.getElementById("editMode").style.display = "block";

    // Prefill the form with current user data
    document.getElementById("updateUsername").value = document.getElementById("profileUsername").textContent;
    document.getElementById("updateFirstName").value = document.getElementById("profileFirstName").textContent;
    document.getElementById("updateLastName").value = document.getElementById("profileLastName").textContent;
    document.getElementById("updateDOB").value = document.getElementById("profileDOB").textContent;
    document.getElementById("updateGender").value = document.getElementById("profileGender").textContent;
    document.getElementById("updatePhoneNumber").value = document.getElementById("profilePhoneNumber").textContent;
};

window.updateUserProfile = async function() {
    const userId = localStorage.getItem("userId");
    const username = document.getElementById("updateUsername").value;
    const firstName = document.getElementById("updateFirstName").value;
    const lastName = document.getElementById("updateLastName").value;
    const dob = document.getElementById("updateDOB").value;
    const gender = document.getElementById("updateGender").value;
    const phoneNumber = document.getElementById("updatePhoneNumber").value;

    if (!userId) {
        console.error("No user ID");
        return;
    }

    try {
        await updateDoc(doc(db, "users", userId), {
            username,
            firstName,
            lastName,
            dob,
            gender,
            phoneNumber
        });
        loadUserProfile();
        cancelEdit(); // Switch back to view mode
    } catch (error) {
        console.error("Error updating user profile:", error.message);
    }
};

window.cancelEdit = function() {
    // Switch back to view mode
    document.getElementById("viewMode").style.display = "block";
    document.getElementById("editMode").style.display = "none";
};

