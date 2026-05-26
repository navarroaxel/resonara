import type { Metadata } from 'next'
import { DCProvider } from '@/store/dc-store'

export const metadata: Metadata = {
  title: 'Resonara — Kirchhoff CC',
  description: 'Simulador interactivo de circuitos resistivos con KVL, KCL y análisis de mallas.',
}

export default function DCLayout({ children }: { children: React.ReactNode }) {
  return <DCProvider>{children}</DCProvider>
}
