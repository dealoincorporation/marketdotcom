import type { Metadata } from "next";
import "./globals.css";
import "../../public/fonts/modern-fonts.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";
import { WhatsAppFloat } from "@/components/ui/whatsapp-float";
import { Footer } from "@/components/footer";

// 🔥 ULTRA MODERN FONTS: Space Grotesk
// 2024's coolest typography for premium marketplace - loads from Google Fonts

// System fonts as fallbacks (these don't need Google Fonts)
const inter = {
  className: '',
  variable: '--font-inter',
  style: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  }
};

const robotoMono = {
  className: '',
  variable: '--font-roboto-mono',
  style: {
    fontFamily: '"SF Mono", Monaco, Inconsolata, Consolas, "Courier New", monospace'
  }
};

// Ultra modern font - Space Grotesk for everything
const spaceGrotesk = {
  className: 'font-space-grotesk',
  variable: '--font-space-grotesk',
  style: {
    fontFamily: 'var(--font-space-grotesk)'
  }
};

export const metadata: Metadata = {
  title: "Marketdotcom - Smart Shopping, Better Living",
  description: "Quality foodstuff, daily savings, and convenient delivery—all in one place. Nigeria's premier online marketplace for fresh, affordable groceries.",
};

const fontLink = {
  rel: 'preconnect',
  href: 'https://fonts.googleapis.com',
};

const fontLink2 = {
  rel: 'preconnect',
  href: 'https://fonts.gstatic.com',
  crossOrigin: 'anonymous' as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} ${spaceGrotesk.variable} font-space-grotesk font-semibold antialiased`}
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
