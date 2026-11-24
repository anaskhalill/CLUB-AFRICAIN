"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Lock } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
    amount: number;
    productName: string;
    onSuccess: () => void;
    onClose: () => void;
}

function CheckoutForm({ amount, productName, onSuccess, onClose }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Create PaymentIntent on the server
            const response = await fetch("/api/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount,
                    currency: "tnd",
                    productName,
                }),
            });

            const { clientSecret, error: backendError } = await response.json();

            if (backendError) {
                setError(backendError);
                setLoading(false);
                return;
            }

            // Confirm the payment
            const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                },
            });

            if (stripeError) {
                setError(stripeError.message || "Payment failed");
                setLoading(false);
            } else {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-[var(--foreground)] font-semibold">Product:</span>
                    <span className="text-[var(--foreground)] opacity-70">{productName}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[var(--foreground)] font-semibold">Amount:</span>
                    <span className="text-[var(--primary)] font-black text-xl">{amount.toFixed(3)} TND</span>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--foreground)] opacity-60 uppercase flex items-center gap-2">
                    <CreditCard size={14} />
                    Card Details
                </label>
                <div className="p-4 bg-[var(--background)] border border-[var(--foreground)]/20 rounded-xl">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: "16px",
                                    color: "var(--foreground)",
                                    "::placeholder": {
                                        color: "rgba(var(--foreground), 0.4)",
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-500 text-sm">{error}</p>
                </div>
            )}

            <div className="flex items-center gap-2 text-xs text-[var(--foreground)] opacity-50">
                <Lock size={12} />
                <span>Secured by Stripe. Your payment information is encrypted.</span>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-[var(--foreground)]/20 text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all"
                >
                    Cancel
                </button>
                <motion.button
                    type="submit"
                    disabled={!stripe || loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-[var(--primary)] text-white py-3 rounded-xl font-bold shadow-lg shadow-[var(--primary)]/30 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Processing..." : `Pay ${amount.toFixed(3)} TND`}
                </motion.button>
            </div>
        </form>
    );
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    productName: string;
    onSuccess: () => void;
}

export default function CheckoutModal({
    isOpen,
    onClose,
    amount,
    productName,
    onSuccess,
}: CheckoutModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center px-4"
                >
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-md bg-[var(--card)] rounded-3xl shadow-2xl overflow-hidden border border-[var(--primary)]/30 relative z-10"
                    >
                        <div className="bg-[var(--primary)] p-6 text-center text-white relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 hover:rotate-90 transition-transform"
                            >
                                <X size={24} />
                            </button>
                            <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-lg">
                                <CreditCard size={32} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-black">Secure Checkout</h3>
                            <p className="text-white/70 text-sm mt-2">
                                Complete your purchase securely
                            </p>
                        </div>

                        <div className="p-8">
                            <Elements stripe={stripePromise}>
                                <CheckoutForm
                                    amount={amount}
                                    productName={productName}
                                    onSuccess={onSuccess}
                                    onClose={onClose}
                                />
                            </Elements>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
