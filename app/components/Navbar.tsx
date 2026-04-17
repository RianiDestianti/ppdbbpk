"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "../providers/LanguageProvider";
import { t } from "../libs/i18n";

export default function Navbar() {
    const { lang }                          = useLanguage();
    const [showFormulir, setShowFormulir]   = useState(false);
    const [showTop, setShowTop]             = useState(false);

    const jenjangItems = [
        { href: "/form?jenjang=tk",  label: t.nav.tk[lang] },
        { href: "/form?jenjang=sd",  label: t.nav.sd[lang] },
        { href: "/form?jenjang=smp", label: t.nav.smp[lang] },
        { href: "/form?jenjang=sma", label: t.nav.sma[lang] },
    ];

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 200);

        onScroll();
        window.addEventListener("scroll", onScroll);

        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <>
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/assets/bpkspmb.png"
                            alt="BPK PENABUR"
                            width={160}
                            height={44}
                            priority
                            className="h-10 w-auto"
                        />
                    </Link>

                    <nav className="flex items-center gap-8 text-sm">
                        <Link href="/" className="text-gray-700 hover:text-red-600">
                            {t.nav.home[lang]}
                        </Link>
                        <Link href="/faq" className="text-gray-700 hover:text-red-600">
                            {t.nav.faq[lang]}
                        </Link>
                        <Link href="/information" className="text-gray-700 hover:text-red-600">
                            {t.nav.info[lang]}
                        </Link>

                        <div
                            className="relative"
                            onMouseEnter={() => setShowFormulir(true)}
                            onMouseLeave={() => setShowFormulir(false)}
                        >
                            <button className="text-gray-700 hover:text-red-600 flex items-center gap-1">
                                {t.nav.formulir[lang]}
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M1 3l4 4 4-4" />
                                </svg>
                            </button>
                            {showFormulir && (
                                <div className="absolute top-full left-0 w-44 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                                    {jenjangItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link href="/sign-in" className="text-gray-700 hover:text-red-600">
                            {t.nav.signin[lang]}
                        </Link>
                    </nav>
                </div>
            </header>

            <a
                href="https://wa.me/6281224122456"
                target="_blank"
                rel="noreferrer"
                className="fixed bottom-6 left-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600"
                aria-label="WhatsApp"
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </a>

            {showTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-md bg-red-600 text-white shadow-lg hover:bg-red-700"
                    aria-label="Scroll to top"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            )}
        </>
    );
}
