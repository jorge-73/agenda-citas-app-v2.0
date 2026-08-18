import type { Metadata } from "next";
import { Inter, DM_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { ChatbotWidget } from "@/features/chatbot/components/chatbot-widget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      <body className={`${inter.variable} ${dmMono.variable} font-sans`}>
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors offset={88} />
          <ChatbotWidget />
        </Providers>
      </body>
    </html>
  );
}