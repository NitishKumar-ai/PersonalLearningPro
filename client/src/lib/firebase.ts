import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Graceful fallback: allow running without Firebase credentials
export const firebaseEnabled =
  !!firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith("AIza");

if (!firebaseEnabled) {
  console.warn(
    "⚠️  Firebase is not configured. Auth features will be disabled.\n" +
    "   To enable Firebase, copy .env.example to .env and fill in your credentials.\n" +
    "   See README.md for details."
  );
}

// Initialize Firebase only when credentials are present
const app = firebaseEnabled ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = firebaseEnabled
  ? new GoogleAuthProvider()
  : null;

// User role types
export type UserRole = 'principal' | 'admin' | 'teacher' | 'student' | 'parent';

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  institutionId?: string;
  classId?: string;
  studentId?: string; // For parents
  subjects?: string[]; // For teachers
  createdAt?: any;
  lastLogin?: any;
}

// Authentication functions
export const loginWithEmail = async (email: string, password: string) => {
  if (!firebaseEnabled || !auth || !db) throw new Error("Firebase is not configured");
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await updateDoc(doc(db, "users", userCredential.user.uid), {
      lastLogin: serverTimestamp(),
    });
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in with email:", error);
    throw error;
  }
};

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  role: UserRole,
  additionalData: Partial<UserProfile> = {}
) => {
  if (!firebaseEnabled || !auth || !db) throw new Error("Firebase is not configured");
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    const userData: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      displayName,
      role,
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      ...additionalData
    };

    await setDoc(doc(db, "users", user.uid), userData);

    return user;
  } catch (error) {
    console.error("Error registering with email:", error);
    throw error;
  }
};

export const loginWithGoogle = async () => {
  if (!firebaseEnabled || !auth || !db || !googleProvider) throw new Error("Firebase is not configured");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      // First time Google login - redirect to role selection
      // We'll handle this in the UI
      return {
        user,
        profile: null,
        isNewUser: true
      };
    } else {
      // Existing user - update last login
      await updateDoc(doc(db, "users", user.uid), {
        lastLogin: serverTimestamp(),
      });
      const userData = userDoc.data() as UserProfile;
      return {
        user,
        profile: userData,
        isNewUser: false
      };
    }
  } catch (error) {
    console.error("Error logging in with Google:", error);
    throw error;
  }
};

export const completeGoogleSignUp = async (
  user: User,
  role: UserRole,
  additionalData: Partial<UserProfile> = {}
) => {
  if (!firebaseEnabled || !db) throw new Error("Firebase is not configured");
  try {
    const userData: UserProfile = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      role,
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      ...additionalData
    };

    await setDoc(doc(db, "users", user.uid), userData);

    return userData;
  } catch (error) {
    console.error("Error completing Google sign up:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  if (!firebaseEnabled || !auth) throw new Error("Firebase is not configured");
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  if (!firebaseEnabled || !auth) throw new Error("Firebase is not configured");
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!firebaseEnabled || !db) return null;
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};