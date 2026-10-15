
import { firebaseApp, auth } from "./firebaseApp.js";
import { getDataConnect, QueryFetchPolicy } from "firebase/data-connect";

import {
    connectorConfig,
    getCurrentUser,
    registerUser,
    getMyLists,
} from "./dataconnect-generated/esm/index.esm.js";

const dataConnect = getDataConnect(firebaseApp, connectorConfig);

// Retrieve the authenticated user's profile.

export async function fetchCurrentUser() {
    await auth.authStateReady();

    if (!auth.currentUser) {
        throw new Error("User is not authenticated.");
    }

    const result = await getCurrentUser(dataConnect, {
        fetchPolicy: QueryFetchPolicy.SERVER_ONLY
    });

    return result.data;
}


// Register a new user.
export async function createUserProfile() {
    if (!auth.currentUser) {
        throw new Error("User is not authenticated.");
    }

    const result = await registerUser(dataConnect);

    return result.data;
}


export async function ensureUserProfile() {
    await auth.authStateReady();

    if (!auth.currentUser) {
        throw new Error("User is not authenticated.");
    }

    // Always check the latest user profile on the server.
    const currentUser = await fetchCurrentUser();

    if (currentUser.users.length > 0) {
        return currentUser.users[0];
    }

    // Register the user only when no profile exists.
    try {
        await createUserProfile();
    } catch (error) {
        // The profile may have been created by another request.
        const existingUser = await fetchCurrentUser();

        if (existingUser.users.length > 0) {
            return existingUser.users[0];
        }

        throw error;
    }

    // Retrieve the profile created in PostgreSQL.
    const registeredUser = await fetchCurrentUser();

    if (registeredUser.users.length === 0) {
        throw new Error("Unable to retrieve the registered user.");
    }

    return registeredUser.users[0];
}


export async function fetchMyLists() {
    await auth.authStateReady();

    if (!auth.currentUser) {
        throw new Error("User is not authenticated.");
    }

    // Request the latest lists directly from Data Connect.
    const result = await getMyLists(dataConnect, {
        fetchPolicy: QueryFetchPolicy.SERVER_ONLY
    });

    return result.data;
}


