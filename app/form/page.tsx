"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { saveSiswa } from "@/store/controllers/siswaController";
import { checkTunggakan } from "@/store/controllers/tunggakanController";
import { getProfile, getSignature, saveSignature } from "@/store/controllers/authController";
import { resetResponse } from "@/store/slices/siswaSlice";
import { resetTunggakan } from "@/store/slices/tunggakanSlice";
import { initialFormSiswa, SiswaFormData } from "@/store/types/SiswaTypes";
import { Jenjang, JenjangConfig } from "@/store/types/JenjangTypes";
import { handleChangeInput } from "@/libs/general";
import Swal from "sweetalert2";

const TAHUN_AJARAN_MULAI = new Date("2026-07-01");

const MIN_USIA_BY_JENJANG: Record<Jenjang, number> = {
    tk  : 4,
    sd  : 6,
    smp : 12,
    sma : 16,
};

const hitungUsiaTahun = (tanggalLahir: string, pada: Date) => {
    const td = new Date(tanggalLahir);
    if (isNaN(td.getTime())) return -1;
    let usia = pada.getFullYear() - td.getFullYear();
    const m  = pada.getMonth() - td.getMonth();
    if (m < 0 || (m === 0 && pada.getDate() < td.getDate())) usia--;
    return usia;
};

const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (value: string): boolean => EMAIL_REGEX.test(value);

const normalizePhoneInput = (value: string): string => {
    const onlyAllowed = value.replace(/[^\d+]/g, "");
    if (onlyAllowed.startsWith("+")) {
        return "+" + onlyAllowed.slice(1).replace(/\+/g, "");
    }
    return onlyAllowed.replace(/\+/g, "");
};

const isValidPhone = (value: string): boolean => PHONE_REGEX.test(value);

