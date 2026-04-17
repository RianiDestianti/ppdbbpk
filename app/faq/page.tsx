"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const faqs = [
    {
        q: "Kapan pendaftaran SPMB BPK PENABUR Bandung dibuka?",
        a: "Pendaftaran tahun ajaran 2026/2027 dibuka mulai tanggal yang akan diumumkan resmi melalui website dan media sosial BPK PENABUR Bandung.",
    },
    {
        q: "Bagaimana cara mendaftar di BPK PENABUR Bandung?",
        a: "Anda dapat mendaftar secara online melalui sistem SPMB Online dengan membuat akun terlebih dahulu, lalu mengisi formulir sesuai jenjang yang dituju.",
    },
    {
        q: "Dokumen apa saja yang diperlukan untuk pendaftaran?",
        a: "Dokumen yang diperlukan antara lain: akta kelahiran, kartu keluarga, pas foto, rapor (untuk SD/SMP/SMA), serta dokumen pendukung lain sesuai jenjang.",
    },
    {
        q: "Apakah bisa mendaftar untuk lebih dari satu jenjang?",
        a: "Satu akun hanya dapat digunakan untuk mendaftar satu calon peserta didik. Jika ingin mendaftarkan anak lain, silakan buat akun baru dengan email berbeda.",
    },
    {
        q: "Bagaimana jika lupa password akun SPMB?",
        a: "Klik tombol 'Lupa Password' pada halaman Sign In, masukkan email terdaftar, dan ikuti instruksi reset password yang dikirimkan ke email Anda.",
    },
    {
        q: "Siapa yang bisa saya hubungi jika mengalami kendala?",
        a: "Anda dapat menghubungi admin kami via WhatsApp di 0812 2412 2456 atau telepon di 022-420 3808 pada jam kerja.",
    },
];

export default function FAQPage() {
    const [openIdx, setOpenIdx] = useState<number | null>(0);

    return (
        <>
            <Navbar />

            <main className="flex-1 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">FAQ</h1>
                        <p className="text-gray-600">Pertanyaan yang sering diajukan seputar pendaftaran</p>
                    </div>

                    <div className="bg-white rounded-md border border-gray-200 divide-y divide-gray-200">
                        {faqs.map((f, i) => (
                            <div key={i}>
                                <button
                                    onClick={() => setOpenIdx(openIdx === i ? null : i)}
                                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-gray-50"
                                >
                                    <span className="font-medium text-gray-800">{f.q}</span>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className={`flex-shrink-0 text-gray-500 transition-transform ${openIdx === i ? "rotate-180" : ""}`}
                                    >
                                        <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                {openIdx === i && (
                                    <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">
                                        {f.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
