import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

type AuthState = {
    user: User | null;
    isLoading: boolean;
    error: Error | null;
};

type AuthContextType = {
    state: AuthState;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string, role: string, additionalData: any, username?: string) => Promise<{ userId: number }>;
    verifyOtp: (userId: number, otp: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    resetPassword?: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isLoading: true,
        error: null,
    });

    // Fetch the current user session dynamically via API checking HTTP-Only cookie authenticity
    const { data: user, isLoading, error, refetch } = useQuery<User>({
        queryKey: ["/api/users/me"],
        retry: false, // Don't retry if unauthorized
    });

    useEffect(() => {
        setAuthState({
            user: user || null,
            isLoading,
            error: error as Error,
        });
    }, [user, isLoading, error]);

    const login = async (email: string, password: string) => {
        setAuthState((prev) => ({ ...prev, isLoading: true }));
        try {
            const res = await apiRequest("POST", "/api/auth/login", { email, password });
            const userData = await res.json();
            queryClient.setQueryData(["/api/users/me"], userData);
            setAuthState({ user: userData, isLoading: false, error: null });
        } catch (error) {
            setAuthState((prev) => ({ ...prev, isLoading: false, error: error as Error }));
            throw error;
        }
    };

    const register = async (email: string, password: string, name: string, role: string, additionalData: any, username?: string) => {
        setAuthState((prev) => ({ ...prev, isLoading: true }));
        try {
            const body = {
                email,
                password,
                name,
                role,
                ...additionalData
            };
            if (username) {
                body.username = username;
            } else {
                body.username = email.split('@')[0] + Math.floor(Math.random() * 10000);
            }

            const res = await apiRequest("POST", "/api/auth/register", body);

            const data = await res.json();
            return { userId: data.userId };
        } catch (error) {
            setAuthState((prev) => ({ ...prev, isLoading: false, error: error as Error }));
            throw error;
        } finally {
            setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
    };

    const verifyOtp = async (userId: number, otp: string) => {
        setAuthState((prev) => ({ ...prev, isLoading: true }));
        try {
            await apiRequest("POST", "/api/auth/verify-otp", { userId, otp });
            // Successfully verified OTP. We should now login or at least refresh user state if the backend returns cookies.
            // Our verify-otp does NOT return cookies, so we actually need to login afterwards or modify the backend.
            // For now, we just resolve. The UI will then call `login`.
        } catch (error) {
            setAuthState((prev) => ({ ...prev, isLoading: false, error: error as Error }));
            throw error;
        } finally {
            setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
    };

    const resetPassword = async (email: string) => {
        // Implement backend endpoint logic for this when ready
        // await apiRequest("POST", "/api/auth/reset-password", { email });
        console.log("Reset password requested for", email);
    };

    const logout = async () => {
        try {
            await apiRequest("POST", "/api/auth/logout");
            // Clear local state and query cache
            queryClient.setQueryData(["/api/users/me"], null);
            queryClient.clear();
            setAuthState({ user: null, isLoading: false, error: null });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const refreshUser = async () => {
        try {
            setAuthState((prev) => ({ ...prev, isLoading: true }));
            await refetch();
        } catch (error) {
            console.error("Failed to refresh user:", error);
        } finally {
            setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
    };

    return (
        <AuthContext.Provider
            value={{
                state: authState,
                login,
                register,
                verifyOtp,
                logout,
                refreshUser,
                resetPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
