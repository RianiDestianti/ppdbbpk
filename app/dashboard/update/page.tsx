"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { getMySiswa, updateSiswa } from "@/store/controllers/siswaController";
import { resetUpdateResp } from "@/store/slices/siswaSlice";
import { SiswaDetail } from "@/store/types/SiswaTypes";
import Swal from "sweetalert2";

const agamaOptions          = ["- Pilih -", "Islam", "Kristen Protestan", "Kristen Katolik", "Hindu", "Buddha", "Khonghucu"];
const golDarahOptions       = ["- Pilih -", "A", "B", "AB", "O"];
const kewarganegaraanOpts   = ["- Pilih -", "WNI", "WNA"];
const tinggalDenganOptions  = ["- Pilih -", "Orang Tua", "Wali", "Asrama", "Kost", "Lainnya"];
const statusOrtuOptions     = ["- Pilih -", "Ayah & Ibu Kandung", "Ayah Kandung", "Ibu Kandung", "Yatim Piatu", "Wali"];
const pendidikanOptions     = ["- Pilih -", "SD", "SMP", "SMA", "D1", "D2", "D3", "S1", "S2", "S3", "Lainnya"];
const pekerjaanOptions      = ["- Pilih -", "PNS", "TNI/Polri", "Karyawan Swasta", "Wiraswasta", "Pendeta", "Guru/Dosen", "Dokter", "Ibu Rumah Tangga", "Lainnya"];
const penghasilanOptions    = ["- Pilih -", "< Rp. 2.000.000", "Rp. 2.000.000 - Rp. 5.000.000", "Rp. 5.000.000 - Rp. 10.000.000", "> Rp. 10.000.000"];

type SdrRow = { nama: string; sekolah: string; uang: string; keterangan: string };

const emptySdr: SdrRow = { nama: "", sekolah: "", uang: "", keterangan: "" };

function decodeSdr(value?: string): SdrRow {
    if (!value) return { ...emptySdr };
    const parts = value.split("|");
    return {
        nama       : parts[0] ?? "",
        sekolah    : parts[1] ?? "",
        uang       : parts[2] ?? "",
        keterangan : parts[3] ?? "",
    };
}

function encodeSdr(row: SdrRow): string {
    const { nama, sekolah, uang, keterangan } = row;
    if (!nama && !sekolah && !uang && !keterangan) return "";
    return [nama, sekolah, uang, keterangan].join("|");
}