const maxTanggalLahirFor = (jenjang: Jenjang): string => {
    const batas = new Date(TAHUN_AJARAN_MULAI);
    batas.setFullYear(batas.getFullYear() - MIN_USIA_BY_JENJANG[jenjang]);
    const year  = batas.getFullYear();
    const month = String(batas.getMonth() + 1).padStart(2, "0");
    const day   = String(batas.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatTanggalId = (d: Date) =>
    d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

const steps = [1, 2, 3];
const tkProgramPilihan2Options = [
    "- Pilih -",
    "TODDLER",
    "Kelompok Bermain",
    "TK-A",
    "TK-B",
    "Luar BPK",
];
const tkProgramPilihanBySekolah: Record<string, string[]> = {
    "TKK BPK PENABUR Singgasana": [
        "- Pilih -",
        "Enriched Bilingual Programme (EBP)",
        "Early Childhood Programme (ECP)",
    ],
    "TKK BPK PENABUR KBP": [
        "- Pilih -",
        "Kelompok Bermain",
        "TK-A",
        "TK-B",
    ],
    "TKK BPK PENABUR Banda": [
        "- Pilih -",
        "Early Years Programme",
        "Kelompok Bermain",
        "TK-A",
        "TK-B",
    ],
};

const jenjangConfig: Record<Jenjang, JenjangConfig> = {
    tk: {
        label: "TK",
        peringatan: [
            "Data yang di input dalam form pendaftaran ini akan digunakan sebagai database siswa untuk sekolah dan dinas pendidikan (DAPODIKMEN), Kesalahan penginputan data di form ini menjadi tanggung jawab peserta didik",
            "Pendaftaran hanya boleh dilakukan 1 kali untuk 1 orang siswa.",
            "Durasi waktu pendaftaran adalah 10 menit, mohon mempersiapkan data no. SPB (untuk siswa BPK), NISN, NIK, Nama sesuai Akte Lahir, No. HP, Tempat/Tanggal Lahir, Alamat, Sekolah Asal, Nama Ayah Ibu dan Email sebelum melakukan pendaftaran",
        ],
        asalSekolahOptions: [
            "- Pilih -",
            "Luar BPK / Belum Sekolah",
            "TKK BPK PENABUR 246",
            "TKK BPK PENABUR 638",
            "TK BPK PENABUR Holis",
            "TKK BPK PENABUR Paskal",
            "TKK BPK PENABUR Guntur",
            "TKK BPK PENABUR Singgasana",
            "TKK BPK PENABUR KBP",
            "TKK BPK PENABUR Banda",
        ],
        programAsalOptions: ["Reguler", "Bilingual", "-"],
        pilihanSekolahOptions: [
            "- Pilih -",
            "TKK BPK PENABUR 246",
            "TKK BPK PENABUR 638",
            "TK BPK PENABUR Holis",
            "TKK BPK PENABUR Paskal",
            "TKK BPK PENABUR Guntur",
            "TKK BPK PENABUR Singgasana",
            "TKK BPK PENABUR KBP",
            "TKK BPK PENABUR Banda",
            "Luar BPK",
        ],
        programPilihanOptions: [
            "- Pilih -",
            "TODDLER",
            "Kelompok Bermain",
            "TK-A",
            "TK-B",
        ],
        sekolahAsalStep2Options: ["- Pilih -", "Lainnya"],
        sumbanganOptions: [
            "Rp. 0",
            "Rp. 100.000",
            "Rp. 200.000",
            "Rp. 300.000",
            "Rp. 400.000",
            "Rp. 500.000",
            "Rp. 600.000",
            "Rp. 700.000",
            "Rp. 800.000",
            "Rp. 900.000",
            "Rp. 1.000.000",
            "Rp. 1.500.000",
            "Rp. 2.000.000",
            "Rp. 2.500.000",
            "Rp. 3.000.000",
            "Rp. 3.500.000",
            "Rp. 4.000.000",
            "Rp. 4.500.000",
            "Rp. 5.000.000",
            "Lainnya",
        ],
    },
    sd: {
        label: "SD",
        peringatan: [
            "Data yang di input dalam form pendaftaran ini akan digunakan sebagai database siswa untuk sekolah dan dinas pendidikan (DAPODIKMEN), Kesalahan penginputan data di form ini menjadi tanggung jawab peserta didik",
            "Pendaftaran hanya boleh dilakukan 1 kali untuk 1 orang siswa.",
            "Durasi waktu pendaftaran adalah 10 menit, mohon mempersiapkan data No. SPB (untuk siswa BPK), NISN, NIK, Nama sesuai Akte Lahir, No HP, Tempat/Tanggal Lahir, Alamat, Sekolah Asal, Nama Ayah Ibu dan Email sebelum melakukan pendaftaran",
        ],
        asalSekolahOptions: [
            "- Pilih -",
            "TKK BPK PENABUR 246",
            "TKK BPK PENABUR 638",
            "TK BPK PENABUR Holis",
            "TKK BPK PENABUR Paskal",
            "TKK BPK PENABUR Guntur",
            "TKK BPK PENABUR Singgasana",
            "TKK BPK PENABUR KBP",
            "TKK BPK PENABUR Banda",
            "Luar BPK",
        ],
        programAsalOptions:    ["Reguler", "bilingual"],
        pilihanSekolahOptions: ["- Pilih -", "SDK 1 BPK PENABUR", "SDK 2 BPK PENABUR", "SDK 3 BPK PENABUR", "Luar BPK"],
        programPilihanOptions:   ["- Pilih -", "Classical", "Reguler"],
        sekolahAsalStep2Options: ["- Pilih -", "TKK BPK PENABUR", "Luar BPK"],
        sumbanganOptions:        ["Rp. 0", "Rp. 1.000.000", "Rp. 5.000.000", "Rp. 10.000.000", "Rp. 25.000.000", "Rp. 50.000.000", "Lainnya"],
    },
    smp: {
        label: "SMP",
        peringatan: [
            "Data yang di input dalam form pendaftaran ini akan digunakan sebagai database siswa untuk sekolah dan dinas pendidikan (DAPODIKMEN), Kesalahan penginputan data di form ini menjadi tanggung jawab peserta didik",
            "Pendaftaran hanya boleh dilakukan 1 kali untuk 1 orang siswa.",
            "Pilihan program studi tertentu (Bilingual) akan ditentukan oleh hasil Psikotes/Tes Masuk Khusus",
            "Durasi waktu pendaftaran adalah 10 menit, mohon mempersiapkan data SPB(untuk siswa BPK), NISN, NIK, Nama sesuai Akte Lahir, No. HP, Tempat/Tanggal Lahir, Alamat, Sekolah Asal, Nama Ayah Ibu dan Email sebelum melakukan pendaftaran",
        ],
        asalSekolahOptions:    ["- Pilih -", "SDK BPK PENABUR", "Luar BPK"],
        programAsalOptions:    ["Reguler"],
        pilihanSekolahOptions: ["- Pilih -", "SMPK 1 BPK PENABUR", "SMPK 2 BPK PENABUR", "SMPK 3 BPK PENABUR", "Luar BPK"],
        programPilihanOptions:   ["- Pilih -", "Reguler", "Bilingual"],
        sekolahAsalStep2Options: ["- Pilih -", "SDK BPK PENABUR", "Luar BPK"],
        sumbanganOptions:        ["Rp. 0", "Rp. 1.000.000", "Rp. 5.000.000", "Rp. 10.000.000", "Rp. 25.000.000", "Rp. 50.000.000", "Lainnya"],
    },
    sma: {
        label: "SMA",
        peringatan: [
            "Data yang di input dalam form pendaftaran ini akan digunakan sebagai database siswa untuk sekolah dan dinas pendidikan (DAPODIKMEN), Kesalahan penginputan data di form ini menjadi tanggung jawab peserta didik",
            "Pendaftaran hanya boleh dilakukan 1 kali untuk 1 orang siswa.",
            "Untuk program DCP SMAK 1 BPK PENABUR hanya untuk siswa DCP dari SMPK 1 BPK PENABUR",
            "Pilihan program studi tertentu (IPA/Bilingual/LSP) akan ditentukan oleh hasil Psikotes/Tes Masuk Khusus",
            "Durasi waktu pendaftaran adalah 10 menit, mohon mempersiapkan data SPB(untuk siswa BPK), NISN, NIK, Nama sesuai Akte Lahir, No. HP, Tempat/Tanggal Lahir, Alamat, Sekolah Asal, Nama Ayah Ibu dan Email sebelum melakukan pendaftaran",
        ],
        asalSekolahOptions:    ["- Pilih -", "SMPK BPK PENABUR", "Luar BPK"],
        programAsalOptions:    ["Reguler"],
        pilihanSekolahOptions: ["- Pilih -", "SMAK 1 BPK PENABUR", "SMAK 2 BPK PENABUR", "SMAK 3 BPK PENABUR", "Luar BPK"],
        programPilihanOptions:   ["- Pilih -", "Reguler", "IPA", "Bilingual", "LSP", "DCP"],
        sekolahAsalStep2Options: ["- Pilih -", "SMPK BPK PENABUR", "Luar BPK"],
        sumbanganOptions:        ["Rp. 0", "Rp. 1.000.000", "Rp. 5.000.000", "Rp. 10.000.000", "Rp. 25.000.000", "Rp. 50.000.000", "Lainnya"],
    },
};

function parseJenjang(value: string | null): Jenjang {
    const v = (value ?? "").toLowerCase();
    return v === "tk" || v === "sd" || v === "smp" || v === "sma" ? v : "sd";
}

export default function FormPage() {
    return (
        <Suspense fallback={null}>
            <FormPageRouter />
        </Suspense>
    );
}

function FormPageRouter() {
    const searchParams         = useSearchParams();
    const jenjang              = parseJenjang(searchParams.get("jenjang"));
    return <FormPageContent key={jenjang} jenjang={jenjang} />;
}

function FormPageContent({ jenjang }: { jenjang: Jenjang }) {
    const config                                    = jenjangConfig[jenjang];
    const dispatch                                  = useAppDispatch();
    const { loading: tunggakanLoading }             = useAppSelector((state) => state.tunggakan);

    const [currentStep, setCurrentStep]             = useState(1);
    const [asalSekolah, setAsalSekolah]             = useState("- Pilih -");
    const [programAsal, setProgramAsal]             = useState("Reguler");
    const [pilihan1,    setPilihan1]                = useState("- Pilih -");
    const [program1,    setProgram1]                = useState("- Pilih -");
    const [pilihan2,    setPilihan2]                = useState("- Pilih -");
    const [program2,    setProgram2]                = useState("- Pilih -");
    const [noSpb,       setNoSpb]                   = useState("");
    const [tanggalLahirAwal, setTanggalLahirAwal]   = useState("");

    const isDariBpk  = asalSekolah.includes("BPK PENABUR");
    const isTargetTk = jenjang === "tk";

    const getProgramPilihanOptions = (pilihanSekolah: string) => {
        if (jenjang === "tk") {
            return tkProgramPilihanBySekolah[pilihanSekolah] ?? config.programPilihanOptions;
        }

        return config.programPilihanOptions;
    };

    const program1Options = getProgramPilihanOptions(pilihan1);
    const program2Options = jenjang === "tk" ? tkProgramPilihan2Options : getProgramPilihanOptions(pilihan2);
    const pilihan1Options = jenjang === "tk"
        ? config.pilihanSekolahOptions.filter((opt) => opt !== "Luar BPK")
        : config.pilihanSekolahOptions;
    const isSelected      = (v: string) => v !== "- Pilih -" && v !== "-" && v.trim() !== "";
    const isPilihanValid  = (pilihan: string, options: string[]) => isSelected(pilihan) && options.includes(pilihan);
    const isProgramValid  = (program: string, options: string[]) => isSelected(program) && options.includes(program);
    const minUsiaStep1        = MIN_USIA_BY_JENJANG[jenjang];
    const isUsiaStep1Valid    = !isTargetTk || (
        tanggalLahirAwal !== "" && hitungUsiaTahun(tanggalLahirAwal, TAHUN_AJARAN_MULAI) >= minUsiaStep1
    );
    const isStep1Valid  = isSelected(asalSekolah) && isSelected(programAsal) &&
                          isPilihanValid(pilihan1, pilihan1Options) && isProgramValid(program1, program1Options) &&
                          isPilihanValid(pilihan2, config.pilihanSekolahOptions) && isProgramValid(program2, program2Options) &&
                          isUsiaStep1Valid;

    const handlePilihan1Change = (value: string) => {
        setPilihan1(value);
        setProgram1("- Pilih -");
    };

    const handlePilihan2Change = (value: string) => {
        setPilihan2(value);
        setProgram2("- Pilih -");
    };

    const goNext = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isStep1Valid) return;

        if (isTargetTk) {
            if (!tanggalLahirAwal) {
                Swal.fire({
                    icon               : "warning",
                    title              : "Tanggal Lahir Diperlukan",
                    text               : "Mohon isi tanggal lahir calon siswa untuk validasi usia minimum TK.",
                    confirmButtonColor : "#dc2626",
                });
                return;
            }
            const minUsia = MIN_USIA_BY_JENJANG[jenjang];
            const usia    = hitungUsiaTahun(tanggalLahirAwal, TAHUN_AJARAN_MULAI);
            if (usia < minUsia) {
                Swal.fire({
                    icon               : "error",
                    title              : "Usia Belum Mencukupi",
                    html               : `
                        Usia minimum untuk jenjang ${jenjang.toUpperCase()} adalah <b>${minUsia} tahun</b> pada saat tahun ajaran dimulai
                        (<b>${formatTanggalId(TAHUN_AJARAN_MULAI)}</b>).
                        <br/>Usia calon siswa pada tanggal tersebut: <b>${usia < 0 ? 0 : usia} tahun</b>.
                    `,
                    confirmButtonColor : "#dc2626",
                });
                return;
            }
        }

        if (isDariBpk) {
            if (!noSpb.trim()) {
                Swal.fire({
                    icon               : "warning",
                    title              : "Nomor SPB Diperlukan",
                    text               : "Pendaftar dari BPK PENABUR wajib mengisi Nomor SPB.",
                    confirmButtonColor : "#dc2626",
                });
                return;
            }

            try {
                const result = await dispatch(checkTunggakan({ noSpb: noSpb.trim() })).unwrap();

                if (result.status === 404 || !result.data) {
                    Swal.fire({
                        icon               : "error",
                        title              : "Nomor SPB Tidak Ditemukan",
                        text               : "Nomor SPB tidak dikenali sistem. Mohon periksa kembali Nomor SPB Anda.",
                        confirmButtonColor : "#dc2626",
                    });
                    dispatch(resetTunggakan());
                    return;
                }

                const adaTunggakan = result.data.tunggakan &&
                                     result.data.tunggakan !== "0" &&
                                     result.data.tunggakan.toLowerCase() !== "lunas";

                if (adaTunggakan) {
                    await Swal.fire({
                        icon               : "warning",
                        title              : "Ups, Kamu Masih Memiliki Tunggakan!",
                        text               : "Silahkan hubungi admin untuk lebih lanjut",
                        confirmButtonText  : "Tutup",
                        confirmButtonColor : "#dc2626",
                    });
                    dispatch(resetTunggakan());
                    return;
                }

                dispatch(resetTunggakan());
            } catch {
                Swal.fire({
                    icon               : "error",
                    title              : "Gagal Memeriksa Tunggakan",
                    text               : "Terjadi kesalahan saat menghubungi server. Silakan coba lagi.",
                    confirmButtonColor : "#dc2626",
                });
                return;
            }
        }

        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const goBack = () => {
        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const goToPreview = () => {
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const backFromPreview = () => {
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <>
            <Navbar />

            <main className="flex-1 relative overflow-hidden bg-slate-50">
                <div className="absolute inset-0 -z-10 pointer-events-none">
                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl" />
                    <div className="absolute top-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-red-200/30 blur-3xl" />
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d47a1] via-[#1565c0] to-[#1976d2] text-white p-8 sm:p-10 mb-8 shadow-[0_20px_60px_-20px_rgba(13,71,161,0.6)]">
                        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border-[30px] border-white/5" />
                        <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-white/5" />
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-xs font-semibold uppercase tracking-wider ring-1 ring-white/25">
                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />
                                    Jenjang {config.label}
                                </span>
                                <span className="text-xs text-blue-100/80 font-medium">SPMB 2026 / 2027</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight">
                                Formulir Pendaftaran Online
                            </h1>
                            <p className="mt-2 text-sm sm:text-base text-blue-100/90">
                                BPK PENABUR Bandung — lengkapi data dengan benar untuk melanjutkan proses penerimaan.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center mb-10">
                        {steps.map((step, idx) => {
                            const isActive = step === currentStep;
                            const isDone   = step < currentStep;
                            const stepLabel = step === 1 ? "Pilihan Sekolah" : step === 2 ? "Data Pendaftar" : "Konfirmasi";
                            return (
                                <div key={step} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all ${
                                                isActive
                                                    ? "bg-gradient-to-br from-[#1976d2] to-[#0d47a1] border-[#1976d2] text-white shadow-lg shadow-blue-500/30 scale-110"
                                                    : isDone
                                                    ? "bg-gradient-to-br from-[#1976d2] to-[#0d47a1] border-[#1976d2] text-white"
                                                    : "bg-white border-gray-300 text-gray-400"
                                            }`}
                                        >
                                            {isDone ? (
                                                <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M3 7l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            ) : (
                                                step
                                            )}
                                        </div>
                                        <span className={`mt-2 text-xs font-medium hidden sm:block ${
                                            isActive || isDone ? "text-[#1976d2]" : "text-gray-400"
                                        }`}>
                                            {stepLabel}
                                        </span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div
                                            className={`w-16 md:w-32 h-0.5 mx-2 sm:mx-3 mb-5 sm:mb-6 transition-all ${
                                                isDone ? "bg-gradient-to-r from-[#1976d2] to-[#0d47a1]" : "bg-gray-300"
                                            }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {currentStep === 1 && (
                        <>
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white p-6 mb-8 shadow-lg shadow-red-500/20">
                                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
                                <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-white/5" />
                                <div className="relative">
                                    <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 ring-1 ring-white/30">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                        Peringatan Penting
                                    </h2>
                                    <ol className="list-decimal list-inside space-y-1.5 text-sm leading-relaxed marker:text-white/70">
                                        {config.peringatan.map((text, i) => (
                                            <li key={i}>{text}</li>
                                        ))}
                                    </ol>
                                </div>
                            </div>

                            <form className="space-y-6" onSubmit={goNext}>
                                <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100 flex items-center gap-3">
                                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-[#1976d2]">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                        Asal Sekolah
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectField label="Asal Sekolah" required value={asalSekolah} onChange={setAsalSekolah}>
                                            {config.asalSekolahOptions.map((opt) => (
                                                <option key={opt}>{opt}</option>
                                            ))}
                                        </SelectField>
                                        <SelectField label="Program" required value={programAsal} onChange={setProgramAsal}>
                                            {config.programAsalOptions.map((opt) => (
                                                <option key={opt}>{opt}</option>
                                            ))}
                                        </SelectField>
                                        {isDariBpk && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nomor SPB
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <p className="text-xs italic text-gray-500 -mt-1 mb-2">
                                                    Wajib diisi untuk pendaftar dari BPK PENABUR (untuk pengecekan tunggakan)
                                                </p>
                                                <input
                                                    type="text"
                                                    value={noSpb}
                                                    onChange={(e) => setNoSpb(e.target.value)}
                                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1976d2] transition"
                                                />
                                            </div>
                                        )}
                                        {isTargetTk && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Tanggal Lahir Calon Siswa
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <p className="text-xs italic text-gray-500 -mt-1 mb-2">
                                                    Minimum usia {MIN_USIA_BY_JENJANG[jenjang]} tahun pada {formatTanggalId(TAHUN_AJARAN_MULAI)} (awal tahun ajaran)
                                                </p>
                                                <input
                                                    type="date"
                                                    value={tanggalLahirAwal}
                                                    onChange={(e) => setTanggalLahirAwal(e.target.value)}
                                                    max={maxTanggalLahirFor(jenjang)}
                                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1976d2] transition"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100 flex items-center gap-3">
                                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-600">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                        Pilihan Sekolah
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <SelectField label="Pilihan 1" required value={pilihan1} onChange={handlePilihan1Change}>
                                            {pilihan1Options.map((opt) => (
                                                <option key={opt}>{opt}</option>
                                            ))}
                                        </SelectField>
                                        <SelectField label="Program" required value={program1} onChange={setProgram1}>
                                            {program1Options.map((opt) => (
                                                <option key={opt}>{opt}</option>
                                            ))}
                                        </SelectField>
                                        <SelectField label="Pilihan 2" required value={pilihan2} onChange={handlePilihan2Change}>
                                            {config.pilihanSekolahOptions.map((opt) => (
                                                <option key={opt}>{opt}</option>
                                            ))}
                                        </SelectField>
                                        <SelectField label="Program" required value={program2} onChange={setProgram2}>
                                            {program2Options.map((opt) => (
                                                <option key={opt}>{opt}</option>
                                            ))}
                                        </SelectField>
                                    </div>
                                </section>

                                <button
                                    type="submit"
                                    disabled={!isStep1Valid || tunggakanLoading}
                                    className="group w-full bg-gradient-to-r from-[#1976d2] to-[#0d47a1] hover:from-[#1565c0] hover:to-[#0d47a1] text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.99] disabled:bg-gray-300 disabled:bg-none disabled:shadow-none disabled:cursor-not-allowed"
                                >
                                    {tunggakanLoading ? "Memeriksa Tunggakan..." : "Berikutnya"}
                                    {!tunggakanLoading && (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform">
                                            <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {currentStep >= 2 && (
                        <FormStep2
                            jenjang={jenjang}
                            asalSekolah={asalSekolah}
                            programAsal={programAsal}
                            pilihan1={pilihan1}
                            program1={program1}
                            pilihan2={pilihan2}
                            program2={program2}
                            noSpb={noSpb}
                            tanggalLahirAwal={tanggalLahirAwal}
                            sekolahAsalStep2Options={config.sekolahAsalStep2Options}
                            sumbanganOptions={config.sumbanganOptions}
                            showPreview={currentStep === 3}
                            onBack={goBack}
                            onEnterPreview={goToPreview}
                            onExitPreview={backFromPreview}
                        />
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}

function FormStep2({
    jenjang,
    asalSekolah,
    programAsal,
    pilihan1,
    program1,
    pilihan2,
    program2,
    noSpb,
    tanggalLahirAwal,
    sekolahAsalStep2Options,
    sumbanganOptions,
    showPreview,
    onBack,
    onEnterPreview,
    onExitPreview,
}: {
    jenjang: Jenjang;
    asalSekolah: string;
    programAsal: string;
    pilihan1: string;
    program1: string;
    pilihan2: string;
    program2: string;
    noSpb: string;
    tanggalLahirAwal: string;
    sekolahAsalStep2Options: string[];
    sumbanganOptions: string[];
    showPreview: boolean;
    onBack: () => void;
    onEnterPreview: () => void;
    onExitPreview: () => void;
}) {
    const isDariBpk = asalSekolah.includes("BPK PENABUR");
    const maxTanggalLahir = maxTanggalLahirFor(jenjang);
    const minUsiaJenjang  = MIN_USIA_BY_JENJANG[jenjang];
    const isUsiaValid     = (tanggal: string) => {
        if (!tanggal) return false;
        return hitungUsiaTahun(tanggal, TAHUN_AJARAN_MULAI) >= minUsiaJenjang;
    };
    const isPhoneRequiredValid = (value: string) => isValidPhone(value);
    const isPhoneOptionalValid = (value: string) => !value || isValidPhone(value);
    const isEmailValid         = (value: string) => !value || isValidEmail(value);
    const isExactDigits        = (value: string, n: number) => !value || /^\d+$/.test(value) && value.length === n;
    const dispatch                                  = useAppDispatch();
    const { loading, response }                     = useAppSelector((state) => state.siswa);
    const authProfile                               = useAppSelector((state) => state.auth.profile);
    const storedSignature                           = useAppSelector((state) => state.auth.signature);
    const signatureSaving                           = useAppSelector((state) => state.auth.signatureSaving);
    const [cachedEmail]                             = useState(() =>
        typeof window !== "undefined" ? localStorage.getItem("auth-email") || "" : ""
    );
    const [formData, setFormData]                   = useState<SiswaFormData>({
        ...initialFormSiswa,
        tanggalLahir: tanggalLahirAwal || initialFormSiswa.tanggalLahir,
    });
    const [jenisKelamin, setJenisKelamin]           = useState("");
    const [sekolahAsalSelect, setSekolahAsalSelect] = useState("- Pilih -");
    const [sumbangan, setSumbangan]                 = useState("Rp. 0");
    const [sumbanganLainnya, setSumbanganLainnya]   = useState("");
    const [signatureData, setSignatureData]         = useState<string>("");

    const loginEmail = authProfile?.email || cachedEmail || "";

    useEffect(() => {
        if (!authProfile?.email) {
            dispatch(getProfile());
        }
    }, [dispatch, authProfile?.email]);

    useEffect(() => {
        if (authProfile?.email) {
            localStorage.setItem("auth-email", authProfile.email);
        }
    }, [authProfile?.email]);

    useEffect(() => {
        dispatch(getSignature());
    }, [dispatch]);

    useEffect(() => {
        if (storedSignature && !signatureData) {
            setSignatureData(storedSignature);
            setFormData((prev) => ({ ...prev, tandaTanganOrtu: storedSignature }));
        }
    }, [storedSignature, signatureData]);

    useEffect(() => {
        if (response?.status === 200) {
            const noreg = response.data?.noreg ?? "";

            Swal.fire({
                icon              : 'success',
                title             : 'Pendaftaran Berhasil',
                html              : `
                    <p style="margin:0 0 10px 0;">No. Registrasi: <b>${noreg}</b></p>
                    <p style="margin:0 0 14px 0;color:#555;font-size:14px;">
                        Notifikasi telah dikirim ke <b>email login</b> Anda dan <b>WhatsApp</b> ke nomor terdaftar.
                        Silahkan cek email Anda untuk melihat informasi pendaftaran lebih lanjut
                        (No. VA, Username, Password, dll).
                    </p>
                    <div style="margin-top:12px;padding:12px 14px;border-radius:10px;background:#eff6ff;border:1px solid #bfdbfe;color:#1e3a8a;font-size:13px;text-align:left;line-height:1.55;">
                        <b>Langkah Selanjutnya:</b><br/>
                        Silakan login ke <b>Dashboard</b> dan lengkapi / perbarui <b>Data Profile</b> Anda agar proses pendaftaran dapat dilanjutkan.
                    </div>
                `,
                confirmButtonColor: '#dc2626',
                confirmButtonText : 'Ke Dashboard',
                allowOutsideClick : false,
                allowEscapeKey    : false,
            }).then(() => {
                dispatch(resetResponse());
                window.location.href = "/dashboard";
            });
        } else if (response?.status === 422) {
            Swal.fire({
                icon  : 'error',
                title : 'Validasi Gagal',
                text  : 'Mohon lengkapi semua data yang wajib diisi',
            });
            dispatch(resetResponse());
        } else if (response?.status === 500) {
            Swal.fire({
                icon  : 'error',
                title : 'Gagal',
                text  : response.message ?? 'Terjadi kesalahan server',
            });
            dispatch(resetResponse());
        }
    }, [response, dispatch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const phoneChecks: Array<{ label: string; value: string; required: boolean }> = [
            { label: "No HP (WhatsApp)", value: formData.noHp,      required: true  },
            { label: "No. HP. Ayah",     value: formData.noHpAyah,  required: true  },
            { label: "No. HP. Ibu",      value: formData.noHpIbu,   required: true  },
            { label: "No. HP. Wali",     value: formData.noHpWali,  required: false },
        ];

        for (const phone of phoneChecks) {
            if (!phone.value && !phone.required) continue;
            if (!isValidPhone(phone.value)) {
                Swal.fire({
                    icon               : "error",
                    title              : "Nomor Telepon Tidak Valid",
                    text               : `Format ${phone.label} tidak valid. Contoh: 08123456789`,
                    confirmButtonColor : "#dc2626",
                });
                return;
            }
        }

        const digitChecks: Array<{ label: string; value: string; length: number }> = [
            { label: "NISN", value: formData.nisn, length: 10 },
            { label: "NIK",  value: formData.nik,  length: 16 },
            { label: "NoKK", value: formData.nokk, length: 16 },
        ];

        for (const field of digitChecks) {
            if (!field.value) continue;
            if (!isExactDigits(field.value, field.length)) {
                Swal.fire({
                    icon               : "error",
                    title              : `${field.label} Tidak Valid`,
                    text               : `${field.label} harus ${field.length} digit angka.`,
                    confirmButtonColor : "#dc2626",
                });
                return;
            }
        }

        if (loginEmail && !isEmailValid(loginEmail)) {
            Swal.fire({
                icon               : "error",
                title              : "Email Tidak Valid",
                text               : "Format email tidak valid. Contoh: nama@gmail.com",
                confirmButtonColor : "#dc2626",
            });
            return;
        }

        if (formData.tanggalLahir) {
            const usia = hitungUsiaTahun(formData.tanggalLahir, TAHUN_AJARAN_MULAI);
            if (usia < minUsiaJenjang) {
                Swal.fire({
                    icon               : "error",
                    title              : "Usia Belum Mencukupi",
                    html               : `
                        Usia minimum untuk jenjang ${jenjang.toUpperCase()} adalah <b>${minUsiaJenjang} tahun</b> pada saat tahun ajaran dimulai
                        (<b>${formatTanggalId(TAHUN_AJARAN_MULAI)}</b>).
                        <br/>Usia calon siswa pada tanggal tersebut: <b>${usia < 0 ? 0 : usia} tahun</b>.
                    `,
                    confirmButtonColor : "#dc2626",
                });
                return;
            }
        }

        if (!signatureData) {
            Swal.fire({
                icon               : "warning",
                title              : "Tanda Tangan Diperlukan",
                text               : "Mohon bubuhkan tanda tangan Orang Tua / Wali sebelum melanjutkan.",
                confirmButtonColor : "#dc2626",
            });
            return;
        }

        onEnterPreview();
    };

    const handleConfirmSubmit = async () => {
        const sekolahAsal = formData.sekolahAsalNama || sekolahAsalSelect;

        const isNewSignature = signatureData && signatureData.startsWith('data:image/');
        let signatureUrl     = storedSignature ?? "";

        if (isNewSignature) {
            try {
                const result = await dispatch(saveSignature({ signature: signatureData })).unwrap();
                signatureUrl = result?.data?.signature ?? "";
            } catch {
                Swal.fire({
                    icon               : "error",
                    title              : "Gagal Menyimpan Tanda Tangan",
                    text               : "Terjadi kesalahan saat menyimpan tanda tangan. Silakan coba lagi.",
                    confirmButtonColor : "#dc2626",
                });
                return;
            }
        }

        dispatch(saveSiswa({
            ...formData,
            tandaTanganOrtu: signatureUrl,
            email: loginEmail,
            jenisKelamin,
            sekolahAsal,
            programAsal,
            pilihan1,
            program1,
            pilihan2,
            program2,
            jenjang,
            noSpb,
        }));
    };

    const formatTanggalLahirId = (d: string) => {
        if (!d) return "-";
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        return formatTanggalId(date);
    };

    const sekolahAsalPreview  = formData.sekolahAsalNama || sekolahAsalSelect;
    const sumbanganPreviewVal = sumbanganLainnya
        ? `${sumbangan}${sumbangan !== "Lainnya" ? " + " : ""}${sumbanganLainnya}`
        : sumbangan;

    if (showPreview) {
        return (
            <>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 mb-6 shadow-lg shadow-amber-500/20">
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-8 -left-6 w-28 h-28 rounded-full bg-white/5" />
                    <div className="relative flex items-start gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 ring-1 ring-white/30 flex-shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </span>
                        <div>
                            <h2 className="font-semibold text-base sm:text-lg mb-1">Preview Data Pendaftaran</h2>
                            <p className="text-sm text-amber-50/95 leading-relaxed">
                                Mohon periksa kembali data di bawah ini. Jika sudah benar, klik <b>Kirim Pendaftaran</b>. Jika ada yang perlu diubah, klik <b>Kembali</b>.
                            </p>
                        </div>
                    </div>
                </div>

                <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100 flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-600">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        Pilihan Sekolah
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <PreviewField label="Asal Sekolah" value={asalSekolah} />
                        <PreviewField label="Program Asal" value={programAsal} />
                        {isDariBpk && <PreviewField label="Nomor SPB" value={noSpb} />}
                        <PreviewField label="Pilihan 1" value={pilihan1} />
                        <PreviewField label="Program Pilihan 1" value={program1} />
                        <PreviewField label="Pilihan 2" value={pilihan2} />
                        <PreviewField label="Program Pilihan 2" value={program2} />
                    </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100 flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-[#1976d2]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="8.5" cy="7" r="4" />
                                <path d="M20 8v6M23 11h-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        Biodata Siswa
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <PreviewField label="NISN" value={formData.nisn} />
                        <PreviewField label="NIK" value={formData.nik} />
                        <PreviewField label="Nomor Kartu Keluarga" value={formData.nokk} />
                        <PreviewField label="Nama Lengkap" value={formData.nama} />
                        <PreviewField label="Tempat Lahir" value={formData.tempatLahir} />
                        <PreviewField label="Tanggal Lahir" value={formatTanggalLahirId(formData.tanggalLahir)} />
                        <PreviewField label="Jenis Kelamin" value={jenisKelamin} />
                        <PreviewField label="No HP (WhatsApp)" value={formData.noHp} />
                        <PreviewField label="Email" value={loginEmail} />
                        <PreviewField label="Sekolah Asal" value={sekolahAsalPreview} />
                        <PreviewField label="Kota Sekolah Asal" value={formData.kotaSekolahAsal} />
                        <div className="md:col-span-2">
                            <PreviewField label="Alamat Rumah" value={formData.alamat} multiline />
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100 flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 text-purple-600">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="9" cy="7" r="4" />
                            </svg>
                        </span>
                        Biodata Keluarga
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <PreviewField label="Nama Ayah" value={formData.namaAyah} />
                        <PreviewField label="No. HP. Ayah" value={formData.noHpAyah} />
                        <PreviewField label="Nama Ibu" value={formData.namaIbu} />
                        <PreviewField label="No. HP. Ibu" value={formData.noHpIbu} />
                        <PreviewField label="Nama Wali" value={formData.namaWali} />
                        <PreviewField label="No. HP. Wali" value={formData.noHpWali} />
                    </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100 flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-rose-50 text-rose-600">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 19l7-7 3 3-7 7-3-3z" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 2l7.586 7.586" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="11" cy="11" r="2" />
                            </svg>
                        </span>
                        Tanda Tangan Orang Tua / Wali
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <PreviewField label="Nama Penanda Tangan" value={formData.namaAyah} />
                        <div>
                            <div className="block text-sm font-medium text-gray-600 mb-2">Tanda Tangan</div>
                            {signatureData ? (
                                <div className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={signatureData} alt="Tanda Tangan" className="max-h-32 object-contain" />
                                </div>
                            ) : (
                                <div className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-gray-50">-</div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100 flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <path d="M2 10h20" />
                            </svg>
                        </span>
                        Data Administratif
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <PreviewField label="Uang Sumbangan Sukarela" value={sumbanganPreviewVal} />
                    </div>
                </section>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-gray-700 mb-6">
                    <p className="flex items-start gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 flex-shrink-0 mt-0.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>
                            Pastikan seluruh data di atas sudah benar. Setelah dikirim, data tidak dapat diubah melalui form ini.
                        </span>
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={onExitPreview}
                        disabled={loading || signatureSaving}
                        className="px-6 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Kembali
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmSubmit}
                        disabled={loading || signatureSaving}
                        className="group flex-1 bg-gradient-to-r from-[#1976d2] to-[#0d47a1] hover:from-[#1565c0] hover:to-[#0d47a1] text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.99] disabled:bg-gray-300 disabled:bg-none disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        {loading || signatureSaving ? "Mengirim..." : "Kirim Pendaftaran"}
                        {!(loading || signatureSaving) && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-[#1976d2]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                    <h3 className="text-sm font-semibold text-gray-800">Ringkasan Pilihan Sekolah</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                        <div className="text-xs uppercase tracking-wide text-[#1976d2] font-semibold mb-1">Pilihan 1</div>
                        <div className="text-gray-800 font-medium">{pilihan1}</div>
                        <div className="text-xs text-gray-500 mt-1">Program: {program1}</div>
                    </div>
                    <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                        <div className="text-xs uppercase tracking-wide text-[#1976d2] font-semibold mb-1">Pilihan 2</div>
                        <div className="text-gray-800 font-medium">{pilihan2}</div>
                        <div className="text-xs text-gray-500 mt-1">Program: {program2}</div>
                    </div>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white p-5 mb-8 shadow-lg shadow-red-500/20">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
                <div className="relative flex items-start gap-3 text-sm leading-relaxed">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 ring-1 ring-white/30 flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                    <span>
                        Untuk mendapatkan potongan pelunasan dan potongan tambahan Amaze U, Orang Tua Pendaftar dapat segera melakukan pembayaran tahap 1 di sekolah pilihan pertama sebelum 27 Juli 2025. (Kami tidak menyarankan pembayaran di lokasi pameran Amaze U) Terima kasih
                    </span>
                </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100 flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-[#1976d2]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="8.5" cy="7" r="4" />
                                <path d="M20 8v6M23 11h-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        Biodata Siswa
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField label="Nomor Induk Siswa Nasional (NISN)" doubleRequired digitsOnly exactLength={10} name="nisn" value={formData.nisn} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Nomor Induk Kependudukan (NIK)" doubleRequired digitsOnly exactLength={16} name="nik" value={formData.nik} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Nomor Kartu Keluarga (NoKK)" doubleRequired digitsOnly exactLength={16} name="nokk" value={formData.nokk} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Nama Lengkap" required hint="Sesuai Akte Lahir Anak" name="nama" value={formData.nama} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Tempat Lahir" required name="tempatLahir" value={formData.tempatLahir} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Tanggal Lahir" required type="date" name="tanggalLahir" value={formData.tanggalLahir} max={maxTanggalLahir} hint={`Minimum usia ${minUsiaJenjang} tahun pada ${formatTanggalId(TAHUN_AJARAN_MULAI)}`} onChange={(e) => handleChangeInput(e, setFormData)} />

                        <div>
                            <Label required>Jenis Kelamin</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {["Laki-laki", "Perempuan"].map((opt) => {
                                    const active = jenisKelamin === opt;
                                    return (
                                        <label
                                            key={opt}
                                            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border cursor-pointer text-sm transition ${
                                                active
                                                    ? "border-[#1976d2] bg-blue-50 text-[#1976d2] font-medium ring-2 ring-blue-200"
                                                    : "border-gray-200 bg-gray-50/50 text-gray-700 hover:bg-white hover:border-gray-300"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="jk"
                                                value={opt}
                                                checked={active}
                                                onChange={(e) => setJenisKelamin(e.target.value)}
                                                className="sr-only"
                                            />
                                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                active ? "border-[#1976d2]" : "border-gray-300"
                                            }`}>
                                                {active && <span className="w-2 h-2 rounded-full bg-[#1976d2]" />}
                                            </span>
                                            {opt}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <InputField label="No HP (WhatsApp) Untuk Informasi Akademik" required type="tel" name="noHp" value={formData.noHp} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Email (Akun Login)" type="email" doubleRequired name="email" value={loginEmail} readOnly hint="Email diambil dari akun login. Notifikasi pendaftaran akan dikirim ke email ini." />

                        <div className="md:col-span-1">
                            <Label required>Alamat Rumah</Label>
                            <textarea
                                name="alamat"
                                value={formData.alamat}
                                onChange={(e) => handleChangeInput(e, setFormData)}
                                rows={5}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1976d2] transition resize-none"
                            />
                        </div>

                        <div className="space-y-5">
                            <div>
                                <Label required>Sekolah Asal</Label>
                                <select
                                    value={sekolahAsalSelect}
                                    onChange={(e) => setSekolahAsalSelect(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1976d2] transition appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1rem] pr-10"
                                    style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e\")" }}
                                >
                                    {sekolahAsalStep2Options.map((opt) => (
                                        <option key={opt}>{opt}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    name="sekolahAsalNama"
                                    value={formData.sekolahAsalNama}
                                    onChange={(e) => handleChangeInput(e, setFormData)}
                                    placeholder="Nama sekolah lainnya (jika tidak ada di pilihan)"
                                    className="w-full mt-2 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1976d2] transition"
                                />
                                <p className="text-xs italic text-gray-500 mt-1.5">
                                    Nama Sekolah Asal Jika Tidak ada di Pilihan
                                </p>
                            </div>
                            <InputField label="Kota Sekolah Asal" required name="kotaSekolahAsal" value={formData.kotaSekolahAsal} onChange={(e) => handleChangeInput(e, setFormData)} />
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100 flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 text-purple-600">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="9" cy="7" r="4" />
                            </svg>
                        </span>
                        Biodata Keluarga
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField label="Nama Ayah" required hint="Sesuai Akte Lahir Anak" name="namaAyah" value={formData.namaAyah} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Nama Ibu" required hint="Sesuai Akte Lahir Anak" name="namaIbu" value={formData.namaIbu} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="No. HP. Ayah" required type="tel" name="noHpAyah" value={formData.noHpAyah} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="No. HP. Ibu" required type="tel" name="noHpIbu" value={formData.noHpIbu} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Nama Wali" name="namaWali" value={formData.namaWali} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="No. HP. Wali" type="tel" name="noHpWali" value={formData.noHpWali} onChange={(e) => handleChangeInput(e, setFormData)} />
                    </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100 flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-rose-50 text-rose-600">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 19l7-7 3 3-7 7-3-3z" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 2l7.586 7.586" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="11" cy="11" r="2" />
                            </svg>
                        </span>
                        Tanda Tangan Orang Tua / Wali
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <Label required>Nama Penanda Tangan</Label>
                            <input
                                type="text"
                                value={formData.namaAyah}
                                readOnly
                                placeholder="Otomatis terisi dari Nama Ayah"
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 bg-gray-100 cursor-not-allowed"
                            />
                            <p className="text-xs italic text-gray-500 mt-1.5">
                                Nama otomatis menggunakan Nama Ayah yang Anda isi pada bagian Biodata Keluarga.
                            </p>
                        </div>
                        <div>
                            <Label required>Tanda Tangan</Label>
                            <SignaturePad
                                value={signatureData}
                                onChange={(data) => {
                                    setSignatureData(data);
                                    setFormData((prev) => ({ ...prev, tandaTanganOrtu: data }));
                                }}
                            />
                            <p className="text-xs italic text-gray-500 mt-1.5">
                                Goreskan tanda tangan menggunakan mouse atau jari pada area di atas. Tanda tangan akan tersimpan dan dapat digunakan kembali pada pendaftaran berikutnya.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100 flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <path d="M2 10h20" />
                            </svg>
                        </span>
                        Data Administratif
                    </h2>
                    <p className="text-sm text-gray-700 mb-5">
                        Dengan ini menyatakan bahwa bila anak saya diterima di sekolah BPK PENABUR Bandung, maka saya bersedia mendukung dana :
                    </p>
                    <div className="space-y-5">
                        <div>
                            <Label>Uang Sumbangan Sukarela</Label>
                            <select
                                value={sumbangan}
                                onChange={(e) => setSumbangan(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1976d2] transition appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1rem] pr-10"
                                style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e\")" }}
                            >
                                {sumbanganOptions.map((opt) => (
                                    <option key={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4">
                                <p className="text-xs italic text-gray-600 mb-2">
                                    Tuliskan jumlah sumbangan, Jika tidak ada di Pilihan (Nilai Sumbangan dalam satuan Rp. 1.000.000)
                                </p>
                                <input
                                    type="text"
                                    value={sumbanganLainnya}
                                    onChange={(e) => setSumbanganLainnya(e.target.value)}
                                    placeholder="Rp"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1976d2] transition"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-gray-700 space-y-1.5">
                    <p className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">*</span>
                        <span>Wajib Diisi</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">**</span>
                        <span>Wajib Diisi Untuk SD, SMP dan SMA</span>
                    </p>
                    <p className="flex items-start gap-2 pt-2 border-t border-amber-200/60 mt-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 flex-shrink-0 mt-0.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Pastikan data sudah terisi dengan benar, tidak diperkenankan back history browser setelah submit dihalaman ini.</span>
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={loading}
                        className="px-6 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Kembali
                    </button>
                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !isUsiaValid(formData.tanggalLahir) ||
                            !isPhoneRequiredValid(formData.noHp) ||
                            !isPhoneRequiredValid(formData.noHpAyah) ||
                            !isPhoneRequiredValid(formData.noHpIbu) ||
                            !isPhoneOptionalValid(formData.noHpWali) ||
                            !isEmailValid(loginEmail) ||
                            !isExactDigits(formData.nisn, 10) ||
                            !isExactDigits(formData.nik,  16) ||
                            !isExactDigits(formData.nokk, 16) ||
                            !signatureData ||
                            !formData.namaAyah
                        }
                        className="group flex-1 bg-gradient-to-r from-[#1976d2] to-[#0d47a1] hover:from-[#1565c0] hover:to-[#0d47a1] text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.99] disabled:bg-gray-300 disabled:bg-none disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        {loading ? "Memproses..." : "Lanjut ke Preview"}
                        {!loading && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform">
                                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                </div>
            </form>
        </>
    );
}

function PreviewField({
    label,
    value,
    multiline,
}: {
    label: string;
    value: string;
    multiline?: boolean;
}) {
    const displayValue = value && value.trim() !== "" && value !== "- Pilih -" ? value : "-";
    return (
        <div>
            <div className="block text-sm font-medium text-gray-600 mb-2">{label}</div>
            <div
                className={`w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-gray-50 ${
                    multiline ? "whitespace-pre-wrap min-h-[80px]" : "truncate"
                }`}
            >
                {displayValue}
            </div>
        </div>
    );
}

function Label({
    children,
    required,
    doubleRequired,
}: {
    children: React.ReactNode;
    required?: boolean;
    doubleRequired?: boolean;
}) {
    return (
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {children}
            {required && <span className="text-red-500 ml-1">*</span>}
            {doubleRequired && <span className="text-red-500 ml-1">**</span>}
        </label>
    );
}

function InputField({
    label,
    required,
    doubleRequired,
    type = "text",
    hint,
    name,
    value,
    onChange,
    max,
    digitsOnly,
    exactLength,
    readOnly,
}: {
    label: string;
    required?: boolean;
    doubleRequired?: boolean;
    type?: string;
    hint?: string;
    name?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    max?: string;
    digitsOnly?: boolean;
    exactLength?: number;
    readOnly?: boolean;
}) {
    const isPhone = type === "tel";
    const isEmail = type === "email";

    const phoneInvalid  = isPhone && !!value && !isValidPhone(value);
    const emailInvalid  = isEmail && !!value && !isValidEmail(value);
    const lengthInvalid = !!exactLength && !!value && value.length !== exactLength;
    const hasError      = phoneInvalid || emailInvalid || lengthInvalid;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isPhone) {
            e.target.value = normalizePhoneInput(e.target.value);
        } else if (digitsOnly) {
            let digits = e.target.value.replace(/\D/g, "");
            if (exactLength) digits = digits.slice(0, exactLength);
            e.target.value = digits;
        }
        onChange?.(e);
    };

    const errorMessage = phoneInvalid
        ? "Format nomor tidak valid. Contoh: 08123456789 atau +628123456789"
        : emailInvalid
        ? "Format email tidak valid. Contoh: nama@gmail.com"
        : lengthInvalid
        ? `Harus ${exactLength} digit angka (saat ini ${value?.length ?? 0})`
        : "";

    return (
        <div>
            <Label required={required} doubleRequired={doubleRequired}>
                {label}
            </Label>
            {hint && <p className="text-xs italic text-gray-500 -mt-1 mb-2">{hint}</p>}
            <input
                type={isEmail ? "email" : digitsOnly ? "text" : type}
                inputMode={isPhone || digitsOnly ? "numeric" : undefined}
                maxLength={isPhone ? 15 : exactLength}
                name={name}
                value={value}
                onChange={handleChange}
                max={max}
                readOnly={readOnly}
                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 transition ${
                    readOnly
                        ? "border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
                        : hasError
                        ? "border-red-300 bg-red-50/30 focus:ring-red-200 focus:border-red-500"
                        : "border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-blue-200 focus:border-[#1976d2]"
                }`}
            />
            {hasError && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                    </svg>
                    {errorMessage}
                </p>
            )}
        </div>
    );
}

function SelectField({
    label,
    required,
    defaultValue,
    value,
    onChange,
    children,
}: {
    label: string;
    required?: boolean;
    defaultValue?: string;
    value?: string;
    onChange?: (value: string) => void;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
                defaultValue={defaultValue}
                value={value}
                onChange={onChange ? (e) => onChange(e.target.value) : undefined}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1976d2] transition appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1rem] pr-10"
                style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e\")" }}
            >
                {children}
            </select>
        </div>
    );
}

function SignaturePad({
    value,
    onChange,
}: {
    value: string;
    onChange: (data: string) => void;
}) {
    const canvasRef    = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const drawingRef   = useRef(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const hasStrokeRef = useRef(false);
    const [isEmpty, setIsEmpty] = useState(!value);

    const setupCanvas = useCallback(() => {
        const canvas    = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ratio  = window.devicePixelRatio || 1;
        const width  = container.clientWidth;
        const height = 200;

        canvas.width        = Math.floor(width * ratio);
        canvas.height       = Math.floor(height * ratio);
        canvas.style.width  = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(ratio, ratio);
        ctx.lineCap     = "round";
        ctx.lineJoin    = "round";
        ctx.lineWidth   = 2.2;
        ctx.strokeStyle = "#0d47a1";
        ctx.fillStyle   = "#ffffff";
        ctx.fillRect(0, 0, width, height);
    }, []);

    const drawImageFromData = useCallback((source: string) => {
        const canvas = canvasRef.current;
        if (!canvas || !source) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const img = new Image();
        if (!source.startsWith("data:")) {
            img.crossOrigin = "anonymous";
        }
        img.onload = () => {
            const ratio  = window.devicePixelRatio || 1;
            const width  = canvas.width / ratio;
            const height = canvas.height / ratio;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            hasStrokeRef.current = true;
            setIsEmpty(false);
        };
        img.onerror = () => {
            hasStrokeRef.current = false;
            setIsEmpty(true);
        };
        img.src = source;
    }, []);

    useEffect(() => {
        setupCanvas();
        if (value) {
            drawImageFromData(value);
        }
        const onResize = () => {
            const current = canvasRef.current?.toDataURL("image/png") || "";
            setupCanvas();
            if (hasStrokeRef.current && current) {
                drawImageFromData(current);
            }
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [setupCanvas, drawImageFromData, value]);

    const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        canvasRef.current?.setPointerCapture(e.pointerId);
        drawingRef.current   = true;
        lastPointRef.current = getPoint(e);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawingRef.current) return;
        const canvas = canvasRef.current;
        const ctx    = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        const point = getPoint(e);
        const last  = lastPointRef.current;
        if (!last) return;
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        lastPointRef.current = point;
        hasStrokeRef.current = true;
        if (isEmpty) setIsEmpty(false);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawingRef.current) return;
        drawingRef.current   = false;
        lastPointRef.current = null;
        canvasRef.current?.releasePointerCapture(e.pointerId);
        const dataUrl = canvasRef.current?.toDataURL("image/png") || "";
        onChange(dataUrl);
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx    = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        const ratio  = window.devicePixelRatio || 1;
        const width  = canvas.width / ratio;
        const height = canvas.height / ratio;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        hasStrokeRef.current = false;
        setIsEmpty(true);
        onChange("");
    };

    return (
        <div ref={containerRef} className="w-full">
            <div className="relative w-full rounded-lg border border-dashed border-gray-300 bg-white overflow-hidden">
                <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    className="block w-full touch-none cursor-crosshair"
                />
                {isEmpty && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-400 select-none">
                        Goreskan tanda tangan di sini
                    </div>
                )}
            </div>
            <div className="flex justify-end mt-2">
                <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Hapus Tanda Tangan
                </button>
            </div>
        </div>
    );
}
