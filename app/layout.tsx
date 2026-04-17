import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../public/globals.css";
import { StoreProvider } from "./providers/StoreProvider";
import { LanguageProvider } from "./providers/LanguageProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "SPMB BPK PENABUR Bandung",
  description: "Sistem Penerimaan Peserta Didik Baru Online BPK PENABUR Bandung",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans">
        <StoreProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
