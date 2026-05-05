"use client";

import { useEffect, useSyncExternalStore } from "react";
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

const subscribeAuthEmail = (onChange: () => void) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
};
const getAuthEmailSnapshot = () =>
    typeof window === "undefined" ? "" : (localStorage.getItem("auth-email") ?? "");
const getAuthEmailServerSnapshot = () => "";

export default function DashboardPage() {
    const router                  = useRouter();
    const dispatch                = useAppDispatch();
    const { list: siswaList, loading } = useAppSelector((state) => state.siswa);
    const authProfile             = useAppSelector((state) => state.auth.profile);
    const cachedEmail             = useSyncExternalStore(
        subscribeAuthEmail,
        getAuthEmailSnapshot,
        getAuthEmailServerSnapshot,
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
                                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                                    <span className="sm:min-w-36 text-gray-600">Author</span>
                                    <span className="text-gray-800">: {email || "-"}</span>
                                </div>
                                {siswaList.length > 0 && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                                        <span className="sm:min-w-36 text-gray-600">Jumlah pendaftaran</span>
                                        <span className="text-gray-800">: {siswaList.length}</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 md:text-left">
                                <button
                                    onClick={handleSignOut}
                                    className="block w-fit text-[#1976d2] hover:underline font-medium"
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
                                Mulai Pendaftaran Baru
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

                {!isValid && <PaymentReminder siswa={siswa} />}

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
                        href={`/dashboard/konfirmasi${qs}`}
                        iconBg="bg-amber-500"
                        icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="16" rx="2" />
                                <path d="M7 8h10M7 12h6" strokeLinecap="round" />
                                <path d="M8 18l2-2 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        }
                        label="Konfirmasi Pembayaran"
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

                <JoinWaButton siswa={siswa} />
            </div>
        </section>
    );
}

function PaymentReminder({ siswa }: { siswa: SiswaDetail }) {
    const noVa     = (siswa.no_va ?? "").toString().trim();
    const nama     = (siswa.nama ?? "").trim();
    const noreg    = (siswa.noreg ?? "").trim();

    const handleCopyVa = () => {
        if (!noVa) return;
        navigator.clipboard?.writeText(noVa).then(() => {
            Swal.fire({
                icon              : "success",
                title             : "Disalin",
                text              : `Nomor VA ${noVa} berhasil disalin.`,
                timer             : 1500,
                showConfirmButton : false,
            });
        }).catch(() => {});
    };

    return (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5 shadow-sm">
            <div className="flex items-start gap-3">
                <span className="inline-flex w-9 h-9 rounded-lg bg-amber-100 text-amber-700 items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-amber-900">
                        Segera Lakukan Pembayaran
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-amber-800 leading-relaxed">
                        Pendaftaran <b>{nama || noreg || "Anda"}</b> belum tervalidasi karena pembayaran melalui Virtual Account belum kami terima. Silakan segera melakukan pembayaran agar pendaftaran dapat diproses.
                    </p>

                    {noVa ? (
                        <div className="mt-3 rounded-lg border border-amber-200 bg-white px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="min-w-0">
                                <div className="text-[11px] uppercase tracking-wider text-amber-700 font-semibold">Virtual Account BCA</div>
                                <div className="text-base sm:text-lg font-bold text-gray-900 break-all">{noVa}</div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCopyVa}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold transition shrink-0"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" />
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                </svg>
                                Salin VA
                            </button>
                        </div>
                    ) : (
                        <div className="mt-3 rounded-lg border border-amber-200 bg-white px-3 sm:px-4 py-3 text-xs sm:text-sm text-amber-800">
                            Nomor Virtual Account belum tersedia. Silakan cek email/WhatsApp Anda atau hubungi admin sekolah.
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

function JoinWaButton({ siswa }: { siswa: SiswaDetail }) {
    const reko = (siswa.reko ?? "").trim().toUpperCase();
    if (reko !== "A" && reko !== "B" && reko !== "C") return null;

    const sekolahLabel =
        reko === "B"
            ? (siswa.sekolah_tujuan2 || siswa.pilihan2 || "")
            : (siswa.sekolah_tujuan  || siswa.pilihan1 || "");

    const waLink = ((siswa as unknown as { wa_group_link?: string }).wa_group_link ?? "").trim();

    const handleClick = () => {
        if (!waLink) {
            Swal.fire({
                icon              : "info",
                title             : "Link Belum Tersedia",
                text              : "Link grup WhatsApp belum diset oleh admin. Mohon hubungi admin sekolah.",
                confirmButtonColor: "#1976d2",
            });
            return;
        }
        window.open(waLink, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="mt-5">
            <button
                type="button"
                onClick={handleClick}
                className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 active:scale-[0.99] text-white font-semibold px-5 py-3.5 rounded-xl shadow-sm transition-all"
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                </svg>
                <span className="text-center">Gabung Grup WhatsApp{sekolahLabel ? ` - ${sekolahLabel}` : ""}</span>
            </button>
        </div>
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
            <span className="text-[#1976d2] font-semibold hover:underline break-words">{label}</span>
        </Link>
    );
}
