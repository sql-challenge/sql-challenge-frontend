import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/_context/themeProvider";
import { UserProvider } from "@/_context/userContext";
import { PageTitleSync } from "@/_components/_organisms/pageTitleSync";

const pressStart2P = Press_Start_2P({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const vt323 = VT323({
  variable: "--font-body",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SQL CHALLENGE",
  description: "SQL CHALLENGE - Mistérios e desafios SQL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${pressStart2P.variable} ${vt323.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col scanlines">
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
