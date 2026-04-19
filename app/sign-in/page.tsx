"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/providers/LanguageProvider";
import { t } from "@/libs/i18n";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { handleActionLogin } from "@/store/controllers/authController";
import { handleCleanResponse } from "@/store/slices/authSlice";
import Swal from "sweetalert2";

export default function SignInPage() {
    const { lang }                = useLanguage();
    const dispatch                = useAppDispatch();
    const stateLogin              = useAppSelector((state) => state.auth);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) return;
        dispatch(handleActionLogin({ username, password }));
    };

    useEffect(() => {
        if (stateLogin.responseLogin) {
            localStorage.setItem("auth-key", stateLogin.responseLogin.key);
            localStorage.setItem("auth-username", stateLogin.responseLogin.username);
            localStorage.setItem("auth-nama", stateLogin.responseLogin.nama);

            Swal.fire({
                icon              : "success",
                title             : "Login Berhasil",
                text              : `Selamat datang, ${stateLogin.responseLogin.nama}`,
                confirmButtonColor: "#dc2626",
                timer             : 1500,
                showConfirmButton : false,
            }).then(() => {
                dispatch(handleCleanResponse());
                window.location.href = "/";
            });
        }
    }, [stateLogin.responseLogin, dispatch]);

    useEffect(() => {
        if (stateLogin.error) {
            Swal.fire({
                icon              : "error",
                title             : "Login Gagal",
                text              : stateLogin.error,
                confirmButtonColor: "#dc2626",
            }).then(() => {
                dispatch(handleCleanResponse());
            });
        }
    }, [stateLogin.error, dispatch]);

    return (
        <>
            <Navbar />

            <main className="flex-1 bg-gradient-to-b from-[#1976d2] to-[#1565c0]">
                <div className="max-w-6xl mx-auto px-6 py-20">
                    <div className="bg-white rounded-2xl shadow-2xl px-8 md:px-16 py-14">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-semibold text-gray-800 mb-2">{t.signin.title[lang]}</h1>
                            <h2 className="text-2xl md:text-3xl text-gray-600 font-light">{t.signin.subtitle[lang]}</h2>
                            <div className="w-20 h-[3px] bg-red-600 mx-auto mt-5" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="flex justify-center">
                                <svg viewBox="0 0 500 420" className="w-full max-w-md h-auto" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0" stopColor="#e3f2fd" />
                                            <stop offset="1" stopColor="#bbdefb" />
                                        </linearGradient>
                                        <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0" stopColor="#42a5f5" />
                                            <stop offset="1" stopColor="#1976d2" />
                                        </linearGradient>
                                    </defs>

                                    <circle cx="250" cy="220" r="180" fill="url(#bg)" />

                                    <circle cx="90" cy="80" r="6" fill="#64b5f6" />
                                    <circle cx="410" cy="110" r="8" fill="#1e88e5" opacity="0.6" />
                                    <circle cx="440" cy="300" r="5" fill="#42a5f5" />
                                    <circle cx="70" cy="340" r="7" fill="#1976d2" opacity="0.5" />

                                    <rect x="140" y="110" width="220" height="240" rx="14" fill="white" stroke="#90caf9" strokeWidth="2" />
                                    <rect x="140" y="110" width="220" height="34" rx="14" fill="#1976d2" />
                                    <rect x="140" y="130" width="220" height="14" fill="#1976d2" />
                                    <circle cx="154" cy="127" r="3" fill="#ff6b6b" />
                                    <circle cx="166" cy="127" r="3" fill="#feca57" />
                                    <circle cx="178" cy="127" r="3" fill="#48dbfb" />

                                    <circle cx="250" cy="180" r="22" fill="url(#screen)" />
                                    <circle cx="250" cy="174" r="7" fill="white" />
                                    <path d="M238 192 Q250 200 262 192 L262 198 Q250 205 238 198 Z" fill="white" />

                                    <rect x="165" y="222" width="170" height="26" rx="6" fill="#e3f2fd" />
                                    <circle cx="178" cy="235" r="4" fill="#1976d2" />
                                    <rect x="190" y="232" width="80" height="6" rx="2" fill="#90caf9" />

                                    <rect x="165" y="258" width="170" height="26" rx="6" fill="#e3f2fd" />
                                    <g fill="#1976d2">
                                        <circle cx="180" cy="271" r="2.5" />
                                        <circle cx="192" cy="271" r="2.5" />
                                        <circle cx="204" cy="271" r="2.5" />
                                        <circle cx="216" cy="271" r="2.5" />
                                        <circle cx="228" cy="271" r="2.5" />
                                        <circle cx="240" cy="271" r="2.5" />
                                    </g>

                                    <rect x="165" y="300" width="170" height="30" rx="6" fill="#1976d2" />
                                    <rect x="235" y="311" width="30" height="8" rx="2" fill="white" />
                                    <path d="M270 315 l6 -4 v8 z" fill="white" />

                                    <g transform="translate(30, 240)">
                                        <circle cx="30" cy="0" r="22" fill="#ffccbc" />
                                        <path d="M10 -6 Q30 -22 50 -6 Q50 -18 30 -22 Q10 -18 10 -6 Z" fill="#5d4037" />
                                        <rect x="8" y="22" width="44" height="70" rx="10" fill="#ef5350" />
                                        <rect x="14" y="90" width="14" height="50" rx="5" fill="#37474f" />
                                        <rect x="32" y="90" width="14" height="50" rx="5" fill="#37474f" />
                                        <rect x="-6" y="28" width="18" height="45" rx="6" fill="#ef5350" />
                                        <rect x="48" y="28" width="18" height="45" rx="6" fill="#ef5350" />
                                    </g>

                                    <g transform="translate(408, 248)">
                                        <circle cx="30" cy="0" r="22" fill="#ffe0b2" />
                                        <path d="M12 -8 Q30 -24 50 -10 L52 4 Q52 -20 30 -22 Q12 -22 12 -8 Z" fill="#3e2723" />
                                        <rect x="8" y="22" width="44" height="68" rx="10" fill="#42a5f5" />
                                        <rect x="14" y="88" width="14" height="50" rx="5" fill="#1565c0" />
                                        <rect x="32" y="88" width="14" height="50" rx="5" fill="#1565c0" />
                                        <rect x="-6" y="28" width="18" height="45" rx="6" fill="#42a5f5" />
                                        <rect x="48" y="28" width="18" height="45" rx="6" fill="#42a5f5" />
                                    </g>

                                    <ellipse cx="250" cy="400" rx="190" ry="8" fill="#0d47a1" opacity="0.08" />
                                </svg>
                            </div>

                            <form className="space-y-5" onSubmit={handleLogin}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t.signin.username[lang]}
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder={t.signin.usernamePh[lang]}
                                        disabled={stateLogin.loading}
                                        className="w-full px-4 py-3 rounded-lg bg-blue-50 border border-blue-100 focus:bg-white focus:border-[#1976d2] focus:ring-2 focus:ring-blue-200 outline-none text-sm transition disabled:opacity-60"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t.signin.password[lang]}
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        disabled={stateLogin.loading}
                                        className="w-full px-4 py-3 rounded-lg bg-blue-50 border border-blue-100 focus:bg-white focus:border-[#1976d2] focus:ring-2 focus:ring-blue-200 outline-none text-sm transition disabled:opacity-60"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={stateLogin.loading}
                                        className="inline-flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-medium px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {stateLogin.loading ? "Memproses..." : t.signin.button[lang]}
                                        {!stateLogin.loading && (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 pt-2">
                                    {t.signin.forgot[lang]}
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
