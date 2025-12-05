import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Chronos - GitHub Unwrapped',
  description: 'Your coding year in review - A minimal GitHub Unwrapped generator',
  keywords: ['github', 'unwrapped', 'coding', 'statistics', 'year-in-review'],
  authors: [{ name: 'Chronos Team' }],
  openGraph: {
    title: 'Chronos - GitHub Unwrapped',
    description: 'Your coding year in review',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chronos - GitHub Unwrapped',
    description: 'Your coding year in review',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-chronos-dark text-white min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
