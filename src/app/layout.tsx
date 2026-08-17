import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { ChatbotWidget } from "@/features/chatbot/components/chatbot-widget";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CitasMed - Sistema de Gestión de Citas",
  description: "Sistema profesional de gestión de citas médicas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${dmMono.variable} font-sans`}>
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors offset={88} />
          <ChatbotWidget />
        </Providers>
      </body>
    </html>
  );
}