import type { Metadata } from "next";
import "./globals.css";
import Logo from "@/app/components/Logo";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "GoTdle",
  description: "A Game of Thrones-themed guessing game",
  openGraph: {
    title: "GoTdle",
    description: "A Game of Thrones-themed guessing game",
    url: "https://www.gotdle.com/",
    siteName: "GoTdle",
    images: [
      {
        url: "https://www.gotdle.com/assets/social-preview.png",
        width: 1200,
        height: 630,
        alt: "GoTdle Game Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoTdle",
    description: "A Game of Thrones-themed guessing game",
    images: ["https://www.gotdle.com/assets/social-preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        style={{
          backgroundImage: "url('/assets/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.35)",
            minHeight: "100vh",
            paddingBottom: "2rem",
          }}
        >
          <header style={{ textAlign: "center" }}>
            <Logo />
          </header>

          {children}
          <Analytics/>
        </div>
      </body>
    </html>
  );
}
