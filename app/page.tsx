"use client";

import Image from "next/image";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageBanner from "./components/PageBanner";
import LanguageToggle from "./components/LanguageToggle";
import { useLanguage } from "./providers/LanguageProvider";
import { t } from "@/libs/i18n";

export default function RootPage() {
    const { lang } = useLanguage();
    const steps    = t.home.steps[lang];

    return (
        <>
            <Navbar />

            <main className="flex-1 overflow-x-hidden bg-white">
                <PageBanner />
                <LanguageToggle />

                <section className="max-w-7xl mx-auto grid grid-cols-1 gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
                    <div className="space-y-6 sm:space-y-8">
                        <div className="text-center md:text-left">
                            <h2 className="text-xl text-gray-700 sm:text-2xl">{t.home.infoTitle[lang]}</h2>
                            <div className="mx-auto mt-1 h-[3px] w-16 bg-red-600 md:mx-0" />
                        </div>

                        <a
                            href="/information"
                            className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 px-4 py-3 text-white shadow-md transition hover:shadow-lg sm:w-auto sm:justify-start sm:rounded-full sm:pl-2 sm:pr-6 sm:py-2"
                        >
                            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-purple-700 flex items-center justify-center font-serif italic text-xl font-bold">
                                i
                            </span>
                            <span className="font-semibold tracking-wide text-xs leading-tight whitespace-pre-line sm:text-sm">
                                {t.home.askFor[lang]}
                            </span>
                        </a>

                        <div className="relative w-full overflow-hidden rounded-xl shadow-md aspect-[16/10] sm:aspect-video">
                            <iframe
                                src="https://www.youtube.com/embed/qXxLncjnfv0"
                                title="Panduan SPMB BPK PENABUR Bandung"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-5 sm:p-6 md:p-7">
                        <div className="text-center md:text-left">
                            <h2 className="text-xl text-gray-700 sm:text-2xl">{t.home.stepsTitle[lang]}</h2>
                            <div className="mx-auto mt-1 mb-6 h-[3px] w-16 bg-red-600 md:mx-0" />
                        </div>

                        <ol className="space-y-4 text-sm leading-relaxed text-gray-700 sm:text-[15px]">
                            {steps.map((item, idx) => (
                                <li key={idx} className="flex gap-3">
                                    <span className="flex-shrink-0">{idx + 1}.</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="max-w-5xl mx-auto border-t border-gray-200 px-4 py-10 sm:px-6 sm:py-16">
                    <h2 className="mb-6 text-center text-xl text-gray-700 sm:mb-8 sm:text-2xl">{t.home.flowTitle[lang]}</h2>
                    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <Image
                            src="/assets/tatacaraspmb.png"
                            alt={t.home.flowTitle[lang]}
                            width={1200}
                            height={1200}
                            sizes="(max-width: 1024px) 100vw, 1200px"
                            className="w-full h-auto"
                        />
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
