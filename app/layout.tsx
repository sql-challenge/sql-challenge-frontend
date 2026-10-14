import type { Metadata } from "next";
import { JetBrains_Mono, Pixelify_Sans, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/_context/themeProvider";
import { UserProvider } from "@/_context/userContext";
import { PageTitleSync } from "@/_components/_organisms/pageTitleSync";

const pressStart2P = Press_Start_2P({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const pixelifySans = Pixelify_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sql-challenge.atcfalcons.org"),
  title: {
    default: "SQL CHALLENGE",
    template: "%s | SQL CHALLENGE",
  },
  description: "SQL CHALLENGE — Mistérios e desafios SQL. Aprenda SQL resolvendo casos detectivescos em um mundo mágico.",
  applicationName: "SQL CHALLENGE",
  keywords: ["SQL", "aprendizado", "desafios", "banco de dados", "gamificação", "mistérios", "detetive"],
  authors: [{ name: "SQL Challenge" }],
  creator: "SQL Challenge",
  publisher: "SQL Challenge",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "SQL CHALLENGE",
    title: "SQL CHALLENGE",
    description: "Mistérios e desafios SQL. Aprenda SQL resolvendo casos detectivescos em um mundo mágico.",
    url: "https://sql-challenge.atcfalcons.org",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "SQL CHALLENGE — Mistérios e desafios SQL",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SQL CHALLENGE",
    description: "Mistérios e desafios SQL. Aprenda SQL resolvendo casos detectivescos.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${pressStart2P.variable} ${pixelifySans.variable} ${jetbrainsMono.variable} h-full`}
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
