export interface SiswaPayload {
    nisn            : string
    nik             : string
    nokk            : string
    nama            : string
    tempatLahir     : string
    tanggalLahir    : string
    jenisKelamin    : string
    noHp            : string
    email           : string
    alamat          : string
    sekolahAsal     : string
    programAsal     : string
    kotaSekolahAsal : string
    namaAyah        : string
    namaIbu         : string
    noHpAyah        : string
    noHpIbu         : string
    namaWali        : string
    noHpWali        : string
    pilihan1        : string
    program1        : string
    pilihan2        : string
    program2        : string
    fotoSiswa       : string
    tandaTanganOrtu : string
    jenjang        ?: string
    noSpb          ?: string
    sTambahan      ?: string
}

export interface SiswaState {
    loading     : boolean
    response    : any
    error       : string | null
    detail      : SiswaDetail | null
    list        : SiswaDetail[]
    updateResp  : any
}

export interface SiswaDetail {
    noreg                ?: string
    tajar                ?: string
    nisn                 ?: string
    nik                  ?: string
    nokk                 ?: string
    nama                 ?: string
    tempat_lahir         ?: string
    tanggal_lahir        ?: string
    jenis_kelamin        ?: string
    agama                ?: string
    kewarganegaraan      ?: string
    anak_ke              ?: string
    jml_saudara          ?: string
    status_ortu          ?: string
    golongan_darah       ?: string
    tinggal_dengan       ?: string
    alamat               ?: string
    kode_pos             ?: string
    kelurahan            ?: string
    kecamatan            ?: string
    rt                   ?: string
    rw                   ?: string
    berat                ?: string
    tinggi               ?: string
    no_tlp               ?: string
    no_hp1               ?: string
    no_hp2               ?: string
    no_hp3               ?: string
    email                ?: string
    nama_ayah            ?: string
    nik_ayah             ?: string
    alamat_ayah          ?: string
    kewarganegaraan_ayah ?: string
    tempat_lahir_ayah    ?: string
    tgl_lahir_ayah       ?: string
    agama_ayah           ?: string
    gereja_ayah          ?: string
    alamat_grj_ayah      ?: string
    pendidikan_ayah      ?: string
    pekerjaan_ayah       ?: string
    penghasilan_ayah     ?: string
    email_ayah           ?: string
    nama_ibu             ?: string
    nik_ibu              ?: string
    alamat_ibu           ?: string
    kewarganegaraan_ibu  ?: string
    tempat_lahir_ibu     ?: string
    tgl_lahir_ibu        ?: string
    agama_ibu            ?: string
    gereja_ibu           ?: string
    alamat_grj_ibu       ?: string
    pendidikan_ibu       ?: string
    pekerjaan_ibu        ?: string
    penghasilan_ibu      ?: string
    email_ibu            ?: string
    nama_wali            ?: string
    alamat_wali          ?: string
    kewarganegaraan_wali ?: string
    tempat_lahir_wali    ?: string
    tgl_lahir_wali       ?: string
    agama_wali           ?: string
    gereja_wali          ?: string
    alamat_grj_wali      ?: string
    pendidikan_wali      ?: string
    pekerjaan_wali       ?: string
    penghasilan_wali     ?: string
    sdr1                 ?: string
    sdr2                 ?: string
    sdr3                 ?: string
    sdr4                 ?: string
    sdr5                 ?: string
    sekolah_asal         ?: string
    alamat_skl_asal      ?: string
    kota_skl_asal        ?: string
    status               ?: number | string
    pilihan1             ?: string
    pilihan2             ?: string
    jenis                ?: string
    sekolah_tujuan       ?: string
    sekolah_tujuan2      ?: string
    prog1                ?: string
    prog2                ?: string
    no_va                ?: string
    tgl_daftar           ?: string
    tgl_verifikasi       ?: string
    reko                 ?: string
    s_tambahan           ?: string
}

export type UpdateSiswaPayload = Partial<SiswaDetail>;

export interface SiswaFormData {
    nisn            : string
    nik             : string
    nokk            : string
    nama            : string
    tempatLahir     : string
    tanggalLahir    : string
    noHp            : string
    email           : string
    alamat          : string
    sekolahAsalNama : string
    kotaSekolahAsal : string
    namaAyah        : string
    namaIbu         : string
    noHpAyah        : string
    noHpIbu         : string
    namaWali        : string
    noHpWali        : string
    fotoSiswa       : string
    tandaTanganOrtu : string
}

export const initialFormSiswa: SiswaFormData = {
    nisn            : "",
    nik             : "",
    nokk            : "",
    nama            : "",
    tempatLahir     : "",
    tanggalLahir    : "",
    noHp            : "",
    email           : "",
    alamat          : "",
    sekolahAsalNama : "",
    kotaSekolahAsal : "",
    namaAyah        : "",
    namaIbu         : "",
    noHpAyah        : "",
    noHpIbu         : "",
    namaWali        : "",
    noHpWali        : "",
    fotoSiswa       : "",
    tandaTanganOrtu : "",
}
