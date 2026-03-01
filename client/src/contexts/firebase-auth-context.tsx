import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  auth,
  firebaseEnabled,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutUser,
  resetPassword,
  getUserProfile,
  completeGoogleSignUp,
  UserProfile,
  UserRole
} from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// ── Types ──────────────────────────────────────────────────────────────────────

interface AuthUser {
  user: User | null;
  profile: UserProfile | null;
  isNewUser?: boolean;
}

interface AuthContextType {
  currentUser: AuthUser;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole, additionalData?: any) => Promise<void>;
  googleLogin: () => Promise<AuthUser>;
  completeGoogleRegistration: (user: User, role: UserRole, additionalData?: any) => Promise<void>;
  logout: () => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
}

const FirebaseAuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Fetch profile but resolve null after 5 s so we never hang. */
async function getProfileWithTimeout(uid: string): Promise<UserProfile | null> {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
  return Promise.race([getUserProfile(uid), timeout]);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser>({ user: null, profile: null });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Ref to prevent onAuthStateChanged from overwriting a profile that login() just set.
  // When login()/register() sets a profile we raise this flag; onAuthStateChanged skips its
  // own Firestore call for that one event and clears the flag.
  const skipNextAuthStateProfile = useRef(false);

  // ── Single source of truth: onAuthStateChanged ────────────────────────────
  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (skipNextAuthStateProfile.current) {
          // login()/register() already fetched and set the profile — skip double fetch.
          skipNextAuthStateProfile.current = false;
          setIsLoading(false);
          return;
        }
        try {
          const profile = await getProfileWithTimeout(user.uid);
          setCurrentUser({ user, profile });
        } catch {
          setCurrentUser({ user, profile: null });
        }
      } else {
        setCurrentUser({ user: null, profile: null });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await loginWithEmail(email, password);
      // Fetch profile ourselves so the dashboard renders immediately and
      // onAuthStateChanged doesn't do a double Firestore read.
      const profile = await getProfileWithTimeout(user.uid);
      skipNextAuthStateProfile.current = true;
      setCurrentUser({ user, profile });

      toast({
        title: "Login successful",
        description: `Welcome back, ${profile?.displayName || user.displayName || email}!`,
      });
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
      throw error;
    }
    // NOTE: do NOT call setIsLoading(false) here — onAuthStateChanged will do it
    // (or the skip branch above already did).
  };

  // ── register ──────────────────────────────────────────────────────────────
  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    additionalData?: any
  ) => {
    setIsLoading(true);
    try {
      const user = await registerWithEmail(email, password, name, role, additionalData);

      // Sync profile to backend so MongoDB user is bridged immediately
      try {
        await apiRequest("POST", "/api/auth/sync-profile", { displayName: name, ...additionalData });
      } catch (err: any) {
        console.warn("Failed to sync new profile to backend", err.message);
      }

      const profile = await getProfileWithTimeout(user.uid);
      skipNextAuthStateProfile.current = true;
      setCurrentUser({ user, profile });

      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`,
      });
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again",
        variant: "destructive",
      });
      throw error;
    }
  };

  // ── Google login ──────────────────────────────────────────────────────────
  const googleLogin = async (): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();

      if (result.isNewUser) {
        // New user — don't update currentUser yet, wait for role selection
        setIsLoading(false);
        return { user: result.user, profile: null, isNewUser: true };
      }

      skipNextAuthStateProfile.current = true;
      setCurrentUser({ user: result.user, profile: result.profile });

      toast({
        title: "Login successful",
        description: `Welcome back, ${result.profile?.displayName}!`,
      });

      return { user: result.user, profile: result.profile, isNewUser: false };
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Google login failed",
        description: error.message || "An error occurred during Google login",
        variant: "destructive",
      });
      throw error;
    }
  };

  // ── completeGoogleRegistration ─────────────────────────────────────────────
  const completeGoogleRegistration = async (
    user: User,
    role: UserRole,
    additionalData?: any
  ) => {
    setIsLoading(true);
    try {
      const userData = await completeGoogleSignUp(user, role, additionalData);

      // Sync profile to backend after completing google sign up
      try {
        await apiRequest("POST", "/api/auth/sync-profile", { displayName: userData.displayName, ...additionalData });
      } catch (err: any) {
        console.warn("Failed to sync google profile to backend", err.message);
      }

      skipNextAuthStateProfile.current = true;
      setCurrentUser({ user, profile: userData });

      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.displayName}!`,
      });
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred completing your registration",
        variant: "destructive",
      });
      throw error;
    }
  };

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await logoutUser();
      setCurrentUser({ user: null, profile: null });
      toast({ title: "Logged out", description: "You have been successfully logged out." });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
      throw error;
    }
  };

  // ── resetUserPassword ─────────────────────────────────────────────────────
  const resetUserPassword = async (email: string) => {
    try {
      await resetPassword(email);
      toast({
        title: "Password reset email sent",
        description: "Check your email for password reset instructions",
      });
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message || "An error occurred sending the reset email",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    isLoading,
    login,
    register,
    googleLogin,
    completeGoogleRegistration,
    logout,
    resetUserPassword,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error("useFirebaseAuth must be used within a FirebaseAuthProvider");
  }
  return context;
};