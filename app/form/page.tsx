"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { saveSiswa } from "@/store/controllers/siswaController";
import { resetResponse } from "@/store/slices/siswaSlice";
import { initialFormSiswa, SiswaFormData } from "@/store/types/SiswaTypes";
import { Jenjang, JenjangConfig } from "@/store/types/JenjangTypes";
import { handleChangeInput } from "@/libs/general";
import Swal from "sweetalert2";

const steps = [1, 2];

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
            "Enriched Bilingual Programme (EBP)",
            "Early Childhood Programme (ECP)",
            "Luar BPK",
        ],
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
        asalSekolahOptions:    ["- Pilih -", "TKK BPK PENABUR", "Luar BPK"],
        programAsalOptions:    ["Reguler"],
        pilihanSekolahOptions: ["- Pilih -", "SDK 1 BPK PENABUR", "SDK 2 BPK PENABUR", "SDK 3 BPK PENABUR", "Luar BPK"],
        programPilihanOptions: ["- Pilih -", "Classical", "Reguler"],
        sumbanganOptions:      ["Rp. 0", "Rp. 1.000.000", "Rp. 5.000.000", "Rp. 10.000.000", "Rp. 25.000.000", "Rp. 50.000.000", "Lainnya"],
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
        programPilihanOptions: ["- Pilih -", "Reguler", "Bilingual"],
        sumbanganOptions:      ["Rp. 0", "Rp. 1.000.000", "Rp. 5.000.000", "Rp. 10.000.000", "Rp. 25.000.000", "Rp. 50.000.000", "Lainnya"],
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
        programPilihanOptions: ["- Pilih -", "Reguler", "IPA", "Bilingual", "LSP", "DCP"],
        sumbanganOptions:      ["Rp. 0", "Rp. 1.000.000", "Rp. 5.000.000", "Rp. 10.000.000", "Rp. 25.000.000", "Rp. 50.000.000", "Lainnya"],
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
    const config                            = jenjangConfig[jenjang];

    const [currentStep, setCurrentStep]     = useState(1);
    const [asalSekolah, setAsalSekolah]     = useState("- Pilih -");
    const [programAsal, setProgramAsal]     = useState("Reguler");
    const [pilihan1,    setPilihan1]        = useState("- Pilih -");
    const [program1,    setProgram1]        = useState("- Pilih -");
    const [pilihan2,    setPilihan2]        = useState("- Pilih -");
    const [program2,    setProgram2]        = useState("- Pilih -");

    const isSelected    = (v: string) => v !== "- Pilih -" && v !== "-" && v.trim() !== "";
    const isStep1Valid  = isSelected(asalSekolah) && isSelected(programAsal) &&
                          isSelected(pilihan1) && isSelected(program1) &&
                          isSelected(pilihan2) && isSelected(program2);

    const goNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isStep1Valid) return;
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
                                    </div>
                                </section>

                                <section className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-200">
                                        Pilihan Sekolah
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectField label="Pilihan 1" required value={pilihan1} onChange={setPilihan1}>
                                            {config.pilihanSekolahOptions.map((opt) => (
                                                <option key={opt}>{opt}</option>
                                            ))}
                                        </SelectField>
                                        <SelectField label="Program" required value={program1} onChange={setProgram1}>
                                            {config.programPilihanOptions.map((opt) => (
                                                <option key={opt}>{opt}</option>
                                            ))}
                                        </SelectField>
                                        <SelectField label="Pilihan 2" required value={pilihan2} onChange={setPilihan2}>
                                            {config.pilihanSekolahOptions.map((opt) => (
                                                <option key={opt}>{opt}</option>
                                            ))}
                                        </SelectField>
                                        <SelectField label="Program" required value={program2} onChange={setProgram2}>
                                            {config.programPilihanOptions.map((opt) => (
                                                <option key={opt}>{opt}</option>
                                            ))}
                                        </SelectField>
                                    </div>
                                </section>

                                <button
                                    type="submit"
                                    disabled={!isStep1Valid}
                                    className="w-full bg-gray-900 hover:bg-black text-white font-medium py-4 rounded-md transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Berikutnya
                                    <span>→</span>
                                </button>
                            </form>
                        </>
                    )}

                    {currentStep === 2 && (
                        <FormStep2
                            asalSekolah={asalSekolah}
                            programAsal={programAsal}
                            pilihan1={pilihan1}
                            program1={program1}
                            pilihan2={pilihan2}
                            program2={program2}
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
    asalSekolah,
    programAsal,
    pilihan1,
    program1,
    pilihan2,
    program2,
    sumbanganOptions,
    onBack,
}: {
    asalSekolah: string;
    programAsal: string;
    pilihan1: string;
    program1: string;
    pilihan2: string;
    program2: string;
    sumbanganOptions: string[];
    onBack: () => void;
}) {
    const dispatch                                  = useAppDispatch();
    const { loading, response }                     = useAppSelector((state) => state.siswa);
    const [formData, setFormData]                   = useState<SiswaFormData>({ ...initialFormSiswa });
    const [jenisKelamin, setJenisKelamin]           = useState("");
    const [sekolahAsalSelect, setSekolahAsalSelect] = useState("- Pilih -");
    const [sumbangan, setSumbangan]                 = useState("Rp. 0");
    const [sumbanganLainnya, setSumbanganLainnya]   = useState("");

    useEffect(() => {
        if (response?.status === 200) {
            Swal.fire({
                icon  : 'success',
                title : 'Pendaftaran Berhasil',
                text  : `No. Registrasi: ${response.data.noreg}`,
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
                        <InputField label="Nomor Induk Siswa Nasional (NISN)" doubleRequired name="nisn" value={formData.nisn} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Nomor Induk Kependudukan (NIK)" doubleRequired name="nik" value={formData.nik} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Nomor Kartu Keluarga (NoKK)" doubleRequired name="nokk" value={formData.nokk} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Nama Lengkap" required hint="Sesuai Akte Lahir Anak" name="nama" value={formData.nama} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Tempat Lahir" required name="tempatLahir" value={formData.tempatLahir} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Tanggal Lahir" required type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={(e) => handleChangeInput(e, setFormData)} />

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

                        <InputField label="No HP (WhatsApp) Untuk Informasi Akademik" required name="noHp" value={formData.noHp} onChange={(e) => handleChangeInput(e, setFormData)} />
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
                                    <option>- Pilih -</option>
                                    <option>TKK BPK PENABUR</option>
                                    <option>Luar BPK</option>
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
                        <InputField label="No. HP. Ayah" required name="noHpAyah" value={formData.noHpAyah} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="No. HP. Ibu" required name="noHpIbu" value={formData.noHpIbu} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="Nama Wali" name="namaWali" value={formData.namaWali} onChange={(e) => handleChangeInput(e, setFormData)} />
                        <InputField label="No. HP. Wali" name="noHpWali" value={formData.noHpWali} onChange={(e) => handleChangeInput(e, setFormData)} />
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
                        disabled={loading}
                        className="flex-1 bg-gray-900 hover:bg-black text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
}: {
    label: string;
    required?: boolean;
    doubleRequired?: boolean;
    type?: string;
    hint?: string;
    name?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div>
            <Label required={required} doubleRequired={doubleRequired}>
                {label}
            </Label>
            {hint && <p className="text-xs italic text-gray-500 -mt-1 mb-1.5">{hint}</p>}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
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
