import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { HeaderWrapper } from "@/components/layout/header-wrapper";
import { FooterWrapper } from "@/components/layout/footer-wrapper";
import { Hexagon, Github, Twitter } from "lucide-react";
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from "@/components/ui/toaster";
import { SupabaseProvider } from '@/components/supabase/provider'
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MakeHub - AI Models on the Best Providers in Real-Time",
  description: "Dynamic routing of AI models (GPT-4, Claude, Llama) to the best providers (OpenAI, Anthropic, Together.ai) for optimal performance and cost savings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-y-scroll">
      <head>
        <GoogleAnalytics GA_MEASUREMENT_ID="G-BPMLF5L6WY" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <SupabaseProvider>
            <HeaderWrapper heroHeight={0} />
            <main className="flex-1 w-full">
              {children}
            </main>
            <FooterWrapper />
          </SupabaseProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
