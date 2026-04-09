import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Fincheck Docs",
  description: "Backend Swagger and Frontend Storybook documentation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="min-h-screen bg-slate-50">
          <header className="border-b border-slate-200 bg-white/90">
            <nav className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
              <Link href="/" className="text-sm font-semibold text-slate-800">
                Fincheck Docs
              </Link>
              <Link
                href="/backend"
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Backend
              </Link>
              <Link
                href="/frontend"
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Frontend
              </Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
