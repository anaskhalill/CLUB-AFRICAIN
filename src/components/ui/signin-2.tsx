'use client'

import * as React from "react"
import { useState } from "react";
import { LogIn, Lock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SignIn2Props {
    onClose?: () => void;
    language?: string;
    onLogin?: (user: any) => void;
    isSignUpDefault?: boolean;
}

const SignIn2 = ({ onClose, language = "en", onLogin, isSignUpDefault = false }: SignIn2Props) => {
    const [isSignUp, setIsSignUp] = useState(isSignUpDefault);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleAuth = async () => {
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        setError("");
        setLoading(true);

        // This will be handled by the parent component (AuthModal) in a real scenario
        // but we can provide a demo behavior if onLogin is not provided
        if (onLogin) {
            // Logic will stay in AuthModal for simplicity or we can move it here
            // For now, let's just use the demo alert if onLogin is mock
            setTimeout(() => {
                setLoading(false);
                alert(`${isSignUp ? "Sign up" : "Sign in"} successful! (Demo)`);
            }, 1000);
        } else {
            setTimeout(() => {
                setLoading(false);
                alert("Action successful! (Demo)");
            }, 1000);
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-transparent">
            <div className="w-full max-w-sm bg-gradient-to-b from-sky-50/50 to-white dark:from-gray-900 dark:to-gray-950 rounded-3xl p-8 flex flex-col items-center border border-blue-100 dark:border-white/5 text-black dark:text-white">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white dark:bg-white/10 mb-6 shadow-lg shadow-black/5 dark:shadow-none">
                    <LogIn className="w-7 h-7 text-black dark:text-white" />
                </div>

                <h2 className="text-2xl font-bold mb-2 text-center">
                    {isSignUp ? (language === "ar" ? "إنشاء حساب" : "Create Account") : (language === "ar" ? "تسجيل الدخول" : "Welcome Back")}
                </h2>

                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center">
                    {isSignUp
                        ? (language === "ar" ? "انضم إلى عائلة النادي الإفريقي اليوم" : "Join the Club Africain family today and be part of history.")
                        : (language === "ar" ? "سجل دخولك للوصول إلى العروض الحصرية" : "Sign in to access exclusive features, points, and fan rewards.")
                    }
                </p>

                <div className="w-full flex flex-col gap-3 mb-2">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Mail className="w-4 h-4" />
                        </span>
                        <input
                            placeholder="Email"
                            type="email"
                            value={email}
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-gray-50 dark:bg-white/5 text-black dark:text-white text-sm transition-all"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock className="w-4 h-4" />
                        </span>
                        <input
                            placeholder="Password"
                            type="password"
                            value={password}
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-gray-50 dark:bg-white/5 text-black dark:text-white text-sm transition-all"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="w-full flex flex-col items-start gap-1">
                        {error && (
                            <div className="text-xs text-red-500 font-medium">{error}</div>
                        )}
                        <div className="w-full flex justify-end">
                            <button className="text-[10px] text-gray-400 hover:text-red-500 hover:underline font-medium transition-colors">
                                Forgot password?
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleAuth}
                    disabled={loading}
                    className="w-full bg-gradient-to-b from-gray-800 to-black text-white font-bold py-3 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] cursor-pointer transition-all mb-4 mt-2 disabled:opacity-50"
                >
                    {loading ? "Processing..." : (isSignUp ? "Get Started" : "Sign In")}
                </button>

                <div className="flex items-center w-full my-2">
                    <div className="flex-grow border-t border-dashed border-gray-200 dark:border-white/10"></div>
                    <span className="mx-2 text-[10px] text-gray-400 uppercase tracking-widest whitespace-nowrap">Or continue with</span>
                    <div className="flex-grow border-t border-dashed border-gray-200 dark:border-white/10"></div>
                </div>

                <div className="flex gap-3 w-full justify-center mt-2">
                    <button className="flex items-center justify-center w-12 h-12 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all grow group">
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            className="w-5 h-5 group-hover:scale-110 transition-transform"
                        />
                    </button>
                    <button className="flex items-center justify-center w-12 h-12 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all grow group">
                        <img
                            src="https://www.svgrepo.com/show/448224/facebook.svg"
                            alt="Facebook"
                            className="w-5 h-5 group-hover:scale-110 transition-transform"
                        />
                    </button>
                    <button className="flex items-center justify-center w-12 h-12 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all grow group">
                        <img
                            src="https://www.svgrepo.com/show/511330/apple-173.svg"
                            alt="Apple"
                            className="w-5 h-5 dark:invert group-hover:scale-110 transition-transform"
                        />
                    </button>
                </div>

                <p className="mt-6 text-xs text-gray-400">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-red-500 font-bold hover:underline ml-1"
                    >
                        {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export { SignIn2 };
