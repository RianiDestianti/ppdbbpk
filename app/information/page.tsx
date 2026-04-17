"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageBanner from "../components/PageBanner";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../providers/LanguageProvider";
import { t } from "@/libs/i18n";

export default function InformationPage() {
    const { lang } = useLanguage();
    const items    = t.info.items[lang];

    return (
        <>
            <Navbar />

            <main className="flex-1 bg-white">
                <PageBanner />
                <LanguageToggle />

                <section className="max-w-7xl mx-auto px-6 py-12">
                    <h1 className="text-2xl text-gray-700">{t.info.title[lang]}</h1>
                    <p className="mt-1 tracking-[0.3em] text-gray-500 text-xs">{t.info.sub[lang]}</p>
                    <div className="w-16 h-[3px] bg-red-600 mt-3" />

                    <div className="mt-10 space-y-6 text-gray-700 text-[15px] leading-relaxed">
                        <p>{t.info.intro[lang]}</p>
                        <p>{t.info.lead[lang]}</p>

                        <ol className="space-y-4">
                            {items.map((item, idx) => (
                                <li key={idx} className="flex gap-2">
                                    <span className="flex-shrink-0">{idx + 1}.</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ol>

                        <div className="mt-8 bg-sky-500 text-white rounded-md p-5">
                            <div className="flex items-center gap-2 font-semibold mb-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" strokeLinecap="round" />
                                    <circle cx="12" cy="8" r="0.5" fill="currentColor" />
                                </svg>
                                {t.info.infoLabel[lang]}
                            </div>
                            <p>
                                {t.info.infoText[lang]} <strong>{t.info.infoSubject[lang]}</strong>.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
