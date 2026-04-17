export type Lang = "id" | "en";

type Dict = Record<Lang, string>;

export const t = {
    nav: {
        home:       { id: "Home",           en: "Home" } as Dict,
        faq:        { id: "FAQ",            en: "FAQ" } as Dict,
        info:       { id: "Informasi",      en: "Information" } as Dict,
        formulir:   { id: "Formulir 26/27", en: "Form 26/27" } as Dict,
        signin:     { id: "Sign In",        en: "Sign In" } as Dict,
        tk:         { id: "TK 2026/2027",   en: "Kindergarten 2026/2027" } as Dict,
        sd:         { id: "SD 2026/2027",   en: "Elementary 2026/2027" } as Dict,
        smp:        { id: "SMP 2026/2027",  en: "Junior High 2026/2027" } as Dict,
        sma:        { id: "SMA 2026/2027",  en: "Senior High 2026/2027" } as Dict,
    },
    home: {
        infoTitle:  { id: "INFORMASI SPMB BPK PENABUR Bandung",
                      en: "SPMB BPK PENABUR Bandung INFORMATION" } as Dict,
        stepsTitle: { id: "Berikut Ini Adalah Langkah-Langkah Untuk Mengikuti Sistem SPMB Online",
                      en: "Here Are The Steps To Follow The SPMB Online System" } as Dict,
        askFor:     { id: "ASK FOR\nINFORMATION",
                      en: "ASK FOR\nINFORMATION" } as Dict,
        flowTitle:  { id: "Berikut ini adalah Gambar Alur Pendaftaran Online",
                      en: "Here is the Online Registration Flow Diagram" } as Dict,
        steps: {
            id: [
                "Bacalah dengan cermat Informasi Pendaftaran",
                "Isi formulir pendaftaran dengan benar",
                "Simpan Formulir Pendaftaran Anda dalam bentuk softcopy",
                "Mengirimkan berkas-berkas persyaratan pendaftaran (termasuk Formulir Pendaftaran dan surat pernyataan) ke email/Gform sekolah (tercantum dalam Formulir Pendaftaran)",
                "Membayar Biaya Pendaftaran menggunakan No. Virtual Account (VA) BCA (No. VA Tercantum dalam Formulir Pendaftaran) dan melakukan Konfirmasi Pembayaran di web SPMB Online",
                "Jika Semua Persyaratan telah terkirim dan pembayaran sudah divalidasi, Pendaftar akan mendapatkan email Bukti Pendaftaran dari Panitia SPMB Pusat",
                "Untuk memastikan data Anda sudah divalidasi dalam sistem kami, silakan Cek Status Pendaftaran Anda",
            ],
            en: [
                "Carefully read the Registration Information",
                "Fill out the registration form correctly",
                "Save your Registration Form in softcopy format",
                "Send the registration requirement documents (including the Registration Form and statement letter) to the school email/Gform (listed on the Registration Form)",
                "Pay the Registration Fee using the BCA Virtual Account (VA) Number (VA No. listed on the Registration Form) and complete the Payment Confirmation on the SPMB Online website",
                "If all requirements have been sent and payment has been validated, the Registrant will receive a Registration Proof email from the Central SPMB Committee",
                "To ensure your data has been validated in our system, please Check Your Registration Status",
            ],
        },
    },
    faq: {
        title:      { id: "Frequently Asked Questions", en: "Frequently Asked Questions" } as Dict,
        sub:        { id: "( F A Q )", en: "( F A Q )" } as Dict,
        intro:      { id: "Bila informasi di halaman ini tidak mencukupi kebutuhan anda, silakan hubungi kami di nomor telepon",
                      en: "If the information on this page does not meet your needs, please contact us at the phone number" } as Dict,
        or:         { id: "atau", en: "or" } as Dict,
        contactUs:  { id: "Contact Us", en: "Contact Us" } as Dict,
        tanya:      { id: "Tanya", en: "Question" } as Dict,
        jawab:      { id: "Jawab", en: "Answer" } as Dict,
        items: {
            id: [
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
                    a: "ada 3 pilihan jalur untuk SPMB BPK PENABUR Bandung",
                    list: [
                        "1. Jalur Keajegan Dalam adalah pendaftaran peserta didik baru yang asal sekolahnya dari BPK PENABUR Bandung dan melakukan pendaftaran diwaktu pendaftaran Keajegan Dalam",
                        "2. Jalur Keajegan Luar adalah pendaftaran peserta didik baru yang asal sekolahnya dari Luar BPK PENABUR Bandung dan melakukan pendaftaran diwaktu pendaftaran Keajegan Luar",
                        "3. Jalur Tes adalah pendaftaran peserta didik baru yang asal sekolahnya dari Dalam/Luar BPK PENABUR Bandung dan melakukan pendaftaran setelah batas waktu Keajegan",
                    ],
                },
                {
                    q: 'Saya tidak dapat mengklik tombol "Daftar". Sepertinya tidak merespon.',
                    a: "Mungkin ada form yang belum anda isi atau formatnya salah. Silakan cek kembali. Jika masih tidak bisa, coba untuk merefresh halaman/mengklik lagi menu sesuai jenjang.",
                },
                {
                    q: "Situs ini sulit diakses / lambat.",
                    a: "Jika anda yakin hal ini bukan dikarenakan akses internet anda yang bermasalah/lambat, silakan dicoba lagi diwaktu dimana kemungkinan trafiknya kembali normal, misalnya pada malam hari.",
                },
            ],
            en: [
                {
                    q: "The data I entered contains errors.",
                    a: "If it has already been submitted, please contact the SPMB committee of your 1st choice school to edit the data.",
                },
                {
                    q: "The data I entered does not appear completely on the FORM page",
                    a: "Your internet connection may be inadequate (too slow) or you closed the browser tab while the registration page was being processed. Please cancel the registration and try again.",
                },
                {
                    q: "What is the difference between Internal Transfer, External Transfer, and TEST pathways?",
                    a: "There are 3 pathway options for SPMB BPK PENABUR Bandung",
                    list: [
                        "1. Internal Transfer (Keajegan Dalam) is the registration of new students whose origin school is from BPK PENABUR Bandung and who register during the Internal Transfer registration period",
                        "2. External Transfer (Keajegan Luar) is the registration of new students whose origin school is outside BPK PENABUR Bandung and who register during the External Transfer registration period",
                        "3. Test pathway is the registration of new students whose origin school is from inside/outside BPK PENABUR Bandung and who register after the Transfer deadline",
                    ],
                },
                {
                    q: 'I cannot click the "Register" button. It seems unresponsive.',
                    a: "There might be a form field you have not filled in or the format is wrong. Please check again. If it still does not work, try refreshing the page/clicking the menu by grade level again.",
                },
                {
                    q: "This site is hard to access / slow.",
                    a: "If you are sure this is not due to your internet connection being problematic/slow, please try again when the traffic is likely back to normal, for example at night.",
                },
            ],
        },
    },
    info: {
        title:      { id: "Informasi Pendaftaran", en: "Registration Information" } as Dict,
        sub:        { id: "P E R S Y A R A T A N   D O K U M E N", en: "D O C U M E N T   R E Q U I R E M E N T S" } as Dict,
        intro:      { id: "Sistem Penerimaan Murid Baru (SPMB) Online, adalah sebuah sistem yang dirancang untuk melakukan otomasi seleksiSistem Penerimaan Murid Baru (SPMB), mulai dari proses pendaftaran hingga pengumuman hasil seleksi, yang dilakukan secara online dan berbasis web.",
                      en: "The Online New Student Admission System (SPMB) is a system designed to automate the New Student Admission (SPMB) selection process, from the registration process to the announcement of selection results, which is carried out online and web-based." } as Dict,
        lead:       { id: "Kelengkapan syarat pendaftaran SPMB Online BPK PENABUR BANDUNG, sebagai berikut:",
                      en: "The registration requirements for SPMB Online BPK PENABUR BANDUNG are as follows:" } as Dict,
        items: {
            id: [
                "Softcopy KTP Orang Tua (Ayah & Ibu)",
                "Softcopy Kartu Keluarga",
                "Softcopy Akte Lahir",
                "Softcopy Rapor 1 Set (wajib untuk jalur keajegan luar)",
                "Softcopy Surat Baptis / Sidi (jika ada)",
                "Photo 3x4 (wajib berseragam sekolah)",
            ],
            en: [
                "Softcopy of Parents' ID Card (Father & Mother)",
                "Softcopy of Family Card",
                "Softcopy of Birth Certificate",
                "Softcopy of Report Card 1 Set (required for external transfer pathway)",
                "Softcopy of Baptism / Confirmation Certificate (if any)",
                "3x4 Photo (must wear school uniform)",
            ],
        },
        infoLabel:  { id: "Info:", en: "Info:" } as Dict,
        infoText:   { id: "Semua berkas wajib dikirimkan dalam bentuk softcopy ke email admin sekolah masing-masing dengan subject:",
                      en: "All documents must be sent in softcopy to the respective school admin email with the subject:" } as Dict,
        infoSubject: { id: "No Registrasi - Nama Siswa", en: "Registration No. - Student Name" } as Dict,
    },
    footer: {
        pendaftaran:    { id: "Pendaftaran",        en: "Registration" } as Dict,
        faq:            { id: "FAQ",                en: "FAQ" } as Dict,
        informasi:      { id: "Informasi",          en: "Information" } as Dict,
        konfirmasi:     { id: "Konfirmasi",         en: "Confirmation" } as Dict,
        status:         { id: "Status Pendaftaran", en: "Registration Status" } as Dict,
        formulir:       { id: "Formulir",           en: "Form" } as Dict,
        yayasan:        { id: "Yayasan BPK PENABUR Bandung", en: "BPK PENABUR Bandung Foundation" } as Dict,
        website:        { id: "Website Sekolah",    en: "School Website" } as Dict,
        pilihSekolah:   { id: "Pilih Sekolah",      en: "Select School" } as Dict,
        copyright:      { id: "©2025, SPMB Online BPK PENABUR Bandung. All Rights Reserved",
                          en: "©2025, SPMB Online BPK PENABUR Bandung. All Rights Reserved" } as Dict,
    },
    signin: {
        title:      { id: "SPMB Online",            en: "SPMB Online" } as Dict,
        subtitle:   { id: "BPK PENABUR Bandung",    en: "BPK PENABUR Bandung" } as Dict,
        username:   { id: "No. Registrasi / Username", en: "Registration No. / Username" } as Dict,
        usernamePh: { id: "Masukkan nomor registrasi", en: "Enter registration number" } as Dict,
        password:   { id: "Password",               en: "Password" } as Dict,
        button:     { id: "Sign In",                en: "Sign In" } as Dict,
        forgot:     { id: "Lupa password? Hubungi admin sekolah masing-masing.",
                      en: "Forgot password? Contact your respective school admin." } as Dict,
    },
};
