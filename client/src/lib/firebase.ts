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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

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
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
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