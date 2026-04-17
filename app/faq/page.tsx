import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageBanner from "../components/PageBanner";

type FAQItem = {
    q: string;
    a: React.ReactNode;
};

const faqs: FAQItem[] = [
    {
        q: "Data yang saya masukkan ternyata ada kekeliruan.",
        a: "Jika sudah terlanjur dikirim, silahkan mengubungi panitia SPMB Sekolah Pilihan ke 1 untuk mengedit data.",
    },
    {
        q: "Data yang saya masukkan tidak muncul lengkap di halaman FORMULIR",
        a: "Ada kemungkinan akses internet yang anda gunakan tidak memadai (terlalu lambat) atau anda menutup tab browser saat halaman pendaftaran sedang diproses. Silakan membatalkan pendaftaran dan mencoba lagi.",
    },
    {
        q: "Apa perbedaan Jalur Keajegan dalam, Keajegan Luar dan TES?",
        a: (
            <>
                ada 3 pilihan jalur untuk SPMB BPK PENABUR Bandung
                <div className="mt-4 space-y-2">
                    <p>1. Jalur Keajegan Dalam adalah pendaftaran peserta didik baru yang asal sekolahnya dari BPK PENABUR Bandung dan melakukan pendaftaran diwaktu pendaftaran Keajegan Dalam</p>
                    <p>2. Jalur Keajegan Luar adalah pendaftaran peserta didik baru yang asal sekolahnya dari Luar BPK PENABUR Bandung dan melakukan pendaftaran diwaktu pendaftaran Keajegan Luar</p>
                    <p>3. Jalur Tes adalah pendaftaran peserta didik baru yang asal sekolahnya dari Dalam/Luar BPK PENABUR Bandung dan melakukan pendaftaran setelah batas waktu Keajegan</p>
                </div>
            </>
        ),
    },
    {
        q: 'Saya tidak dapat mengklik tombol "Daftar". Sepertinya tidak merespon.',
        a: (
            <>
                Mungkin ada <em>form</em> yang belum anda isi atau formatnya salah. Silakan cek kembali. Jika masih tidak bisa, coba untuk merefresh halaman/mengklik lagi menu sesuai jenjang.
            </>
        ),
    },
    {
        q: "Situs ini sulit diakses / lambat.",
        a: "Jika anda yakin hal ini bukan dikarenakan akses internet anda yang bermasalah/lambat, silakan dicoba lagi diwaktu dimana kemungkinan trafiknya kembali normal, misalnya pada malam hari.",
    },
];

export default function FAQPage() {
    return (
        <>
            <Navbar />

            <main className="flex-1 bg-white">
                <PageBanner />

                <section className="max-w-7xl mx-auto px-6 py-12">
                    <h1 className="text-2xl text-gray-700">Frequently Asked Questions</h1>
                    <p className="mt-1 tracking-[0.3em] text-gray-500 text-xs">( F A Q )</p>
                    <div className="w-16 h-[3px] bg-red-600 mt-3" />

                    <p className="mt-10 text-gray-700 text-[15px] flex flex-wrap items-center gap-3">
                        <span>Bila informasi di halaman ini tidak mencukupi kebutuhan anda, silakan hubungi kami di nomor telepon</span>
                        <a
                            href="tel:0224203808"
                            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md px-4 py-1.5 text-sm"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 00-1.02.24l-2.2 2.2a15.07 15.07 0 01-6.58-6.58l2.2-2.21a1 1 0 00.24-1.01A11.36 11.36 0 018.5 4a1 1 0 00-1-1H4a1 1 0 00-1 1 17 17 0 0017 17 1 1 0 001-1v-3.5a1 1 0 00-1-1z" />
                            </svg>
                            022-420 3808
                        </a>
                        <span>atau</span>
                        <a
                            href="#contact"
                            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md px-4 py-1.5 text-sm"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <path d="M22 6l-10 7L2 6" />
                            </svg>
                            Contact Us
                        </a>
                    </p>

                    <div className="mt-10 space-y-8">
                        {faqs.map((f, i) => (
                            <div key={i}>
                                <p className="font-bold italic text-gray-800 text-[15px]">
                                    Tanya : {f.q}
                                </p>
                                <div className="mt-2 text-gray-700 text-[15px] leading-relaxed">
                                    <span>Jawab : </span>
                                    {f.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
