import type { Metadata } from 'next'
import { KirchhoffACProvider } from '@/store/kirchhoff-ac-store'

export const metadata: Metadata = {
  title: 'Resonara — Kirchhoff CA',
  description: 'Simulador CA de análisis de mallas con corrección del factor de potencia.',
}

export default function KirchhoffACLayout({ children }: { children: React.ReactNode }) {
  return <KirchhoffACProvider>{children}</KirchhoffACProvider>
}
