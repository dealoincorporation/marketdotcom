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
            position="bottom-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                color: '#111827',
                boxShadow: '0 32px 64px -16px rgba(0, 0, 0, 0.2)',
                padding: '16px 24px',
                borderRadius: '1.5rem',
                fontSize: '11px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              },
              success: {
                iconTheme: {
                  primary: '#ea580c',
                  secondary: 'white',
                },
                style: {
                  border: '1px solid rgba(234, 88, 12, 0.3)',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: 'white',
                },
                style: {
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
