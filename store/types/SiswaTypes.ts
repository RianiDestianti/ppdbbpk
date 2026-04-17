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
}

export interface SiswaState {
    loading     : boolean
    response    : any
    error       : string | null
}

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
}
