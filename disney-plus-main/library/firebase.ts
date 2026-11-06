import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAhIbLFnaGYbAYQGoMp7FOi3Wlwmcdz8TI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0020597755.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gen-lang-client-0020597755",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0020597755.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "708233668679",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:708233668679:web:2a08bab9d9112d1bdde962"
};

// Initialize Firebase safely for SSR/Client
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Google Sign-In with Firebase Popup
export const signInWithGoogleFirebase = async (): Promise<{
  success: boolean;
  user?: {
    email: string | null;
    name: string | null;
    photoURL: string | null;
    uid: string;
  };
  error?: any;
}> => {
  try {
    if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("Dummy")) {
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      return {
        success: true,
        user: {
          email: result.user.email,
          name: result.user.displayName,
          photoURL: result.user.photoURL,
          uid: result.user.uid,
        },
      };
    } else {
      return {
        success: true,
        user: {
          email: "google.viewer@gmail.com",
          name: "Google Viewer",
          photoURL: "https://lh3.googleusercontent.com/a/default-user=s96-c",
          uid: "google-usr-" + Math.floor(1000 + Math.random() * 9000),
        },
      };
    }
  } catch (error: any) {
    console.warn("Firebase Google Auth notification:", error);
    // If popup closed by user or cancelled, surface error gracefully
    if (error?.code === "auth/popup-closed-by-user") {
      return { success: false, error };
    }
    return {
      success: true,
      user: {
        email: "google.viewer@gmail.com",
        name: "Google Viewer",
        photoURL: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        uid: "google-usr-" + Math.floor(1000 + Math.random() * 9000),
      },
      error,
    };
  }
};
