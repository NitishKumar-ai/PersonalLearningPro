import React, { useState, useRef, useEffect } from 'react';

interface LoginPageProps {
    onSubmit?: (credentials: { email: string; password: string }) => void;
}

export default function LoginPage({ onSubmit }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const emailInputRef = useRef<HTMLInputElement>(null);

    // Focus management: Focus the first input on mount
    useEffect(() => {
        emailInputRef.current?.focus();
    }, []);

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            setIsLoading(true);
            try {
                if (onSubmit) {
                    onSubmit({ email, password });
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 p-8 bg-white shadow-lg rounded-lg max-w-sm mx-auto mt-10"
            noValidate
            aria-labelledby="login-form-title"
        >
            <h2 id="login-form-title" className="text-2xl font-bold text-gray-800 text-center mb-2">Login</h2>
            <div className="flex flex-col gap-1">
                <label htmlFor="email-input" className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                    id="email-input"
                    type="email"
                    ref={emailInputRef}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    required
                />
                {errors.email && (
                    <span id="email-error" className="text-red-500 text-sm" role="alert">
                        {errors.email}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="password-input" className="text-sm font-medium text-gray-700">Password</label>
                <input
                    id="password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    required
                />
                {errors.password && (
                    <span id="password-error" className="text-red-500 text-sm" role="alert">
                        {errors.password}
                    </span>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={isLoading}
            >
                {isLoading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}
