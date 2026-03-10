import { useState, useCallback, useMemo } from "react";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { UserRole } from "@/lib/firebase";
import { User } from "firebase/auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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

import teacherImg from "@/assets/teacher-illustration.png";
import laptopImg from "@/assets/laptop.png";
import coffeeImg from "@/assets/coffee-mug.png";
import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";

const StudentBubble = ({ color, size = 48, className = "", delay = 0, initials, avatarSrc }: any) => {
    return (
        <motion.div
            className={`z-20 flex items-center justify-center rounded-full border-2 border-card shadow-md overflow-hidden ${className}`}
            style={{ width: size, height: size, backgroundColor: color }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
        >
            {avatarSrc ? (
                <img src={avatarSrc} alt={initials} className="h-full w-full object-cover" />
            ) : (
                <span className="text-xs font-semibold text-secondary-foreground">{initials}</span>
            )}
        </motion.div>
    );
};

const FloatingCard = ({ title, subtitle, progress, tag, className = "", delay = 0 }: any) => {
    return (
        <motion.div
            className={`rounded-2xl bg-card px-5 py-4 shadow-lg shadow-foreground/5 min-w-[160px] z-20 ${className}`}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay }}
        >
            <p className="text-sm font-bold text-card-foreground">{title}</p>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
            {(progress !== undefined || tag) && (
                <div className="mt-2 flex items-center gap-3">
                    {progress !== undefined && (
                        <div className="relative flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={`${progress * 0.88} 88`} strokeLinecap="round" transform="rotate(-90 18 18)" />
                            </svg>
                            <span className="absolute text-[8px] font-bold text-primary">{progress}%</span>
                        </div>
                    )}
                    {tag && <span className="rounded-md border border-input px-2.5 py-1 text-[11px] font-medium text-card-foreground">{tag}</span>}
                </div>
            )}
        </motion.div>
    );
};

