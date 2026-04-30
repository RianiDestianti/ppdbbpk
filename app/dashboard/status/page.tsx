"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { getMySiswa, getMySiswaList } from "@/store/controllers/siswaController";
import { SiswaDetail } from "@/store/types/SiswaTypes";

const TGL_PENGUMUMAN = "2025-09-18 10:00:00";

export default function StatusPendaftaranPage() {
    return (
        <Suspense fallback={null}>
            <StatusPendaftaranContent />
        </Suspense>
    );
}

function StatusPendaftaranContent() {
    const router        = useRouter();
    const searchParams  = useSearchParams();
    const noregParam    = searchParams.get("noreg") ?? "";
    const dispatch      = useAppDispatch();
    const { detail, list, loading } = useAppSelector((state) => state.siswa);

    useEffect(() => {
        const token = localStorage.getItem("auth-key");
        if (!token) {
            router.replace("/sign-in");
            return;
        }

        if (list.length === 0) {
            dispatch(getMySiswaList());
        }

        if (noregParam && !list.find((s) => s.noreg === noregParam)) {
            dispatch(getMySiswa(noregParam));
        }
    }, [dispatch, router, noregParam, list]);

    const rows: SiswaDetail[] = useMemo(() => {
        if (noregParam) {
            const fromList = list.find((s) => s.noreg === noregParam);
            if (fromList)                            return [fromList];
            if (detail?.noreg === noregParam)        return [detail];
            return [];
        }
        return list;
    }, [list, detail, noregParam]);

    return (
        <>
            <Navbar />

            <main className="flex-1 bg-white">
                <PageBanner />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 text-center sm:text-left flex-1">
                            <span className="inline-block border-b-2 border-red-500 pb-1">Status Pendaftaran</span>
                        </h1>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="text-sm text-[#1976d2] hover:underline self-start sm:self-auto"
                        >
                            ← Kembali ke Dashboard
                        </button>
                    </div>

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

                    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 px-4 sm:px-6 py-4">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                                Informasi Penerimaan SPMB akan diumumkan pada {TGL_PENGUMUMAN}
                            </h2>
                        </div>

                        <div className="px-4 sm:px-6 py-5 overflow-x-auto">
                            <table className="w-full text-sm border border-gray-200 min-w-[900px]">
                                <thead className="bg-gray-50 text-gray-700">
                                    <tr>
                                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold">No Formulir</th>
                                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Nama</th>
                                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Sekolah Pilihan 1</th>
                                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Sekolah Pilihan 2</th>
                                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Tgl. Daftar</th>
                                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Tgl. Verifikasi</th>
                                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Rekomendasi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && rows.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="border border-gray-200 px-3 py-6 text-center text-gray-500">
                                                Memuat data status pendaftaran...
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && rows.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="border border-gray-200 px-3 py-6 text-center text-gray-500">
                                                Belum ada data pendaftaran.
                                            </td>
                                        </tr>
                                    )}

                                    {rows.map((siswa, idx) => (
                                        <StatusRow key={siswa.noreg ?? idx} siswa={siswa} />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-4 sm:px-6 pb-5">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Rekomendasi</p>
                            <div className="text-sm text-gray-700 space-y-1">
                                <LegendItem code="A"   label="Diterima Pilihan 1" />
                                <LegendItem code="B"   label="Diterima Pilihan 2" />
                                <LegendItem code="C"   label="Ditempatkan" />
                                <LegendItem code="Tes" label="Mengikuti Tes Seleksi" />
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}

function StatusRow({ siswa }: { siswa: SiswaDetail }) {
    const isValid = Number(siswa.status ?? 0) === 1;

    const pilihan1 = siswa.pilihan1
        ?? [siswa.sekolah_tujuan, siswa.prog1].filter(Boolean).join(" - ");
    const pilihan2 = siswa.pilihan2
        ?? [siswa.sekolah_tujuan2, siswa.prog2].filter(Boolean).join(" - ");

    return (
        <tr className="text-gray-700">
            <td className="border border-gray-200 px-3 py-3 align-top">{siswa.noreg || "-"}</td>
            <td className="border border-gray-200 px-3 py-3 align-top">{siswa.nama || "-"}</td>
            <td className="border border-gray-200 px-3 py-3 align-top">{pilihan1 || "-"}</td>
            <td className="border border-gray-200 px-3 py-3 align-top">{pilihan2 || "-"}</td>
            <td className="border border-gray-200 px-3 py-3 align-top whitespace-nowrap">{siswa.tgl_daftar || "-"}</td>
            <td className="border border-gray-200 px-3 py-3 align-top whitespace-nowrap">
                {isValid ? (siswa.tgl_verifikasi || "-") : "-"}
            </td>
            <td className="border border-gray-200 px-3 py-3 align-top">
                <RekomendasiBadge value={siswa.reko ?? ""} valid={isValid} />
            </td>
        </tr>
    );
}

function RekomendasiBadge({ value, valid }: { value: string; valid: boolean }) {
    if (!valid || !value) return <span className="text-gray-400">-</span>;

    const code = value.trim().toUpperCase();
    const cfg =
        code === "A"   ? { cls: "bg-green-50 text-green-700 border-green-200", label: "A"   } :
        code === "B"   ? { cls: "bg-blue-50 text-blue-700 border-blue-200",    label: "B"   } :
        code === "C"   ? { cls: "bg-amber-50 text-amber-700 border-amber-200", label: "C"   } :
        code === "TES" ? { cls: "bg-red-50 text-red-700 border-red-200",       label: "Tes" } :
                         { cls: "bg-gray-50 text-gray-700 border-gray-200",    label: value };

    return (
        <span className={`inline-flex items-center justify-center min-w-[2.25rem] ${cfg.cls} border px-2 py-0.5 rounded font-semibold text-xs`}>
            {cfg.label}
        </span>
    );
}

function LegendItem({ code, label }: { code: string; label: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="inline-block min-w-[2.25rem] text-gray-700 font-semibold">{code}</span>
            <span className="text-gray-500">=</span>
            <span className="text-gray-700">{label}</span>
        </div>
    );
}
