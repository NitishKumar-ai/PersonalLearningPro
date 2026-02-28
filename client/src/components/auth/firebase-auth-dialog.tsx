import { useState, useCallback, useMemo } from "react";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { UserRole } from "@/lib/firebase";
import { User } from "firebase/auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ── SVG Icons ──
const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const AlertIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const MailIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

// ── Password Strength Utility ──
type StrengthLevel = "weak" | "fair" | "strong" | "very-strong";

function getPasswordStrength(password: string): { level: StrengthLevel; label: string } | null {
    if (!password || password.length === 0) return null;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: "weak", label: "Weak" };
    if (score === 2) return { level: "fair", label: "Fair" };
    if (score === 3) return { level: "strong", label: "Strong" };
    return { level: "very-strong", label: "Very Strong" };
}


/**
 * Production-ready authentication dialog with login, registration,
 * forgot-password, and Google sign-in flows.
 */
export function FirebaseAuthDialog() {
    const { login, register, googleLogin, completeGoogleRegistration, resetUserPassword } = useFirebaseAuth();
    const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);
    const [tempGoogleUser, setTempGoogleUser] = useState<User | null>(null);
    const [authTab, setAuthTab] = useState<"login" | "register">("login");

    // ── Visibility toggles ──
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ── Error / loading states ──
    const [loginError, setLoginError] = useState<string | null>(null);
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);

    // ── Forgot password ──
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotSuccess, setForgotSuccess] = useState(false);
    const [forgotError, setForgotError] = useState<string | null>(null);

    // ── Form schemas ──
    const loginSchema = useMemo(() => z.object({
        email: z.string().email({ message: "Please enter a valid email address" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    }), []);

    const registerSchema = useMemo(() => z.object({
        name: z.string().min(2, { message: "Name must be at least 2 characters" }),
        email: z.string().email({ message: "Please enter a valid email address" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters" }),
        confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
        role: z.enum(["student", "teacher", "principal", "admin", "parent"], {
            required_error: "Please select a role",
        }),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    }), []);

    const roleSchema = useMemo(() => z.object({
        role: z.enum(["student", "teacher", "principal", "admin", "parent"], {
            required_error: "Please select a role",
        }),
    }), []);

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const registerForm = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "student" },
    });

    const roleForm = useForm<z.infer<typeof roleSchema>>({
        resolver: zodResolver(roleSchema),
        defaultValues: { role: "student" },
    });

    // ── Password strength for register form ──
    const regPasswordValue = registerForm.watch("password");
    const regConfirmValue = registerForm.watch("confirmPassword");
    const passwordStrength = getPasswordStrength(regPasswordValue);
    const passwordsMatch = regConfirmValue.length > 0 && regPasswordValue === regConfirmValue;
    const passwordsMismatch = regConfirmValue.length > 0 && regPasswordValue !== regConfirmValue;

    // ── Handlers ──
    const onLoginSubmit = useCallback(async (data: z.infer<typeof loginSchema>) => {
        setLoginError(null);
        try {
            await login(data.email, data.password);
        } catch (error: any) {
            setLoginError(error.message || "Login failed. Please try again.");
        }
    }, [login, loginSchema]);

    const onRegisterSubmit = useCallback(async (data: z.infer<typeof registerSchema>) => {
        setRegisterError(null);
        try {
            const additionalData = getRoleSpecificData(data.role);
            await register(data.email, data.password, data.name, data.role as UserRole, additionalData);
        } catch (error: any) {
            setRegisterError(error.message || "Registration failed. Please try again.");
        }
    }, [register, registerSchema]);

    const onRoleSubmit = useCallback(async (data: z.infer<typeof roleSchema>) => {
        if (!tempGoogleUser) return;
        try {
            const additionalData = getRoleSpecificData(data.role);
            await completeGoogleRegistration(tempGoogleUser, data.role as UserRole, additionalData);
            setIsNewGoogleUser(false);
            setTempGoogleUser(null);
        } catch (error) {
            console.error("Google registration completion failed:", error);
        }
    }, [tempGoogleUser, completeGoogleRegistration, roleSchema]);

    function getRoleSpecificData(role: string) {
        switch (role) {
            case "student": return { classId: "10-A" };
            case "teacher": return { subjects: ["Mathematics", "Physics"] };
            case "principal": return { institutionId: "central-high" };
            case "admin": return { institutionId: "central-high" };
            case "parent": return { studentId: "student-123" };
            default: return {};
        }
    }

    const handleGoogleLogin = useCallback(async () => {
        setGoogleLoading(true);
        setLoginError(null);
        setRegisterError(null);
        try {
            const result = await googleLogin();
            if (result.isNewUser) {
                setIsNewGoogleUser(true);
                setTempGoogleUser(result.user);
            }
        } catch (error: any) {
            const msg = error.message || "Google login failed.";
            if (authTab === "login") setLoginError(msg);
            else setRegisterError(msg);
        } finally {
            setGoogleLoading(false);
        }
    }, [googleLogin, authTab]);

    const handleForgotPassword = useCallback(async () => {
        if (!forgotEmail.trim()) {
            setForgotError("Please enter your email address.");
            return;
        }
        setForgotLoading(true);
        setForgotError(null);
        try {
            await resetUserPassword(forgotEmail.trim());
            setForgotSuccess(true);
        } catch (error: any) {
            setForgotError(error.message || "Failed to send reset email.");
        } finally {
            setForgotLoading(false);
        }
    }, [forgotEmail, resetUserPassword]);

    const openForgotModal = useCallback(() => {
        setForgotEmail(loginForm.getValues("email") || "");
        setForgotError(null);
        setForgotSuccess(false);
        setShowForgotModal(true);
    }, [loginForm]);

    const closeForgotModal = useCallback(() => {
        setShowForgotModal(false);
        setForgotEmail("");
        setForgotError(null);
        setForgotSuccess(false);
    }, []);

    // Clear errors when switching tabs
    const switchTab = useCallback((tab: "login" | "register") => {
        setAuthTab(tab);
        setLoginError(null);
        setRegisterError(null);
    }, []);

    // ── Password input helper ──
    const renderPasswordField = (
        fieldProps: any,
        showPw: boolean,
        togglePw: () => void,
        placeholder = "••••••••",
        disabled = false,
    ) => (
        <div className="bb-input-wrap bb-password-wrap">
            <svg className="bb-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
                className="bb-input bb-input--password"
                type={showPw ? "text" : "password"}
                placeholder={placeholder}
                disabled={disabled}
                {...fieldProps}
            />
            <button
                type="button"
                className="bb-password-toggle"
                onClick={togglePw}
                tabIndex={-1}
                aria-label={showPw ? "Hide password" : "Show password"}
            >
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
        </div>
    );

    // ── Google role selection dialog (new Google user) ──
    if (isNewGoogleUser) {
        return (
            <Dialog open={isNewGoogleUser} onOpenChange={(open) => !open && setIsNewGoogleUser(false)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Complete your registration</DialogTitle>
                        <DialogDescription>
                            Please select your role to complete your registration.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...roleForm}>
                        <form onSubmit={roleForm.handleSubmit(onRoleSubmit)} className="space-y-4 pt-4">
                            <FormField
                                control={roleForm.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="student">Student</SelectItem>
                                                <SelectItem value="teacher">Teacher</SelectItem>
                                                <SelectItem value="principal">Principal</SelectItem>
                                                <SelectItem value="admin">Administrator</SelectItem>
                                                <SelectItem value="parent">Parent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">Complete Registration</Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        );
    }

    const isLoginSubmitting = loginForm.formState.isSubmitting;
    const isRegSubmitting = registerForm.formState.isSubmitting;

    return (
        <>
            <div className="bb-wrapper">
                {/* Decorative chalk doodles */}
                <div className="bb-doodle bb-doodle--atom">
                    <svg viewBox="0 0 60 60" fill="none" stroke="#e8e4d9" strokeWidth="1.2">
                        <ellipse cx="30" cy="30" rx="28" ry="10" />
                        <ellipse cx="30" cy="30" rx="28" ry="10" transform="rotate(60 30 30)" />
                        <ellipse cx="30" cy="30" rx="28" ry="10" transform="rotate(120 30 30)" />
                        <circle cx="30" cy="30" r="3" fill="#e8e4d9" />
                    </svg>
                </div>
                <span className="bb-doodle bb-doodle--formula">E = mc²</span>
                <div className="bb-doodle bb-doodle--star">
                    <svg viewBox="0 0 40 40" fill="none" stroke="#e8e4d9" strokeWidth="1.2">
                        <polygon points="20,2 25,15 38,15 27,24 31,38 20,29 9,38 13,24 2,15 15,15" />
                    </svg>
                </div>
                <span className="bb-doodle bb-doodle--pi">π</span>

                {/* Board */}
                <div className="bb-board">
                    <div className="bb-glass">
                        <h1 className="bb-title">Master Plan</h1>
                        <p className="bb-subtitle">AI-powered personalized learning</p>

                        {/* Tab bar */}
                        <div className="bb-tabs">
                            <button
                                type="button"
                                className={`bb-tab ${authTab === "login" ? "bb-tab--active" : ""}`}
                                onClick={() => switchTab("login")}
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                className={`bb-tab ${authTab === "register" ? "bb-tab--active" : ""}`}
                                onClick={() => switchTab("register")}
                            >
                                Register
                            </button>
                        </div>

                        {/* ── LOGIN TAB ── */}
                        {authTab === "login" && (
                            <Form {...loginForm}>
                                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                                    {/* Error Banner */}
                                    {loginError && (
                                        <div className="bb-error-banner">
                                            <AlertIcon />
                                            <span className="bb-error-banner-text">{loginError}</span>
                                        </div>
                                    )}

                                    {/* Email */}
                                    <FormField
                                        control={loginForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="bb-field">
                                                <label className="bb-label">Email</label>
                                                <FormControl>
                                                    <div className="bb-input-wrap">
                                                        <svg className="bb-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                            <circle cx="12" cy="7" r="4" />
                                                        </svg>
                                                        <input
                                                            className="bb-input"
                                                            placeholder="your.email@example.com"
                                                            disabled={isLoginSubmitting}
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="bb-error" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Password */}
                                    <FormField
                                        control={loginForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="bb-field">
                                                <label className="bb-label">Password</label>
                                                <FormControl>
                                                    {renderPasswordField(
                                                        field,
                                                        showLoginPassword,
                                                        () => setShowLoginPassword(p => !p),
                                                        "••••••••",
                                                        isLoginSubmitting
                                                    )}
                                                </FormControl>
                                                <FormMessage className="bb-error" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Remember me / Forgot */}
                                    <div className="bb-options-row">
                                        <label className="bb-checkbox-label">
                                            <input type="checkbox" className="bb-checkbox" />
                                            Remember me
                                        </label>
                                        <button
                                            type="button"
                                            className="bb-forgot"
                                            onClick={openForgotModal}
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    <button type="submit" className="bb-btn" disabled={isLoginSubmitting}>
                                        {isLoginSubmitting ? (
                                            <><span className="bb-spinner" /> Signing in…</>
                                        ) : (
                                            "Sign In"
                                        )}
                                    </button>
                                </form>
                            </Form>
                        )}

                        {/* ── REGISTER TAB ── */}
                        {authTab === "register" && (
                            <Form {...registerForm}>
                                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                                    {/* Error Banner */}
                                    {registerError && (
                                        <div className="bb-error-banner">
                                            <AlertIcon />
                                            <span className="bb-error-banner-text">{registerError}</span>
                                        </div>
                                    )}

                                    {/* Full Name */}
                                    <FormField
                                        control={registerForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="bb-field">
                                                <label className="bb-label">Full Name</label>
                                                <FormControl>
                                                    <div className="bb-input-wrap">
                                                        <svg className="bb-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                            <circle cx="12" cy="7" r="4" />
                                                        </svg>
                                                        <input className="bb-input" placeholder="John Doe" disabled={isRegSubmitting} {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="bb-error" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Email */}
                                    <FormField
                                        control={registerForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="bb-field">
                                                <label className="bb-label">Email</label>
                                                <FormControl>
                                                    <div className="bb-input-wrap">
                                                        <MailIcon />
                                                        <input className="bb-input" placeholder="your.email@example.com" disabled={isRegSubmitting} {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="bb-error" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Password */}
                                    <FormField
                                        control={registerForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="bb-field">
                                                <label className="bb-label">Password</label>
                                                <FormControl>
                                                    {renderPasswordField(
                                                        field,
                                                        showRegPassword,
                                                        () => setShowRegPassword(p => !p),
                                                        "••••••••",
                                                        isRegSubmitting
                                                    )}
                                                </FormControl>
                                                <FormMessage className="bb-error" />
                                                {/* Strength indicator */}
                                                {passwordStrength && (
                                                    <div className="bb-strength">
                                                        <div className="bb-strength-bar">
                                                            <div className={`bb-strength-fill bb-strength-fill--${passwordStrength.level}`} />
                                                        </div>
                                                        <span className="bb-strength-text">{passwordStrength.label}</span>
                                                    </div>
                                                )}
                                            </FormItem>
                                        )}
                                    />

                                    {/* Confirm Password */}
                                    <FormField
                                        control={registerForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem className="bb-field">
                                                <label className="bb-label">Confirm Password</label>
                                                <FormControl>
                                                    {renderPasswordField(
                                                        field,
                                                        showConfirmPassword,
                                                        () => setShowConfirmPassword(p => !p),
                                                        "Re-enter password",
                                                        isRegSubmitting
                                                    )}
                                                </FormControl>
                                                <FormMessage className="bb-error" />
                                                {passwordsMatch && <span className="bb-match-success">✓ Passwords match</span>}
                                                {passwordsMismatch && <span className="bb-match-error">✗ Passwords don't match</span>}
                                            </FormItem>
                                        )}
                                    />

                                    {/* Role */}
                                    <FormField
                                        control={registerForm.control}
                                        name="role"
                                        render={({ field }) => (
                                            <FormItem className="bb-field">
                                                <label className="bb-label">Role</label>
                                                <FormControl>
                                                    <div className="bb-input-wrap">
                                                        <svg className="bb-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                            <circle cx="9" cy="7" r="4" />
                                                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                                        </svg>
                                                        <select
                                                            className="bb-select"
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            disabled={isRegSubmitting}
                                                        >
                                                            <option value="student">Student</option>
                                                            <option value="teacher">Teacher</option>
                                                            <option value="principal">Principal</option>
                                                            <option value="admin">Administrator</option>
                                                            <option value="parent">Parent</option>
                                                        </select>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="bb-error" />
                                            </FormItem>
                                        )}
                                    />

                                    <button type="submit" className="bb-btn" disabled={isRegSubmitting}>
                                        {isRegSubmitting ? (
                                            <><span className="bb-spinner" /> Creating account…</>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </button>
                                </form>
                            </Form>
                        )}

                        {/* Divider */}
                        <div className="bb-divider">
                            <span className="bb-divider-line" />
                            <span className="bb-divider-text">Or continue with</span>
                            <span className="bb-divider-line" />
                        </div>

                        {/* Google */}
                        <button
                            type="button"
                            className="bb-btn-google"
                            onClick={handleGoogleLogin}
                            disabled={googleLoading || isLoginSubmitting || isRegSubmitting}
                        >
                            {googleLoading ? (
                                <><span className="bb-spinner" /> Connecting…</>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                    </svg>
                                    Google
                                </>
                            )}
                        </button>

                        {/* Footer link */}
                        <div className="bb-footer">
                            {authTab === "login" ? (
                                <>Don&apos;t have an account?{" "}
                                    <button type="button" className="bb-footer-link" onClick={() => switchTab("register")}>
                                        Sign Up
                                    </button>
                                </>
                            ) : (
                                <>Already have an account?{" "}
                                    <button type="button" className="bb-footer-link" onClick={() => switchTab("login")}>
                                        Sign In
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="bb-shelf" />
                </div>
            </div>

            {/* ── Forgot Password Modal ── */}
            {showForgotModal && (
                <div className="bb-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeForgotModal()}>
                    <div className="bb-modal">
                        <h2 className="bb-modal-title">Reset Password</h2>
                        <p className="bb-modal-desc">
                            Enter your email address and we&apos;ll send you a link to reset your password.
                        </p>

                        {forgotError && (
                            <div className="bb-error-banner">
                                <AlertIcon />
                                <span className="bb-error-banner-text">{forgotError}</span>
                            </div>
                        )}

                        {forgotSuccess ? (
                            <div className="bb-success-banner">
                                <CheckIcon />
                                <span className="bb-success-banner-text">
                                    Password reset email sent! Check your inbox for instructions.
                                </span>
                            </div>
                        ) : (
                            <div className="bb-field">
                                <label className="bb-label">Email Address</label>
                                <div className="bb-input-wrap">
                                    <MailIcon />
                                    <input
                                        className="bb-input"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        disabled={forgotLoading}
                                        onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="bb-modal-actions">
                            <button type="button" className="bb-btn-secondary" onClick={closeForgotModal}>
                                {forgotSuccess ? "Close" : "Cancel"}
                            </button>
                            {!forgotSuccess && (
                                <button
                                    type="button"
                                    className="bb-btn-primary-sm"
                                    onClick={handleForgotPassword}
                                    disabled={forgotLoading}
                                >
                                    {forgotLoading ? (
                                        <><span className="bb-spinner" /> Sending…</>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}