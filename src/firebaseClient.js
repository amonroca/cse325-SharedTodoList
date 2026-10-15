
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "firebase/auth";

import { auth } from "./firebaseApp.js";

export {
    fetchCurrentUser,
    createUserProfile,
    ensureUserProfile, 
    fetchMyLists
} from "./dataConnect.js";

const googleProvider = new GoogleAuthProvider();

// Authenticate with Google.
export async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);

    return await result.user.getIdToken();
}

// Create an ASP.NET Core authentication session.
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
        throw new Error(
            "Unable to establish an authenticated session."
        );
    }

    return true;
}

// Sign out from Firebase Authentication.
export async function signOutFromGoogle() {
    await signOut(auth);
}

// Sign out from both ASP.NET Core and Firebase.
export async function signOutSession() {
    const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin"
    });

    if (!response.ok) {
        throw new Error(
            "Unable to sign out from the server."
        );
    }

    await signOut(auth);

    window.location.replace("/login");
}
