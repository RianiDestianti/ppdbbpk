"use client";

import { useLanguage } from "@/providers/LanguageProvider";

export default function LanguageToggle() {
    const { lang, setLang } = useLanguage();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8">
            <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3 text-xs sm:text-sm">
                <button
                    onClick={() => setLang("id")}
                    className={`inline-flex min-w-[88px] items-center justify-center gap-2 border rounded-md px-3 sm:px-4 py-2 transition ${
                        lang === "id"
                            ? "border-[#1976d2] bg-blue-50 text-[#1976d2]"
                            : "border-gray-300 hover:bg-gray-50"
                    }`}
                >
                    <span className="font-medium">ID</span>
                    <span className="inline-block w-5 h-3 bg-gradient-to-b from-red-600 from-50% to-white to-50% border border-gray-300" />
                </button>
                <button
                    onClick={() => setLang("en")}
                    className={`inline-flex min-w-[88px] items-center justify-center gap-2 border rounded-md px-3 sm:px-4 py-2 transition ${
                        lang === "en"
                            ? "border-[#1976d2] bg-blue-50 text-[#1976d2]"
                            : "border-gray-300 hover:bg-gray-50"
                    }`}
                >
                    <span className="font-medium">EN</span>
                    <span className="inline-block w-5 h-3 bg-blue-800 border border-gray-300 relative overflow-hidden">
                        <span className="absolute inset-0 flex items-center justify-center text-[6px] text-white font-bold">UK</span>
                    </span>
                </button>
            </div>
        </div>
    );
}
