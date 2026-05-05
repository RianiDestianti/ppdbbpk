"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { saveSiswa, checkNik } from "@/store/controllers/siswaController";
import { checkTunggakan } from "@/store/controllers/tunggakanController";
import { getProfile } from "@/store/controllers/authController";
import { getSekolahByJenjang } from "@/store/controllers/sekolahController";
import { resetResponse } from "@/store/slices/siswaSlice";
import { resetTunggakan } from "@/store/slices/tunggakanSlice";
import { initialFormSiswa, SiswaFormData } from "@/store/types/SiswaTypes";
import { Jenjang, JenjangConfig } from "@/store/types/JenjangTypes";
import { SekolahOption } from "@/store/types/SekolahTypes";
import { handleChangeInput } from "@/libs/general";
import api from "@/services/api";
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

const PILIH_PLACEHOLDER  = "- Pilih -";
const LUAR_BPK_LABEL     = "Luar BPK";
const LUAR_BPK_TK_LABEL  = "Luar BPK / Belum Sekolah";
const PROGRAM_DEFAULT_LUAR = ["-"];
const TK_PROGRAM_TIERS = [
    { rank: 0, aliases: ["TODDLER", "TOODLER"] },
    { rank: 1, aliases: ["KELOMPOK BERMAIN", "KELAS BERMAIN", "KB"] },
    { rank: 2, aliases: ["TK-A", "TK A", "TKA"] },
    { rank: 3, aliases: ["TK-B", "TK B", "TKB"] },
] as const;

const ASAL_JENJANG: Record<Jenjang, Jenjang | ""> = {
    tk  : "tk",
    sd  : "tk",
    smp : "sd",
    sma : "smp",
};

const luarBpkLabelFor = (jenjang: Jenjang) =>
    jenjang === "tk" ? LUAR_BPK_TK_LABEL : LUAR_BPK_LABEL;

const isLuarBpk = (value: string) =>
    value === LUAR_BPK_LABEL || value === LUAR_BPK_TK_LABEL;

const buildPilihanOptions = (sekolahs: SekolahOption[]): string[] => {
    const names = sekolahs.map((s) => s.nama).filter(Boolean);
    return [PILIH_PLACEHOLDER, ...names];
};

const buildAsalOptions = (jenjang: Jenjang, sekolahs: SekolahOption[]): string[] => {
    const names = sekolahs.map((s) => s.nama).filter(Boolean);
    return [PILIH_PLACEHOLDER, ...names, luarBpkLabelFor(jenjang)];
};

const normalizeProgramKey = (value: string): string =>
    value.trim().replace(/[-_]+/g, " ").replace(/\s+/g, " ").toUpperCase();

const getTkProgramRank = (value: string): number | null => {
    const key = normalizeProgramKey(value);
    if (!key) return null;
    const matched = TK_PROGRAM_TIERS.find((tier) =>
        tier.aliases.some((alias) => normalizeProgramKey(alias) === key)
    );
    return matched ? matched.rank : null;
};

const sortTkPrograms = (programs: string[]): string[] => {
    return [...programs].sort((left, right) => {
        const leftRank  = getTkProgramRank(left);
        const rightRank = getTkProgramRank(right);

        if (leftRank === null && rightRank === null) {
            return left.localeCompare(right, "id");
        }
        if (leftRank === null) return 1;
        if (rightRank === null) return -1;
        return leftRank - rightRank;
    });
};

const uniquePrograms = (programs: string[]): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const program of programs) {
        const cleaned = program.trim();
        if (!cleaned) continue;

        const key = normalizeProgramKey(cleaned);
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(cleaned);
    }

    return result;
};

const programsForSekolah = (
    namaSekolah: string,
    sekolahs: SekolahOption[],
    fallback: string[] = PROGRAM_DEFAULT_LUAR,
    minTkRank?: number | null,
): string[] => {
    const found = sekolahs.find((s) => s.nama === namaSekolah);
    const list  = uniquePrograms(found?.programs ?? []);
    const filtered = typeof minTkRank === "number"
        ? list.filter((program) => {
            const rank = getTkProgramRank(program);
            return rank === null || rank >= minTkRank;
        })
        : list;
    const ordered = sortTkPrograms(filtered);
    return ordered.length > 0 ? [PILIH_PLACEHOLDER, ...ordered] : [PILIH_PLACEHOLDER, ...fallback];
};

const SUMBANGAN_MANUAL_MIN = 5_000_000;

const parseRupiahToNumber = (value: string): number => {
    if (!value) return 0;
    const digits = value.toString().replace(/[^\d]/g, "");
    return digits ? Number(digits) : 0;
};

