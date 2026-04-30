"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { getProfile } from "@/store/controllers/authController";
import { getMySiswaList } from "@/store/controllers/siswaController";
import { SiswaDetail } from "@/store/types/SiswaTypes";
import Swal from "sweetalert2";

export default function DashboardPage() {
    const router                  = useRouter();
    const dispatch                = useAppDispatch();
    const { list: siswaList, loading } = useAppSelector((state) => state.siswa);
    const authProfile             = useAppSelector((state) => state.auth.profile);
    const [cachedEmail]           = useState(() =>
        typeof window !== "undefined" ? localStorage.getItem("auth-email") ?? "" : ""
    );
    const email                   = authProfile?.email || cachedEmail;

    useEffect(() => {
        const token = localStorage.getItem("auth-key");
        if (!token) {
            router.replace("/sign-in");
            return;
        }

        dispatch(getProfile());
        dispatch(getMySiswaList());
    }, [dispatch, router]);

    useEffect(() => {
        if (authProfile?.email) {
            localStorage.setItem("auth-email", authProfile.email);
        }
    }, [authProfile?.email]);

    const handleLockedMenu = (label: string) => {
        Swal.fire({
            icon               : "info",
            title              : "Belum Tersedia",
            html               : `Menu <b>${label}</b> hanya dapat diakses jika pendaftaran Anda <b>Valid</b>.<br/>Silakan menunggu proses validasi dari panitia.`,
            confirmButtonColor : "#1976d2",
        });
    };

    const handleSignOut = () => {
        Swal.fire({
            icon              : "question",
            title             : "Keluar dari akun?",
            showCancelButton  : true,
            confirmButtonText : "Ya, Keluar",
            cancelButtonText  : "Batal",
            confirmButtonColor: "#dc2626",
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("auth-key");
                localStorage.removeItem("auth-username");
                localStorage.removeItem("auth-nama");
                router.replace("/sign-in");
            }
        });
    };

    return (
        <>
            <Navbar />

            <main className="flex-1 bg-white">
                <PageBanner />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 px-4 sm:px-6 py-4">
                            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 tracking-wide">LAST USER ACTIVITY</h1>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 py-5">
                            <div className="text-sm text-gray-700 space-y-2">
                                <div className="flex">
                                    <span className="w-36 text-gray-600">Author</span>
                                    <span className="text-gray-800">: {email || "-"}</span>
                                </div>
                                {siswaList.length > 0 && (
                                    <div className="flex">
                                        <span className="w-36 text-gray-600">Jumlah pendaftaran</span>
                                        <span className="text-gray-800">: {siswaList.length}</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 md:text-left">
                                <button
                                    onClick={handleSignOut}
                                    className="block text-[#1976d2] hover:underline font-medium"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className="bg-[#1976d2] text-white rounded-md px-4 sm:px-5 py-3 sm:py-4 text-sm flex items-start gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
                        </svg>
                        <span>
                            Informasi Penerimaan Peserta Didik Baru hanya dapat dilihat Jika Pendaftar telah melakukan pengkinian data di menu{" "}
                            <Link href="/dashboard/update" className="text-red-300 font-semibold hover:underline">
                                Update Data Pendaftar
                            </Link>
                        </span>
                    </div>

                    {loading && siswaList.length === 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-10 text-center text-sm text-gray-500">
                            Memuat data pendaftaran...
                        </div>
                    )}

                    {!loading && siswaList.length === 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-10 text-center">
                            <p className="text-sm text-gray-600">Belum ada pendaftaran pada akun ini.</p>
                            <Link href="/" className="inline-block mt-3 text-[#1976d2] font-semibold hover:underline text-sm">
                                Mulai Pendaftaran Baru →
                            </Link>
                        </div>
                    )}

                    {siswaList.map((siswa, idx) => (
                        <SiswaCard
                            key={siswa.noreg ?? idx}
                            siswa={siswa}
                            index={idx + 1}
                            total={siswaList.length}
                            onLockedClick={handleLockedMenu}
                        />
                    ))}
                </div>
            </main>

            <Footer />
        </>
    );
}

