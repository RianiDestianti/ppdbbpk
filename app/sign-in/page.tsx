"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function SignInPage() {
    const [showPass, setShowPass]    = useState(false);
    const [email, setEmail]          = useState("");
    const [password, setPassword]    = useState("");

    return (
        <>
            <Navbar />

            <main className="flex-1 bg-gray-50 py-16">
                <div className="max-w-md mx-auto px-6">
                    <div className="bg-white rounded-md border border-gray-200 p-8">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Sign In</h1>
                            <p className="text-sm text-gray-600">Masuk ke akun SPMB Anda</p>
                        </div>

                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@email.com"
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <Link href="/forgot-password" className="text-xs text-red-600 hover:underline">
                                        Lupa password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full px-3 py-2 pr-10 rounded-md border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                        aria-label="Toggle password"
                                    >
                                        {showPass ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10 10 0 0112 20c-7 0-10-8-10-8a18.5 18.5 0 014.22-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 10 8 10 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22M14.12 14.12a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-red-600" />
                                Ingat saya
                            </label>

                            <button
                                type="submit"
                                className="w-full py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium text-sm"
                            >
                                Sign In
                            </button>
                        </form>

                        <p className="mt-5 text-center text-sm text-gray-600">
                            Belum punya akun?{" "}
                            <Link href="/sign-up" className="text-red-600 font-medium hover:underline">
                                Daftar
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
