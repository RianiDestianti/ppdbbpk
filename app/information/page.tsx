import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const jadwal = [
    { tahap: "Pembukaan Pendaftaran", tanggal: "Januari 2026" },
    { tahap: "Tes Seleksi & Observasi", tanggal: "Februari 2026" },
    { tahap: "Pengumuman Hasil", tanggal: "Maret 2026" },
    { tahap: "Daftar Ulang", tanggal: "Maret - April 2026" },
    { tahap: "Awal Tahun Ajaran Baru", tanggal: "Juli 2026" },
];

const persyaratan = [
    "Akta Kelahiran Calon Peserta Didik",
    "Kartu Keluarga (KK)",
    "Pas Foto Terbaru (berwarna)",
    "Rapor Terakhir (untuk jenjang SD, SMP, SMA)",
    "Surat Keterangan Pindah (bila mutasi)",
    "Kartu Tanda Penduduk Orang Tua/Wali",
];

export default function InformationPage() {
    return (
        <>
            <Navbar />

            <main className="flex-1 bg-gray-50">
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                            Informasi Pendaftaran
                        </h1>
                        <p className="text-gray-600">Tahun Ajaran 2026/2027</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-md border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Jadwal Pendaftaran</h2>
                            <ul className="space-y-3 text-sm">
                                {jadwal.map((j) => (
                                    <li key={j.tahap} className="flex justify-between gap-4 pb-2 border-b border-gray-100 last:border-0">
                                        <span className="text-gray-700">{j.tahap}</span>
                                        <span className="text-gray-500 text-right flex-shrink-0">{j.tanggal}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white rounded-md border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Persyaratan</h2>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                                {persyaratan.map((p) => (
                                    <li key={p}>{p}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white rounded-md border border-gray-200 p-6 mt-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Butuh Bantuan?</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Hubungi admin BPK PENABUR Bandung untuk informasi lebih lanjut.
                        </p>
                        <div className="flex flex-wrap gap-3 text-sm">
                            <a href="tel:0224203808" className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium">
                                022-420 3808
                            </a>
                            <a href="https://wa.me/6281224122456" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium">
                                WhatsApp Admin
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
