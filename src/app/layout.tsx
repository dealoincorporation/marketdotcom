import type { Metadata } from "next";
import { Inter, Roboto_Mono, Poppins, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";
import { WhatsAppFloat } from "@/components/ui/whatsapp-float";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marketdotcom - Smart Shopping, Better Living",
  description: "Quality foodstuff, daily savings, and convenient delivery—all in one place. Nigeria's premier online marketplace for fresh, affordable groceries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoMono.variable} ${poppins.variable} ${spaceGrotesk.variable} font-space-grotesk antialiased`}
      >
        <Providers>
          {children}
          <WhatsAppFloat />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#374151',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              },
              success: {
                style: {
                  background: 'rgba(34, 197, 94, 0.95)',
                  color: 'white',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#22c55e',
                },
              },
              error: {
                style: {
                  background: 'rgba(239, 68, 68, 0.95)',
                  color: 'white',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#ef4444',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
