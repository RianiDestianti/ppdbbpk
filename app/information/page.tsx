import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const persyaratan = [
    "Softcopy KTP Orang Tua (Ayah & Ibu)",
    "Softcopy Kartu Keluarga",
    "Softcopy Akte Lahir",
    "Softcopy Rapor 1 Set (wajib untuk jalur keajegan luar)",
    "Softcopy Surat Baptis / Sidi (jika ada)",
    "Photo 3x4 (wajib berseragam sekolah)",
];

export default function InformationPage() {
    return (
        <>
            <Navbar />

            <main className="flex-1 bg-white">
                <section className="relative w-full">
                    <Image
                        src="/assets/bannerspmb.png"
                        alt="SPMB BPK PENABUR Bandung"
                        width={1600}
                        height={500}
                        priority
                        className="w-full h-auto object-cover"
                    />
                </section>

                <div className="max-w-7xl mx-auto px-6 pt-10 flex justify-end gap-3 text-sm">
                    <button className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50">
                        <span className="font-medium">ID</span>
                        <span className="inline-block w-5 h-3 bg-gradient-to-b from-red-600 from-50% to-white to-50% border border-gray-300" />
                    </button>
                    <button className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50">
                        <span className="font-medium">EN</span>
                        <span className="inline-block w-5 h-3 bg-blue-800 border border-gray-300 relative overflow-hidden">
                            <span className="absolute inset-0 flex items-center justify-center text-[6px] text-white font-bold">UK</span>
                        </span>
                    </button>
                </div>

                <section className="max-w-7xl mx-auto px-6 py-12">
                    <h1 className="text-2xl text-gray-700">Informasi Pendaftaran</h1>
                    <p className="mt-1 tracking-[0.3em] text-gray-500 text-xs">P E R S Y A R A T A N &nbsp; D O K U M E N</p>
                    <div className="w-16 h-[3px] bg-red-600 mt-3" />

                    <div className="mt-10 space-y-6 text-gray-700 text-[15px] leading-relaxed">
                        <p>
                            Sistem Penerimaan Murid Baru (SPMB) Online, adalah sebuah sistem yang dirancang untuk melakukan otomasi seleksiSistem Penerimaan Murid Baru (SPMB), mulai dari proses pendaftaran hingga pengumuman hasil seleksi, yang dilakukan secara online dan berbasis web.
                        </p>
                        <p>
                            Kelengkapan syarat pendaftaran SPMB Online BPK PENABUR BANDUNG, sebagai berikut:
                        </p>

                        <ol className="space-y-4">
                            {persyaratan.map((item, idx) => (
                                <li key={idx} className="flex gap-2">
                                    <span className="flex-shrink-0">{idx + 1}.</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ol>

                        <div className="mt-8 bg-sky-500 text-white rounded-md p-5">
                            <div className="flex items-center gap-2 font-semibold mb-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" strokeLinecap="round" />
                                    <circle cx="12" cy="8" r="0.5" fill="currentColor" />
                                </svg>
                                Info:
                            </div>
                            <p>
                                Semua berkas wajib dikirimkan dalam bentuk softcopy ke email admin sekolah masing-masing dengan subject: <strong>No Registrasi - Nama Siswa</strong>.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
