"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { getMySiswa } from "@/store/controllers/siswaController";
import { submitKonfirmasiPembayaran } from "@/store/controllers/konfirmasiController";
import { resetKonfirmasi } from "@/store/slices/konfirmasiSlice";
import { KonfirmasiPembayaranPayload } from "@/store/types/KonfirmasiTypes";
import { SiswaDetail } from "@/store/types/SiswaTypes";

const defaultForm: KonfirmasiPembayaranPayload = {
    no_registrasi: "",
    nama_siswa: "",
    asal_sekolah: "",
    sekolah_tujuan: "",
    no_hp: "",
    email: "",
    no_va: "",
    tanggal_bayar: "",
    keterangan: "",
};

const sekolahOptions = [
    "- Pilih -",
    "TKK BPK PENABUR 246",
    "TKK BPK PENABUR 638",
    "TK BPK PENABUR Holis",
    "TKK BPK PENABUR Paskal",
    "TKK BPK PENABUR Guntur",
    "TKK BPK PENABUR Singgasana",
    "TKK BPK PENABUR KBP",
    "TKK BPK PENABUR Banda",
    "SDK 1 BPK PENABUR",
    "SDK 2 BPK PENABUR",
    "SDK 3 BPK PENABUR",
    "SMP BPK PENABUR",
    "SMA BPK PENABUR",
];

export default function KonfirmasiPembayaranPage() {
    return (
        <Suspense fallback={null}>
            <KonfirmasiPembayaranContent />
        </Suspense>
    );
}

