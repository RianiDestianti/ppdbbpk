import { SiswaDetail } from "@/store/types/SiswaTypes";

const BULAN_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const safe = (v?: string | number | null): string => {
    if (v === undefined || v === null) return "-";
    const s = String(v).trim();
    return s.length > 0 ? s : "-";
};

const formatTanggalLahir = (value?: string): string => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return `${d.getDate().toString().padStart(2, "0")} ${BULAN_ID[d.getMonth()]} ${d.getFullYear()}`;
};

const formatTempatTglLahir = (siswa: SiswaDetail): string => {
    const tempat = safe(siswa.tempat_lahir);
    const tgl    = formatTanggalLahir(siswa.tanggal_lahir);
    if (tempat === "-" && tgl === "-") return "-";
    return `${tempat}, ${tgl}`;
};

const formatPilihan = (sekolah?: string, prog?: string): string => {
    const s = safe(sekolah);
    const p = safe(prog);
    if (s === "-" && p === "-") return "-";
    if (p === "-") return s;
    if (s === "-") return p;
    return `${s} - ${p}`;
};

export function buildWhatsAppNotification(siswa: SiswaDetail): string {
    return [
        "*PENDAFTARAN PPDB BPK PENABUR BANDUNG*",
        "",
        `Halo *${safe(siswa.nama)}*, terima kasih telah melakukan pendaftaran.`,
        "Berikut detail data pendaftaran Anda:",
        "",
        `*Nomor Registrasi*    : ${safe(siswa.noreg)}`,
        `*Nama Siswa*          : ${safe(siswa.nama)}`,
        `*Alamat*              : ${safe(siswa.alamat)}`,
        `*Tempat, Tgl Lahir*   : ${formatTempatTglLahir(siswa)}`,
        `*Sekolah Asal*        : ${safe(siswa.sekolah_asal)}`,
        `*No. Telp/WhatsApp*   : ${safe(siswa.no_hp1)}`,
        `*Pilihan Sekolah 1*   : ${formatPilihan(siswa.sekolah_tujuan, siswa.prog1)}`,
        `*Pilihan Sekolah 2*   : ${formatPilihan(siswa.sekolah_tujuan2, siswa.prog2)}`,
        "",
        "Silakan lakukan pembayaran biaya pendaftaran ke:",
        `*Virtual Account BCA : ${safe(siswa.no_va)}*`,
        "",
        "Untuk informasi lebih lanjut, silakan menghubungi sekolah tujuan Anda.",
        "",
        "Terima kasih,",
        "_BPK PENABUR Bandung_",
    ].join("\n");
}

export interface EmailNotification {
    subject : string;
    text    : string;
    html    : string;
}

export function buildEmailNotification(siswa: SiswaDetail): EmailNotification {
    const noreg     = safe(siswa.noreg);
    const nama      = safe(siswa.nama);
    const alamat    = safe(siswa.alamat);
    const ttl       = formatTempatTglLahir(siswa);
    const sklAsal   = safe(siswa.sekolah_asal);
    const noHp      = safe(siswa.no_hp1);
    const pilihan1  = formatPilihan(siswa.sekolah_tujuan,  siswa.prog1);
    const pilihan2  = formatPilihan(siswa.sekolah_tujuan2, siswa.prog2);
    const noVa      = safe(siswa.no_va);

    const subject = `Konfirmasi Pendaftaran PPDB BPK PENABUR - ${noreg}`;

    const text = [
        "PENDAFTARAN PPDB BPK PENABUR BANDUNG",
        "",
        `Halo ${nama}, terima kasih telah melakukan pendaftaran.`,
        "Berikut detail data pendaftaran Anda:",
        "",
        `Nomor Registrasi    : ${noreg}`,
        `Nama Siswa          : ${nama}`,
        `Alamat              : ${alamat}`,
        `Tempat, Tgl Lahir   : ${ttl}`,
        `Sekolah Asal        : ${sklAsal}`,
        `No. Telp/WhatsApp   : ${noHp}`,
        `Pilihan Sekolah 1   : ${pilihan1}`,
        `Pilihan Sekolah 2   : ${pilihan2}`,
        "",
        "Silakan lakukan pembayaran biaya pendaftaran ke:",
        `Virtual Account BCA : ${noVa}`,
        "",
        "Untuk informasi lebih lanjut, silakan menghubungi sekolah tujuan Anda.",
        "",
        "Terima kasih,",
        "BPK PENABUR Bandung",
    ].join("\n");

    const row = (label: string, value: string) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#555;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:6px 0;color:#111;font-weight:600;">${value}</td></tr>`;

    const html = `<!DOCTYPE html>
<html lang="id">
<body style="margin:0;padding:0;background:#f5f6f8;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;padding:24px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    <tr>
                        <td style="background:#1976d2;color:#ffffff;padding:20px 28px;font-size:18px;font-weight:700;letter-spacing:0.4px;">
                            PENDAFTARAN PPDB BPK PENABUR BANDUNG
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px 28px;font-size:14px;line-height:1.6;">
                            <p style="margin:0 0 8px 0;">Halo <strong>${nama}</strong>,</p>
                            <p style="margin:0 0 16px 0;">Terima kasih telah melakukan pendaftaran. Berikut detail data pendaftaran Anda:</p>
                            <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;">
                                ${row("Nomor Registrasi",       noreg)}
                                ${row("Nama Siswa",             nama)}
                                ${row("Alamat",                 alamat)}
                                ${row("Tempat, Tanggal Lahir",  ttl)}
                                ${row("Sekolah Asal",           sklAsal)}
                                ${row("No. Telepon / WhatsApp", noHp)}
                                ${row("Pilihan Sekolah 1",      pilihan1)}
                                ${row("Pilihan Sekolah 2",      pilihan2)}
                            </table>
                            <div style="margin:20px 0 8px 0;padding:14px 16px;background:#fff8e1;border-left:4px solid #f9a825;border-radius:4px;">
                                <div style="font-size:13px;color:#555;margin-bottom:4px;">Silakan lakukan pembayaran biaya pendaftaran ke:</div>
                                <div style="font-size:16px;font-weight:700;color:#111;">Virtual Account BCA: ${noVa}</div>
                            </div>
                            <p style="margin:20px 0 0 0;color:#555;font-size:13px;">
                                Untuk informasi lebih lanjut, silakan menghubungi sekolah tujuan Anda.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#fafafa;padding:16px 28px;font-size:12px;color:#888;text-align:center;border-top:1px solid #eee;">
                            BPK PENABUR Bandung &middot; Email otomatis, mohon tidak membalas pesan ini.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    return { subject, text, html };
}