function SiswaCard({
    siswa,
    index,
    total,
    onLockedClick,
}: {
    siswa         : SiswaDetail;
    index         : number;
    total         : number;
    onLockedClick : (label: string) => void;
}) {
    const isValid = Number(siswa.status ?? 0) === 1;
    const noreg      = siswa.noreg ?? "";
    const qs         = noreg ? `?noreg=${encodeURIComponent(noreg)}` : "";
    const jenjang    = resolveJenjang(siswa);

    const pilihan1 = siswa.pilihan1
        ?? [siswa.sekolah_tujuan, siswa.prog1].filter(Boolean).join(" - ")
        ?? "-";
    const pilihan2 = siswa.pilihan2
        ?? [siswa.sekolah_tujuan2, siswa.prog2].filter(Boolean).join(" - ")
        ?? "-";

    return (
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                        Control Panel Pendaftar SPMB
                        {total > 1 && <span className="ml-2 text-sm text-gray-400 font-normal">({index} dari {total})</span>}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-[#1976d2] border border-blue-100 px-2 py-0.5 rounded font-medium">
                            No. Reg: {noreg || "-"}
                        </span>
                        {siswa.nama && (
                            <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-700 border border-gray-200 px-2 py-0.5 rounded">
                                {siswa.nama}
                            </span>
                        )}
                        {siswa.jenis && (
                            <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-700 border border-gray-200 px-2 py-0.5 rounded">
                                {siswa.jenis}
                            </span>
                        )}
                        <StatusBadge status={Number(siswa.status ?? 0)} />
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 py-5">
                <div className="bg-gray-50 border border-gray-200 rounded-md px-4 sm:px-5 py-3 sm:py-4 text-sm text-gray-700 space-y-1 break-words">
                    <div>Pilihan 1 : {pilihan1 || "-"}</div>
                    <div>Pilihan 2 : {pilihan2 || "-"}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-6">
                    <MenuItem
                        href={`/dashboard/status${qs}`}
                        iconBg="bg-green-500"
                        icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                            </svg>
                        }
                        label="Status Pendaftaran"
                    />
                    <MenuItem
                        href={`/dashboard/update${qs}`}
                        iconBg="bg-[#1976d2]"
                        icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 7v5l3 2" strokeLinecap="round" />
                            </svg>
                        }
                        label="Update Data Pendaftar"
                        disabled={!isValid}
                        onLockedClick={onLockedClick}
                    />
                    <div className="hidden sm:block" />
                    <MenuItem
                        href={`/pdf/${jenjang}${qs}`}
                        iconBg="bg-slate-600"
                        icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                                <rect x="6" y="14" width="12" height="7" />
                            </svg>
                        }
                        label="Print Formulir"
                        disabled={!isValid}
                        onLockedClick={onLockedClick}
                    />
                </div>
            </div>
        </section>
    );
}

function resolveJenjang(siswa: SiswaDetail): "tk" | "sd" | "smp" | "sma" {
    const target = (siswa.sekolah_tujuan ?? siswa.pilihan1 ?? "").toUpperCase();
    if (target.includes("SMAK") || target.includes("SMA "))                                                   return "sma";
    if (target.includes("SMPK") || target.includes("SMP "))                                                   return "smp";
    if (target.includes("SDK")  || target.includes("SD "))                                                    return "sd";
    if (target.includes("TKK")  || target.includes("TK ") || target.includes("TODDLER") || target.includes("KELOMPOK BERMAIN")) return "tk";
    return "tk";
}

function StatusBadge({ status }: { status: number }) {
    if (status !== 1 && status !== 2) return null;

    const cfg = status === 1
        ? { label: "Pendaftaran Valid", cls: "bg-green-50 text-green-700 border-green-200" }
        : { label: "Ditolak",           cls: "bg-red-50 text-red-700 border-red-200"      };

    return (
        <span className={`inline-flex items-center gap-1 ${cfg.cls} border px-2 py-0.5 rounded font-medium`}>
            {cfg.label}
        </span>
    );
}

function MenuItem({
    href,
    iconBg,
    icon,
    label,
    disabled,
    onLockedClick,
}: {
    href           : string;
    iconBg         : string;
    icon           : React.ReactNode;
    label          : string;
    disabled      ?: boolean;
    onLockedClick ?: (label: string) => void;
}) {
    if (disabled) {
        return (
            <button
                type="button"
                onClick={() => onLockedClick?.(label)}
                className="flex items-center gap-3 rounded-md px-3 py-2 w-full text-left cursor-not-allowed opacity-60 hover:bg-gray-50 transition"
                aria-disabled="true"
                title="Hanya tersedia jika Pendaftaran Valid"
            >
                <span className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center shadow-sm relative`}>
                    {icon}
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="3">
                            <rect x="5" y="11" width="14" height="10" rx="2" />
                            <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" />
                        </svg>
                    </span>
                </span>
                <span className="flex flex-col">
                    <span className="text-gray-400 font-semibold">{label}</span>
                    <span className="text-xs text-gray-400">Tersedia setelah Pendaftaran Valid</span>
                </span>
            </button>
        );
    }

    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-gray-50 transition"
        >
            <span className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center shadow-sm`}>
                {icon}
            </span>
            <span className="text-[#1976d2] font-semibold hover:underline">{label}</span>
        </Link>
    );
}