const formatThousandID = (value: string): string => {
    const digits = value.replace(/[^\d]/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatRupiahID = (value: number): string =>
    new Intl.NumberFormat("id-ID", {
        style                 : "currency",
        currency              : "IDR",
        minimumFractionDigits : 0,
    }).format(value);

const terbilangID = (n: number): string => {
    if (!Number.isFinite(n) || n < 0) return "";
    if (n === 0) return "Nol";
    const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    const helper = (x: number): string => {
        if (x < 12) return satuan[x];
        if (x < 20) return `${satuan[x - 10]} Belas`;
        if (x < 100) return `${satuan[Math.floor(x / 10)]} Puluh${x % 10 ? ` ${satuan[x % 10]}` : ""}`;
        if (x < 200) return `Seratus${x - 100 ? ` ${helper(x - 100)}` : ""}`;
        if (x < 1000) return `${satuan[Math.floor(x / 100)]} Ratus${x % 100 ? ` ${helper(x % 100)}` : ""}`;
        if (x < 2000) return `Seribu${x - 1000 ? ` ${helper(x - 1000)}` : ""}`;
        if (x < 1_000_000) return `${helper(Math.floor(x / 1000))} Ribu${x % 1000 ? ` ${helper(x % 1000)}` : ""}`;
        if (x < 1_000_000_000) return `${helper(Math.floor(x / 1_000_000))} Juta${x % 1_000_000 ? ` ${helper(x % 1_000_000)}` : ""}`;
        if (x < 1_000_000_000_000) return `${helper(Math.floor(x / 1_000_000_000))} Miliar${x % 1_000_000_000 ? ` ${helper(x % 1_000_000_000)}` : ""}`;
        return `${helper(Math.floor(x / 1_000_000_000_000))} Triliun${x % 1_000_000_000_000 ? ` ${helper(x % 1_000_000_000_000)}` : ""}`;
    };
    return `${helper(Math.floor(n))} Rupiah`;
};

const sumbanganOptionsDefault = [
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
];

const jenjangConfig: Record<Jenjang, JenjangConfig> = {
    tk: {
        label: "TK",
        peringatan: [
            "Data yang di input dalam form pendaftaran ini akan digunakan sebagai database siswa untuk sekolah dan dinas pendidikan (DAPODIKMEN), Kesalahan penginputan data di form ini menjadi tanggung jawab peserta didik",
            "Pendaftaran hanya boleh dilakukan 1 kali untuk 1 orang siswa.",
            "Durasi waktu pendaftaran adalah 10 menit, mohon mempersiapkan data no. SPB (untuk siswa BPK), NIK, Nama sesuai Akte Lahir, No. HP, Tempat/Tanggal Lahir, Alamat, Sekolah Asal, Nama Ayah Ibu dan Email sebelum melakukan pendaftaran",
        ],
        sekolahAsalStep2Options: ["- Pilih -", "Lainnya"],
        sumbanganOptions:        sumbanganOptionsDefault,
    },
    sd: {
        label: "SD",
        peringatan: [
            "Data yang di input dalam form pendaftaran ini akan digunakan sebagai database siswa untuk sekolah dan dinas pendidikan (DAPODIKMEN), Kesalahan penginputan data di form ini menjadi tanggung jawab peserta didik",
            "Pendaftaran hanya boleh dilakukan 1 kali untuk 1 orang siswa.",
            "Durasi waktu pendaftaran adalah 10 menit, mohon mempersiapkan data No. SPB (untuk siswa BPK), NISN, NIK, Nama sesuai Akte Lahir, No HP, Tempat/Tanggal Lahir, Alamat, Sekolah Asal, Nama Ayah Ibu dan Email sebelum melakukan pendaftaran",
        ],
        sekolahAsalStep2Options: ["- Pilih -", "TKK BPK PENABUR", "Luar BPK"],
        sumbanganOptions:        sumbanganOptionsDefault,
    },
    smp: {
        label: "SMP",
        peringatan: [
            "Data yang di input dalam form pendaftaran ini akan digunakan sebagai database siswa untuk sekolah dan dinas pendidikan (DAPODIKMEN), Kesalahan penginputan data di form ini menjadi tanggung jawab peserta didik",
            "Pendaftaran hanya boleh dilakukan 1 kali untuk 1 orang siswa.",
            "Pilihan program studi tertentu (Bilingual) akan ditentukan oleh hasil Psikotes/Tes Masuk Khusus",
            "Durasi waktu pendaftaran adalah 10 menit, mohon mempersiapkan data SPB(untuk siswa BPK), NISN, NIK, Nama sesuai Akte Lahir, No. HP, Tempat/Tanggal Lahir, Alamat, Sekolah Asal, Nama Ayah Ibu dan Email sebelum melakukan pendaftaran",
        ],
        sekolahAsalStep2Options: ["- Pilih -", "SDK BPK PENABUR", "Luar BPK"],
        sumbanganOptions:        sumbanganOptionsDefault,
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
        sekolahAsalStep2Options: ["- Pilih -", "SMPK BPK PENABUR", "Luar BPK"],
        sumbanganOptions:        sumbanganOptionsDefault,
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
    const [isPreviewOpen, setIsPreviewOpen]         = useState(false);
    const [asalSekolah, setAsalSekolah]             = useState(PILIH_PLACEHOLDER);
    const [programAsal, setProgramAsal]             = useState(PILIH_PLACEHOLDER);
    const [pilihan1,    setPilihan1]                = useState(PILIH_PLACEHOLDER);
    const [program1,    setProgram1]                = useState(PILIH_PLACEHOLDER);
    const [pilihan2,    setPilihan2]                = useState(PILIH_PLACEHOLDER);
    const [program2,    setProgram2]                = useState(PILIH_PLACEHOLDER);
    const [noSpb,       setNoSpb]                   = useState("");
    const [tanggalLahirAwal, setTanggalLahirAwal]   = useState("");

    const sekolahByJenjang     = useAppSelector((state) => state.sekolah.byJenjang);
    const sekolahLoading       = useAppSelector((state) => state.sekolah.loading);
    const asalJenjang          = ASAL_JENJANG[jenjang];
    const pilihanSekolahData: SekolahOption[] = sekolahByJenjang[jenjang] ?? [];
    const asalSekolahData:    SekolahOption[] = asalJenjang ? (sekolahByJenjang[asalJenjang] ?? []) : [];
    const programAsalRank = getTkProgramRank(programAsal);

    const isDariBpk  = asalSekolah.includes("BPK PENABUR");
    const isTargetTk = jenjang === "tk";

    useEffect(() => {
        dispatch(getSekolahByJenjang({ jenjang }));
        if (asalJenjang && asalJenjang !== jenjang) {
            dispatch(getSekolahByJenjang({ jenjang: asalJenjang }));
        }
    }, [dispatch, jenjang, asalJenjang]);

    const asalSekolahOptions = buildAsalOptions(jenjang, asalSekolahData);
    const programAsalOptions = programsForSekolah(asalSekolah, asalSekolahData);
    const programPilihanMinRank = programAsalRank === null ? null : programAsalRank + 1;

    const basePilihanOptions = buildPilihanOptions(pilihanSekolahData);
    const pilihan1Options = basePilihanOptions;
    const pilihan2Options = basePilihanOptions.filter(
        (opt) => opt === PILIH_PLACEHOLDER || opt !== pilihan1
    );
    const program1Options = programsForSekolah(pilihan1, pilihanSekolahData, PROGRAM_DEFAULT_LUAR, programPilihanMinRank);
    const program2Options = programsForSekolah(pilihan2, pilihanSekolahData, PROGRAM_DEFAULT_LUAR, programPilihanMinRank);

    const isSelected      = (v: string) => v !== PILIH_PLACEHOLDER && v !== "-" && v.trim() !== "";
    const isPilihanValid  = (pilihan: string, options: string[]) => isSelected(pilihan) && options.includes(pilihan);
    const isProgramValid  = (program: string, options: string[]) => isSelected(program) && options.includes(program);
    const isAsalSekolahValid  = isLuarBpk(asalSekolah) || isSelected(asalSekolah);
    const isProgramAsalValid  = isLuarBpk(asalSekolah)
        ? programAsal === "-"
        : isProgramValid(programAsal, programAsalOptions);
    const minUsiaStep1        = MIN_USIA_BY_JENJANG[jenjang];
    const isUsiaStep1Valid    = !isTargetTk || (
        tanggalLahirAwal !== "" && hitungUsiaTahun(tanggalLahirAwal, TAHUN_AJARAN_MULAI) >= minUsiaStep1
    );
    const isStep1Valid  = isAsalSekolahValid && isProgramAsalValid &&
                          isPilihanValid(pilihan1, pilihan1Options) && isProgramValid(program1, program1Options) &&
                          isPilihanValid(pilihan2, pilihan2Options) && pilihan2 !== pilihan1 &&
                          isProgramValid(program2, program2Options) &&
                          isUsiaStep1Valid;

    const handleAsalSekolahChange = (value: string) => {
        setAsalSekolah(value);
        setProgramAsal(isLuarBpk(value) ? "-" : PILIH_PLACEHOLDER);
        setProgram1(PILIH_PLACEHOLDER);
        setProgram2(PILIH_PLACEHOLDER);
    };

    const handleProgramAsalChange = (value: string) => {
        setProgramAsal(value);
        setProgram1(PILIH_PLACEHOLDER);
        setProgram2(PILIH_PLACEHOLDER);
    };

    const handlePilihan1Change = (value: string) => {
        setPilihan1(value);
        setProgram1(PILIH_PLACEHOLDER);
        if (pilihan2 === value) {
            setPilihan2(PILIH_PLACEHOLDER);
            setProgram2(PILIH_PLACEHOLDER);
        }
    };

    const handlePilihan2Change = (value: string) => {
        setPilihan2(value);
        setProgram2(PILIH_PLACEHOLDER);
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

                const rawTunggakan = (result.data.tunggakan ?? "").toString().trim();
                const nominalAngka = Number(rawTunggakan.replace(/[^\d]/g, "")) || 0;

                const statusValue   = result.data.stat;
                const statusBlocked = statusValue !== undefined &&
                                      statusValue !== null &&
                                      String(statusValue).trim() === "0";
                const adaTunggakanNominal = rawTunggakan !== "" &&
                                            rawTunggakan !== "0" &&
                                            rawTunggakan.toLowerCase() !== "lunas" &&
                                            nominalAngka > 0;

                if (statusBlocked || adaTunggakanNominal) {
                    const asalDetail = asalSekolahData.find((s) => s.nama === asalSekolah);
                    const namaAsal   = asalDetail?.nama  || asalSekolah || "-";
                    const waDigits   = (asalDetail?.noWa ?? "").replace(/\D/g, "");
                    const waAsal     = waDigits.startsWith("62")
                        ? waDigits
                        : waDigits.startsWith("0")
                            ? "62" + waDigits.slice(1)
                            : waDigits
                                ? "62" + waDigits
                                : "";
                    const emailAsal  = asalDetail?.email2 || asalDetail?.email || "";
                    const telpAsal   = asalDetail?.notlp  || "";
                    const kasekAsal  = asalDetail?.kasek  || "";
                    const waDisplay  = waAsal
                        ? "+" + waAsal.replace(/^(\d{2})(\d{3})(\d{4})(\d+)$/, "$1 $2-$3-$4")
                        : "";
                    const waButton   = waAsal
                        ? `<a href="https://wa.me/${waAsal}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:10px;background:#25d366;color:#ffffff;padding:11px 14px;border-radius:10px;text-decoration:none;font-weight:600;font-size:13px;box-shadow:0 4px 12px -4px rgba(37,211,102,0.45);transition:transform .15s">
                                <span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,0.18)">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffffff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
                                </span>
                                <span style="display:flex;flex-direction:column;line-height:1.2">
                                    <span style="font-size:11px;opacity:.85;font-weight:500">WhatsApp Admin</span>
                                    <span>${waDisplay}</span>
                                </span>
                            </a>`
                        : "";
                    const emailButton = emailAsal
                        ? `<a href="mailto:${emailAsal}" style="display:flex;align-items:center;gap:10px;background:#ffffff;color:#1e3a8a;padding:11px 14px;border-radius:10px;text-decoration:none;font-weight:600;font-size:13px;border:1px solid #bfdbfe;transition:background .15s">
                                <span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#dbeafe;color:#1d4ed8">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                </span>
                                <span style="display:flex;flex-direction:column;line-height:1.2">
                                    <span style="font-size:11px;opacity:.7;font-weight:500">Email Admin</span>
                                    <span style="word-break:break-all">${emailAsal}</span>
                                </span>
                            </a>`
                        : "";
                    const telpRow    = telpAsal
                        ? `<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#475569"><span style="color:#94a3b8">Telepon</span><span style="font-weight:600;color:#0f172a">${telpAsal}</span></div>`
                        : "";
                    const kasekRow   = kasekAsal
                        ? `<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#475569"><span style="color:#94a3b8">Kepala Sekolah</span><span style="font-weight:600;color:#0f172a">${kasekAsal}</span></div>`
                        : "";

                    await Swal.fire({
                        title              : "Pendaftaran Tidak Dapat Dilanjutkan",
                        html               : `
                            <div style="text-align:left;font-size:14px;line-height:1.6;color:#334155">
                                <div style="display:flex;justify-content:center;margin:0 0 14px">
                                    <div style="display:inline-flex;align-items:center;justify-content:center;width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);box-shadow:0 10px 28px -10px rgba(245,158,11,0.55)">
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                    </div>
                                </div>
                                <p style="margin:0 0 16px;color:#475569;text-align:center">Pendaftaran anda tidak dapat dilanjutkan, tolong menghubungi admin sekolah asal.</p>
                                <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:14px 16px;box-shadow:0 1px 2px rgba(15,23,42,0.04)">
                                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                                        <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:6px;background:#dbeafe;color:#1d4ed8">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
                                        </span>
                                        <span style="font-weight:700;color:#1e3a8a;font-size:13px;letter-spacing:.02em;text-transform:uppercase">Hubungi Admin Sekolah Asal</span>
                                    </div>
                                    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">
                                        <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#475569"><span style="color:#94a3b8">Sekolah</span><span style="font-weight:600;color:#0f172a">${namaAsal}</span></div>
                                        ${kasekRow}
                                        ${telpRow}
                                    </div>
                                    <div style="display:flex;flex-direction:column;gap:8px">
                                        ${waButton}
                                        ${emailButton}
                                    </div>
                                </div>
                            </div>
                        `,
                        confirmButtonText  : "Mengerti, Tutup",
                        confirmButtonColor : "#0f172a",
                        width              : 520,
                        padding            : "1.75rem 1.5rem 1.5rem",
                        background         : "#f8fafc",
                        customClass        : { popup: "rounded-3xl" },
                    });
                    dispatch(resetTunggakan());
                    setCurrentStep(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    return;
                }

                dispatch(resetTunggakan());
            } catch {
                Swal.fire({
                    icon               : "error",
                    title              : "Gagal Memverifikasi Data",
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
        setIsPreviewOpen(true);
    };

    const backFromPreview = () => {
        setIsPreviewOpen(false);
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
                            const stepLabel = step === 1 ? "Pilihan Sekolah" : "Data Pendaftar";
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
                                        <SelectField label="Asal Sekolah" required value={asalSekolah} onChange={handleAsalSekolahChange}>
                                            {asalSekolahOptions.map((opt) => (
                                                <option key={opt}>{opt}</option>
                                            ))}
                                        </SelectField>
                                        <SelectField label="Program" required value={programAsal} onChange={handleProgramAsalChange}>
                                            {programAsalOptions.map((opt) => (
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
                                                    Wajib diisi untuk pendaftar dari BPK PENABUR (untuk verifikasi data)
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
                                            {pilihan2Options.map((opt) => (
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
                                    disabled={!isStep1Valid || tunggakanLoading || sekolahLoading}
                                    className="group w-full bg-gradient-to-r from-[#1976d2] to-[#0d47a1] hover:from-[#1565c0] hover:to-[#0d47a1] text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.99] disabled:bg-gray-300 disabled:bg-none disabled:shadow-none disabled:cursor-not-allowed"
                                >
                                    {tunggakanLoading
                                        ? "Memverifikasi data..."
                                        : sekolahLoading
                                        ? "Memuat data sekolah..."
                                        : "Berikutnya"}
                                    {!tunggakanLoading && !sekolahLoading && (
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
                            showPreview={isPreviewOpen}
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
    const isTk            = jenjang === "tk";
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
    const [cachedEmail]                             = useState(() =>
        typeof window !== "undefined" ? localStorage.getItem("auth-email") || "" : ""
    );
    const [formData, setFormData]                   = useState<SiswaFormData>({
        ...initialFormSiswa,
        tanggalLahir: tanggalLahirAwal || initialFormSiswa.tanggalLahir,
    });
    const [jenisKelamin, setJenisKelamin]           = useState("");
    const [sekolahAsalSelect, setSekolahAsalSelect] = useState("- Pilih -");
    const [asalSklList, setAsalSklList]             = useState<Array<{ id: number; nama: string }>>([]);
    const [sumbangan, setSumbangan]                 = useState("Rp. 0");
    const [sumbanganLainnya, setSumbanganLainnya]   = useState("");
    const [nikError, setNikError]                   = useState<string>("");
    const [nikChecking, setNikChecking]             = useState<boolean>(false);
    const [nikChecked, setNikChecked]               = useState<string>("");
    const [nikVaInfo, setNikVaInfo]                 = useState<{ noVa: string; nama: string } | null>(null);

    const showVaReminder = useCallback((info: { noVa: string; nama: string }) => {
        const waAdmin = "6281224122456";
        Swal.fire({
            icon  : "warning",
            title : "Pembayaran Belum Lunas",
            html  : `
                <div style="text-align:left;font-size:14px;line-height:1.6">
                    <p style="margin:0 0 10px">Kamu sudah pernah mendaftar, namun pembayaran melalui Virtual Account belum kami terima. Silakan lakukan pembayaran terlebih dahulu agar pendaftaran dapat dilanjutkan.</p>
                    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px;margin-bottom:10px">
                        <div><b>Nama Siswa</b> : ${info.nama || "-"}</div>
                        <div><b>Virtual Account BCA</b> : <span style="font-weight:700;color:#b45309">${info.noVa}</span></div>
                    </div>
                    <p style="margin:0 0 6px">Apabila sudah melakukan pembayaran namun status belum berubah, silakan hubungi admin sekolah:</p>
                    <p style="margin:0">
                        <a href="https://wa.me/${waAdmin}" target="_blank" rel="noopener noreferrer" style="color:#dc2626;font-weight:600;text-decoration:underline">
                            WhatsApp Admin: +${waAdmin}
                        </a>
                    </p>
                </div>
            `,
            confirmButtonText  : "Tutup",
            confirmButtonColor : "#dc2626",
        });
    }, []);

    const runNikCheck = useCallback(async (nik: string) => {
        if (!/^\d{16}$/.test(nik)) {
            setNikError("");
            setNikChecked("");
            setNikVaInfo(null);
            return;
        }
        if (nik === nikChecked) return;
        setNikChecking(true);
        try {
            const result = await dispatch(checkNik({ nik })).unwrap();
            if (result?.status === 409) {
                const existing  = result.data ?? {};
                const statusVal = existing.status;
                const isPaid    = statusVal !== undefined && statusVal !== null && String(statusVal).trim() === "1";
                const noVa      = (existing.no_va ?? "").toString().trim();

                if (!isPaid && noVa) {
                    const info = { noVa, nama: existing.nama || "-" };
                    setNikVaInfo(info);
                    setNikError("Pendaftaran sebelumnya belum dibayar. Silakan lunasi VA terlebih dahulu.");
                    showVaReminder(info);
                } else {
                    setNikVaInfo(null);
                    setNikError("NIK ini sudah terdaftar dalam periode pendaftaran yang sedang berjalan.");
                }
            } else {
                setNikError("");
                setNikVaInfo(null);
            }
            setNikChecked(nik);
        } catch {
            setNikError("");
            setNikVaInfo(null);
        } finally {
            setNikChecking(false);
        }
    }, [dispatch, nikChecked, showVaReminder]);

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
        if (loginEmail && !formData.email) {
            setFormData((prev) => ({ ...prev, email: loginEmail }));
        }
    }, [loginEmail, formData.email]);

    useEffect(() => {
        if (isDariBpk) {
            setAsalSklList([]);
            return;
        }
        const jenjangAsal: Record<Jenjang, string> = {
            tk  : "",      // belum ada jenjang sebelumnya
            sd  : "tk",
            smp : "sd",
            sma : "smp",
        };
        const sourceJenjang = jenjangAsal[jenjang];
        if (!sourceJenjang) {
            setAsalSklList([]);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const res = await api.get(`/asal-sekolah?jenjang=${encodeURIComponent(sourceJenjang)}`);
                if (!cancelled && res.data?.status === 200) {
                    setAsalSklList(res.data.data ?? []);
                }
            } catch {
                if (!cancelled) setAsalSklList([]);
            }
        })();
        return () => { cancelled = true; };
    }, [isDariBpk, jenjang]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const lettersOnlyRegex = /^[A-Za-zÀ-ſ\s.'\-]+$/;
        const lettersChecks: Array<{ label: string; value: string; required: boolean; min: number }> = [
            { label: "Nama Lengkap",      value: formData.nama,            required: true,  min: 2 },
            { label: "Tempat Lahir",      value: formData.tempatLahir,     required: true,  min: 2 },
            { label: "Kota Sekolah Asal", value: formData.kotaSekolahAsal, required: true,  min: 2 },
            { label: "Nama Ayah",         value: formData.namaAyah,        required: true,  min: 2 },
            { label: "Nama Ibu",          value: formData.namaIbu,         required: true,  min: 2 },
            { label: "Nama Wali",         value: formData.namaWali,        required: false, min: 2 },
        ];

        for (const field of lettersChecks) {
            const trimmed = (field.value ?? "").trim();
            if (!trimmed) {
                if (field.required) {
                    Swal.fire({
                        icon               : "error",
                        title              : `${field.label} Wajib Diisi`,
                        text               : `Mohon isi ${field.label}.`,
                        confirmButtonColor : "#dc2626",
                    });
                    return;
                }
                continue;
            }
            if (!lettersOnlyRegex.test(trimmed)) {
                Swal.fire({
                    icon               : "error",
                    title              : `${field.label} Tidak Valid`,
                    text               : `${field.label} hanya boleh berisi huruf, spasi, titik, apostrof, atau tanda hubung.`,
                    confirmButtonColor : "#dc2626",
                });
                return;
            }
            if (trimmed.length < field.min) {
                Swal.fire({
                    icon               : "error",
                    title              : `${field.label} Terlalu Pendek`,
                    text               : `${field.label} minimal ${field.min} karakter.`,
                    confirmButtonColor : "#dc2626",
                });
                return;
            }
        }

        if ((formData.alamat ?? "").trim().length < 5) {
            Swal.fire({
                icon               : "error",
                title              : "Alamat Tidak Valid",
                text               : "Alamat Rumah minimal 5 karakter.",
                confirmButtonColor : "#dc2626",
            });
            return;
        }

        if (!sekolahAsalSelect || sekolahAsalSelect === "- Pilih -") {
            Swal.fire({
                icon               : "error",
                title              : "Sekolah Asal Wajib Dipilih",
                text               : "Mohon pilih Sekolah Asal pada daftar.",
                confirmButtonColor : "#dc2626",
            });
            return;
        }

        if (sekolahAsalSelect === "Lainnya") {
            const namaTrimmed = (formData.sekolahAsalNama ?? "").trim();
            if (namaTrimmed.length < 2) {
                Swal.fire({
                    icon               : "error",
                    title              : "Nama Sekolah Asal Wajib Diisi",
                    text               : "Mohon tulis nama sekolah asal minimal 2 karakter pada kolom 'Tulis nama sekolah asal'.",
                    confirmButtonColor : "#dc2626",
                });
                return;
            }
        }

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

        if (/^\d{16}$/.test(formData.nik) && formData.nik !== nikChecked) {
            await runNikCheck(formData.nik);
        }

        if (nikError) {
            if (nikVaInfo) {
                showVaReminder(nikVaInfo);
            } else {
                Swal.fire({
                    icon               : "error",
                    title              : "NIK Sudah Terdaftar",
                    text               : "NIK ini sudah terdaftar dalam periode pendaftaran yang sedang berjalan.",
                    confirmButtonColor : "#dc2626",
                });
            }
            return;
        }

        if (isSumbanganManual && sumbanganManualValue > 0 && sumbanganManualValue <= SUMBANGAN_MANUAL_MIN) {
            Swal.fire({
                icon               : "warning",
                title              : "Nominal Sumbangan Tidak Valid",
                html               : `Input manual hanya untuk nominal <b>di atas ${formatRupiahID(SUMBANGAN_MANUAL_MIN)}</b>.<br/>Untuk nominal ${formatRupiahID(SUMBANGAN_MANUAL_MIN)} atau di bawahnya, mohon pilih dari daftar.`,
                confirmButtonColor : "#dc2626",
            });
            return;
        }

        onEnterPreview();
    };

    const sekolahAsalOptions = isDariBpk
        ? sekolahAsalStep2Options
        : ["- Pilih -", ...asalSklList.map((s) => s.nama), "Lainnya"];

    const handleConfirmSubmit = async () => {
        const sekolahAsalRaw = sekolahAsalSelect === "Lainnya"
            ? formData.sekolahAsalNama
            : sekolahAsalSelect;
        const sekolahAsal = (sekolahAsalRaw ?? "").trim() === "- Pilih -"
            ? ""
            : (sekolahAsalRaw ?? "").trim();

        dispatch(saveSiswa({
            ...formData,
            tandaTanganOrtu: "",
            email: formData.email || loginEmail,
            jenisKelamin,
            sekolahAsal,
            programAsal,
            pilihan1,
            program1,
            pilihan2,
            program2,
            jenjang,
            noSpb,
            sTambahan: String(sumbanganFinalValue),
        }));
    };

    const formatTanggalLahirId = (d: string) => {
        if (!d) return "-";
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        return formatTanggalId(date);
    };

    const sekolahAsalPreview  = sekolahAsalSelect === "Lainnya"
        ? formData.sekolahAsalNama
        : sekolahAsalSelect;

    const isSumbanganManual    = sumbangan === "Lainnya";
    const sumbanganManualValue = parseRupiahToNumber(sumbanganLainnya);
    const sumbanganSelectValue = parseRupiahToNumber(sumbangan);
    const sumbanganFinalValue  = isSumbanganManual ? sumbanganManualValue : sumbanganSelectValue;
    const sumbanganTerbilang   = sumbanganFinalValue > 0 ? terbilangID(sumbanganFinalValue) : "";
    const sumbanganPreviewVal  = sumbanganFinalValue > 0
        ? formatRupiahID(sumbanganFinalValue)
        : "Rp 0";

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
                        {!isTk && (
                            <InputField label="Nomor Induk Siswa Nasional (NISN)" doubleRequired digitsOnly exactLength={10} name="nisn" value={formData.nisn} onChange={(e) => handleChangeInput(e, setFormData)} />
                        )}
                        <InputField
                            label="Nomor Induk Kependudukan (NIK)"
                            doubleRequired
                            digitsOnly
                            exactLength={16}
                            name="nik"
                            value={formData.nik}
                            onChange={(e) => {
                                handleChangeInput(e, setFormData);
                                if (nikError) setNikError("");
                                if (nikChecked && e.target.value !== nikChecked) setNikChecked("");
                            }}
                            onBlur={(e) => runNikCheck(e.target.value)}
                            externalError={nikError}
                            hint={nikChecking ? "Memeriksa NIK..." : undefined}
                        />
                        <InputField label="Nomor Kartu Keluarga (NoKK)" doubleRequired digitsOnly exactLength={16} name="nokk" value={formData.nokk} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Nama Lengkap" required hint="Sesuai Akte Lahir Anak" name="nama" value={formData.nama} onChange={(e) => handleChangeInput(e, setFormData)} lettersOnly minLength={2} maxLength={100} />
                        <InputField label="Tempat Lahir" required name="tempatLahir" value={formData.tempatLahir} onChange={(e) => handleChangeInput(e, setFormData)} lettersOnly minLength={2} maxLength={50} />
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
                        <InputField label="Email" type="email" doubleRequired name="email" value={formData.email} onChange={(e) => handleChangeInput(e, setFormData)} hint="Notifikasi pendaftaran akan dikirim ke email ini." />

                        <div className="md:col-span-1">
                            <Label required>Alamat Rumah</Label>
                            <textarea
                                name="alamat"
                                value={formData.alamat}
                                onChange={(e) => handleChangeInput(e, setFormData)}
                                rows={5}
                                maxLength={300}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1976d2] transition resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">{formData.alamat.length}/300 karakter</p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <Label required>Sekolah Asal</Label>
                                <select
                                    value={sekolahAsalSelect}
                                    onChange={(e) => {
                                        setSekolahAsalSelect(e.target.value);
                                        if (e.target.value !== "Lainnya") {
                                            setFormData((prev) => ({ ...prev, sekolahAsalNama: "" }));
                                        }
                                    }}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1976d2] transition appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1rem] pr-10"
                                    style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e\")" }}
                                >
                                    {sekolahAsalOptions.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                {sekolahAsalSelect === "Lainnya" && (
                                    <>
                                        <input
                                            type="text"
                                            name="sekolahAsalNama"
                                            value={formData.sekolahAsalNama}
                                            onChange={(e) => {
                                                const cleaned = e.target.value
                                                    .replace(/[^A-Za-z0-9À-ſ\s.'\-]/g, "")
                                                    .replace(/\s{2,}/g, " ")
                                                    .slice(0, 100);
                                                setFormData((prev) => ({ ...prev, sekolahAsalNama: cleaned }));
                                            }}
                                            placeholder="Tulis nama sekolah asal"
                                            maxLength={100}
                                            className="w-full mt-2 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1976d2] transition"
                                        />
                                        <p className="text-xs italic text-gray-500 mt-1.5">
                                            Tulis nama sekolah asal jika tidak ada di daftar.
                                        </p>
                                    </>
                                )}
                            </div>
                            <InputField label="Kota Sekolah Asal" required name="kotaSekolahAsal" value={formData.kotaSekolahAsal} onChange={(e) => handleChangeInput(e, setFormData)} lettersOnly minLength={2} maxLength={50} />
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
                        <InputField label="Nama Ayah" required hint="Sesuai Akte Lahir Anak" name="namaAyah" value={formData.namaAyah} onChange={(e) => handleChangeInput(e, setFormData)} lettersOnly minLength={2} maxLength={100} />
                        <InputField label="Nama Ibu" required hint="Sesuai Akte Lahir Anak" name="namaIbu" value={formData.namaIbu} onChange={(e) => handleChangeInput(e, setFormData)} lettersOnly minLength={2} maxLength={100} />
                        <InputField label="No. HP. Ayah" required type="tel" name="noHpAyah" value={formData.noHpAyah} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="No. HP. Ibu" required type="tel" name="noHpIbu" value={formData.noHpIbu} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Nama Wali" name="namaWali" value={formData.namaWali} onChange={(e) => handleChangeInput(e, setFormData)} lettersOnly minLength={2} maxLength={100} />
                        <InputField label="No. HP. Wali" type="tel" name="noHpWali" value={formData.noHpWali} onChange={(e) => handleChangeInput(e, setFormData)} />
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
                            <Label>Dana Sumbangan Sukarela</Label>
                            <select
                                value={sumbangan}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSumbangan(val);
                                    if (val !== "Lainnya") setSumbanganLainnya("");
                                }}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1976d2] transition appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1rem] pr-10"
                                style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e\")" }}
                            >
                                {sumbanganOptions.map((opt) => (
                                    <option key={opt}>{opt}</option>
                                ))}
                            </select>
                            {!isSumbanganManual && sumbanganFinalValue > 0 && (
                                <p className="mt-2 text-xs text-gray-600 italic">
                                    Terbilang: <span className="font-medium text-gray-800 not-italic">{sumbanganTerbilang}</span>
                                </p>
                            )}
                        </div>
                        <div>
                            <div className={`border rounded-xl p-4 transition ${isSumbanganManual ? "bg-blue-50/40 border-blue-100" : "bg-gray-100/60 border-gray-200"}`}>
                                <p className="text-xs italic text-gray-600 mb-2">
                                    Tuliskan jumlah sumbangan Jika Tidak ada di Pilihan (Untuk Sumbangan sukarela diatas Rp. 5.000.000)
                                </p>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">Rp</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={sumbanganLainnya}
                                        onChange={(e) => setSumbanganLainnya(formatThousandID(e.target.value))}
                                        placeholder="6.000.000"
                                        disabled={!isSumbanganManual}
                                        className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1976d2] transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    />
                                </div>
                                {isSumbanganManual && sumbanganManualValue > 0 && (
                                    <p className="mt-2 text-xs text-gray-600 italic">
                                        Terbilang: <span className="font-medium text-gray-800 not-italic">{terbilangID(sumbanganManualValue)}</span>
                                    </p>
                                )}
                                {isSumbanganManual && sumbanganManualValue > 0 && sumbanganManualValue <= SUMBANGAN_MANUAL_MIN && (
                                    <p className="mt-2 text-xs text-red-600">
                                        Input manual hanya untuk nominal di atas {formatRupiahID(SUMBANGAN_MANUAL_MIN)}. Untuk nominal {formatRupiahID(SUMBANGAN_MANUAL_MIN)} atau di bawahnya, mohon pilih dari daftar.
                                    </p>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 italic">
                            Sumbangan bersifat sukarela dan tidak mempengaruhi hasil seleksi.
                        </p>
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
                            !isEmailValid(formData.email) ||
                            (!isTk && !isExactDigits(formData.nisn, 10)) ||
                            !isExactDigits(formData.nik,  16) ||
                            !isExactDigits(formData.nokk, 16) ||
                            !formData.namaAyah ||
                            !!nikError ||
                            nikChecking
                        }
                        className="group flex-1 bg-gradient-to-r from-[#1976d2] to-[#0d47a1] hover:from-[#1565c0] hover:to-[#0d47a1] text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.99] disabled:bg-gray-300 disabled:bg-none disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        {loading ? "Memproses..." : "Lanjut"}
                        {!loading && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform">
                                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                </div>
            </form>

            {showPreview && (
                <PreviewModal
                    isTk={isTk}
                    isDariBpk={isDariBpk}
                    asalSekolah={asalSekolah}
                    programAsal={programAsal}
                    pilihan1={pilihan1}
                    program1={program1}
                    pilihan2={pilihan2}
                    program2={program2}
                    noSpb={noSpb}
                    formData={formData}
                    jenisKelamin={jenisKelamin}
                    sekolahAsalPreview={sekolahAsalPreview}
                    loginEmail={loginEmail}
                    sumbanganPreviewVal={sumbanganPreviewVal}
                    formatTanggalLahirId={formatTanggalLahirId}
                    submitting={loading}
                    onClose={onExitPreview}
                    onConfirm={handleConfirmSubmit}
                />
            )}
        </>
    );
}

function PreviewModal({
    isTk,
    isDariBpk,
    asalSekolah,
    programAsal,
    pilihan1,
    program1,
    pilihan2,
    program2,
    noSpb,
    formData,
    jenisKelamin,
    sekolahAsalPreview,
    loginEmail,
    sumbanganPreviewVal,
    formatTanggalLahirId,
    submitting,
    onClose,
    onConfirm,
}: {
    isTk: boolean;
    isDariBpk: boolean;
    asalSekolah: string;
    programAsal: string;
    pilihan1: string;
    program1: string;
    pilihan2: string;
    program2: string;
    noSpb: string;
    formData: SiswaFormData;
    jenisKelamin: string;
    sekolahAsalPreview: string;
    loginEmail: string;
    sumbanganPreviewVal: string;
    formatTanggalLahirId: (d: string) => string;
    submitting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !submitting) onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = original;
            window.removeEventListener("keydown", onKey);
        };
    }, [onClose, submitting]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
            role="dialog"
            aria-modal="true"
            onClick={() => { if (!submitting) onClose(); }}
        >
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4 sm:my-8 flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="rounded-t-2xl bg-white px-6 py-5 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-[#1976d2] flex-shrink-0">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </span>
                            <div>
                                <h2 className="font-semibold text-base sm:text-lg text-gray-900">Preview Data Pendaftaran</h2>
                                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mt-0.5">
                                    Periksa kembali data sebelum dikirim ke sistem.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            aria-label="Tutup preview"
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto px-5 sm:px-7 py-6 space-y-6 flex-1 bg-slate-50">
                    <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                        <h3 className="text-base font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100 flex items-center gap-3">
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-amber-50 text-amber-600">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            Pilihan Sekolah
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PreviewField label="Asal Sekolah" value={asalSekolah} />
                            <PreviewField label="Program Asal" value={programAsal} />
                            {isDariBpk && <PreviewField label="Nomor SPB" value={noSpb} />}
                            <PreviewField label="Pilihan 1" value={pilihan1} />
                            <PreviewField label="Program Pilihan 1" value={program1} />
                            <PreviewField label="Pilihan 2" value={pilihan2} />
                            <PreviewField label="Program Pilihan 2" value={program2} />
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                        <h3 className="text-base font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100 flex items-center gap-3">
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 text-[#1976d2]">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <path d="M20 8v6M23 11h-6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            Biodata Siswa
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {!isTk && <PreviewField label="NISN" value={formData.nisn} />}
                            <PreviewField label="NIK" value={formData.nik} />
                            <PreviewField label="Nomor Kartu Keluarga" value={formData.nokk} />
                            <PreviewField label="Nama Lengkap" value={formData.nama} />
                            <PreviewField label="Tempat Lahir" value={formData.tempatLahir} />
                            <PreviewField label="Tanggal Lahir" value={formatTanggalLahirId(formData.tanggalLahir)} />
                            <PreviewField label="Jenis Kelamin" value={jenisKelamin} />
                            <PreviewField label="No HP (WhatsApp)" value={formData.noHp} />
                            <PreviewField label="Email" value={formData.email || loginEmail} />
                            <PreviewField label="Sekolah Asal" value={sekolahAsalPreview} />
                            <PreviewField label="Kota Sekolah Asal" value={formData.kotaSekolahAsal} />
                            <div className="md:col-span-2">
                                <PreviewField label="Alamat Rumah" value={formData.alamat} multiline />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                        <h3 className="text-base font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100 flex items-center gap-3">
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-purple-50 text-purple-600">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="9" cy="7" r="4" />
                                </svg>
                            </span>
                            Biodata Keluarga
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PreviewField label="Nama Ayah" value={formData.namaAyah} />
                            <PreviewField label="No. HP. Ayah" value={formData.noHpAyah} />
                            <PreviewField label="Nama Ibu" value={formData.namaIbu} />
                            <PreviewField label="No. HP. Ibu" value={formData.noHpIbu} />
                            <PreviewField label="Nama Wali" value={formData.namaWali} />
                            <PreviewField label="No. HP. Wali" value={formData.noHpWali} />
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                        <h3 className="text-base font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100 flex items-center gap-3">
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="5" width="20" height="14" rx="2" />
                                    <path d="M2 10h20" />
                                </svg>
                            </span>
                            Data Administratif
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PreviewField label="Dana Sumbangan Sukarela" value={sumbanganPreviewVal} />
                        </div>
                    </section>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-gray-700">
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
                </div>

                <div className="px-5 sm:px-7 py-4 border-t border-gray-100 bg-white rounded-b-2xl flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Kembali ke Form
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={submitting}
                        className="group flex-1 bg-gradient-to-r from-[#1976d2] to-[#0d47a1] hover:from-[#1565c0] hover:to-[#0d47a1] text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.99] disabled:bg-gray-300 disabled:bg-none disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        {submitting ? "Mengirim..." : "Konfirmasi & Submit"}
                        {!submitting && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
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
    onBlur,
    max,
    digitsOnly,
    lettersOnly,
    minLength,
    maxLength,
    exactLength,
    readOnly,
    externalError,
}: {
    label: string;
    required?: boolean;
    doubleRequired?: boolean;
    type?: string;
    hint?: string;
    name?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    max?: string;
    digitsOnly?: boolean;
    lettersOnly?: boolean;
    minLength?: number;
    maxLength?: number;
    exactLength?: number;
    readOnly?: boolean;
    externalError?: string;
}) {
    const isPhone = type === "tel";
    const isEmail = type === "email";

    const phoneInvalid    = isPhone && !!value && !isValidPhone(value);
    const emailInvalid    = isEmail && !!value && !isValidEmail(value);
    const lengthInvalid   = !!exactLength && !!value && value.length !== exactLength;
    const minLenInvalid   = !!minLength && !!value && value.trim().length > 0 && value.trim().length < minLength;
    const hasExternal     = !!externalError;
    const hasError        = phoneInvalid || emailInvalid || lengthInvalid || minLenInvalid || hasExternal;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isPhone) {
            e.target.value = normalizePhoneInput(e.target.value);
        } else if (digitsOnly) {
            let digits = e.target.value.replace(/\D/g, "");
            if (exactLength) digits = digits.slice(0, exactLength);
            e.target.value = digits;
        } else if (lettersOnly) {
            let letters = e.target.value.replace(/[^A-Za-zÀ-ſ\s.'\-]/g, "");
            letters     = letters.replace(/\s{2,}/g, " ");
            if (maxLength) letters = letters.slice(0, maxLength);
            e.target.value = letters;
        } else if (maxLength) {
            e.target.value = e.target.value.slice(0, maxLength);
        }
        onChange?.(e);
    };

    const errorMessage = hasExternal
        ? externalError!
        : phoneInvalid
        ? "Format nomor tidak valid. Contoh: 08123456789 atau +628123456789"
        : emailInvalid
        ? "Format email tidak valid. Contoh: nama@gmail.com"
        : lengthInvalid
        ? `Harus ${exactLength} digit angka (saat ini ${value?.length ?? 0})`
        : minLenInvalid
        ? `Minimal ${minLength} karakter`
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
                maxLength={isPhone ? 15 : (exactLength ?? maxLength)}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={onBlur}
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