export default function UpdatePendaftarPage() {
    const router                        = useRouter();
    const dispatch                      = useAppDispatch();
    const { detail, loading, updateResp } = useAppSelector((state) => state.siswa);

    const [form, setForm] = useState<SiswaDetail>({});
    const [sdrRows, setSdrRows] = useState<SdrRow[]>([
        { ...emptySdr }, { ...emptySdr }, { ...emptySdr }, { ...emptySdr }, { ...emptySdr },
    ]);

    useEffect(() => {
        const token = localStorage.getItem("auth-key");
        if (!token) {
            router.replace("/sign-in");
            return;
        }
        dispatch(getMySiswa());
    }, [dispatch, router]);

    useEffect(() => {
        if (detail) {
            setForm(detail);
            setSdrRows([
                decodeSdr(detail.sdr1),
                decodeSdr(detail.sdr2),
                decodeSdr(detail.sdr3),
                decodeSdr(detail.sdr4),
                decodeSdr(detail.sdr5),
            ]);
        }
    }, [detail]);

    useEffect(() => {
        if (!updateResp) return;
        if (updateResp.status === 200) {
            Swal.fire({
                icon              : "success",
                title             : "Data Berhasil Diperbarui",
                text              : "Perubahan biodata pendaftar telah tersimpan",
                confirmButtonColor: "#dc2626",
            });
        } else {
            Swal.fire({
                icon              : "error",
                title             : "Gagal Memperbarui",
                text              : updateResp.message ?? "Terjadi kesalahan",
                confirmButtonColor: "#dc2626",
            });
        }
        dispatch(resetUpdateResp());
    }, [updateResp, dispatch]);

    const setField = <K extends keyof SiswaDetail>(key: K, value: SiswaDetail[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const setSdr = (idx: number, key: keyof SdrRow, value: string) => {
        setSdrRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...form,
            sdr1: encodeSdr(sdrRows[0]),
            sdr2: encodeSdr(sdrRows[1]),
            sdr3: encodeSdr(sdrRows[2]),
            sdr4: encodeSdr(sdrRows[3]),
            sdr5: encodeSdr(sdrRows[4]),
        };

        (["ayah", "ibu", "wali"] as const).forEach((prefix) => {
            const agamaKey = `agama_${prefix}` as keyof SiswaDetail;
            const alamatGerejaKey = `alamat_grj_${prefix}` as keyof SiswaDetail;

            if (payload[agamaKey] === "Islam") {
                payload[alamatGerejaKey] = "";
            }
        });

        dispatch(updateSiswa(payload));
    };

    return (
        <>
            <Navbar />

            <main className="flex-1 bg-white">
                <PageBanner />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-800">Update Data Pendaftar</h1>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="text-sm text-[#1976d2] hover:underline"
                        >
                            ← Kembali ke Dashboard
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Section title="Edit Biodata Pribadi">
                            <Grid>
                                <Input label="NISN" value={form.nisn ?? ""} onChange={(v) => setField("nisn", v)} />
                                <Input label="NIK" value={form.nik ?? ""} onChange={(v) => setField("nik", v)} />
                                <Input label="No KK" value={form.nokk ?? ""} onChange={(v) => setField("nokk", v)} />
                                <Input label="Nama Lengkap" value={form.nama ?? ""} onChange={(v) => setField("nama", v)} />
                                <Input label="Tempat Lahir" value={form.tempat_lahir ?? ""} onChange={(v) => setField("tempat_lahir", v)} />
                                <Input label="Tanggal Lahir" type="date" value={form.tanggal_lahir ?? ""} onChange={(v) => setField("tanggal_lahir", v)} />

                                <div>
                                    <Label>Jenis Kelamin</Label>
                                    <div className="flex gap-6 mt-2">
                                        {["Laki-laki", "Perempuan"].map((opt) => (
                                            <label key={opt} className="flex items-center gap-2 text-sm text-gray-700">
                                                <input
                                                    type="radio"
                                                    name="jenis_kelamin"
                                                    value={opt}
                                                    checked={form.jenis_kelamin === opt}
                                                    onChange={(e) => setField("jenis_kelamin", e.target.value)}
                                                    className="w-4 h-4 text-red-600"
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <Input label="Anak Ke" value={form.anak_ke ?? ""} onChange={(v) => setField("anak_ke", v)} />
                                <Input label="Jumlah Saudara" value={form.jml_saudara ?? ""} onChange={(v) => setField("jml_saudara", v)} />
                                <Input label="Berat Badan (kg)" value={form.berat ?? ""} onChange={(v) => setField("berat", v)} />
                                <Input label="Tinggi Badan (cm)" value={form.tinggi ?? ""} onChange={(v) => setField("tinggi", v)} />

                                <Select label="Agama" options={agamaOptions} value={form.agama ?? "- Pilih -"} onChange={(v) => setField("agama", v === "- Pilih -" ? "" : v)} />
                                <Input label="No Telp" value={form.no_tlp ?? ""} onChange={(v) => setField("no_tlp", v)} />
                                <Input label="No HP" value={form.no_hp1 ?? ""} onChange={(v) => setField("no_hp1", v)} />
                                <Select label="Kewarganegaraan" options={kewarganegaraanOpts} value={form.kewarganegaraan ?? "- Pilih -"} onChange={(v) => setField("kewarganegaraan", v === "- Pilih -" ? "" : v)} />
                                <Select label="Golongan Darah" options={golDarahOptions} value={form.golongan_darah ?? "- Pilih -"} onChange={(v) => setField("golongan_darah", v === "- Pilih -" ? "" : v)} />
                            </Grid>

                            <div className="mt-5">
                                <Label>Alamat</Label>
                                <textarea
                                    value={form.alamat ?? ""}
                                    onChange={(e) => setField("alamat", e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                />
                            </div>

                            <Grid className="mt-5">
                                <Input label="Kelurahan" value={form.kelurahan ?? ""} onChange={(v) => setField("kelurahan", v)} />
                                <Input label="Kecamatan" value={form.kecamatan ?? ""} onChange={(v) => setField("kecamatan", v)} />
                                <Input label="RT" value={form.rt ?? ""} onChange={(v) => setField("rt", v)} />
                                <Input label="RW" value={form.rw ?? ""} onChange={(v) => setField("rw", v)} />
                                <Input label="Kode Pos" value={form.kode_pos ?? ""} onChange={(v) => setField("kode_pos", v)} />
                                <Select label="Tinggal Dengan" options={tinggalDenganOptions} value={form.tinggal_dengan ?? "- Pilih -"} onChange={(v) => setField("tinggal_dengan", v === "- Pilih -" ? "" : v)} />
                                <Select label="Status Orang Tua" options={statusOrtuOptions} value={form.status_ortu ?? "- Pilih -"} onChange={(v) => setField("status_ortu", v === "- Pilih -" ? "" : v)} />
                                <Input label="Email" type="email" value={form.email ?? ""} onChange={(v) => setField("email", v)} />
                                <Input label="Sekolah Asal" value={form.sekolah_asal ?? ""} onChange={(v) => setField("sekolah_asal", v)} />
                                <Input label="Alamat Sekolah Asal" value={form.alamat_skl_asal ?? ""} onChange={(v) => setField("alamat_skl_asal", v)} />
                                <Input label="Kota Sekolah Asal" value={form.kota_skl_asal ?? ""} onChange={(v) => setField("kota_skl_asal", v)} />
                            </Grid>
                        </Section>

                        <Section title="Edit Biodata Keluarga">
                            <OrangTuaBlock
                                heading="Data Ayah"
                                prefix="ayah"
                                form={form}
                                setField={setField}
                            />
                            <div className="h-px bg-gray-200 my-6" />
                            <OrangTuaBlock
                                heading="Data Ibu"
                                prefix="ibu"
                                form={form}
                                setField={setField}
                            />
                            <div className="h-px bg-gray-200 my-6" />
                            <OrangTuaBlock
                                heading="Data Wali"
                                prefix="wali"
                                form={form}
                                setField={setField}
                                includeNik={false}
                            />
                        </Section>

                        <Section title="Jumlah Anak Yang Menjadi Tanggungan">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border border-gray-200">
                                    <thead className="bg-gray-50 text-gray-700">
                                        <tr>
                                            <th className="border border-gray-200 px-3 py-2 text-left w-12">No</th>
                                            <th className="border border-gray-200 px-3 py-2 text-left">Nama Anak</th>
                                            <th className="border border-gray-200 px-3 py-2 text-left">Sekolah / Kelas</th>
                                            <th className="border border-gray-200 px-3 py-2 text-left">Uang Sekolah</th>
                                            <th className="border border-gray-200 px-3 py-2 text-left">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sdrRows.map((row, idx) => (
                                            <tr key={idx}>
                                                <td className="border border-gray-200 px-3 py-2 text-center text-gray-700">{idx + 1}</td>
                                                <td className="border border-gray-200 px-2 py-1">
                                                    <input
                                                        type="text"
                                                        value={row.nama}
                                                        onChange={(e) => setSdr(idx, "nama", e.target.value)}
                                                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                    />
                                                </td>
                                                <td className="border border-gray-200 px-2 py-1">
                                                    <input
                                                        type="text"
                                                        value={row.sekolah}
                                                        onChange={(e) => setSdr(idx, "sekolah", e.target.value)}
                                                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                    />
                                                </td>
                                                <td className="border border-gray-200 px-2 py-1">
                                                    <input
                                                        type="text"
                                                        value={row.uang}
                                                        onChange={(e) => setSdr(idx, "uang", e.target.value)}
                                                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                    />
                                                </td>
                                                <td className="border border-gray-200 px-2 py-1">
                                                    <input
                                                        type="text"
                                                        value={row.keterangan}
                                                        onChange={(e) => setSdr(idx, "keterangan", e.target.value)}
                                                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Section>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => router.push("/dashboard")}
                                disabled={loading}
                                className="px-6 py-3 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 rounded-md bg-[#1976d2] hover:bg-[#1565c0] text-white font-medium text-sm disabled:opacity-50"
                            >
                                {loading ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            </div>
            <div className="px-6 py-5">{children}</div>
        </section>
    );
}

function Grid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${className}`}>{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
    return <label className="block text-sm text-gray-700 mb-2">{children}</label>;
}

function Input({
    label,
    value,
    onChange,
    type = "text",
}: {
    label    : string;
    value    : string;
    onChange : (v: string) => void;
    type    ?: string;
}) {
    return (
        <div>
            <Label>{label}</Label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
        </div>
    );
}

function Select({
    label,
    options,
    value,
    onChange,
}: {
    label    : string;
    options  : string[];
    value    : string;
    onChange : (v: string) => void;
}) {
    return (
        <div>
            <Label>{label}</Label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
                {options.map((opt) => (
                    <option key={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
}

function OrangTuaBlock({
    heading,
    prefix,
    form,
    setField,
    includeNik = true,
}: {
    heading     : string;
    prefix      : "ayah" | "ibu" | "wali";
    form        : SiswaDetail;
    setField    : <K extends keyof SiswaDetail>(key: K, value: SiswaDetail[K]) => void;
    includeNik ?: boolean;
}) {
    const f = (name: string) => `${name}_${prefix}` as keyof SiswaDetail;
    const nameKey = (prefix === "wali" ? "nama_wali" : `nama_${prefix}`) as keyof SiswaDetail;
    const agamaKey = f("agama");
    const alamatGerejaKey = f("alamat_grj");
    const selectedAgama = (form[agamaKey] as string) ?? "";
    const showAlamatGereja = selectedAgama !== "Islam";

    const hpKey: keyof SiswaDetail | null =
        prefix === "ayah" ? "no_hp2" : prefix === "ibu" ? "no_hp3" : null;

    const handleAgamaChange = (value: string) => {
        const agama = value === "- Pilih -" ? "" : value;
        setField(agamaKey, agama);

        if (agama === "Islam") {
            setField(alamatGerejaKey, "");
        }
    };

    return (
        <div>
            <h3 className="text-base font-semibold text-gray-800 mb-4">{heading}</h3>
            <Grid>
                <Input label={`Nama ${heading.replace("Data ", "")}`} value={(form[nameKey] as string) ?? ""} onChange={(v) => setField(nameKey, v as any)} />
                {includeNik && (
                    <Input label="NIK" value={(form[f("nik")] as string) ?? ""} onChange={(v) => setField(f("nik"), v as any)} />
                )}
                <Input label="Tempat Lahir" value={(form[f("tempat_lahir")] as string) ?? ""} onChange={(v) => setField(f("tempat_lahir"), v as any)} />
                <Input label="Tanggal Lahir" type="date" value={(form[f("tgl_lahir")] as string) ?? ""} onChange={(v) => setField(f("tgl_lahir"), v as any)} />
                <Select label="Kewarganegaraan" options={kewarganegaraanOpts} value={(form[f("kewarganegaraan")] as string) || "- Pilih -"} onChange={(v) => setField(f("kewarganegaraan"), (v === "- Pilih -" ? "" : v) as any)} />
                <Select label="Agama" options={agamaOptions} value={selectedAgama || "- Pilih -"} onChange={handleAgamaChange} />
                <Input label="Gereja" value={(form[f("gereja")] as string) ?? ""} onChange={(v) => setField(f("gereja"), v as any)} />
                {showAlamatGereja && (
                    <Input label="Alamat Gereja" value={(form[alamatGerejaKey] as string) ?? ""} onChange={(v) => setField(alamatGerejaKey, v)} />
                )}
                <Select label="Pendidikan" options={pendidikanOptions} value={(form[f("pendidikan")] as string) || "- Pilih -"} onChange={(v) => setField(f("pendidikan"), (v === "- Pilih -" ? "" : v) as any)} />
                <Select label="Pekerjaan" options={pekerjaanOptions} value={(form[f("pekerjaan")] as string) || "- Pilih -"} onChange={(v) => setField(f("pekerjaan"), (v === "- Pilih -" ? "" : v) as any)} />
                <Select label="Penghasilan" options={penghasilanOptions} value={(form[f("penghasilan")] as string) || "- Pilih -"} onChange={(v) => setField(f("penghasilan"), (v === "- Pilih -" ? "" : v) as any)} />
                {prefix !== "wali" && (
                    <Input label="Email" type="email" value={(form[f("email")] as string) ?? ""} onChange={(v) => setField(f("email"), v as any)} />
                )}
                {hpKey && (
                    <Input label={`No HP ${heading.replace("Data ", "")}`} value={(form[hpKey] as string) ?? ""} onChange={(v) => setField(hpKey, v as any)} />
                )}
            </Grid>
            <div className="mt-5">
                <Label>{`Alamat ${heading.replace("Data ", "")}`}</Label>
                <textarea
                    value={(form[f("alamat")] as string) ?? ""}
                    onChange={(e) => setField(f("alamat"), e.target.value as any)}
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
            </div>
        </div>
    );
}
