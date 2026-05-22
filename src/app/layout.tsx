import type { Metadata } from 'next'
import { RLCProvider } from '@/store/rlc-store'
import './globals.css'

export const metadata: Metadata = {
  title: 'Resonara — Simulador RLC en CA',
  description: 'Simulador interactivo de circuitos RLC en corriente alterna.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            const stored = localStorage.getItem('theme')
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            if (stored === 'dark' || (!stored && prefersDark)) {
              document.documentElement.classList.add('dark')
            }
          })()
        `}} />
      </head>
      <body className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 antialiased">
        <RLCProvider>
          {children}
        </RLCProvider>
      </body>
    </html>
  )
}
