/* eslint-disable @next/next/no-img-element */
"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { getMySiswa } from "@/store/controllers/siswaController";
import { getSignature } from "@/store/controllers/authController";
import { SiswaDetail } from "@/store/types/SiswaTypes";

const BULAN_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatTanggalCetak(date = new Date()): string {
    return `Bandung, ${date.getDate()} ${BULAN_ID[date.getMonth()]} ${date.getFullYear()}`;
}

function formatTanggalLahir(value?: string): string {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
}

function joinPilihan(sekolah?: string, prog?: string): string {
    return [sekolah, prog].filter(Boolean).join(" - ") || "-";
}

export default function PdfTkPage() {
    return (
        <Suspense fallback={null}>
            <PdfTkContent />
        </Suspense>
    );
}

function PdfTkContent() {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const noregParam   = searchParams.get("noreg") ?? "";
    const dispatch     = useAppDispatch();

    const { detail, list } = useAppSelector((state) => state.siswa);
    const signature        = useAppSelector((state) => state.auth.signature);

    useEffect(() => {
        const token = localStorage.getItem("auth-key");
        if (!token) {
            router.replace("/sign-in");
            return;
        }
        dispatch(getMySiswa(noregParam || undefined));
        dispatch(getSignature());
    }, [dispatch, router, noregParam]);

    const siswa: SiswaDetail = useMemo(() => {
        if (noregParam) {
            const cached = list.find((s) => s.noreg === noregParam);
            if (cached) return cached;
            if (detail?.noreg === noregParam) return detail;
        }
        return detail ?? {};
    }, [detail, list, noregParam]);

    const tanggalCetak = formatTanggalCetak();
    const pilihan1     = joinPilihan(siswa.sekolah_tujuan, siswa.prog1);
    const pilihan2     = joinPilihan(siswa.sekolah_tujuan2, siswa.prog2);
    const noreg        = siswa.noreg ?? "-";
    const sekolahTujuan = siswa.sekolah_tujuan ?? "-";
    const noVa         = siswa.no_va ?? "-";

    return (
        <main className="bg-gray-100 min-h-screen py-6 print:bg-white print:py-0">
            <div className="max-w-[820px] mx-auto bg-white shadow-md print:shadow-none">

                {/* HALAMAN 1 */}
                <section
                    className="relative bg-no-repeat"
                    style={{
                        backgroundImage : "url('/assets/tk/formtk.jpg')",
                        backgroundSize  : "100% 100%",
                    }}
                >
                    <div className="pt-[52%] px-[10%] pb-[12%]">
                        <div className="flex items-start justify-between gap-6">
                            <div className="flex-1">
                                <div className="bg-black text-white font-bold text-sm px-3 py-1.5">
                                    SEKOLAH TUJUAN
                                </div>
                                <div className="mt-2 text-sm text-gray-900 space-y-0.5">
                                    <div><span className="font-bold">Pilihan 1:</span> {pilihan1}</div>
                                    <div><span className="font-bold">Pilihan 2:</span> {pilihan2}</div>
                                </div>
                            </div>
                            <div className="text-red-600 font-extrabold text-3xl tracking-wide pr-4">
                                {noreg}
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-[1fr_220px] gap-4">
                            <div>
                                <div className="bg-black text-white font-bold text-sm px-3 py-1.5">
                                    BIODATA SISWA
                                </div>
                                <table className="mt-2 w-full text-sm">
                                    <tbody>
                                        <Row label="Nama Lengkap"         value={siswa.nama ?? "-"} />
                                        <Row label="Tempat/Tanggal Lahir" value={`${siswa.tempat_lahir ?? "-"}, ${formatTanggalLahir(siswa.tanggal_lahir)}`} />
                                        <Row label="Jenis Kelamin"        value={siswa.jenis_kelamin ?? "-"} />
                                        <Row label="Alamat"               value={siswa.alamat ?? "-"} />
                                    </tbody>
                                </table>
                            </div>
                            <div>
                                <div className="bg-black text-white font-bold text-sm px-3 py-1.5">
                                    PHOTO SISWA
                                </div>
                                <div className="mt-2 border border-gray-300 bg-white/70 h-[150px] flex items-center justify-center text-sm text-gray-700">
                                    <div className="text-center">
                                        <div>Photo siswa</div>
                                        <div>4 x 6</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="bg-black text-white font-bold text-sm px-3 py-1.5">
                                BIODATA ORANG TUA/WALI
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-4">
                                <div>
                                    <div className="bg-black text-white font-bold text-xs px-3 py-1">
                                        DATA AYAH
                                    </div>
                                    <table className="mt-1 w-full text-sm">
                                        <tbody>
                                            <Row label="Nama"    value={siswa.nama_ayah ?? "-"} />
                                            <Row label="No. Telp" value={siswa.no_hp2 ?? "-"} />
                                        </tbody>
                                    </table>
                                </div>
                                <div>
                                    <div className="bg-black text-white font-bold text-xs px-3 py-1">
                                        DATA IBU
                                    </div>
                                    <table className="mt-1 w-full text-sm">
                                        <tbody>
                                            <Row label="Nama"    value={siswa.nama_ibu ?? "-"} />
                                            <Row label="No. Telp" value={siswa.no_hp3 ?? "-"} />
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="bg-black text-white font-bold text-sm px-3 py-1.5">
                                DATA ADMINISTRATIF
                            </div>
                            <div className="mt-3 text-sm text-gray-900 space-y-2">
                                <p className="font-semibold">
                                    Dengan ini menyatakan bahwa bila anak saya diterima di sekolah BPK PENABUR Bandung , maka saya
                                    bersedia mendukung dana (sesuai tarif yang telah ditentukan):
                                </p>
                                <ol className="space-y-1.5 pl-1">
                                    <li>1. Uang Sumbangan Sarana Pendidikan : Rp _________________(diisi sesuai petunjuk Operator SPMB)</li>
                                    <li>2. Uang Sumbangan Sukarela : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Rp _________________(diisi Oleh Orang tua siswa)</li>
                                    <li>3. Uang Sekolah bulan Juli 2026 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Rp ____________(diisi sesuai petunjuk Operator SPMB)</li>
                                </ol>

                                <p className="mt-4">
                                    DOKUMEN SYARAT PENDAFTARAN dikirim dalam bentuk softcopy ke admin@tkk246bpk.penabur.sch.id<br />
                                    dengan Subject : No registrasi- Nama Siswa<br />
                                    <span className="font-bold">(Photo Siswa 3 x 4, softcopy KTP Ayah, softcopy KTP Ibu, softcopy Akte lahir, softcopy Kartu Keluarga)</span>
                                </p>

                                <p className="mt-4">
                                    BIAYA PENDAFTARAN Rp. 200.000 DILAKUKAN DENGAN TRANSFER KE NO VIRTUAL ACCOUNT<br />
                                    (VA) BCA : <span className="font-bold">{noVa}</span><br />
                                    Untuk Informasi lebih lanjut, silahkan menghubungi No WA sekolah : <span className="font-bold">089 8961 6100</span>
                                </p>

                                <ol className="mt-3 space-y-1">
                                    <li>1. Saya menyatakan bahwa data yang diinput dalam formulir ini adalah benar.</li>
                                    <li>2. Saya menyatakan bahwa dokumen syarat pendaftaran yang saya kirimkan ke email adalah benar.</li>
                                    <li>
                                        3. Saya menyetujui ketentuan bahwa apabila calon siswa/siswi mengundurkan diri dengan alasan apapun juga,
                                        maka semua pembayaran yang telah dibayarkan tidak akan saya tarik kembali ( sesuai dengan Surat Pernyataan
                                        yang saya tanda tangani ini)
                                    </li>
                                </ol>

                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm">{tanggalCetak}</div>
                                        <div className="text-sm">Orang Tua Calon Siswa</div>
                                        <div className="mt-2 h-24 w-56 flex items-end">
                                            {signature ? (
                                                <img
                                                    src={signature}
                                                    alt="Tanda Tangan"
                                                    className="max-h-24 object-contain mix-blend-multiply"
                                                    crossOrigin="anonymous"
                                                />
                                            ) : null}
                                        </div>
                                        <div className="border-t border-black w-56" />
                                        <div className="text-sm mt-1 font-semibold">{siswa.nama_ayah || siswa.nama_ibu || siswa.nama_wali || ""}</div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <img
                                            src="/assets/scanme.png"
                                            alt="Scan Me"
                                            className="w-32 h-32 object-contain"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="page-break" />

                {/* HALAMAN 2 - SURAT PERNYATAAN */}
                <section className="px-16 py-12 print:break-before-page">
                    <h2 className="text-center text-base font-bold tracking-wide">SURAT PERNYATAAN</h2>

                    <div className="mt-6 text-sm text-gray-900 space-y-2">
                        <p>Yang bertanda tangan dibawah ini :</p>
                        <FieldLine label="N a m a"             value={siswa.nama_ayah || siswa.nama_ibu || siswa.nama_wali || ""} />
                        <FieldLine label="Alamat"              value={siswa.alamat_ayah || siswa.alamat_ibu || siswa.alamat_wali || siswa.alamat || ""} />
                        <FieldLine label="No. Telepon / No. HP" value={siswa.no_hp2 || siswa.no_hp3 || siswa.no_hp1 || ""} />
                        <FieldLine label="Pekerjaan"           value={siswa.pekerjaan_ayah || siswa.pekerjaan_ibu || siswa.pekerjaan_wali || ""} />

                        <p className="mt-3">
                            Selaku Orangtua / Wali dari calon Siswa BPK PENABUR yang bernama : <span className="font-bold">{siswa.nama ?? "-"}</span>
                        </p>
                        <p>Untuk pendaftaran di sekolah {sekolahTujuan}</p>
                        <p>Apabila anak saya diterima sebagai siswa di Sekolah BPK PENABUR :</p>
                        <p>{sekolahTujuan}</p>
                        <p>dengan ini saya selaku orangtua / wali menyatakan hal- hal sebagai berikut :</p>

                        <ol className="mt-3 list-decimal pl-7 space-y-3 leading-relaxed">
                            <li>
                                Berdasarkan pada pengakuan bahwa sekolah-sekolah yang berada di bawah asuhan BPK PENABUR adalah Sekolah
                                Kristen, maka dengan ini saya menyetujui dan tidak keberatan akan pemberian pelajaran dan pendidikan Agama
                                Kristen bagi anak saya;
                            </li>
                            <li>
                                Menjamin bahwa anak saya akan mentaati setiap peraturan yang berlaku di sekolah tanpa pengecualian dan bersedia
                                untuk menerima sanksi, apabila anak saya tidak mentaati dan melanggar peraturan sekolah maupun peraturan yang
                                berlaku pada umumnya;
                            </li>
                            <li>
                                Bersedia bekerjasama melakukan pemeriksaan psikologi yang disarankan oleh pihak sekolah untuk mendukung
                                tumbuh kembang dan pemahaman kondisi psikologis anak saya.
                            </li>
                            <li>
                                Bersedia bekerjasama dengan pihak sekolah dalam melaksanakan saran dari pihak profesional yang berwenang.
                            </li>
                            <li>
                                Jika anak saya membutuhkan perhatian khusus dan atau memiliki kondisi khusus, saya akan mengkomunikasikan
                                kepada kepala sekolah dan guru BK sebelum memasuki tahun pelajaran.
                            </li>
                            <li>
                                Bersedia membayar dana Sumbangan Sarana Pendidikan, sesuai dengan ketentuan untuk sekolah yang dituju tepat
                                pada waktunya dan jika tidak dapat membayar dana Sumbangan Sarana Pendidikan tepat waktu, maka bersedia
                                menyerahkan penempatan Sekolah anak saya, serta menyetujui pengalihan pembayaran Sumbangan Sarana
                                Pendidikan yang sudah dibayarkan apabila masih ada kewajiban tertunggak yang belum selesai sesuai dengan
                                ketentuan khusus tentang kewajiban administrasi keuangan BPK PENABUR Bandung;
                            </li>
                            <li>
                                Bersedia membayar uang sekolah, sesuai dengan ketentuan untuk sekolah yang dituju tepat pada waktunya dan jika
                                tidak dapat membayar uang sekolah tepat waktu, maka bersedia menyerahkan penampatan Sekolah anak saya sesuai
                                dengan ketentuan khusus tentang kewajiban administrasi keuangan BPK PENABUR Bandung yang diatur dalam
                                adendum khusus;
                            </li>
                            <li>
                                Apabila saya tidak memenuhi persyaratan dan batas waktu penerimaan yang ditentukan, sebagaimana Ketentuan
                                Penerimaan Siswa Baru, maka saya tidak akan menuntut pihak sekolah, apabila pendaftaran ini menjadi gugur dan
                                tempat diberikan kepada calon siswa lain;
                            </li>
                            <li>
                                Bahwa Surat-surat dan dokumen yang saya serahkan adalah surat-surat dan dokumen yang sah dan benar, apabila
                                dikemudian hari terbukti dokumen atau surat-surat yang saya serahkan ke sekolah tidak sah / palsu, menurut
                                keterangan pihak-pihak terkait, maka saya menyatakan akan menanggung resiko apabila sampai anak saya
                                dikeluarkan oleh Pihak Sekolah;
                            </li>
                            <li>
                                Apabila anak saya sudah diterima sebagai siswa di Sekolah BPK PENABUR melalui pendaftaran ini, saya
                                menyatakan bahwa anak saya tidak akan pindah ke sekolah lain atau mendaftar lagi ke sekolah lain, segala akibat
                                kepindahan dan pembatalan diri saya, menjadi resiko dan tanggung jawab saya sendiri serta tidak akan menuntut
                                pengembalian biaya yang telah dibayarkan pada saat pendaftaran di sekolah BPK PENABUR Bandung;
                            </li>
                        </ol>

                        <p className="mt-5">* Mohon ditandatangani di atas meterai Rp 10.000 (Meterai yang terbaru)</p>

                        <div className="mt-10 flex justify-end">
                            <div className="text-sm">
                                <div>{tanggalCetak}</div>
                                <div>Orang Tua Calon Siswa</div>
                                <div className="mt-2 h-24 w-56 flex items-end">
                                    {signature ? (
                                        <img
                                            src={signature}
                                            alt="Tanda Tangan"
                                            className="max-h-24 object-contain mix-blend-multiply"
                                            crossOrigin="anonymous"
                                        />
                                    ) : null}
                                </div>
                                <div className="border-t border-black w-56" />
                                <div className="text-sm mt-1 font-semibold">{siswa.nama_ayah || siswa.nama_ibu || siswa.nama_wali || ""}</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <button
                type="button"
                onClick={() => window.print()}
                className="fixed bottom-6 right-6 z-50 print:hidden flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold text-sm px-5 py-3 rounded-full shadow-lg shadow-blue-500/30 transition"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 4v12m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 20h16" strokeLinecap="round" />
                </svg>
                Download PDF
            </button>

            <style jsx global>{`
                @page { size: A4; margin: 0; }
                @media print {
                    .page-break { page-break-after: always; }
                    body { background: white !important; }
                }
            `}</style>
        </main>
    );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <tr className={highlight ? "bg-gray-100" : ""}>
            <td className="py-1 pr-3 align-top w-44 text-gray-900">{label}</td>
            <td className="py-1 align-top text-gray-900">{value}</td>
        </tr>
    );
}

function FieldLine({ label, value }: { label: string; value?: string }) {
    return (
        <div className="flex items-end gap-3">
            <span className="w-44 shrink-0">{label}</span>
            <span>:</span>
            <span className="flex-1 border-b border-black">&nbsp;{value || ""}</span>
        </div>
    );
}
