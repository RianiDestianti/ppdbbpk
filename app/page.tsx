import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const jenjangList = [
    { href: "/form?jenjang=tk", label: "TK", desc: "Taman Kanak-kanak" },
    { href: "/form?jenjang=sd", label: "SD", desc: "Sekolah Dasar" },
    { href: "/form?jenjang=smp", label: "SMP", desc: "Sekolah Menengah Pertama" },
    { href: "/form?jenjang=sma", label: "SMA", desc: "Sekolah Menengah Atas" },
];

export default function RootPage() {
    return (
        <>
            <Navbar />

            <main className="flex-1 bg-gray-50">
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                            SPMB Online BPK PENABUR Bandung
                        </h1>
                        <p className="text-gray-600">
                            Sistem Penerimaan Peserta Didik Baru Tahun Ajaran 2026/2027
                        </p>
                    </div>

                    <div className="bg-white rounded-md border border-gray-200 p-8 mb-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-5">Pilih Jenjang Pendaftaran</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {jenjangList.map((j) => (
                                <Link
                                    key={j.href}
                                    href={j.href}
                                    className="border border-gray-200 rounded-md p-5 text-center hover:border-red-500 hover:shadow-sm transition"
                                >
                                    <div className="text-2xl font-bold text-red-700 mb-1">{j.label}</div>
                                    <div className="text-xs text-gray-600">{j.desc}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-md border border-gray-200 p-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Informasi Penting</h2>
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                            <li>Pastikan data yang diinput sesuai dengan dokumen resmi (akta kelahiran, KK, rapor).</li>
                            <li>Gunakan email aktif untuk mendaftar akun agar dapat menerima notifikasi pendaftaran.</li>
                            <li>Siapkan dokumen persyaratan sebelum mengisi formulir pendaftaran.</li>
                            <li>Hubungi admin melalui WhatsApp atau telepon jika mengalami kendala teknis.</li>
                        </ul>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                href="/information"
                                className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
                            >
                                Lihat Informasi Lengkap
                            </Link>
                            <Link
                                href="/faq"
                                className="px-5 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium"
                            >
                                FAQ
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
