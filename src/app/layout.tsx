import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat With AI",
  description: "Chat with AI - Powered by LangChain",
  icons: {
    icon: "/ai-rag-chatapp-icon-minimal.png",
    apple: "/ai-rag-chatapp-icon-minimal.png",
    shortcut: "/ai-rag-chatapp-icon-minimal.png"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
