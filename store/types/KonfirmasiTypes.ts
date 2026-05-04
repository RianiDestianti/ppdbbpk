export interface KonfirmasiPembayaranPayload {
    no_registrasi: string;
    nama_siswa: string;
    asal_sekolah: string;
    sekolah_tujuan: string;
    no_hp: string;
    email: string;
    no_va: string;
    tanggal_bayar: string;
    keterangan?: string;
}

export interface KonfirmasiPembayaranResponse {
    status: number;
    message?: string;
    data?: unknown;
}

export interface KonfirmasiPembayaranState {
    loading: boolean;
    response: KonfirmasiPembayaranResponse | null;
    error: string | null;
}
