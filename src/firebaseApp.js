
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDuOYjSaOqidATctXIcYcAs9XjTIH-9-A0",
    authDomain: "sharedtodolist-8f1ec.firebaseapp.com",
    projectId: "sharedtodolist-8f1ec",
    storageBucket: "sharedtodolist-8f1ec.firebasestorage.app",
    messagingSenderId: "458181410474",
    appId: "1:458181410474:web:d0171735db688704d89ad3"
};

export const firebaseApp = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
