import type { Metadata, Viewport } from 'next';
import { Orbitron, Inter } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Neon Void - Area Enclosure Architecture',
  description: 'A next-generation reimagining of the classic area capture game. Built with WebGPU, React 19, and Go microservices.',
};

export const viewport: Viewport = {
  themeColor: '#05050A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="bg-void-black text-cyan-plasma antialiased overflow-hidden h-screen" suppressHydrationWarning>
        {children}
        <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none', visibility: 'hidden' }}>
          <defs>
            <filter id="deuteranopia" colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values="0.43, 0.72, -0.15, 0, 0, 0.34, 0.57, 0.09, 0, 0, -0.02, 0.03, 1.0, 0, 0, 0, 0, 0, 1, 0" />
            </filter>
            <filter id="protanopia" colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values="0.2, 0.99, -0.19, 0, 0, 0.16, 0.79, 0.04, 0, 0, 0.01, -0.01, 1, 0, 0, 0, 0, 0, 1, 0" />
            </filter>
            <filter id="tritanopia" colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values="0.97, 0.11, -0.08, 0, 0, 0.02, 0.88, 0.1, 0, 0, -0.06, 0.88, 0.18, 0, 0, 0, 0, 0, 1, 0" />
            </filter>
          </defs>
        </svg>
      </body>
    </html>
  );
}
