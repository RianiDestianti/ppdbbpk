import Image from "next/image";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageBanner from "./components/PageBanner";
import LanguageToggle from "./components/LanguageToggle";

const langkahList = [
    "Bacalah dengan cermat Informasi Pendaftaran",
    "Isi formulir pendaftaran dengan benar",
    <>Simpan Formulir Pendaftaran Anda dalam bentuk <em>softcopy</em></>,
    "Mengirimkan berkas-berkas persyaratan pendaftaran (termasuk Formulir Pendaftaran dan surat pernyataan) ke email/Gform sekolah (tercantum dalam Formulir Pendaftaran)",
    "Membayar Biaya Pendaftaran menggunakan No. Virtual Account (VA) BCA (No. VA Tercantum dalam Formulir Pendaftaran) dan melakukan Konfirmasi Pembayaran di web SPMB Online",
    "Jika Semua Persyaratan telah terkirim dan pembayaran sudah divalidasi, Pendaftar akan mendapatkan email Bukti Pendaftaran dari Panitia SPMB Pusat",
    "Untuk memastikan data Anda sudah divalidasi dalam sistem kami, silakan Cek Status Pendaftaran Anda",
];

export default function RootPage() {
    return (
        <>
            <Navbar />

            <main className="flex-1 bg-white">
                <PageBanner />
                <LanguageToggle />

                <section className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                        <h2 className="text-2xl text-gray-700 mb-1">INFORMASI SPMB BPK PENABUR Bandung</h2>
                        <div className="w-16 h-[3px] bg-red-600 mb-8" />

                        <a
                            href="/information"
                            className="inline-flex items-center gap-3 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-full pl-2 pr-6 py-2 shadow-md hover:shadow-lg transition mb-8"
                        >
                            <span className="w-10 h-10 rounded-full bg-white text-purple-700 flex items-center justify-center font-serif italic text-xl font-bold">
                                i
                            </span>
                            <span className="font-semibold tracking-wide text-sm leading-tight">
                                ASK FOR<br />INFORMATION
                            </span>
                        </a>

                        <div className="relative w-full aspect-video rounded-md overflow-hidden shadow-md">
                            <iframe
                                src="https://www.youtube.com/embed/qXxLncjnfv0"
                                title="Panduan SPMB BPK PENABUR Bandung"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl text-gray-700 mb-1">Berikut Ini Adalah Langkah-Langkah Untuk Mengikuti Sistem SPMB Online</h2>
                        <div className="w-16 h-[3px] bg-red-600 mb-6" />

                        <ol className="space-y-4 text-gray-700 text-[15px] leading-relaxed">
                            {langkahList.map((item, idx) => (
                                <li key={idx} className="flex gap-2">
                                    <span className="flex-shrink-0">{idx + 1}.</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="max-w-5xl mx-auto px-6 py-16 border-t border-gray-200">
                    <h2 className="text-2xl text-center text-gray-700 mb-8">Berikut ini adalah Gambar Alur Pendaftaran Online</h2>
                    <div className="w-full rounded-lg overflow-hidden">
                        <Image
                            src="/assets/tatacaraspmb.png"
                            alt="Alur Pendaftaran Online"
                            width={1200}
                            height={1200}
                            className="w-full h-auto"
                        />
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
