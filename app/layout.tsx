import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/_context/themeProvider";
import { UserProvider } from "@/_context/userContext";
import { PageTitleSync } from "@/_components/_organisms/pageTitleSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SQL CHALLENGER",
  description: "SQL CHALLENGER - Mistérios e desafios SQL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <ThemeProvider>
            <UserProvider>
              <PageTitleSync />
              {children}
            </UserProvider>
          </ThemeProvider>
        </body>
    </html>
  );
}
