"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { t } from "@/libs/i18n";

export default function Navbar() {
    const { lang }                            = useLanguage();
    const router                              = useRouter();
    const [showFormulir, setShowFormulir]     = useState(false);
    const [showTop, setShowTop]               = useState(false);
    const [mobileOpen, setMobileOpen]         = useState(false);
    const [mobileFormulir, setMobileFormulir] = useState(false);
    const [isLoggedIn, setIsLoggedIn]         = useState(false);

    const jenjangItems = [
        { href: "/form?jenjang=tk",  label: t.nav.tk[lang] },
        { href: "/form?jenjang=sd",  label: t.nav.sd[lang] },
        { href: "/form?jenjang=smp", label: t.nav.smp[lang] },
        { href: "/form?jenjang=sma", label: t.nav.sma[lang] },
    ];

    const handleFormulirClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (!isLoggedIn) {
            e.preventDefault();
            sessionStorage.setItem("auth-redirect", href);
            closeMobile();
            setShowFormulir(false);
            router.push("/sign-in");
        } else {
            closeMobile();
        }
    };

    const handleAuthClick = () => {
        if (!isLoggedIn) {
            sessionStorage.removeItem("auth-redirect");
        }
        closeMobile();
    };

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 200);

        onScroll();
        window.addEventListener("scroll", onScroll);

        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("auth-key"));

        checkAuth();
        window.addEventListener("storage", checkAuth);
        window.addEventListener("focus",   checkAuth);

        return () => {
            window.removeEventListener("storage", checkAuth);
            window.removeEventListener("focus",   checkAuth);
        };
    }, []);

    const authHref  = isLoggedIn ? "/dashboard"        : "/sign-in";
    const authLabel = isLoggedIn ? t.nav.dashboard[lang] : t.nav.signin[lang];

    const closeMobile = () => {
        setMobileOpen(false);
        setMobileFormulir(false);
    };

    return (
        <>
            <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
                <div className="max-w-7xl mx-auto flex min-h-14 items-center justify-between px-4 py-2 sm:min-h-16 sm:px-6">
                    <Link href="/" className="flex items-center" onClick={closeMobile}>
                        <Image
                            src="/assets/bpkspmb.png"
                            alt="BPK PENABUR"
                            width={160}
                            height={44}
                            priority
                            sizes="(max-width: 640px) 120px, 160px"
                            className="h-7 w-auto sm:h-10"
                        />
                    </Link>

                    <nav className="hidden lg:flex items-center gap-6 text-sm xl:gap-8">
                        <Link href="/" className="text-gray-700 hover:text-[#1976d2]">
                            {t.nav.home[lang]}
                        </Link>
                        <Link href="/faq" className="text-gray-700 hover:text-[#1976d2]">
                            {t.nav.faq[lang]}
                        </Link>
                        <Link href="/information" className="text-gray-700 hover:text-[#1976d2]">
                            {t.nav.info[lang]}
                        </Link>
                        <Link href="/konfirmasi" className="text-gray-700 hover:text-[#1976d2]">
                            {t.footer.konfirmasi[lang]}
                        </Link>

                        <div
                            className="relative"
                            onMouseEnter={() => setShowFormulir(true)}
                            onMouseLeave={() => setShowFormulir(false)}
                        >
                            <button className="text-gray-700 hover:text-[#1976d2] flex items-center gap-1">
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
                                            onClick={(e) => handleFormulirClick(e, item.href)}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link href={authHref} onClick={handleAuthClick} className="text-gray-700 hover:text-[#1976d2]">
                            {authLabel}
                        </Link>
                    </nav>

                    <button
                        onClick={() => setMobileOpen((v) => !v)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-transparent text-gray-700 hover:bg-gray-100 lg:hidden"
                        aria-label="Toggle menu"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                            </svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
                            </svg>
                        )}
                    </button>
                </div>

                {mobileOpen && (
                    <div className="border-t border-gray-200 bg-white shadow-sm lg:hidden">
                        <nav className="flex flex-col gap-1 px-4 py-3 text-sm">
                            <Link href="/" onClick={closeMobile} className="rounded-md px-1 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#1976d2]">
                                {t.nav.home[lang]}
                            </Link>
                            <Link href="/faq" onClick={closeMobile} className="rounded-md px-1 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#1976d2]">
                                {t.nav.faq[lang]}
                            </Link>
                            <Link href="/information" onClick={closeMobile} className="rounded-md px-1 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#1976d2]">
                                {t.nav.info[lang]}
                            </Link>
                            <Link href="/konfirmasi" onClick={closeMobile} className="rounded-md px-1 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#1976d2]">
                                {t.footer.konfirmasi[lang]}
                            </Link>

                            <button
                                onClick={() => setMobileFormulir((v) => !v)}
                                className="flex items-center justify-between rounded-md px-1 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#1976d2]"
                                aria-expanded={mobileFormulir}
                            >
                                <span>{t.nav.formulir[lang]}</span>
                                <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className={mobileFormulir ? "rotate-180 transition" : "transition"}>
                                    <path d="M1 3l4 4 4-4" />
                                </svg>
                            </button>
                            {mobileFormulir && (
                                <div className="flex flex-col gap-1 pl-4 pt-1">
                                    {jenjangItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={(e) => handleFormulirClick(e, item.href)}
                                            className="rounded-md px-1 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#1976d2]"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <Link href={authHref} onClick={handleAuthClick} className="rounded-md px-1 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#1976d2]">
                                {authLabel}
                            </Link>
                        </nav>
                    </div>
                )}
            </header>

            <a
                href="https://wa.me/6281224122456"
                target="_blank"
                rel="noreferrer"
                className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-30 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600"
                aria-label="WhatsApp"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="sm:w-[22px] sm:h-[22px]">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </a>

            {showTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-md bg-[#1976d2] text-white shadow-lg hover:bg-[#0d47a1]"
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
