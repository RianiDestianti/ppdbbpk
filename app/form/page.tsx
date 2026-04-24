"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { saveSiswa } from "@/store/controllers/siswaController";
import { checkTunggakan } from "@/store/controllers/tunggakanController";
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

const steps = [1, 2];
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

    return (
        <>
            <Navbar />

            <main className="flex-1 bg-gray-50">
                <div className="max-w-5xl mx-auto px-6 py-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
                        Formulir Pendaftaran Online Jenjang {config.label}
                        <br />
                        SPMB BPK PENABUR BANDUNG 2026/2027
                    </h1>

                    <div className="flex items-center justify-center mb-10">
                        {steps.map((step, idx) => (
                            <div key={step} className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 ${
                                        step === currentStep
                                            ? "bg-red-600 border-red-600 text-white"
                                            : step < currentStep
                                            ? "bg-red-600 border-red-600 text-white"
                                            : "bg-white border-gray-300 text-gray-400"
                                    }`}
                                >
                                    {step < currentStep ? (
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M3 7l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        step
                                    )}
                                </div>
                                {idx < steps.length - 1 && (
                                    <div
                                        className={`w-16 md:w-24 h-0.5 ${
                                            step < currentStep ? "bg-red-600" : "bg-gray-300"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {currentStep === 1 && (
                        <>
                            <div className="bg-red-500 text-white rounded-md p-5 mb-8 shadow-sm">
                                <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
                                    <span>⚠</span>
                                    Peringatan
                                </h2>
                                <ol className="list-decimal list-inside space-y-1.5 text-sm leading-relaxed">
                                    {config.peringatan.map((text, i) => (
                                        <li key={i}>{text}</li>
                                    ))}
                                </ol>
                            </div>

                            <form className="space-y-8" onSubmit={goNext}>
                                <section className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-200">
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
                                                <label className="block text-sm text-gray-700 mb-2">
                                                    Nomor SPB
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <p className="text-xs italic text-gray-500 -mt-1 mb-1.5">
                                                    Wajib diisi untuk pendaftar dari BPK PENABUR (untuk pengecekan tunggakan)
                                                </p>
                                                <input
                                                    type="text"
                                                    value={noSpb}
                                                    onChange={(e) => setNoSpb(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                />
                                            </div>
                                        )}
                                        {isTargetTk && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm text-gray-700 mb-2">
                                                    Tanggal Lahir Calon Siswa
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <p className="text-xs italic text-gray-500 -mt-1 mb-1.5">
                                                    Minimum usia {MIN_USIA_BY_JENJANG[jenjang]} tahun pada {formatTanggalId(TAHUN_AJARAN_MULAI)} (awal tahun ajaran)
                                                </p>
                                                <input
                                                    type="date"
                                                    value={tanggalLahirAwal}
                                                    onChange={(e) => setTanggalLahirAwal(e.target.value)}
                                                    max={maxTanggalLahirFor(jenjang)}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-200">
                                        Pilihan Sekolah
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    className="w-full bg-gray-900 hover:bg-black text-white font-medium py-4 rounded-md transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {tunggakanLoading ? "Memeriksa Tunggakan..." : "Berikutnya"}
                                    {!tunggakanLoading && <span>→</span>}
                                </button>
                            </form>
                        </>
                    )}

                    {currentStep === 2 && (
                        <FormStep2
                            jenjang={jenjang}
                            programAsal={programAsal}
                            pilihan1={pilihan1}
                            program1={program1}
                            pilihan2={pilihan2}
                            program2={program2}
                            noSpb={noSpb}
                            tanggalLahirAwal={tanggalLahirAwal}
                            sekolahAsalStep2Options={config.sekolahAsalStep2Options}
                            sumbanganOptions={config.sumbanganOptions}
                            onBack={goBack}
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
    programAsal,
    pilihan1,
    program1,
    pilihan2,
    program2,
    noSpb,
    tanggalLahirAwal,
    sekolahAsalStep2Options,
    sumbanganOptions,
    onBack,
}: {
    jenjang: Jenjang;
    programAsal: string;
    pilihan1: string;
    program1: string;
    pilihan2: string;
    program2: string;
    noSpb: string;
    tanggalLahirAwal: string;
    sekolahAsalStep2Options: string[];
    sumbanganOptions: string[];
    onBack: () => void;
}) {
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
    const [formData, setFormData]                   = useState<SiswaFormData>({
        ...initialFormSiswa,
        tanggalLahir: tanggalLahirAwal || initialFormSiswa.tanggalLahir,
    });
    const [jenisKelamin, setJenisKelamin]           = useState("");
    const [sekolahAsalSelect, setSekolahAsalSelect] = useState("- Pilih -");
    const [sumbangan, setSumbangan]                 = useState("Rp. 0");
    const [sumbanganLainnya, setSumbanganLainnya]   = useState("");

    useEffect(() => {
        if (response?.status === 200) {
            Swal.fire({
                icon              : 'success',
                title             : 'Pendaftaran Berhasil',
                html              : `
                    <p style="margin:0 0 8px 0;">No. Registrasi: <b>${response.data.noreg}</b></p>
                    <p style="margin:0;color:#555;font-size:14px;">
                        Silahkan cek email Anda untuk melihat informasi pendaftaran lebih lanjut
                        (No. VA, Username, Password, dll).
                    </p>
                `,
                confirmButtonColor: '#dc2626',
            });
            dispatch(resetResponse());
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

        if (formData.email && !isEmailValid(formData.email)) {
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

        const sekolahAsal = formData.sekolahAsalNama || sekolahAsalSelect;

        dispatch(saveSiswa({
            ...formData,
            jenisKelamin,
            sekolahAsal,
            programAsal,
            pilihan1,
            program1,
            pilihan2,
            program2,
            noSpb,
        }));
    };

    return (
        <>
            <div className="bg-white rounded-md border border-gray-200 p-5 mb-5 text-sm text-gray-700 space-y-1">
                <div>
                    <span className="font-semibold">Pilihan 1: </span>
                    {pilihan1}
                </div>
                <div>
                    <span className="font-semibold">Program pilihan 1: </span>
                    {program1}
                </div>
                <div className="pt-2">
                    <span className="font-semibold">Pilihan 2: </span>
                    {pilihan2}
                </div>
                <div>
                    <span className="font-semibold">Program pilihan 2: </span>
                    {program2}
                </div>
            </div>

            <div className="bg-red-500 text-white rounded-md p-4 mb-8 text-sm leading-relaxed">
                Untuk mendapatkan potongan pelunasan dan potongan tambahan Amaze U, Orang Tua Pendaftar dapat segera melakukan pembayaran tahap 1 di sekolah pilihan pertama sebelum 27 Juli 2025. (Kami tidak menyarankan pembayaran di lokasi pameran Amaze U) Terima kasih
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
                <section className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-200 flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="8.5" cy="7" r="4" />
                            <path d="M20 8v6M23 11h-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
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
                            <div className="space-y-2 mt-2">
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="radio"
                                        name="jk"
                                        value="Laki-laki"
                                        checked={jenisKelamin === "Laki-laki"}
                                        onChange={(e) => setJenisKelamin(e.target.value)}
                                        className="w-4 h-4 text-red-600"
                                    />
                                    Laki-laki
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="radio"
                                        name="jk"
                                        value="Perempuan"
                                        checked={jenisKelamin === "Perempuan"}
                                        onChange={(e) => setJenisKelamin(e.target.value)}
                                        className="w-4 h-4 text-red-600"
                                    />
                                    Perempuan
                                </label>
                            </div>
                        </div>

                        <InputField label="No HP (WhatsApp) Untuk Informasi Akademik" required type="tel" name="noHp" value={formData.noHp} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Email" type="email" doubleRequired name="email" value={formData.email} onChange={(e) => handleChangeInput(e, setFormData)} />

                        <div className="md:col-span-1">
                            <Label required>Alamat Rumah</Label>
                            <textarea
                                name="alamat"
                                value={formData.alamat}
                                onChange={(e) => handleChangeInput(e, setFormData)}
                                rows={5}
                                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                            />
                        </div>

                        <div className="space-y-5">
                            <div>
                                <Label required>Sekolah Asal</Label>
                                <select
                                    value={sekolahAsalSelect}
                                    onChange={(e) => setSekolahAsalSelect(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                                    placeholder=""
                                    className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                                <p className="text-xs italic text-gray-500 mt-1">
                                    Nama Sekolah Asal Jika Tidak ada di Pilihan
                                </p>
                            </div>
                            <InputField label="Kota Sekolah Asal" required name="kotaSekolahAsal" value={formData.kotaSekolahAsal} onChange={(e) => handleChangeInput(e, setFormData)} />
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-200 flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="9" cy="7" r="4" />
                        </svg>
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

                <section className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-200 flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <path d="M2 10h20" />
                        </svg>
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
                                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                {sumbanganOptions.map((opt) => (
                                    <option key={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                                <p className="text-xs italic text-gray-600 mb-2">
                                    Tuliskan jumlah sumbangan, Jika tidak ada di Pilihan (Nilai Sumbangan dalam satuan Rp. 1.000.000)
                                </p>
                                <input
                                    type="text"
                                    value={sumbanganLainnya}
                                    onChange={(e) => setSumbanganLainnya(e.target.value)}
                                    placeholder="Rp"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="text-sm text-gray-600 space-y-1">
                    <p>
                        <span className="text-red-500">*</span>Wajib Diisi
                    </p>
                    <p>
                        <span className="text-red-500">**</span>Wajib Diisi Untuk SD, SMP dan SMA
                    </p>
                    <p className="pt-2">
                        - Pastikan data sudah terisi dengan benar, tidak diperkenankan back history browser setelah submit dihalaman ini.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={loading}
                        className="px-6 py-3 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        <span>←</span>
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
                            !isEmailValid(formData.email) ||
                            !isExactDigits(formData.nisn, 10) ||
                            !isExactDigits(formData.nik,  16) ||
                            !isExactDigits(formData.nokk, 16)
                        }
                        className="flex-1 bg-gray-900 hover:bg-black text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Mengirim..." : "Kirim"}
                        {!loading && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                </div>
            </form>
        </>
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
        <label className="block text-sm text-gray-700 mb-2">
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
            {hint && <p className="text-xs italic text-gray-500 -mt-1 mb-1.5">{hint}</p>}
            <input
                type={isEmail ? "email" : digitsOnly ? "text" : type}
                inputMode={isPhone || digitsOnly ? "numeric" : undefined}
                maxLength={isPhone ? 15 : exactLength}
                name={name}
                value={value}
                onChange={handleChange}
                max={max}
                className={`w-full border rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 ${
                    hasError
                        ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                        : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                }`}
            />
            {hasError && <p className="text-xs text-red-500 mt-1">{errorMessage}</p>}
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
            <label className="block text-sm text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
                defaultValue={defaultValue}
                value={value}
                onChange={onChange ? (e) => onChange(e.target.value) : undefined}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
                {children}
            </select>
        </div>
    );
}
