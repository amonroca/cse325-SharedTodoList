
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDuOYjSaOqidATctXIcYcAs9XjTIH-9-A0",
    authDomain: "sharedtodolist-8f1ec.firebaseapp.com",
    projectId: "sharedtodolist-8f1ec",
    storageBucket: "sharedtodolist-8f1ec.firebasestorage.app",
    messagingSenderId: "458181410474",
    appId: "1:458181410474:web:d0171735db688704d89ad3"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// Authenticate with Google
export async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);

    return await result.user.getIdToken();
}

// Sign out from Firebase
export async function signOutFromGoogle() {
    await signOut(auth);
}


export async function createServerSession(idToken) {
    const response = await fetch("/api/auth/session", {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
        throw new Error("Unable to establish an authenticated session.");
    }

    return true;
}


export async function signOutSession() {
    const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin"
    });

    if (!response.ok) {
        throw new Error("Unable to sign out from the server.");
    }

    await signOut(auth);

    window.location.replace("/login");
}
