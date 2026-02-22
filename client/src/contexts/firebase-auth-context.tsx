import React, { createContext, useContext, useEffect, useState } from "react";
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

// Extended user data type
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

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser>({ user: null, profile: null });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // If Firebase is not configured, skip auth and mark as loaded
    if (!firebaseEnabled || !auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Add timeout to prevent hanging when Firestore is offline
          const profilePromise = getUserProfile(user.uid);
          const timeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), 5000)
          );
          const profile = await Promise.race([profilePromise, timeoutPromise]);
          setCurrentUser({ user, profile });
        } catch (error) {
          console.error("Error getting user profile:", error);
          setCurrentUser({ user, profile: null });
        }
      } else {
        setCurrentUser({ user: null, profile: null });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const user = await loginWithEmail(email, password);
      const profile = await getUserProfile(user.uid);
      setCurrentUser({ user, profile });

      toast({
        title: "Login successful",
        description: `Welcome back, ${profile?.displayName || user.displayName || email}!`,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    additionalData?: any
  ) => {
    try {
      setIsLoading(true);
      const user = await registerWithEmail(email, password, name, role, additionalData);
      const profile = await getUserProfile(user.uid);
      setCurrentUser({ user, profile });

      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`,
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async () => {
    try {
      setIsLoading(true);
      const result = await loginWithGoogle();

      if (result.isNewUser) {
        return {
          user: result.user,
          profile: null,
          isNewUser: true
        };
      } else {
        setCurrentUser({
          user: result.user,
          profile: result.profile
        });

        toast({
          title: "Login successful",
          description: `Welcome back, ${result.profile?.displayName}!`,
        });

        return {
          user: result.user,
          profile: result.profile,
          isNewUser: false
        };
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Google login failed",
        description: error.message || "An error occurred during Google login",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeGoogleRegistration = async (
    user: User,
    role: UserRole,
    additionalData?: any
  ) => {
    try {
      setIsLoading(true);
      const userData = await completeGoogleSignUp(user, role, additionalData);
      setCurrentUser({
        user,
        profile: userData
      });

      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.displayName}!`,
      });
    } catch (error: any) {
      console.error("Google registration completion error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred completing your registration",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await logoutUser();
      setCurrentUser({ user: null, profile: null });

      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetUserPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await resetPassword(email);

      toast({
        title: "Password reset email sent",
        description: "Check your email for password reset instructions",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Password reset failed",
        description: error.message || "An error occurred sending the reset email",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
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