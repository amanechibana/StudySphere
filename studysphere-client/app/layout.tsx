import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthInit from "./components/AuthInit";
import Providers from "./api/provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "StudySphere",
  description: "Find your focus — your study rooms are waiting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-espresso`}
      >
        <Providers>
          <AuthInit />
          {children}
          <footer className="border-t border-border bg-surface px-6 py-5 text-center text-sm text-espresso-muted">
            StudySphere: CS554 Project. Created by: Aidan, Amane, Barnatt, Jimmy, and Takekuni.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
