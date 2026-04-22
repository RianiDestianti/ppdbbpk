"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { changePassword } from "@/store/controllers/authController";
import { resetChangePwResp } from "@/store/slices/authSlice";
import Swal from "sweetalert2";

export default function ChangePasswordPage() {
    const router                                      = useRouter();
    const dispatch                                    = useAppDispatch();
    const { changePwLoading, changePwResp }           = useAppSelector((state) => state.auth);
    const [passwordLama,       setPasswordLama]       = useState("");
    const [passwordBaru,       setPasswordBaru]       = useState("");
    const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
    const [showLama,       setShowLama]               = useState(false);
    const [showBaru,       setShowBaru]               = useState(false);
    const [showKonfirmasi, setShowKonfirmasi]         = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("auth-key");
        if (!token) {
            router.replace("/sign-in");
        }
    }, [router]);

    useEffect(() => {
        if (!changePwResp) return;

        if (changePwResp.status === 200) {
            Swal.fire({
                icon              : "success",
                title             : "Password Berhasil Diubah",
                text              : "Email konfirmasi password baru telah dikirim ke alamat email Anda",
                confirmButtonColor: "#dc2626",
            }).then(() => {
                setPasswordLama("");
                setPasswordBaru("");
                setKonfirmasiPassword("");
                router.push("/dashboard");
            });
        } else {
            const firstError = changePwResp.data
                ? Object.values(changePwResp.data)[0]?.[0]
                : null;

            Swal.fire({
                icon              : "error",
                title             : "Gagal Mengubah Password",
                text              : firstError ?? changePwResp.message ?? "Terjadi kesalahan",
                confirmButtonColor: "#dc2626",
            });
        }

        dispatch(resetChangePwResp());
    }, [changePwResp, dispatch, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordLama || !passwordBaru || !konfirmasiPassword) {
            Swal.fire({
                icon              : "warning",
                title             : "Data belum lengkap",
                text              : "Semua field wajib diisi",
                confirmButtonColor: "#dc2626",
            });
            return;
        }

        if (passwordBaru !== konfirmasiPassword) {
            Swal.fire({
                icon              : "warning",
                title             : "Konfirmasi tidak cocok",
                text              : "Password baru dan konfirmasi password harus sama",
                confirmButtonColor: "#dc2626",
            });
            return;
        }

        dispatch(changePassword({
            password_lama       : passwordLama,
            password_baru       : passwordBaru,
            konfirmasi_password : konfirmasiPassword,
        }));
    };

    return (
        <>
            <Navbar />

            <main className="flex-1 bg-white">
                <PageBanner />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-5 text-center">
                            <p className="text-sm text-gray-600 mb-1">
                                <Link href="/dashboard" className="text-[#1976d2] hover:underline">
                                    Home
                                </Link>
                                <span className="mx-2 text-gray-400">|</span>
                                <span>Ganti password</span>
                            </p>
                            <h1 className="text-2xl font-semibold text-gray-800 tracking-wide">
                                GANTI PASSWORD
                            </h1>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                            <Field
                                label       = "Password lama"
                                placeholder = "Password lama"
                                value       = {passwordLama}
                                onChange    = {setPasswordLama}
                                show        = {showLama}
                                onToggle    = {() => setShowLama((v) => !v)}
                            />
                            <Field
                                label       = "Password baru"
                                placeholder = "Password baru"
                                value       = {passwordBaru}
                                onChange    = {setPasswordBaru}
                                show        = {showBaru}
                                onToggle    = {() => setShowBaru((v) => !v)}
                            />
                            <Field
                                label       = "Konfirmasi password baru"
                                placeholder = "Konfirmasi password baru"
                                value       = {konfirmasiPassword}
                                onChange    = {setKonfirmasiPassword}
                                show        = {showKonfirmasi}
                                onToggle    = {() => setShowKonfirmasi((v) => !v)}
                            />

                            <button
                                type     = "submit"
                                disabled = {changePwLoading}
                                className="w-full bg-[#111827] hover:bg-black text-white font-semibold py-4 rounded-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {changePwLoading ? "Memproses..." : "Submit"}
                                {!changePwLoading && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}

function Field({
    label,
    placeholder,
    value,
    onChange,
    show,
    onToggle,
}: {
    label       : string;
    placeholder : string;
    value       : string;
    onChange    : (v: string) => void;
    show        : boolean;
    onToggle    : () => void;
}) {
    return (
        <div>
            <label className="block text-sm text-gray-700 mb-2">
                {label} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <input
                    type        = {show ? "text" : "password"}
                    placeholder = {placeholder}
                    value       = {value}
                    onChange    = {(e) => onChange(e.target.value)}
                    className   = "w-full border border-gray-300 rounded-md px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2]"
                />
                <button
                    type      = "button"
                    onClick   = {onToggle}
                    className = "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex  = {-1}
                >
                    {show ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a19 19 0 0 1 5.06-5.94M9.9 4.24A10 10 0 0 1 12 4c7 0 11 8 11 8a19 19 0 0 1-2.16 3.19M1 1l22 22" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
