import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { BrandProvider } from '@web-base/base-ui'
import { Providers } from '@/components/providers'
import { exampleBrand } from '@/brand'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Example App — web-base',
  description: 'Demonstrates all web-base packages',
}

/**
 * Root layout — Server Component.
 * BrandProvider is safe in Server Components (pure context, no hooks).
 * All client-side providers (auth, query, cms) live in <Providers>.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BrandProvider brand={exampleBrand}>
          <Providers>{children}</Providers>
        </BrandProvider>
      </body>
    </html>
  )
}
