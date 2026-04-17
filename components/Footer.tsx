"use client";

import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";
import { t } from "@/libs/i18n";

export default function Footer() {
    const { lang } = useLanguage();

    return (
        <footer className="mt-16 bg-[#1e3a5f] text-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                        <h3 className="text-white font-semibold mb-1">{t.footer.pendaftaran[lang]}</h3>
                        <div className="w-12 h-[2px] bg-red-500 mb-4" />
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/faq" className="hover:text-white">{t.footer.faq[lang]}</Link></li>
                            <li><Link href="/information" className="hover:text-white">{t.footer.informasi[lang]}</Link></li>
                            <li><Link href="/konfirmasi" className="hover:text-white">{t.footer.konfirmasi[lang]}</Link></li>
                            <li><Link href="/status" className="hover:text-white">{t.footer.status[lang]}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-1">{t.footer.formulir[lang]}</h3>
                        <div className="w-12 h-[2px] bg-red-500 mb-4" />
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/form?jenjang=tk" className="hover:text-white">TK</Link></li>
                            <li><Link href="/form?jenjang=sd" className="hover:text-white">SD</Link></li>
                            <li><Link href="/form?jenjang=smp" className="hover:text-white">SMP</Link></li>
                            <li><Link href="/form?jenjang=sma" className="hover:text-white">SMA</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-1">{t.footer.yayasan[lang]}</h3>
                        <div className="w-12 h-[2px] bg-red-500 mb-4" />
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-1 flex-shrink-0">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>Jl. Banda No 19, Bandung 40115</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-1 flex-shrink-0">
                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>022-420 3808</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-1 flex-shrink-0">
                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>08 1224 1224 56</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-1 flex-shrink-0">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                                </svg>
                                <a href="https://bpkpenabur.or.id/cities/bandung" className="hover:text-white break-all">
                                    https://bpkpenabur.or.id/cities/bandung
                                </a>
                            </li>
                        </ul>
                        <div className="flex gap-2 mt-4">
                            <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                                </svg>
                            </a>
                            <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="2" width="20" height="20" rx="5" />
                                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </a>
                            <a href="#" aria-label="YouTube" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
                                    <path d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z" fill="#1f2937" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <h3 className="text-white font-semibold mb-1">{t.footer.website[lang]}</h3>
                    <div className="w-12 h-[2px] bg-red-500 mb-4" />
                    <select className="w-full md:w-96 bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm text-gray-100">
                        <option>{t.footer.pilihSekolah[lang]}</option>
                    </select>
                </div>
            </div>

            <div className="bg-red-700 text-white text-center text-sm py-3">
                {t.footer.copyright[lang]}
            </div>
        </footer>
    );
}
