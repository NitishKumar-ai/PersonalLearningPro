import { useState } from "react";
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

/**
 * Authentication dialog that provides login, registration, and Google sign-in flows,
 * including a modal flow to complete registration for new Google users by selecting a role.
 *
 * @returns The rendered authentication dialog React element.
 */
export function FirebaseAuthDialog() {
    const { login, register, googleLogin, completeGoogleRegistration } = useFirebaseAuth();
    const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);
    const [tempGoogleUser, setTempGoogleUser] = useState<User | null>(null);
    const [authTab, setAuthTab] = useState<"login" | "register">("login");

    // Form schemas
    const loginSchema = z.object({
        email: z.string().email({ message: "Please enter a valid email address" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    });

    const registerSchema = z.object({
        name: z.string().min(2, { message: "Name must be at least 2 characters" }),
        email: z.string().email({ message: "Please enter a valid email address" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters" }),
        role: z.enum(["student", "teacher", "principal", "admin", "parent"], {
            required_error: "Please select a role",
        }),
    });

    const roleSchema = z.object({
        role: z.enum(["student", "teacher", "principal", "admin", "parent"], {
            required_error: "Please select a role",
        }),
    });

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const registerForm = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "student",
        },
    });

    const roleForm = useForm<z.infer<typeof roleSchema>>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            role: "student",
        },
    });

    /**
     * Attempts to sign in using the provided email and password.
     *
     * Logs an error to the console if authentication fails.
     *
     * @param data - Object matching the login schema containing `email` and `password`
     */
    async function onLoginSubmit(data: z.infer<typeof loginSchema>) {
        try {
            await login(data.email, data.password);
        } catch (error) {
            console.error("Login failed:", error);
        }
    }

    /**
     * Creates a new user account using the provided registration form values.
     *
     * @param data - Registration form values: `name`, `email`, `password`, and `role`
     */
    async function onRegisterSubmit(data: z.infer<typeof registerSchema>) {
        try {
            const additionalData = getRoleSpecificData(data.role);
            await register(data.email, data.password, data.name, data.role as UserRole, additionalData);
        } catch (error) {
            console.error("Registration failed:", error);
        }
    }

    /**
     * Finalize a new Google user's registration by submitting their chosen role and associated role-specific data.
     *
     * If no temporary Google user is present this function is a no-op. On successful completion it clears the temporary
     * Google user and exits the new-user flow.
     *
     * @param data - Form values containing the selected `role` to use when completing Google registration
     */
    async function onRoleSubmit(data: z.infer<typeof roleSchema>) {
        if (!tempGoogleUser) return;

        try {
            const additionalData = getRoleSpecificData(data.role);
            await completeGoogleRegistration(tempGoogleUser, data.role as UserRole, additionalData);
            setIsNewGoogleUser(false);
            setTempGoogleUser(null);
        } catch (error) {
            console.error("Google registration completion failed:", error);
        }
    }

    /**
     * Provides role-specific additional data used during registration flows.
     *
     * @param role - Role identifier; expected values: `"student"`, `"teacher"`, `"principal"`, `"admin"`, or `"parent"`.
     * @returns An object containing extra fields required for the given role:
     * - `student`: `{ classId: string }`
     * - `teacher`: `{ subjects: string[] }`
     * - `principal` / `admin`: `{ institutionId: string }`
     * - `parent`: `{ studentId: string }`
     * - other values: an empty object
     */
    function getRoleSpecificData(role: string) {
        switch (role) {
            case "student":
                return { classId: "10-A" };
            case "teacher":
                return { subjects: ["Mathematics", "Physics"] };
            case "principal":
                return { institutionId: "central-high" };
            case "admin":
                return { institutionId: "central-high" };
            case "parent":
                return { studentId: "student-123" };
            default:
                return {};
        }
    }

    /**
     * Initiates the Google sign-in flow and, for first-time Google users, marks the component as requiring completion and stores the temporary Google user.
     *
     * If sign-in fails the error is logged to the console.
     */
    async function handleGoogleLogin() {
        try {
            const result = await googleLogin();

            if (result.isNewUser) {
                setIsNewGoogleUser(true);
                setTempGoogleUser(result.user);
            }
        } catch (error) {
            console.error("Google login failed:", error);
        }
    }

    // New Google user role selection
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
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
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

    return (
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
                            onClick={() => setAuthTab("login")}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            className={`bb-tab ${authTab === "register" ? "bb-tab--active" : ""}`}
                            onClick={() => setAuthTab("register")}
                        >
                            Register
                        </button>
                    </div>

                    {/* ── LOGIN TAB ── */}
                    {authTab === "login" && (
                        <Form {...loginForm}>
                            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
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
                                                <div className="bb-input-wrap">
                                                    <svg className="bb-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                    </svg>
                                                    <input
                                                        className="bb-input"
                                                        type="password"
                                                        placeholder="••••••••"
                                                        {...field}
                                                    />
                                                </div>
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
                                    <button type="button" className="bb-forgot">Forgot password?</button>
                                </div>

                                <button type="submit" className="bb-btn" disabled={loginForm.formState.isSubmitting}>
                                    {loginForm.formState.isSubmitting ? (
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
                                                    <input className="bb-input" placeholder="John Doe" {...field} />
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
                                                    <svg className="bb-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                                    </svg>
                                                    <input className="bb-input" placeholder="your.email@example.com" {...field} />
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
                                                <div className="bb-input-wrap">
                                                    <svg className="bb-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                    </svg>
                                                    <input className="bb-input" type="password" placeholder="••••••••" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="bb-error" />
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

                                <button type="submit" className="bb-btn" disabled={registerForm.formState.isSubmitting}>
                                    {registerForm.formState.isSubmitting ? (
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
                    <button type="button" className="bb-btn-google" onClick={handleGoogleLogin}>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                        </svg>
                        Google
                    </button>

                    {/* Footer link */}
                    <div className="bb-footer">
                        {authTab === "login" ? (
                            <>Don&apos;t have an account?{" "}
                                <button type="button" className="bb-footer-link" onClick={() => setAuthTab("register")}>
                                    Sign Up
                                </button>
                            </>
                        ) : (
                            <>Already have an account?{" "}
                                <button type="button" className="bb-footer-link" onClick={() => setAuthTab("login")}>
                                    Sign In
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div className="bb-shelf" />
            </div>
        </div>
    );
}