import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { BrandProvider } from '@web-base/base-ui'
import { exampleBrand } from '../brand'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Example App — web-base',
  description: 'Demonstrates all web-base packages',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BrandProvider brand={exampleBrand}>
          {children}
        </BrandProvider>
      </body>
    </html>
  )
}
