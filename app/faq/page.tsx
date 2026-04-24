"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/providers/LanguageProvider";
import { t } from "@/libs/i18n";

export default function FAQPage() {
    const { lang } = useLanguage();
    const items    = t.faq.items[lang];

    return (
        <>
            <Navbar />

            <main className="flex-1 bg-white">
                <PageBanner />
                <LanguageToggle />

                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <h1 className="text-xl sm:text-2xl text-gray-700">{t.faq.title[lang]}</h1>
                    <p className="mt-1 tracking-[0.3em] text-gray-500 text-[10px] sm:text-xs">{t.faq.sub[lang]}</p>
                    <div className="w-16 h-[3px] bg-red-600 mt-3" />

                    <p className="mt-8 sm:mt-10 text-gray-700 text-sm sm:text-[15px] flex flex-wrap items-center gap-2 sm:gap-3">
                        <span>{t.faq.intro[lang]}</span>
                        <a
                            href="tel:0224203808"
                            className="inline-flex items-center gap-2 bg-[#1976d2] hover:bg-[#0d47a1] text-white rounded-md px-4 py-1.5 text-sm"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 00-1.02.24l-2.2 2.2a15.07 15.07 0 01-6.58-6.58l2.2-2.21a1 1 0 00.24-1.01A11.36 11.36 0 018.5 4a1 1 0 00-1-1H4a1 1 0 00-1 1 17 17 0 0017 17 1 1 0 001-1v-3.5a1 1 0 00-1-1z" />
                            </svg>
                            022-420 3808
                        </a>
                        <span>{t.faq.or[lang]}</span>
                        <a
                            href="#contact"
                            className="inline-flex items-center gap-2 bg-[#1976d2] hover:bg-[#0d47a1] text-white rounded-md px-4 py-1.5 text-sm"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <path d="M22 6l-10 7L2 6" />
                            </svg>
                            {t.faq.contactUs[lang]}
                        </a>
                    </p>

                    <div className="mt-8 sm:mt-10 space-y-6 sm:space-y-8">
                        {items.map((f, i) => (
                            <div key={i}>
                                <p className="font-bold italic text-gray-800 text-sm sm:text-[15px]">
                                    {t.faq.tanya[lang]} : {f.q}
                                </p>
                                <div className="mt-2 text-gray-700 text-sm sm:text-[15px] leading-relaxed">
                                    <span>{t.faq.jawab[lang]} : </span>
                                    {f.a}
                                    {"list" in f && f.list && (
                                        <div className="mt-4 space-y-2">
                                            {f.list.map((line, idx) => (
                                                <p key={idx}>{line}</p>
                                            ))}
                                        </div>
                                    )}
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
