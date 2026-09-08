import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopScrollBlur } from "@/components/top-scroll-blur";
// import { Dock } from "@/components/ui/dock";
import { NewDock } from "@/components/ui/new-dock";
import { SiteFooter } from "@/components/ui/site-footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rohitlodhi.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rohit Lodhi — Full Stack Engineer",
    template: "%s | Rohit Lodhi",
  },
  description:
    "Rohit Lodhi — Full Stack Engineer from Bhopal, India. Building fast, accessible web apps and open-source products.",
  keywords: ["Rohit Lodhi", "Full Stack Engineer", "Bhopal", "India", "Portfolio", "Web Developer", "Next.js", "React"],
  authors: [{ name: "Rohit Lodhi", url: siteUrl }],
  creator: "Rohit Lodhi",
  publisher: "Rohit Lodhi",
  icons: {
    icon: [
      { url: "/icon.ico" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/icon.ico",
    apple: "/icon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Rohit Lodhi",
    title: "Rohit Lodhi — Full Stack Engineer",
    description:
      "Full Stack Engineer from Bhopal, India. Building fast, accessible web apps and open-source products.",
    images: [{ url: "/icon.ico", width: 512, height: 512, alt: "Rohit Lodhi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rohit Lodhi — Full Stack Engineer",
    description:
      "Full Stack Engineer from Bhopal, India. Building fast, accessible web apps and open-source products.",
    images: ["/icon.ico"],
    creator: "@rohitlodhi",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
};

/**
 * Resolves night mode before the browser paints.
 *
 * The server can't read `localStorage`, so it always emits the light document.
 * This runs synchronously while `<head>` is parsed — earlier than any effect
 * could — so the page never flashes light on its way to dark. Must stay in sync
 * with `resolveTheme` in `lib/use-theme.ts`, which the dock's switch reads.
 */
const THEME_BOOT_SCRIPT = `(function(){try{var s=localStorage.getItem("theme");var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Rohit Lodhi",
    url: siteUrl,
    jobTitle: "Full Stack Engineer",
    address: { "@type": "PostalAddress", addressLocality: "Bhopal", addressCountry: "IN" },
    image: `${siteUrl}/icon.ico`,
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme-boot" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body  className="min-h-full flex flex-col pb-16 sm:pb-20">
        <TopScrollBlur />
        {children}
        <SiteFooter />
        {/* <Dock /> */}
        <NewDock />
      </body>
    </html>
  );
}
