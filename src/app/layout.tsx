import type { Metadata } from "next";
import "./globals.css";
import GlobalModals from "@/app/components/GlobalModals";
import Logo from "@/app/components/Logo";

export const metadata: Metadata = {
  title: "Game of Thrones Loldle",
  description: "A GOT-themed guessing game",
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
        </div>

        <GlobalModals />
      </body>
    </html>
  );
}
