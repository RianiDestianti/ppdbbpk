"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/providers/LanguageProvider";
import { t } from "@/libs/i18n";
import Swal from "sweetalert2";

export default function SignInPage() {
    const { lang } = useLanguage();

    const handleGoogleSignIn = () => {
        const clientId    = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
        const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? `${window.location.origin}/auth`;

        if (!clientId) {
            Swal.fire({
                icon              : "error",
                title             : "Konfigurasi Google Belum Lengkap",
                text              : "NEXT_PUBLIC_GOOGLE_CLIENT_ID belum diatur.",
                confirmButtonColor: "#dc2626",
            });
            return;
        }

        const params = new URLSearchParams({
            client_id     : clientId,
            redirect_uri  : redirectUri,
            response_type : "code",
            scope         : "openid email profile",
            access_type   : "offline",
            prompt        : "consent",
        });

        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    };

    return (
        <>
            <Navbar />

            <main className="flex-1 relative overflow-hidden bg-slate-50">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0d47a1] via-[#1565c0] to-[#1976d2]" />
                    <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-blue-400/30 blur-3xl" />
                    <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-sky-300/20 blur-3xl" />
                    <div className="absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] rounded-full bg-red-500/15 blur-3xl" />
                    <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
                    <div className="bg-white/95 backdrop-blur rounded-3xl shadow-[0_30px_80px_-20px_rgba(13,71,161,0.5)] ring-1 ring-white/50 overflow-hidden">
                        <div className="grid lg:grid-cols-5 min-h-[600px]">
                            <div className="relative lg:col-span-2 bg-gradient-to-br from-[#0d47a1] via-[#1565c0] to-[#1976d2] text-white p-8 sm:p-10 lg:p-12 overflow-hidden">
                                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border-[40px] border-white/5" />
                                <div className="absolute top-32 -left-16 w-40 h-40 rounded-full border-[20px] border-white/5" />
                                <div className="absolute -bottom-24 -right-10 w-64 h-64 rounded-full bg-white/5" />
                                <div className="absolute bottom-20 left-10 w-3 h-3 rounded-full bg-yellow-300" />
                                <div className="absolute top-20 right-16 w-2 h-2 rounded-full bg-red-300" />
                                <div className="absolute top-1/2 left-20 w-1.5 h-1.5 rounded-full bg-sky-200" />

                                <div className="relative h-full flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white rounded-xl p-2 shadow-lg">
                                            <Image
                                                src="/assets/bpkspmb.png"
                                                alt="BPK PENABUR"
                                                width={140}
                                                height={40}
                                                className="h-9 w-auto"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-12">
                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-xs font-semibold uppercase tracking-wider ring-1 ring-white/25">
                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />
                                            SPMB 2026 / 2027
                                        </span>
                                        <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.6rem] font-bold leading-tight tracking-tight">
                                            Mulai Perjalanan{" "}
                                            <span className="bg-gradient-to-r from-yellow-200 to-amber-300 bg-clip-text text-transparent">
                                                Pendidikan
                                            </span>{" "}
                                            di BPK PENABUR Bandung
                                        </h2>
                                        <p className="mt-4 text-blue-100/90 text-sm sm:text-base leading-relaxed max-w-md">
                                            Sistem Penerimaan Murid Baru online — daftar, pantau, dan kelola seluruh proses pendaftaran dalam satu tempat.
                                        </p>

                                        <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                                            <Stat value="TK" label="Taman Kanak" />
                                            <Stat value="SD" label="Sekolah Dasar" />
                                            <Stat value="SMP/SMA" label="Menengah" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-3 p-8 sm:p-12 lg:p-16 flex items-center">
                                <div className="w-full max-w-md mx-auto">
                                    <div className="text-center lg:text-left">
                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1976d2] text-xs font-semibold uppercase tracking-wide ring-1 ring-blue-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#1976d2]" />
                                            Sign In
                                        </span>
                                        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                                            Selamat Datang
                                        </h1>
                                        <p className="mt-2 text-gray-500 text-sm sm:text-base">
                                            {t.signin.title[lang]} — {t.signin.subtitle[lang]}
                                        </p>
                                    </div>

                                    <div className="mt-10">
                                        <button
                                            type="button"
                                            onClick={handleGoogleSignIn}
                                            className="group relative w-full inline-flex items-center justify-center gap-3 bg-white hover:bg-gray-50 active:scale-[0.99] text-gray-800 font-semibold px-6 py-4 rounded-xl border-2 border-gray-200 hover:border-[#1976d2]/40 shadow-sm hover:shadow-lg transition-all duration-200"
                                        >
                                            <svg width="22" height="22" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                                                <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                                                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                                                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                                            </svg>
                                            <span className="text-base">{t.signin.google[lang]}</span>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400 group-hover:text-[#1976d2] group-hover:translate-x-1 transition-all">
                                                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>

                                        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
                                            <Trust
                                                icon={
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z" strokeLinejoin="round" />
                                                    </svg>
                                                }
                                                label="Aman & Terverifikasi"
                                            />
                                            <Trust
                                                icon={
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="11" width="18" height="11" rx="2" />
                                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                                    </svg>
                                                }
                                                label="Data Terenkripsi"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-10 pt-6 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 text-center leading-relaxed">
                                            Dengan masuk, Anda menyetujui{" "}
                                            <span className="font-medium text-gray-700">Syarat & Ketentuan</span> serta{" "}
                                            <span className="font-medium text-gray-700">Kebijakan Privasi</span> SPMB BPK PENABUR Bandung.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div className="bg-white/10 backdrop-blur rounded-xl px-3 py-3 ring-1 ring-white/15 text-center">
            <div className="text-base sm:text-lg font-bold text-white">{value}</div>
            <div className="text-[10px] sm:text-xs text-blue-100/80 mt-0.5">{label}</div>
        </div>
    );
}

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-1.5 text-gray-500">
            <span className="text-[#1976d2]">{icon}</span>
            <span>{label}</span>
        </div>
    );
}