const IllustrationPanel = () => {
    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-illustration">
            <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-auto opacity-40" viewBox="0 0 500 120" fill="none">
                <path d="M80 110 Q150 10 250 50 Q350 90 420 20" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M100 100 Q170 30 250 60 Q330 90 400 30" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
            </svg>
            <StudentBubble color="hsl(var(--bubble-1))" initials="AS" avatarSrc={avatar1} className="absolute top-[12%] left-[12%]" delay={0} size={56} />
            <StudentBubble color="hsl(var(--bubble-2))" initials="MK" avatarSrc={avatar2} className="absolute top-[40%] right-[6%]" delay={1} size={52} />
            <div className="relative z-10 flex items-end justify-center">
                <motion.img src={laptopImg} alt="Laptop" className="w-[100px] lg:w-[120px] xl:w-[140px] -mr-4 mb-4 drop-shadow-sm" animate={{ y: [0, -5, 0], rotate: [-1, 1, -1] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
                <motion.img src={teacherImg} alt="AI Teacher" className="w-[240px] lg:w-[300px] xl:w-[340px] drop-shadow-sm" animate={{ scale: [1, 1.015, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
                <motion.img src={coffeeImg} alt="Coffee mug" className="w-[60px] lg:w-[70px] xl:w-[80px] -ml-6 mb-2 drop-shadow-sm" animate={{ y: [0, -4, 0], rotate: [1, -1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} />
            </div>
            <FloatingCard title="AI Flashcards" subtitle="12 created today" progress={84} tag="Study" className="absolute bottom-[28%] left-[8%] lg:left-[10%]" delay={0.3} />
            <div className="flex items-center gap-2 mt-6 relative z-10">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                <span className="h-4 w-4 rounded-full bg-foreground" />
            </div>
            <p className="mt-5 text-center text-base text-foreground relative z-10 px-6">
                Make your learning easier and organized<br />with <span className="font-bold">EduAI</span>
            </p>
        </div>
    );
};

export function FirebaseAuthDialog() {
    const { login, register, googleLogin, completeGoogleRegistration, resetUserPassword } = useFirebaseAuth();
    const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);
    const [tempGoogleUser, setTempGoogleUser] = useState<User | null>(null);
    const [authTab, setAuthTab] = useState<"login" | "register">("login");

    const [loginError, setLoginError] = useState<string | null>(null);
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
    const [isRegSubmitting, setIsRegSubmitting] = useState(false);
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const loginSchema = useMemo(() => z.object({
        email: z.string().email({ message: "Please enter a valid email address" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    }), []);

    const registerSchema = useMemo(() => z.object({
        name: z.string().min(2, { message: "Name must be at least 2 characters" }),
        email: z.string().email({ message: "Please enter a valid email address" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters" }),
        confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
        role: z.enum(["student", "teacher", "principal", "school_admin", "admin", "parent"], {
            required_error: "Please select a role",
        }),
        class: z.string().optional(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    }).refine((data) => data.role !== "student" || !!data.class, {
        message: "Please select a class",
        path: ["class"],
    }), []);

    const roleSchema = useMemo(() => z.object({
        role: z.enum(["student", "teacher", "principal", "school_admin", "admin", "parent"], {
            required_error: "Please select a role",
        }),
        class: z.string().optional(),
    }).refine((data) => data.role !== "student" || !!data.class, {
        message: "Please select a class",
        path: ["class"],
    }), []);

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const registerForm = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "student", class: "12" },
    });

    const roleForm = useForm<z.infer<typeof roleSchema>>({
        resolver: zodResolver(roleSchema),
        defaultValues: { role: "student", class: "12" },
    });

    const selectedGoogleRole = roleForm.watch("role");

    const onLoginSubmit = useCallback(async (data: z.infer<typeof loginSchema>) => {
        setLoginError(null);
        setIsLoginSubmitting(true);
        try {
            await login(data.email, data.password);
        } catch (error: any) {
            const code = error.code || "";
            const firebaseNotConfigured = error.message === "Firebase is not configured";
            if (firebaseNotConfigured || code === "auth/operation-not-allowed" || code === "auth/invalid-login-credentials" || code === "auth/too-many-requests") {
                try {
                    const res = await fetch("/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ email: data.email, password: data.password }),
                    });
                    if (res.ok) {
                        const payload = await res.json();
                        if (payload.token) {
                            localStorage.setItem("auth_token", payload.token);
                            localStorage.setItem("auth_user", JSON.stringify(payload));
                        }
                        window.location.href = "/";
                        return;
                    } else {
                        const errBody = await res.json().catch(() => ({}));
                        setLoginError(errBody.message || "Invalid email or password.");
                        return;
                    }
                } catch (_backendErr) {
                    setLoginError("Login failed. Please check your credentials and try again.");
                    return;
                }
            }
            setLoginError(error.message || "Login failed. Please try again.");
        } finally {
            setIsLoginSubmitting(false);
        }
    }, [login, loginSchema]);

    const getRoleSpecificData = (role: string, data?: any) => {
        switch (role) {
            case "student": return { classId: data?.class || "12" };
            case "teacher": return { subjects: ["Mathematics", "Physics"] };
            case "principal": return { institutionId: "central-high" };
            case "school_admin": return { institutionId: "central-high" };
            case "admin": return { institutionId: "central-high" };
            case "parent": return { studentId: "student-123" };
            default: return {};
        }
    };

    const onRegisterSubmit = useCallback(async (data: z.infer<typeof registerSchema>) => {
        setRegisterError(null);
        setIsRegSubmitting(true);
        try {
            const additionalData = getRoleSpecificData(data.role, data);
            await register(data.email, data.password, data.name, data.role as UserRole, additionalData);
        } catch (error: any) {
            const code = error.code || "";
            const firebaseNotConfigured = error.message === "Firebase is not configured";
            if (firebaseNotConfigured || code === "auth/operation-not-allowed") {
                try {
                    const res = await fetch("/api/auth/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            name: data.name,
                            email: data.email,
                            password: data.password,
                            role: data.role,
                            class: data.class,
                        }),
                    });
                    if (res.ok) {
                        const loginRes = await fetch("/api/auth/login", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ email: data.email, password: data.password }),
                        });
                        if (loginRes.ok) {
                            const payload = await loginRes.json();
                            if (payload.token) {
                                localStorage.setItem("auth_token", payload.token);
                                localStorage.setItem("auth_user", JSON.stringify(payload));
                            }
                            window.location.href = "/";
                            return;
                        }
                    } else {
                        const errBody = await res.json().catch(() => ({}));
                        setRegisterError(errBody.message || "Registration failed. Please try again.");
                        return;
                    }
                } catch (_backendErr) {
                    setRegisterError("Registration failed. Please try again later.");
                    return;
                }
            }
            setRegisterError(error.message || "Registration failed. Please try again.");
        } finally {
            setIsRegSubmitting(false);
        }
    }, [register, registerSchema]);

    const onRoleSubmit = useCallback(async (data: z.infer<typeof roleSchema>) => {
        if (!tempGoogleUser) return;
        try {
            const additionalData = getRoleSpecificData(data.role, data);
            await completeGoogleRegistration(tempGoogleUser, data.role as UserRole, additionalData);
            setIsNewGoogleUser(false);
            setTempGoogleUser(null);
        } catch (error) {
            console.error("Google registration completion failed:", error);
        }
    }, [tempGoogleUser, completeGoogleRegistration, roleSchema]);

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
                                                <SelectItem value="school_admin">School Admin</SelectItem>
                                                <SelectItem value="admin">Administrator</SelectItem>
                                                <SelectItem value="parent">Parent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {selectedGoogleRole === "student" && (
                                <FormField
                                    control={roleForm.control}
                                    name="class"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Class/Grade</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a class" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="9">9th Grade</SelectItem>
                                                    <SelectItem value="10">10th Grade</SelectItem>
                                                    <SelectItem value="11">11th Grade</SelectItem>
                                                    <SelectItem value="12">12th Grade</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <Button type="submit" className="w-full bg-eduai-primary hover:bg-eduai-accent">Complete Registration</Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        );
    }

    const inputClasses = "w-full rounded-full border border-input bg-card px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:ring-2 focus:ring-ring/20 focus:border-primary";

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-card font-sans">
            {/* Mobile: illustration on top */}
            <div className="block lg:hidden h-[300px]">
                <IllustrationPanel />
            </div>

            {/* Left: Login Form */}
            <div className="flex w-full lg:w-[45%] min-h-[calc(100vh-300px)] lg:min-h-screen">
                <motion.div
                    className="flex h-full w-full flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 max-w-lg mx-auto py-12"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="font-display text-4xl font-bold text-foreground">
                        {authTab === "login" ? "Welcome back!" : <span className="text-3xl">Create an account</span>}
                    </h1>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        Simplify your workflow and boost your productivity with{" "}
                        <span className="font-semibold text-foreground">EduAI</span>. {authTab === 'login' ? 'Get started for free.' : 'Join us for free.'}
                    </p>

                    {authTab === "login" ? (
                        <Form {...loginForm}>
                            <form className="mt-8 space-y-4" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                                {loginError && (
                                    <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm font-medium">
                                        {loginError}
                                    </div>
                                )}
                                <FormField
                                    control={loginForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <input
                                                    type="email"
                                                    placeholder="Username/Email"
                                                    disabled={isLoginSubmitting}
                                                    className={inputClasses}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs px-2" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={loginForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Password"
                                                        disabled={isLoginSubmitting}
                                                        className={inputClasses}
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs px-2" />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end pr-2">
                                    <button
                                        type="button"
                                        className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-0 p-0"
                                        onClick={() => {
                                            // Handle forgot password implicitly or mock
                                        }}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoginSubmitting}
                                    className="w-full rounded-full bg-foreground py-3.5 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                                >
                                    {isLoginSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Login
                                </button>
                            </form>
                        </Form>
                    ) : (
                        <Form {...registerForm}>
                            <form className="mt-6 space-y-3" onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                                {registerError && (
                                    <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm font-medium">
                                        {registerError}
                                    </div>
                                )}
                                <FormField
                                    control={registerForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <input
                                                    placeholder="Full Name"
                                                    disabled={isRegSubmitting}
                                                    className={inputClasses + " py-2.5"}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs px-2" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={registerForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <input
                                                    type="email"
                                                    placeholder="Email"
                                                    disabled={isRegSubmitting}
                                                    className={inputClasses + " py-2.5"}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs px-2" />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={registerForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Password"
                                                            disabled={isRegSubmitting}
                                                            className={inputClasses + " py-2.5"}
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-red-500 text-[10px] px-2" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={registerForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="relative">
                                                        <input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            placeholder="Confirm"
                                                            disabled={isRegSubmitting}
                                                            className={inputClasses + " py-2.5"}
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-red-500 text-[10px] px-2" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={registerForm.control}
                                        name="role"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <select
                                                        disabled={isRegSubmitting}
                                                        className={inputClasses + " py-2.5 appearance-none"}
                                                        {...field}
                                                    >
                                                        <option value="student">Student</option>
                                                        <option value="teacher">Teacher</option>
                                                        <option value="principal">Principal</option>
                                                        <option value="parent">Parent</option>
                                                    </select>
                                                </FormControl>
                                                <FormMessage className="text-red-500 text-[10px] px-2" />
                                            </FormItem>
                                        )}
                                    />
                                    {registerForm.watch("role") === "student" && (
                                        <FormField
                                            control={registerForm.control}
                                            name="class"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <select
                                                            disabled={isRegSubmitting}
                                                            className={inputClasses + " py-2.5 appearance-none"}
                                                            {...field}
                                                        >
                                                            <option value="9">9th Grade</option>
                                                            <option value="10">10th Grade</option>
                                                            <option value="11">11th Grade</option>
                                                            <option value="12">12th Grade</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage className="text-red-500 text-[10px] px-2" />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isRegSubmitting}
                                    className="w-full rounded-full bg-foreground py-3 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                                >
                                    {isRegSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create Account
                                </button>
                            </form>
                        </Form>
                    )}

                    <div className="flex items-center gap-4 pt-4 mb-2">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">or continue with</span>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="flex items-center justify-center gap-5 pt-2">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={googleLoading || isLoginSubmitting || isRegSubmitting}
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background text-lg font-semibold transition-all hover:opacity-80 active:scale-95"
                        >
                           {googleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "G"}
                        </button>
                        <button
                            type="button"
                            disabled
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background text-lg font-semibold transition-all hover:opacity-80 active:scale-95 opacity-50 cursor-not-allowed"
                        >
                           A
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        {authTab === "login" ? "Not a member? " : "Already have an account? "}
                        <button
                            type="button"
                            className="font-semibold text-primary hover:text-accent transition-colors bg-transparent border-none cursor-pointer"
                            onClick={() => setAuthTab(authTab === "login" ? "register" : "login")}
                        >
                            {authTab === "login" ? "Register now" : "Login"}
                        </button>
                    </p>
                </motion.div>
            </div>

            {/* Right: Illustration (desktop) */}
            <div className="hidden lg:flex w-[55%] min-h-screen rounded-l-[2.5rem] overflow-hidden drop-shadow-2xl">
                <IllustrationPanel />
            </div>
        </div>
    );
}