function KonfirmasiPembayaranContent() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const noregParam = searchParams.get("noreg") ?? "";
    const siswaDetail = useAppSelector((state) => state.siswa.detail);
    const { loading, response, error } = useAppSelector((state) => state.konfirmasi);

    const initialForm = useMemo<KonfirmasiPembayaranPayload>(() => {
        const siswa = siswaDetail ?? ({} as SiswaDetail);

        return {
            no_registrasi: noregParam ?? siswa.noreg ?? "",
            nama_siswa: siswa.nama ?? "",
            asal_sekolah: siswa.sekolah_asal ?? "",
            sekolah_tujuan: siswa.sekolah_tujuan ?? siswa.pilihan1 ?? "",
            no_hp: siswa.no_hp1 ?? siswa.no_tlp ?? "",
            email: siswa.email ?? "",
            no_va: siswa.no_va ?? "",
            tanggal_bayar: "",
            keterangan: "",
        };
    }, [noregParam, siswaDetail]);

    const [form, setForm] = useState<KonfirmasiPembayaranPayload>(defaultForm);
    const [formError, setFormError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("auth-key");
        if (!token) {
            router.replace("/sign-in");
            return;
        }

        dispatch(getMySiswa(noregParam || undefined));
    }, [dispatch, noregParam, router]);

    useEffect(() => {
        setForm(initialForm);
    }, [initialForm]);

    useEffect(() => {
        if (response?.status === 200) {
            setSubmitted(true);
        }
    }, [response]);

    useEffect(() => {
        return () => {
            dispatch(resetKonfirmasi());
        };
    }, [dispatch]);

    const setField = <K extends keyof KonfirmasiPembayaranPayload>(field: K, value: KonfirmasiPembayaranPayload[K]) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError("");
        setSubmitted(false);

        const requiredFields: Array<keyof KonfirmasiPembayaranPayload> = [
            "no_registrasi",
            "nama_siswa",
            "asal_sekolah",
            "sekolah_tujuan",
            "no_hp",
            "email",
            "no_va",
            "tanggal_bayar",
        ];

        const missingField = requiredFields.find((field) => !String(form[field] ?? "").trim());
        if (missingField) {
            setFormError("Lengkapi semua kolom yang wajib diisi.");
            return;
        }

        await dispatch(submitKonfirmasiPembayaran(form));
    };

    return (
        <>
            <Navbar />

            <main className="flex-1 overflow-x-hidden bg-white">
                <section className="relative overflow-hidden bg-white">
                    <Image
                        src="/assets/bannerspmb.png"
                        alt="SPMB BPK PENABUR Bandung"
                        width={1600}
                        height={500}
                        priority
                        sizes="100vw"
                        className="w-full h-auto object-cover"
                    />
                </section>

                <section className="h-8 bg-white sm:h-10 lg:h-12" />

                <section className="bg-[#1f6ea6] pb-14 pt-6 sm:pb-20 sm:pt-10 lg:pt-14">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6">
                        <div className="mt-8 overflow-hidden rounded-[28px] bg-white shadow-[0_18px_50px_rgba(3,28,54,0.18)] sm:mt-10 lg:mt-12">
                        <div className="border-b border-gray-100 px-6 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-8">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2f6fb] text-[#1976d2] shadow-sm">
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                                        <rect x="3" y="5" width="18" height="11" rx="2" />
                                        <path d="M8 20h8M12 16v4" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-[28px] font-light tracking-tight text-gray-900 sm:text-[34px]">
                                        Konfirmasi Pembayaran Formulir
                                    </h1>
                                    <p className="mt-2 text-[12px] uppercase tracking-[0.42em] text-gray-400 sm:text-[13px]">
                                        Apabila Anda telah melakukan pembayaran, silakan isi form berikut untuk proses validasi.
                                    </p>
                                </div>
                            </div>
                            <div className="mx-auto mt-5 h-[2px] w-16 bg-red-600" />
                        </div>

                            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
                            <form onSubmit={handleSubmit} className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
                                <FormSection title="Data Pembayaran" subtitle="Pastikan data sesuai dengan bukti transfer yang Anda miliki.">
                                    <div className="grid gap-5">
                                        <Field label="No. Registrasi" required>
                                            <input
                                                value={form.no_registrasi}
                                                onChange={(event) => setField("no_registrasi", event.target.value)}
                                                className="form-input"
                                                placeholder="Masukkan no registrasi"
                                            />
                                        </Field>
                                        <Field label="Nama Siswa" required>
                                            <input
                                                value={form.nama_siswa}
                                                onChange={(event) => setField("nama_siswa", event.target.value)}
                                                className="form-input"
                                                placeholder="Masukkan nama siswa"
                                            />
                                        </Field>
                                        <Field label="Asal Sekolah" required>
                                            <input
                                                value={form.asal_sekolah}
                                                onChange={(event) => setField("asal_sekolah", event.target.value)}
                                                className="form-input"
                                                placeholder="Masukkan asal sekolah"
                                            />
                                        </Field>
                                        <Field label="Sekolah Tujuan" required>
                                            <select
                                                value={form.sekolah_tujuan}
                                                onChange={(event) => setField("sekolah_tujuan", event.target.value)}
                                                className="form-input"
                                            >
                                                {sekolahOptions.map((item) => (
                                                    <option key={item} value={item === "- Pilih -" ? "" : item}>
                                                        {item}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                    </div>
                                </FormSection>

                                <FormSection title="Kontak dan VA" subtitle="Data ini dipakai untuk validasi pembayaran oleh admin.">
                                    <div className="grid gap-5">
                                        <Field label="No. HP" required>
                                            <input
                                                value={form.no_hp}
                                                onChange={(event) => setField("no_hp", event.target.value)}
                                                className="form-input"
                                                placeholder="08xxxxxxxxxx"
                                            />
                                        </Field>
                                        <Field label="Email" required>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={(event) => setField("email", event.target.value)}
                                                className="form-input"
                                                placeholder="nama@email.com"
                                            />
                                        </Field>
                                        <Field label="No. Virtual Account BCA" required>
                                            <input
                                                value={form.no_va}
                                                onChange={(event) => setField("no_va", event.target.value)}
                                                className="form-input"
                                                placeholder="Masukkan nomor VA"
                                            />
                                        </Field>
                                        <Field label="Tanggal Bayar" required>
                                            <input
                                                type="date"
                                                value={form.tanggal_bayar}
                                                onChange={(event) => setField("tanggal_bayar", event.target.value)}
                                                className="form-input"
                                            />
                                        </Field>
                                        <Field label="Keterangan">
                                            <textarea
                                                value={form.keterangan ?? ""}
                                                onChange={(event) => setField("keterangan", event.target.value)}
                                                className="form-input min-h-28 resize-y"
                                                placeholder="Opsional: tulis catatan tambahan"
                                            />
                                        </Field>
                                    </div>
                                </FormSection>

                                {(formError || error || submitted) && (
                                    <div
                                        className={`rounded-2xl border px-4 py-3 text-sm ${
                                            submitted
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                                : "border-rose-200 bg-rose-50 text-rose-700"
                                        }`}
                                    >
                                        {submitted
                                            ? response?.message ?? "Konfirmasi pembayaran berhasil dikirim."
                                            : formError || error}
                                    </div>
                                )}

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs leading-relaxed text-gray-500">
                                        Pastikan nomor registrasi, VA, dan tanggal bayar sesuai sebelum menekan kirim.
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1976d2] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#1565c0] disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {loading ? "Mengirim..." : "Kirim"}
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <path d="M22 2L11 13" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            </form>

                            <aside className="border-t border-gray-100 bg-[#f7fbff] px-6 py-8 sm:px-10 lg:border-l lg:border-t-0">
                                <div className="sticky top-6 space-y-6">
                                    <InfoCard
                                        title="Panduan Singkat"
                                        accent="bg-[#1976d2]"
                                        items={[
                                            "Isi form sesuai bukti transfer yang sudah dilakukan.",
                                            "Gunakan email aktif agar admin mudah menghubungi Anda.",
                                            "Setelah berhasil, simpan bukti pengiriman konfirmasi.",
                                        ]}
                                    />

                                    <InfoCard
                                        title="Kontak Admin"
                                        accent="bg-emerald-500"
                                        items={[
                                            "Whatsapp: 08 1224 1224 56",
                                            "Telepon: 022-420 3808",
                                            "Alamat: Jl. Banda No. 19, Bandung",
                                        ]}
                                    />
                                </div>
                            </aside>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

        <Footer />

            <style jsx global>{`
                .form-input {
                    width: 100%;
                    border: 1px solid #d1dbe8;
                    border-radius: 0.75rem;
                    background: white;
                    padding: 0.95rem 1rem;
                    color: #111827;
                    font-size: 0.98rem;
                    outline: none;
                    transition: border-color 0.15s ease, box-shadow 0.15s ease;
                }

                .form-input:focus {
                    border-color: #1976d2;
                    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.12);
                }

                select.form-input {
                    appearance: none;
                }
            `}</style>
        </>
    );
}

function FormSection({
    title,
    subtitle,
    children,
}: Readonly<{
    title: string;
    subtitle: string;
    children: React.ReactNode;
}>) {
    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-xl font-light text-gray-900 sm:text-2xl">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">{subtitle}</p>
            </div>
            {children}
        </section>
    );
}

function Field({
    label,
    required,
    children,
}: Readonly<{
    label: string;
    required?: boolean;
    children: React.ReactNode;
}>) {
    return (
        <label className="block">
            <span className="mb-2 block text-[15px] text-gray-500">
                {label}
                {required ? <span className="text-rose-500"> *</span> : null}
            </span>
            {children}
        </label>
    );
}

function InfoCard({
    title,
    accent,
    items,
}: Readonly<{
    title: string;
    accent: string;
    items: string[];
}>) {
    return (
        <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className={`mb-4 h-1.5 w-16 rounded-full ${accent}`} />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
                {items.map((item) => (
                    <li key={item} className="flex gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[#1976d2] flex-none" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
